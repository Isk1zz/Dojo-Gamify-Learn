-- ================================================
-- Knell — 0007: forum schema
-- ------------------------------------------------
-- docs/FORUM-PLAN.md шаг 1. Таблицы и RLS. Ни одного RPC — они в 0008,
-- потому что схему стоит проверить отдельно от логики, которая её
-- использует.
--
-- ---- Главный принцип, унаследованный от economy ----
-- НИ У ОДНОЙ таблицы здесь нет политики записи. Совсем. Всё пишется
-- только через SECURITY DEFINER функции.
--
-- Это ровно та схема, которая на пентесте 2026-08-27 выдержала все
-- атаки на economy: прямые PATCH/INSERT/UPSERT/DELETE, подделку JWT,
-- горизонтальный доступ к чужим строкам. Если клиент может писать
-- posts.score напрямую, то оба потолка репутации — рекомендация, а не
-- правило. Отсутствие политики надёжнее любой проверки, потому что
-- нечего обходить.
--
-- ---- Потолки живут в ОГРАНИЧЕНИЯХ, а не в коде ----
-- unique (giver, post) и check (giver <> receiver) — это правила
-- «одно очко на пост» и «никогда себе», выраженные так, что они
-- держатся, даже если RPC когда-нибудь напишут неправильно. Проверки в
-- функции всё равно будут: они дают внятную ошибку вместо нарушения
-- ограничения. Но последнее слово за БД.
-- ================================================

-- ---- Посты --------------------------------------------------------
create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  author      uuid not null references auth.users(id) on delete cascade,
  body        text not null check (length(btrim(body)) between 1 and 8000),
  created_at  timestamptz not null default now(),
  -- Модерация. Ставится только админом через RPC.
  hidden      bool not null default false,
  -- Денормализованный счётчик для сортировки ленты. Источник истины —
  -- rep_grants; это кэш, чтобы не считать COUNT(*) на каждый рендер.
  -- Пишется ТОЛЬКО из RPC начисления.
  score       int  not null default 0 check (score >= 0)
);

create index if not exists posts_feed_idx on public.posts (score desc, created_at desc);
create index if not exists posts_author_idx on public.posts (author);

-- ---- Ответы -------------------------------------------------------
-- Ответы не набирают репутацию: очко даётся посту. Иначе ветка
-- превращается в соревнование за последнее слово, а норма в 5 очков
-- размазывается по репликам вместо того, ради чего она есть.
create table if not exists public.replies (
  id          uuid primary key default gen_random_uuid(),
  post        uuid not null references public.posts(id) on delete cascade,
  author      uuid not null references auth.users(id) on delete cascade,
  body        text not null check (length(btrim(body)) between 1 and 4000),
  created_at  timestamptz not null default now(),
  hidden      bool not null default false
);

create index if not exists replies_post_idx on public.replies (post, created_at);

-- ---- Журнал начислений --------------------------------------------
-- ЭТО источник истины по репутации. Нормы нигде не хранятся: «сколько
-- положено сегодня» считается от Сада, «сколько потрачено» — это
-- count(*) по этому журналу за сегодня. Из чего бесплатно следует, что
-- норма сгорает ночью: не нужен ни cron, ни ночная задача, которых на
-- бесплатном тарифе всё равно нет.
--
-- Три величины профиля (отдано / получено за месяц / получено всего)
-- тоже отсюда, запросами. Сезон обнуляется сам, потому что «за месяц» —
-- это условие where, а не событие.
create table if not exists public.rep_grants (
  id          uuid primary key default gen_random_uuid(),
  giver       uuid not null references auth.users(id) on delete cascade,
  receiver    uuid not null references auth.users(id) on delete cascade,
  post        uuid not null references public.posts(id) on delete cascade,
  created_at  timestamptz not null default now(),
  -- Одно очко на пост.
  unique (giver, post),
  -- Никогда себе.
  constraint rep_grants_not_self check (giver <> receiver)
);

create index if not exists rep_grants_day_idx on public.rep_grants (giver, created_at);
create index if not exists rep_grants_pair_idx on public.rep_grants (giver, receiver, created_at);
create index if not exists rep_grants_recv_idx on public.rep_grants (receiver, created_at);

-- ---- Жалобы -------------------------------------------------------
-- Решение 0.3: жалоба падает в очередь, видимость меняет только админ.
-- Автоскрытия по N жалобам нет намеренно — на маленьком форуме трое
-- договариваются тривиально, и автоскрытие становится оружием.
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter    uuid not null references auth.users(id) on delete cascade,
  post        uuid references public.posts(id) on delete cascade,
  reply       uuid references public.replies(id) on delete cascade,
  reason      text not null check (length(btrim(reason)) between 1 and 500),
  created_at  timestamptz not null default now(),
  resolved    bool not null default false,
  -- Ровно одна цель: жалоба либо на пост, либо на ответ.
  constraint reports_one_target check (num_nonnulls(post, reply) = 1),
  -- Один человек жалуется на одну цель один раз.
  unique (reporter, post, reply)
);

create index if not exists reports_open_idx on public.reports (resolved, created_at);

-- ---- RLS ------------------------------------------------------------
alter table public.posts      enable row level security;
alter table public.replies    enable row level security;
alter table public.rep_grants enable row level security;
alter table public.reports    enable row level security;

-- Админ определяется СЕРВЕРОМ: economy.is_admin, у которой нет
-- клиентской политики записи. Локальный флаг профиля здесь не при чём —
-- его можно подделать в devtools, что и было продемонстрировано
-- 2026-08-27.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select e.is_admin from public.economy e
                    where e.user_id = auth.uid()), false);
$$;

-- ВНИМАНИЕ: authenticated здесь НУЖЕН -- см. 0008. is_admin()
-- вызывается из RLS-политики, а политика выполняется в контексте
-- вызывающего. Отзыв у authenticated ломает чтение всех четырёх таблиц.
revoke execute on function public.is_admin() from public, anon;
grant  execute on function public.is_admin() to authenticated;

-- Посты: видны всем авторизованным, кроме скрытых. Автор видит свои
-- всегда — пост, молча исчезнувший для собственного автора, выглядит
-- как баг и мешает ему понять, что произошло. Админ видит всё, иначе
-- очередь жалоб не разобрать.
drop policy if exists posts_read on public.posts;
create policy posts_read on public.posts
  for select to authenticated
  using (not hidden or author = auth.uid() or public.is_admin());

drop policy if exists replies_read on public.replies;
create policy replies_read on public.replies
  for select to authenticated
  using (not hidden or author = auth.uid() or public.is_admin());

-- Начисления: свои видны, чтобы интерфейс мог показать «уже начислял» и
-- остаток нормы. Чужие — нет: кто кому дал очко, никого не касается, и
-- это же убирает возможность вычислять, кто кого поддерживает.
-- Получатель видит начисления В СВОЮ сторону, но без дарителя показывать
-- нечего — поэтому и он тоже.
drop policy if exists rep_grants_read on public.rep_grants;
create policy rep_grants_read on public.rep_grants
  for select to authenticated
  using (giver = auth.uid() or receiver = auth.uid() or public.is_admin());

-- Жалобы: жалующийся видит свои, админ видит все.
drop policy if exists reports_read on public.reports;
create policy reports_read on public.reports
  for select to authenticated
  using (reporter = auth.uid() or public.is_admin());

-- ---- Политик записи НЕТ, и это не упущение -------------------------
-- Ни одного insert/update/delete policy ни на одной из четырёх таблиц.
-- Всё пишется через SECURITY DEFINER функции в 0008. Комментарий тут
-- затем, чтобы никто не «дописал недостающее» через полгода.
comment on table public.posts is
  'Форум. Запись только через SECURITY DEFINER RPC: политик insert/update/delete нет намеренно, как у economy.';
comment on table public.rep_grants is
  'Журнал начислений репутации — источник истины. Оба потолка выражены ограничениями БД (unique giver+post, check giver<>receiver), поэтому держатся даже при ошибке в RPC.';
