// ================================================
// Course: Теория A3 — электровелосипед (Израиль) — MODULE 1
// Unit 31: Электровелосипед — официальная теория
// ------------------------------------------------
// Написан по library/content/CONTENT-MODEL.md: шесть тем, три чанка в
// каждой, пять экзаменационных вопросов на тему; explain через
// blocks[] на ~200 слов, два источника на чанк, свои аналогии.
//
// ---- Про язык ----
// Двуязычный курс: каждая пользовательская строка — это {ru, en}, и
// core/i18n.js разрешает её один раз, при регистрации курса. Русский
// первичен — экзамен A3 сдаётся на русском или на иврите.
//
// ЭКЗАМЕНАЦИОННЫЕ ВОПРОСЫ НЕ ПЕРЕВЕДЕНЫ, А ВЗЯТЫ. Министерство
// публикует один и тот же банк на шести языках; английские
// формулировки скачаны с /en/ той же страницы, а не переведены
// вручную. Для подготовки к экзамену это принципиально: человек
// должен узнать на экране ровно ту фразу, которую видел в курсе, а
// самодельный перевод официального текста учил бы другому тексту.
// Ключи ответов в обеих версиях сверены и совпадают.
//
// Учебная проза (объяснения, аналогии, примеры, recall) написана на
// обоих языках отдельно — это наш текст, и он не связан ничем, кроме
// смысла.
//
// ---- Сверено с первоисточником ----
// Определение «אופניים עם מנוע עזר» прочитано в самом тексте תקנות
// התעבורה, תקנה 1, а не по пересказам. Оттуда — то, чего не было в
// первой редакции курса:
//   · «ההספק המרבי» — МАКСИМАЛЬНАЯ мощность 250 Вт. Не «номинальная
//     длительная», как в европейском EN 15194. Это закрывает лазейку
//     «250 nominal / 600 peak», на которой держится расхожее «600 Вт».
//   · ручка газа НЕ запрещена: для велосипедов с 1.07.2014 она
//     предусмотрена, но обязана отключаться выше 6 км/ч (выгул);
//   · תקנה 124(ג): кому нет 14 — не может везти никого;
//   · масса до 30 кг — только для купленных до 1.07.2014;
//   · шлем — вообще не в Правилах, а в פקודת התעבורה סעיף 65ג, и
//     распространяется на водителя И пассажира: «לא ירכב אדם על
//     אופניים, ולא ירכיב אדם אחר, אלא אם כן הם חובשים קסדת מגן».
//     Городское послабление для взрослого не действует, если на
//     велосипеде есть мотор. Отсюда же תקנה 39טז(4): на шлеме
//     электровелосипедиста должен быть светоотражатель.
//
// Экзамен спрашивает УСЛОВИЕ перевозки, а шлем — самостоятельная
// обязанность, поэтому в вопросе 0009 «оба в шлемах» неверно. Первая
// редакция курса воспроизвела эту логику и потеряла бытовой факт, что
// шлем всё равно обязателен. Не сокращать этот блок обратно.
//
// ДЕФЕКТ ИСТОЧНИКА: в английском банке у вопроса 0005 в поле заголовка
// лежит текст ОТВЕТА, а не вопроса («0005. No. However a pedestrian is
// permitted...»). Русская версия корректна. Английская формулировка
// вопроса здесь восстановлена по смыслу русской; варианты ответов —
// официальные. Если министерство починит страницу, стоит сверить.
//
// ---- Про источник вопросов ----
// Все 40 вопросов официального банка использованы ровно по одному
// разу: 30 — как examQuestions (5 на тему), 10 — как quiz внутри
// чанков. Остальные 8 quiz написаны для этого курса и проверяют
// применение, а не узнавание (CONTENT-MODEL §2.5).
// Банк: gov.il/ru/departments/dynamiccollectors/theory-exam-a3
//
// Формулировки официальных вопросов сохранены; исправлены только
// очевидные опечатки и пунктуация исходной публикации, а порядок
// вариантов в quiz-вопросах переставлен ради разброса ключа
// (CONTENT-MODEL §4).
//
// ---- Про id ----
// Unit 31: 1-8 заняты Intro to CS, 9-30 зарезервированы за четырьмя
// научными курсами в CURRICULUM-PLAN.md §2. Все topic id начинаются
// с "bike-" — глобальная уникальность важна, потому что на id
// завязаны прогресс, повторения и Garden.
// ================================================

const MODULE_A3 = {
  id: "bike-a3-theory",
  unit: 31,
  title: { ru: "Электровелосипед: теория A3", en: "Electric Bicycle: A3 Theory" },
  icon: "\u{1F6B2}",
  topics: [

    // ============================================================
    {
      id: "bike-law",
      title: { ru: "Закон и статус", en: "The Law and Your Status" },
      desc: { ru: "Что закон считает электровелосипедом, кто вы на дороге и что даёт категория A3", en: "What the law counts as an electric bicycle, who you are on the road, and what category A3 actually gives you" },
      icon: "⚖️",
      chunks: [
        {
          title: { ru: "Что закон называет электровелосипедом", en: "What the Law Calls an Electric Bicycle" },
          glossary: [
            { term: { ru: "Велосипед со вспомогательным двигателем", en: "Bicycle with an auxiliary motor" }, definition: { ru: "Официальное название электровелосипеда в законе: два колеса одно за другим плюс электродвигатель.", en: "The law's own name for an electric bicycle: two wheels one behind the other, plus an electric motor." } },
            { term: "SI 15194", definition: { ru: "Израильский стандарт на электровелосипеды: максимальная мощность мотора до 250 Вт, привод от педалей, отключение выше 25 км/ч. Ручка газа допустима только до 6 км/ч.", en: "The Israeli standard for electric bicycles: maximum motor output 250 W, pedal-driven, cut-off above 25 km/h. A throttle is allowed only up to 6 km/h." } },
            { term: { ru: "Категория A3", en: "Category A3" }, definition: { ru: "Водительская категория для электровелосипедов и электросамокатов, действует с 1 января 2019 года.", en: "The driving category for electric bicycles and scooters, in force since 1 January 2019." } }
          ],
          predict: {
            question: { ru: "Двигатель электровелосипеда обязан отключиться, когда скорость превышает…", en: "The motor on an electric bicycle must cut out once the speed goes above…" },
            options: [
              { ru: "10 км/ч — иначе это уже не «помощь», а езда на моторе", en: "10 km/h — past that it stops being assistance and becomes riding on a motor" },
              { ru: "25 км/ч", en: "25 km/h" },
              { ru: "40 км/ч — как у мопеда", en: "40 km/h — the same as a moped" },
              { ru: "Отдельного порога нет: действует обычное ограничение скорости на дороге", en: "There is no separate threshold: the ordinary road speed limit applies" }
            ],
            reveal: { ru: "Угадать здесь важнее, чем угадать правильно: дальше вы увидите, что это число — не характеристика мотора, а условие, при котором ваш аппарат вообще считается велосипедом.", en: "Guessing matters more here than guessing right: you are about to see that this number is not a specification of the motor but the condition under which your machine counts as a bicycle at all." }
          },
          explain: {
            blocks: [
              { text: { ru: `Закон не интересуется тем, как вы называете свой транспорт. У него есть короткий список признаков — либо аппарат в него попадает, либо нет.<br><br><strong>«Велосипед со вспомогательным двигателем»</strong> — это велосипед с двумя колёсами, установленными одно за другим, на котором установлен электродвигатель. Три колеса, мотор вместо педалей, рама скутера — и перед вами уже другое транспортное средство, с другими правами и другой ответственностью.`, en: `The law takes no interest in what you call your machine. It holds a short list of features, and either yours is on that list or it is not.<br><br>A <strong>bicycle with an auxiliary motor</strong> is a bicycle with two wheels mounted one behind the other, fitted with an electric motor. Three wheels, a motor instead of pedals, a scooter frame — and what stands in front of you is a different vehicle altogether, with different licensing and a different kind of liability.` } },
              { heading: { ru: "Четыре условия стандарта", en: "The standard's four conditions" }, text: { ru: `Чтобы электровелосипед считался стандартным, он должен отвечать израильскому стандарту <strong>SI 15194</strong>: <strong>максимальная</strong> мощность двигателя не выше 250 Вт; двигатель приводится вращением педалей; его помощь слабеет по мере разгона; и он полностью отключается, когда скорость превышает <strong>25 км/ч</strong>.<br><br>Про ручку газа есть тонкость, которая зря пугает: она разрешена, но только как режим выгула — обязана переставать работать выше <strong>6 км/ч</strong>. Ручка, которая тянет вас на дорожной скорости, выводит аппарат из определения; кнопка, которая катит велосипед рядом с идущим человеком, — нет.<br><br>Условия работают вместе. Сняли ограничитель, поставили мотор помощнее — нарушено одно, а значит нарушен весь стандарт.`, en: `To count as standard, an electric bicycle must meet the Israeli standard <strong>SI 15194</strong>: the motor's <strong>maximum</strong> output no higher than 250 W; the motor driven by turning the pedals; its assistance falling away as speed rises; and it must cut out entirely once speed passes <strong>25 km/h</strong>.<br><br>Throttles cause needless alarm, so note the detail: one is allowed, but only as a walk-assist — it must stop working above <strong>6 km/h</strong>. A throttle that pulls you along at road speed puts the machine outside the definition; a button that walks the bicycle beside you does not.<br><br>The conditions work together. Remove the limiter or fit a stronger motor and you have broken one, which breaks the whole standard.` } },
              { heading: { ru: "Почему это первый вопрос темы", en: "Why this is the topic's first question" }, text: { ru: `От этой строчки зависит всё остальное. Стандартный электровелосипед — это категория <strong>A3</strong>, доступная с 16 лет. Тот же аппарат после тюнинга закон читает как мотоцикл: нужны водительские права, номерной знак, страховка и техосмотр, а без них это езда без прав.<br><br>Ездить на велосипеде, который не отвечает требованиям стандарта, запрещено. Без оговорок про «короткую поездку» или «только по тротуару» — именно такие оговорки и подсовывают в неправильных вариантах ответа.`, en: `Everything else rests on this one line. A standard electric bicycle is <strong>category A3</strong>, open to you from 16. The same machine after tuning is read by the law as a motorcycle: licence, plate, insurance and roadworthiness test — and without them you are simply riding unlicensed.<br><br>Riding a bicycle that fails the standard is forbidden. No qualifier about a short trip or about staying on the pavement — and qualifiers of exactly that shape are what the wrong answers are built from.` } }
            ],
            analogy: { ru: `Стандарт работает как рамка для ручной клади в аэропорту. Пока чемодан входит в рамку, он летит с вами бесплатно и без вопросов. Стал на пару сантиметров шире — это уже багаж: другая стойка, другой тариф, другие правила. Рамка не спрашивает, что внутри, она меряет габарит. Разница одна: чемодан можно сдать в багаж, а нестандартный велосипед — только вернуть к стандарту.`, en: `The standard works like the cabin-baggage frame at an airport. While the case drops into the frame it flies with you, free and unquestioned. A couple of centimetres wider and it is hold luggage: different desk, different fee, different rules. The frame never asks what is inside; it measures the outside. One difference: a case can simply be checked in, whereas a non-standard bicycle can only be brought back to the standard.` },
            sources: [
              { ref: `<bdi>תקן ישראלי SI 15194 — «אופניים עם מנוע עזר חשמלי: דרישות בטיחות ושיטות בדיקה», מכון התקנים הישראלי</bdi> (sii.org.il/he/bicycles).`, note: { ru: `Четыре технических условия: до 250 Вт, привод от педалей, падение помощи с разгоном, отключение выше 25 км/ч.`, en: `The four technical conditions: up to 250 W, pedal-driven, assistance falling away with speed, cut-off above 25 km/h.` } },
              { ref: { ru: `Официальный банк вопросов теоретического экзамена, категория «A3» — Министерство транспорта и дорожной безопасности (gov.il/ru/departments/dynamiccollectors/theory-exam-a3), вопросы 0003 и 0022.`, en: `Official theory-exam question bank, category A3 — Ministry of Transport and Road Safety (gov.il/en/departments/dynamiccollectors/theory-exam-a3), questions 0003 and 0022.` }, note: { ru: `Формулировка определения «велосипед со вспомогательным двигателем» и порог 25 км/ч в том виде, в каком их спрашивают на экзамене.`, en: `The wording of the definition and the 25 km/h threshold exactly as the exam asks them.` } }
            ]
          },
          example: {
            label: { ru: "Четыре аппарата: какой из них электровелосипед?", en: "Four machines: which one is an electric bicycle?" },
            steps: [
              { ru: `Двухколёсный велосипед, мотор 250 Вт, помогает только когда крутишь педали, на 25 км/ч помощь пропадает — <strong>электровелосипед</strong>. Категория A3, с 16 лет.`, en: `Two wheels, a 250 W motor that helps only while you pedal, assistance gone at 25 km/h — <strong>an electric bicycle</strong>. Category A3, from 16.` },
              { ru: `Тот же велосипед, но хозяин снял ограничитель и разгоняется до 45 км/ч — <strong>уже нет</strong>. Внешне ничего не изменилось, юридически перед вами мотоцикл без прав, номера и страховки.`, en: `The same bicycle, but the owner stripped the limiter and now does 45 km/h — <strong>no longer one</strong>. Nothing changed to look at; in law it is a motorcycle with no licence, no plate and no insurance.` },
              { ru: `Трёхколёсный аппарат с ручкой газа и без педального привода — <strong>не подходит с самого начала</strong>: колёса стоят не одно за другим, и мотор включается не от педалей. Два условия из четырёх нарушены сразу.`, en: `A three-wheeler with a throttle and no pedal drive — <strong>never qualified in the first place</strong>: the wheels are not one behind the other and the motor does not run off the pedals. Two of the four conditions fail at once.` },
              { ru: `Обычный велосипед без мотора — <strong>тоже не электровелосипед</strong>. Правила движения к нему применяются те же, но всё, что касается двигателя и стандарта, к нему просто не относится.`, en: `An ordinary bicycle with no motor — <strong>also not an electric bicycle</strong>. The same traffic rules apply to it, but everything about motors and the standard simply does not.` }
            ]
          },
          quiz: {
            question: { ru: "Друг предлагает «прошить» контроллер, чтобы велосипед ехал до 40 км/ч: «педали же на месте, значит это всё равно велосипед». Что изменится юридически?", en: "A friend offers to reflash your controller so the bicycle will do 40 km/h: \"the pedals are still there, so it's still a bicycle.\" What changes in law?" },
            options: [
              { ru: "Ничего: педали на месте, конструкция та же — велосипед остаётся велосипедом.", en: "Nothing: the pedals are there and the frame is unchanged, so it stays a bicycle." },
              { ru: "Аппарат перестанет отвечать стандарту, и закон будет читать его как другое транспортное средство — с правами, номером и страховкой.", en: "The machine stops meeting the standard, and the law reads it as a different vehicle — licence, plate and insurance." },
              { ru: "Изменится только страховка: её придётся оформить отдельно, всё остальное останется как было.", en: "Only the insurance changes: you would take out a separate policy and everything else stays as it was." },
              { ru: "Ничего до первой аварии — пока никто не пострадал, превышение мощности никого не касается.", en: "Nothing until the first crash — while nobody is hurt, excess power is nobody's business." }
            ],
            correct: 1,
            explanation: { ru: `Определение держится на четырёх условиях стандарта одновременно, и отсечка на 25 км/ч — одно из них. Убрали её — аппарат вышел из категории A3 целиком, а не «частично». Первый вариант соблазнителен именно потому, что внешне ничего не поменялось: закон смотрит не на педали, а на соответствие стандарту.`, en: `The definition rests on all four conditions at once, and the 25 km/h cut-off is one of them. Remove it and the machine leaves category A3 entirely, not partly. The first option tempts precisely because nothing changed to look at: the law is not watching the pedals, it is watching compliance.` }
          },
          recall: {
            prompt: { ru: "Своими словами: по каким признакам закон отличает электровелосипед от мотоцикла?", en: "In your own words: by what features does the law tell an electric bicycle from a motorcycle?" },
            answer: { ru: `Два колеса, установленные одно за другим, и электродвигатель мощностью не выше 250 Вт, который работает от вращения педалей, слабеет по мере разгона и полностью отключается выше 25 км/ч — это стандарт SI 15194. Мотоцикл — всё, что вышло за эти рамки: больше мощности, снятый ограничитель, ручка газа, тянущая быстрее 6 км/ч. Соответствие стандарту — не «характеристика» аппарата, а условие, при котором вам вообще разрешено ехать по категории A3.`, en: `Two wheels mounted one behind the other, and an electric motor of no more than 250 W that runs off the pedals, weakens as speed rises and cuts out entirely above 25 km/h — that is standard SI 15194. A motorcycle is anything past those limits: more power, a stripped limiter, a throttle that pulls beyond 6 km/h. Meeting the standard is not a specification of the machine but the condition under which you are allowed to ride on category A3 at all.` },
            points: [
              { ru: `Два колеса, установленные одно за другим`, en: `Two wheels mounted one behind the other` },
              { ru: `Электродвигатель мощностью до 250 Вт`, en: `An electric motor of up to 250 W` },
              { ru: `Привод от педалей; ручка газа — только как выгул до 6 км/ч`, en: `Pedal-driven; a throttle only as a 6 km/h walk-assist` },
              { ru: `Полное отключение двигателя выше 25 км/ч`, en: `The motor cutting out entirely above 25 km/h` }
            ]
          },
          wisdomTags: ["beginning", "limits"]
        },

        {
          title: { ru: "Транспортное средство и участник движения", en: "A Vehicle, and a Road User" },
          glossary: [
            { term: { ru: "Участник дорожного движения", en: "Road user" }, definition: { ru: "Любой, кто находится на дороге и обязан подчиняться её правилам: водитель, велосипедист, пешеход.", en: "Anyone on the road and bound by its rules: driver, cyclist, pedestrian." } },
            { term: { ru: "«Да, если…»", en: "\"Yes, provided…\"" }, definition: { ru: "Типичная форма неверного варианта в банке A3: правильный ответ безусловен, приманка добавляет условие.", en: "The standard shape of a wrong option in the A3 bank: the right answer is unconditional, the bait adds a condition." } }
          ],
          explain: {
            blocks: [
              { text: { ru: `По закону электровелосипед — транспортное средство, а тот, кто на нём едет, — участник дорожного движения. Оба утверждения безусловны: не «если есть права», не «если едет по проезжей части», не «если исполнилось 18».<br><br>Это самая частая ловушка экзамена. Правильный ответ обычно короткий — «Да». Неправильные начинаются так же, но добавляют условие: «Да, если…».`, en: `In law an electric bicycle is a vehicle, and whoever rides it is a road user. Both statements are unconditional: not "if he holds a licence", not "if he is on the carriageway", not "if he is over 18".<br><br>This is the exam's most frequent trap. The right answer is usually the short one — "Yes." The wrong ones open the same way and then attach a condition: "Yes, provided…"` } },
              { heading: { ru: "Что из этого следует на дороге", en: "What that means on the road" }, text: { ru: `Раз вы участник движения, на вас распространяются те же правила и те же дорожные знаки, что и на водителя автомобиля. Красный сигнал — красный. «Въезд запрещён» — запрещён. Знак «уступи дорогу» обязывает уступить, а разметка полос значит для вас то же, что и для машин.<br><br>Отсюда же и обязанности перед пешеходами, и право полиции остановить вас, выписать штраф и запретить продолжать движение.`, en: `Being a road user puts you under the same rules and the same signs as the driver of a car. Red means red. No Entry means no entry. Give Way obliges you to give way, and lane markings mean for you what they mean for traffic.<br><br>The same clause is the source of what you owe pedestrians, and of the police power to stop you, fine you and end your ride.` } },
              { heading: { ru: "Почему закон устроен именно так", en: "Why the law is built this way" }, text: { ru: `Дорога работает, пока поведение участников предсказуемо. Водитель, заметивший вас в зеркале, строит свой манёвр на расчёте, что вы поедете по правилам. Как только у одного участника появляются «личные» правила, предсказуемость исчезает не только у него — она исчезает у всех, кто рядом.<br><br>Поэтому закон не делает скидку на то, что велосипед лёгкий, тихий и медленный. Такая скидка была бы не льготой, а дырой в общей системе.`, en: `A road works for exactly as long as people on it are predictable. The driver who catches you in the mirror plans the next manoeuvre on the assumption that you will ride by the rules. The moment one participant runs private rules, predictability does not fail for him alone — it fails for everyone near him.<br><br>So the law grants no discount for the bicycle being light, quiet and slow. That discount would not be a concession; it would be a hole in the system everyone else is relying on.` } }
            ],
            analogy: { ru: `Правила движения — как общий язык на переговорах. Пока все говорят на одном, короткого «уступаю» достаточно. Если один решит, что грамматика для него необязательна, остальные не станут понимать его хуже — они станут понимать его <em>неправильно</em>, а это опаснее молчания. Разница с языком одна: за акцент на дороге платят не смущением, а столкновением.`, en: `Traffic rules work like a shared language at a negotiation. While everyone speaks it, a two-word "after you" is enough. If one person decides grammar is optional for him, the others do not understand him <em>less</em> — they understand him <em>wrongly</em>, which is far worse than silence. One difference from language: on the road the price of an accent is not embarrassment but a collision.` },
            sources: [
              { ref: { ru: `Официальный банк вопросов теоретического экзамена, категория «A3» — Министерство транспорта и дорожной безопасности (gov.il/ru/departments/dynamiccollectors/theory-exam-a3), вопросы 0001, 0002, 0004 и 0026.`, en: `Official theory-exam question bank, category A3 — Ministry of Transport and Road Safety (gov.il/en/departments/dynamiccollectors/theory-exam-a3), questions 0001, 0002, 0004 and 0026.` }, note: { ru: `Четыре вопроса подряд, где верен безусловный ответ «Да», а неверные варианты добавляют условие про права, возраст или тип дороги.`, en: `Four questions in a row where the unconditional "Yes" is correct and every wrong option attaches a condition about licence, age or road type.` } },
              { ref: { ru: `<bdi>תקנות התעבורה, התשכ״א-1961, תקנה 39טז — «נהיגה והחזקה באופניים עם מנוע עזר»</bdi>. Полный текст: nevo.co.il/law_html/law01/p230_011.htm`, en: `Israeli Traffic Regulations 1961, reg. 39(16) — <bdi>תקנות התעבורה, התשכ״א-1961, תקנה 39טז — «נהיגה והחזקה באופניים עם מנוע עזר»</bdi>. Full text: nevo.co.il/law_html/law01/p230_011.htm` }, note: { ru: `Регулирование езды на электровелосипеде внутри общих Правил дорожного движения, а не отдельным законом — отсюда и общий статус участника движения.`, en: `Electric bicycles are regulated inside the general Traffic Regulations rather than by a separate act — which is where the shared road-user status comes from.` } }
            ]
          },
          example: {
            label: { ru: "Где заканчивается «Да» и начинается «Да, если…»", en: "Where \"Yes\" ends and \"Yes, provided…\" begins" },
            steps: [
              { ru: `«Обязан ли электровелосипедист соблюдать дорожные знаки?» — <strong>Да.</strong> Точка. Вариант «Да, если у него есть водительские права» проверяет, не решили ли вы, что обязанности приходят вместе с документом.`, en: `"Is a rider required to obey traffic signs?" — <strong>Yes.</strong> Full stop. The option "Yes, provided he has a driving licence" is testing whether you think duties arrive together with a document.` },
              { ru: `«Считается ли электровелосипедист участником дорожного движения?» — <strong>Да.</strong> Вариант «Да, если он едет по дороге» звучит логично, но статус не включается и не выключается в зависимости от того, где вы едете.`, en: `"Is a rider considered a road user?" — <strong>Yes.</strong> The option "Yes, provided he is riding on a road" sounds reasonable, but the status does not switch on and off according to where you happen to be.` },
              { ru: `«Обязаны ли велосипедисты соблюдать те же правила, что и водители автомобилей?» — <strong>Да.</strong> Здесь приманка «Да, но только при езде по дороге» повторяет ту же схему третий раз подряд.`, en: `"Do riders have to obey the same rules as car drivers?" — <strong>Yes.</strong> Here the bait, "Yes, but only when riding on the road", runs the same pattern for the third time in a row.` },
              { ru: `Исключение, которое стоит помнить: короткое «Нет» тоже бывает правильным — например, про буксировку или про тротуар. Безусловность, а не слово «да», — вот что общего у верных ответов.`, en: `One exception worth holding on to: the short "No" is sometimes the right answer too — towing, for instance, or the pavement. What the correct answers share is being unconditional, not the word yes.` }
            ]
          },
          quiz: {
            question: { ru: "Велодорожка закончилась, вы выезжаете на проезжую часть и видите знак «уступи дорогу». Прав у вас нет, вам 16 лет. Что обязывает вас сделать этот знак?", en: "The cycle lane ends, you move onto the carriageway and there is a Give Way sign. You hold no licence and you are 16. What does that sign require of you?" },
            options: [
              { ru: "Ничего: дорожные знаки адресованы транспортным средствам с номерными знаками.", en: "Nothing: road signs address vehicles that carry number plates." },
              { ru: "Ничего до 18 лет — до этого возраста велосипедист приравнен к пешеходу.", en: "Nothing until 18 — below that age a rider counts as a pedestrian." },
              { ru: "Уступить дорогу, как любому другому участнику движения: ни возраст, ни отсутствие прав здесь ничего не меняют.", en: "Give way, like any other road user: neither your age nor the missing licence changes anything here." },
              { ru: "Уступить, только если по главной дороге действительно едет автомобиль, — иначе знак можно проехать не снижая скорости.", en: "Give way only if a car is actually coming along the main road — otherwise you may pass the sign without slowing." }
            ],
            correct: 2,
            explanation: { ru: `Статус участника движения не зависит ни от прав, ни от возраста, ни от того, где именно вы едете, — поэтому все варианты с условием неверны. Последний особенно соблазнителен: он выглядит как здравый смысл («уступать некому»), но знак предписывает поведение, а не результат — снизить скорость и убедиться нужно в любом случае.`, en: `Road-user status depends on neither licence nor age nor where exactly you are riding, so every conditional option is wrong. The last one tempts hardest because it looks like common sense — there is nobody to give way to — but the sign prescribes behaviour, not an outcome: you slow down and check either way.` }
          },
          recall: {
            prompt: { ru: "Почему на экзамене A3 вариант «Да, если у велосипедиста есть водительские права» почти всегда неверен?", en: "Why is \"Yes, provided the rider has a driving licence\" almost always wrong on the A3 exam?" },
            answer: { ru: `Потому что статус электровелосипеда как транспортного средства и статус велосипедиста как участника дорожного движения закон устанавливает безусловно. Наличие прав, возраст 18 лет, езда именно по проезжей части — это не условия, а лишние оговорки, которые в вопросах служат приманкой. Обязанность соблюдать знаки, правила и приоритет пешеходов возникает в тот момент, когда вы сели на велосипед, а не когда выполнилось дополнительное условие.`, en: `Because the law establishes both statuses unconditionally: the electric bicycle is a vehicle, and its rider is a road user. Holding a licence, being 18, being on the carriageway specifically — these are not conditions but spare qualifiers, and in the question bank they exist as bait. The duty to obey signs, rules and pedestrian priority begins the moment you get on the bicycle, not when some extra condition is met.` },
            points: [
              { ru: `Электровелосипед — транспортное средство`, en: `An electric bicycle is a vehicle` },
              { ru: `Велосипедист — участник дорожного движения`, en: `Its rider is a road user` },
              { ru: `Условий «если права / если 18 / если по дороге» в законе нет`, en: `The law carries no "if licensed / if 18 / if on the road" condition` },
              { ru: `Те же знаки и правила, что и для водителя автомобиля`, en: `The same signs and rules as for a car driver` }
            ]
          },
          wisdomTags: ["self-deception", "evidence"]
        },

        {
          title: { ru: "Категория A3: что она даёт и где её границы", en: "Category A3: What It Gives You and Where It Ends" },
          glossary: [
            { term: { ru: "Теория A3", en: "A3 theory test" }, definition: { ru: "Компьютерный тест на 30 вопросов. Банк из 40 опубликованных вопросов — основа, но министерство прямо предупреждает, что он не исчерпывающий.", en: "A 30-question computer test. The published bank of 40 is the basis, but the Ministry states plainly that it is not exhaustive." } },
            { term: { ru: "Отсечка 25 км/ч", en: "The 25 km/h cut-off" }, definition: { ru: "Скорость, выше которой двигатель обязан перестать помогать. Не ограничение вашей скорости, а условие стандарта.", en: "The speed above which the motor must stop assisting. Not a limit on how fast you may go — a condition of the standard." } }
          ],
          explain: {
            blocks: [
              { text: { ru: `Категория <strong>A3</strong> появилась 1 января 2019 года и существует ровно для одного — для электровелосипедов и электросамокатов. Это не «полноценные права»: на автомобиль или мотоцикл она не даёт ничего.<br><br>Порядок простой. Сдавать теорию A3 можно с 15 с половиной лет, ездить — с 16. Тому, у кого уже есть обычные водительские права, отдельный экзамен A3 не нужен.`, en: `<strong>Category A3</strong> came in on 1 January 2019 and exists for exactly one purpose: electric bicycles and electric scooters. It is not a full licence — it entitles you to nothing on a car or a motorcycle.<br><br>The sequence is simple. You may sit the A3 theory test from fifteen and a half, and ride from 16. Anyone who already holds an ordinary driving licence needs no separate A3 exam.` } },
              { heading: { ru: "Что именно проверяют", en: "What is actually being tested" }, text: { ru: `Экзамен A3 — компьютерный тест на 30 вопросов. Министерство публикует банк из 40 вопросов с ответами, и весь этот банк лежит в основе курса — целиком, без пропусков.<br><br>Но там же стоит важная оговорка: <strong>банк не исчерпывающий, и на экзамене могут появиться другие или дополнительные вопросы</strong>. Поэтому выучить 40 ответов наизусть — плохая стратегия: она рассыплется на первой же незнакомой формулировке. Работает другое — понять логику, по которой эти ответы устроены, и она в курсе разобрана отдельно.`, en: `The A3 exam is a 30-question computer test. The Ministry publishes a bank of 40 questions with their answers, and that entire bank underpins this course — all of it, nothing skipped.<br><br>But the same page carries an important qualifier: <strong>the bank is not exhaustive, and other or additional questions may appear in the exam</strong>. Memorising 40 answers is therefore a poor strategy — it collapses at the first unfamiliar wording. What works is understanding the logic those answers are built on, which is what this course spends its time on.` } },
              { heading: { ru: "Где проходит граница категории", en: "Where the category stops" }, text: { ru: `Категория покрывает стандартный электровелосипед — тот самый, у которого двигатель отключается выше <strong>25 км/ч</strong>. Это потолок не для вашей скорости вообще (под уклон вы поедете быстрее и не нарушите ничего), а для помощи двигателя.<br><br>Как только аппарат перестаёт отвечать стандарту, A3 перестаёт его покрывать, и вместе с ней исчезает законное основание поездки. Поэтому вопрос про 25 км/ч в банке стоит рядом с определением, а не в разделе про скорость.<br><br>Историческая деталь на всякий случай: у велосипедов, купленных до 1 июля 2014 года, есть ещё и потолок массы — <strong>30 кг</strong>. К более новым он не применяется.`, en: `The category covers the standard electric bicycle — the one whose motor cuts out above <strong>25 km/h</strong>. That is a ceiling on the motor's assistance, not on your speed as such: downhill you will go faster and break nothing.<br><br>The moment the machine stops meeting the standard, A3 stops covering it, and the legal basis of your ride disappears with it. That is why the 25 km/h question sits beside the definition in the bank rather than in the section about speed.<br><br>One historical detail, in case you meet it: bicycles bought before 1 July 2014 also carry a weight ceiling of <strong>30 kg</strong>. It does not apply to newer ones.` } }
            ],
            analogy: { ru: `A3 похожа на пропуск в один конкретный корпус здания. Свою дверь он открывает надёжно и без вопросов, но приложить его к соседней бессмысленно — не потому, что пропуск «слабый», а потому, что он выдан под другую дверь. И как только вы перестраиваете саму дверь, пропуск перестаёт подходить и к ней тоже.`, en: `A3 is like a pass to one particular wing of a building. It opens its own door reliably and without argument, but holding it to the next door is pointless — not because the pass is weak, but because it was issued against a different door. And the moment you rebuild that door, the pass stops matching it too.` },
            sources: [
              { ref: `The Times of Israel — «New driver's license instituted for electric bicycles» (timesofisrael.com).`, note: { ru: `Дата введения категории A3 — 1 января 2019 года — и то, что она создана исключительно для электровелосипедов.`, en: `The date category A3 came in — 1 January 2019 — and that it was created for electric bicycles alone.` } },
              { ref: `AIC — «Riding Electric Bikes and Scooters in Israel: eligibility and vehicle registration» (aic.org.il).`, note: { ru: `Возраст 16 лет для езды, 15,5 для сдачи теории и то, что обычные водительские права заменяют экзамен A3.`, en: `Age 16 to ride, 15.5 to sit the theory, and that an ordinary driving licence stands in for the A3 exam.` } },
              { ref: { ru: `Официальный банк вопросов теоретического экзамена, категория «A3» — Министерство транспорта и дорожной безопасности (gov.il/ru/departments/dynamiccollectors/theory-exam-a3).`, en: `Official theory-exam question bank, category A3 — Ministry of Transport and Road Safety (gov.il/en/departments/dynamiccollectors/theory-exam-a3).` }, note: { ru: `Сам банк: 40 опубликованных вопросов. Источник всех экзаменационных вопросов этого курса.`, en: `The bank itself: 40 published questions. The source of every exam question in this course.` } },
              { ref: { ru: `Тот же банк на иврите — <bdi>מאגר שאלות ותשובות מדגמיות למבחן עיוני ייעודי לרוכבי אופניים חשמליים</bdi> (gov.il/he/departments/dynamiccollectors/theory-exam-a3).`, en: `The same bank in Hebrew — <bdi>מאגר שאלות ותשובות מדגמיות למבחן עיוני ייעודי לרוכבי אופניים חשמליים</bdi> (gov.il/he/departments/dynamiccollectors/theory-exam-a3).` }, note: { ru: `Оговорка министерства, которой нет на русской странице: «<bdi>מאגר השאלות והתשובות איננו מאגר ממצה. במבחן העיוני עשויות להופיע שאלות נוספות או אחרות</bdi>» — банк не исчерпывающий, на экзамене могут быть другие вопросы.`, en: `The Ministry's qualifier, absent from the other language pages: "<bdi>מאגר השאלות והתשובות איננו מאגר ממצה. במבחן העיוני עשויות להופיע שאלות נוספות או אחרות</bdi>" — the bank is not exhaustive and other questions may appear in the exam.` } }
            ]
          },
          example: {
            label: { ru: "Кому что нужно сдавать", en: "Who has to sit what" },
            steps: [
              { ru: `Вам 15 лет и 7 месяцев — <strong>теорию сдавать можно</strong>, ездить пока нельзя. Экзамен и допуск к дороге разнесены по возрасту специально.`, en: `You are 15 years and 7 months — <strong>you may sit the theory</strong>, you may not ride yet. The exam and the permission to ride are deliberately set at different ages.` },
              { ru: `Вам 16, прав нет — <strong>нужна теория A3</strong>. Это ваш случай и ради него написан весь курс.`, en: `You are 16 with no licence — <strong>you need the A3 theory</strong>. That is the case this whole course was written for.` },
              { ru: `Вам 19, есть права категории B — <strong>ничего сдавать не нужно</strong>. Обычные водительские права заменяют A3.`, en: `You are 19 and hold a category B licence — <strong>you sit nothing</strong>. An ordinary driving licence stands in for A3.` },
              { ru: `Вам 16, теория A3 сдана, но велосипед разогнан до 45 км/ч — <strong>сданный экзамен не поможет</strong>: категория покрывает аппарат по стандарту, а этот аппарат из стандарта вышел.`, en: `You are 16, A3 is passed, but the bicycle has been tuned to 45 km/h — <strong>the pass does not help</strong>: the category covers a machine that meets the standard, and this one has left it.` }
            ]
          },
          quiz: {
            question: { ru: "Какова предельная скорость (в километрах в час), при превышении которой двигатель электровелосипеда должен отключиться?", en: "What is the speed limit (in kilometers per hour [km/h]), above which the motor on the electric bicycle must disengage?" },
            options: [
              { ru: "25 км/ч.", en: "25 km/h." },
              { ru: "10 км/ч.", en: "10 km/h." },
              { ru: "40 км/ч.", en: "40 km/h." },
              { ru: "25 км/ч на дороге в населённом пункте, 40 км/ч на свободной дороге и 60 км/ч на физически обособленной дороге.", en: "25 km/h on a road in a built-up area, 40 km/h on an open road, and 60 km/h on a physically-separated road." }
            ],
            correct: 0,
            explanation: { ru: `25 км/ч — единственное число, зашитое в стандарт SI 15194, и оно одинаково везде. Последний вариант правдоподобен, потому что перечисляет настоящие ограничения скорости для автомобилей, — но отсечка двигателя не зависит ни от типа дороги, ни от знаков: это свойство самого велосипеда, а не участка пути.`, en: `25 km/h is the single number written into SI 15194, and it is the same everywhere. The last option is plausible because it lists real speed limits for cars — but the motor's cut-off depends on neither road type nor signage. It is a property of the bicycle, not of the stretch of road.` }
          },
          recall: {
            prompt: { ru: "Что даёт категория A3, чего она не даёт и с какого возраста ей можно пользоваться?", en: "What does category A3 give you, what does it not, and from what age can you use it?" },
            answer: { ru: `A3 — водительская категория для электровелосипедов и электросамокатов, действующая с 1 января 2019 года. Она разрешает ездить на стандартном электровелосипеде с 16 лет; сдавать теорию можно с 15,5. Она не даёт права на автомобиль или мотоцикл, и она не нужна тому, у кого уже есть обычные водительские права. Покрывает она только аппарат, отвечающий стандарту: как только двигатель перестаёт отключаться выше 25 км/ч, категория к нему не относится.`, en: `A3 is the driving category for electric bicycles and scooters, in force since 1 January 2019. It permits riding a standard electric bicycle from 16; the theory may be sat from 15.5. It confers nothing on a car or a motorcycle, and it is unnecessary for anyone already holding an ordinary driving licence. It covers only a machine that meets the standard: once the motor stops cutting out above 25 km/h, the category no longer applies to it.` },
            points: [
              { ru: `Только электровелосипеды и электросамокаты`, en: `Electric bicycles and scooters only` },
              { ru: `Ездить с 16 лет, сдавать теорию с 15,5`, en: `Ride from 16, sit the theory from 15.5` },
              { ru: `Обычные водительские права заменяют A3`, en: `An ordinary driving licence stands in for A3` },
              { ru: `Не покрывает аппарат, вышедший за стандарт`, en: `Does not cover a machine that has left the standard` }
            ]
          },
          wisdomTags: ["planning", "limits"]
        }
      ],
      examQuestions: [
        {
          question: { ru: "Считается ли электровелосипед транспортным средством согласно закону?", en: "Is an electric bicycle considered by law to be a vehicle?" },
          options: [
            { ru: "Нет.", en: "No." },
            { ru: "Да.", en: "Yes." },
            { ru: "Да. Если у велосипедиста есть водительские права.", en: "Yes. Provided the rider has a driving license." },
            { ru: "Да. Если он приводится в движение двигателем.", en: "Yes. Provided they are powered with a motor." }
          ],
          correct: 1
        },
        {
          question: { ru: "Считается ли электровелосипедист участником дорожного движения согласно закону?", en: "Is a rider on an electric bicycle considered by law to be a “road user”?" },
          options: [
            { ru: "Нет.", en: "No." },
            { ru: "Да.", en: "Yes." },
            { ru: "Да. Если он едет по дороге.", en: "Yes. Provided he is riding on a road." },
            { ru: "Да. Если у него есть водительские права как минимум категории B.", en: "Yes. Provided he has a Class B driving license as a minimum." }
          ],
          correct: 1
        },
        {
          question: { ru: "Согласно закону, «велосипедами со вспомогательным двигателем» являются:", en: "According to the law, \"electric bicycle\" are:" },
          options: [
            { ru: "Трёхколёсный велосипед.", en: "tricycle." },
            { ru: "Велосипед с двумя колёсами, установленными одно за другим, на котором установлен электродвигатель.", en: "A bicycle with two wheels mounted one behind the other, in which an electric motor is installed." },
            { ru: "Мотоцикл.", en: "motorcycle." },
            { ru: "Все ответы верны.", en: "All answers are correct." }
          ],
          correct: 1
        },
        {
          question: { ru: "Обязан ли электровелосипедист соблюдать требования знаков дорожного движения?", en: "Is a rider on an electric bicycle required to obey traffic signs?" },
          options: [
            { ru: "Нет.", en: "No." },
            { ru: "Да.", en: "Yes." },
            { ru: "Да. Если ему исполнилось 18 лет.", en: "Provided he is at least 18 years old." },
            { ru: "Да. Если у него есть водительские права.", en: "Yes. Provided he has a driving license." }
          ],
          correct: 1
        },
        {
          question: { ru: "Обязаны ли электровелосипедисты соблюдать правила дорожного движения и указания дорожных знаков, которые обязательны для водителей автомобилей?", en: "Are the instructions in the regulations and according to the road signs, which are applicable to car drivers, also applicable to electric bicycle riders?" },
          options: [
            { ru: "Да, но только при езде по дороге.", en: "Yes, but only when riding on the road." },
            { ru: "Да, но только при наличии у велосипедиста водительских прав.", en: "Yes, but only if the rider has a driving license." },
            { ru: "Да.", en: "Yes." },
            { ru: "Нет.", en: "No." }
          ],
          correct: 2
        }
      ]
    },
    // ============================================================
    {
      id: "bike-rider",
      title: { ru: "Кто и на чём может ехать", en: "Who May Ride, and on What" },
      desc: { ru: "Возраст, допуск, пассажиры, дети и то, что запрещено цеплять к велосипеду", en: "Age, entitlement, passengers, children, and what you may never attach to a bicycle" },
      icon: "\u{1F464}",
      chunks: [
        {
          title: { ru: "С какого возраста и по какому документу", en: "From What Age, and on What Document" },
          glossary: [
            { term: { ru: "Допуск к езде", en: "Entitlement to ride" }, definition: { ru: "Одно из трёх: сданная теория A3, израильские водительские права любой категории или иностранные водительские права.", en: "One of three: a passed A3 theory test, an Israeli driving licence of any category, or a foreign driving licence." } },
            { term: { ru: "15,5 года", en: "15.5 years" }, definition: { ru: "Возраст, с которого разрешено сдавать теорию A3 — на полгода раньше, чем разрешено ездить.", en: "The age from which you may sit the A3 theory — six months before you may ride." } }
          ],
          predict: {
            question: { ru: "С какого возраста в Израиле разрешено ездить на электровелосипеде?", en: "From what age are you allowed to ride an electric bicycle in Israel?" },
            options: [
              { ru: "С 12 лет", en: "From 12" },
              { ru: "С 14 лет", en: "From 14" },
              { ru: "С 16 лет", en: "From 16" },
              { ru: "С 18 лет", en: "From 18" }
            ],
            reveal: { ru: "Планку поднимали, и старое число у многих осталось в памяти как действующее. Дальше — почему выбрали именно этот возраст и чего он не отменяет.", en: "The threshold was raised, and plenty of people still carry the old number as the current one. Next: why this particular age was chosen, and what it does not cancel." }
          },
          explain: {
            blocks: [
              { text: { ru: `Ездить на электровелосипеде разрешено <strong>с 16 лет</strong>. Не с 12, не с 14 — с шестнадцати. Это одно из немногих чисел в курсе, которое нужно просто знать: в вопросе оно стоит рядом с тремя правдоподобными соседями, и рассуждением его не вывести.<br><br>Сдать теорию A3 можно чуть раньше — с 15 с половиной лет, чтобы ко дню рождения документ уже был на руках.`, en: `You may ride an electric bicycle <strong>from 16</strong>. Not 12, not 14 — sixteen. This is one of the few numbers in the course you simply have to know: in the question it sits beside three plausible neighbours, and no amount of reasoning will produce it.<br><br>The A3 theory can be sat a little earlier — from fifteen and a half — so that the document is already in hand by the birthday.` } },
              { heading: { ru: "Три законных основания", en: "Three lawful grounds" }, text: { ru: `На дорогу вас пускает одно из трёх: сданная теория A3, действующие израильские водительские права любой категории или иностранные водительские права. Достаточно чего-то одного — но «ничего» не подходит.<br><br>Возрастную планку поднимали именно потому, что предыдущая не работала: аппарат, спокойно едущий 25 км/ч в потоке машин, требует навыка читать дорогу, которого у двенадцатилетнего просто нет.`, en: `One of three things lets you onto the road: a passed A3 theory, a valid Israeli driving licence of any category, or a foreign driving licence. Any one of them is enough — but none of them is not.<br><br>The age threshold was raised precisely because the previous one did not work: a machine that comfortably holds 25 km/h in traffic demands an ability to read the road that a twelve-year-old simply has not built yet.` } },
              { heading: { ru: "Кто отвечает, пока вам нет 18", en: "Who answers for it while you are under 18" }, text: { ru: `Несовершеннолетний велосипедист не выпадает из закона: штраф выписывается, полиция вправе остановить и запретить дальнейшую езду, а ответственность за причинённый ущерб ложится на семью. Возраст не смягчает правила — он определяет только то, с какого дня они к вам применяются.<br><br>Отсюда и типичная приманка в вопросах банка: «разрешено, если велосипедисту исполнилось 18». Восемнадцать в этом курсе не значит ничего.`, en: `A minor rider does not fall outside the law: the fine is written, the police may stop the ride and forbid its continuation, and liability for damage lands on the family. Age does not soften the rules — it only sets the day from which they start applying to you.<br><br>Hence the standard bait across the bank: "permitted, provided the rider is 18". Eighteen means nothing anywhere in this course.` } }
            ],
            analogy: { ru: `Возрастной порог здесь — как допуск к погрузчику на складе. Дело не в росте и не в силе: управлять физически сможет и подросток. Дело в том, что ошибка стоит слишком дорого, чтобы учиться на ней в общем проходе. Разница с погрузчиком одна: там за новичком присматривает бригадир, а на дороге — никто.`, en: `The age threshold works like a forklift certificate in a warehouse. It is not about height or strength: a teenager could physically drive one. It is that the cost of a mistake is too high to be learned in a shared aisle. One difference from the forklift: there a supervisor watches the newcomer, and on the road nobody does.` },
            sources: [
              { ref: { ru: `Официальный банк вопросов теоретического экзамена, категория «A3» — Министерство транспорта и дорожной безопасности (gov.il/ru/departments/dynamiccollectors/theory-exam-a3), вопрос 0007.`, en: `Official theory-exam question bank, category A3 — Ministry of Transport and Road Safety (gov.il/en/departments/dynamiccollectors/theory-exam-a3), question 0007.` }, note: { ru: `Минимальный возраст 16 лет в той формулировке, в какой он вынесен на экзамен.`, en: `The minimum age of 16 in the wording the exam puts it in.` } },
              { ref: { ru: `<bdi>תקנות התעבורה, התשכ״א-1961, תקנה 39טז — «נהיגה והחזקה באופניים עם מנוע עזר»</bdi>. Полный текст: nevo.co.il/law_html/law01/p230_011.htm`, en: `Israeli Traffic Regulations 1961, reg. 39(16) — <bdi>תקנות התעבורה, התשכ״א-1961, תקנה 39טז — «נהיגה והחזקה באופניים עם מנוע עזר»</bdi>. Full text: nevo.co.il/law_html/law01/p230_011.htm` }, note: { ru: `Сама норма о том, кому разрешено управлять электровелосипедом и владеть им.`, en: `The regulation itself on who may ride and keep an electric bicycle.` } },
              { ref: `AIC — «Riding Electric Bikes and Scooters in Israel: eligibility and vehicle registration» (aic.org.il).`, note: { ru: `Три основания допуска и возраст 15,5 года для сдачи теории A3.`, en: `The three grounds of entitlement and the age of 15.5 for sitting the A3 theory.` } }
            ]
          },
          example: {
            label: { ru: "Кому что нужно, чтобы выехать законно", en: "What each person needs in order to ride legally" },
            steps: [
              { ru: `15 лет и 7 месяцев — <strong>теорию сдавать можно, ездить нельзя</strong>. Экзамен и допуск к дороге разнесены по возрасту специально.`, en: `15 years and 7 months — <strong>you may sit the theory, you may not ride</strong>. The exam and the permission are set at different ages on purpose.` },
              { ru: `16 лет, прав нет — <strong>нужна теория A3</strong>. Ровно тот случай, ради которого написан этот курс.`, en: `16, no licence — <strong>you need the A3 theory</strong>. Exactly the case this course was written for.` },
              { ru: `19 лет, есть права категории B — <strong>сдавать ничего не нужно</strong>: обычные водительские права заменяют A3.`, en: `19, holding a category B licence — <strong>nothing to sit</strong>: an ordinary driving licence stands in for A3.` },
              { ru: `16 лет, теория сдана, но велосипед разогнан до 45 км/ч — <strong>сданный экзамен не помогает</strong>: категория покрывает аппарат по стандарту, а этот из стандарта вышел.`, en: `16, theory passed, but the bicycle has been tuned to 45 km/h — <strong>the pass does not help</strong>: the category covers a machine that meets the standard, and this one has left it.` }
            ]
          },
          quiz: {
            question: { ru: "Вашему брату 14, катается он уверенно и просит велосипед доехать до магазина — два квартала по тихой улице. Как на это смотрит закон?", en: "Your brother is 14, rides confidently, and asks to take the bicycle to the shop — two blocks down a quiet street. How does the law see it?" },
            options: [
              { ru: "Разрешено: до 16 лет запрет действует только на проезжей части, а по тихим улицам можно.", en: "Allowed: below 16 the ban applies only to the carriageway, and quiet streets are fine." },
              { ru: "Разрешено, если он наденет шлем — шлем и есть то условие, ради которого стоит возрастная планка.", en: "Allowed if he wears a helmet — the helmet is the condition the age threshold exists for." },
              { ru: "Разрешено, если вы едете рядом и присматриваете за ним.", en: "Allowed if you ride alongside and keep an eye on him." },
              { ru: "Запрещено: минимальный возраст — 16 лет, и он не зависит ни от длины поездки, ни от улицы, ни от сопровождения.", en: "Forbidden: the minimum age is 16, and it depends on neither the length of the trip, nor the street, nor supervision." }
            ],
            correct: 3,
            explanation: { ru: `Порог в 16 лет безусловный — ровно как статус участника движения в прошлой теме. Опаснее всего второй вариант: шлем действительно обязателен, и настоящее требование здесь подставлено вместо возрастного, чтобы ответ выглядел ответственным. Одно обязательное условие никогда не отменяет другое.`, en: `The threshold of 16 is unconditional — exactly like road-user status in the previous topic. The second option is the dangerous one: the helmet really is mandatory, and a genuine requirement has been slipped in to stand where the age requirement belongs, so the answer looks responsible. One mandatory condition never cancels another.` }
          },
          recall: {
            prompt: { ru: "С какого возраста разрешено ездить на электровелосипеде и какие документы дают на это право?", en: "From what age may you ride an electric bicycle, and what documents grant that right?" },
            answer: { ru: `Ездить разрешено с 16 лет. Право даёт одно из трёх: сданная теория A3, действующие израильские водительские права любой категории или иностранные водительские права. Сдавать саму теорию можно с 15 с половиной лет. Возраст и основание — два отдельных условия, и выполнить нужно оба: сданный экзамен не разрешает ездить в 15, а исполнившиеся 16 не разрешают ездить без основания.`, en: `Riding is permitted from 16. The right comes from one of three things: a passed A3 theory, a valid Israeli driving licence of any category, or a foreign driving licence. The theory itself may be sat from fifteen and a half. Age and grounds are two separate conditions and both must hold: a passed exam does not let you ride at 15, and turning 16 does not let you ride with no grounds at all.` },
            points: [
              { ru: `16 лет — минимальный возраст езды`, en: `16 is the minimum riding age` },
              { ru: `Теорию A3 можно сдавать с 15,5 лет`, en: `The A3 theory may be sat from 15.5` },
              { ru: `Израильские или иностранные права заменяют теорию A3`, en: `An Israeli or foreign licence stands in for the A3 theory` },
              { ru: `Возраст и документ — два условия, нужны оба`, en: `Age and document are two conditions; both are needed` }
            ]
          },
          wisdomTags: ["limits", "planning"]
        },

        {
          title: { ru: "Пассажир и ребёнок", en: "A Passenger, and a Child" },
          glossary: [
            { term: { ru: "Специально предназначен", en: "Purpose-built for it" }, definition: { ru: "Формулировка закона: место для второго человека предусмотрено конструкцией велосипеда, а не придумано ездоком.", en: "The law's wording: a place for a second person is designed into the bicycle, not improvised by the rider." } },
            { term: { ru: "Шлем", en: "Helmet" }, definition: { ru: "Обязателен водителю и пассажиру всегда. Отдельная норма, не условие перевозки; для электровелосипеда городских послаблений нет.", en: "Mandatory for rider and passenger alike, always. A separate rule rather than a condition of carrying; for electric bicycles there is no urban exemption." } },
            { term: { ru: "Отдельное сиденье", en: "Separate seat" }, definition: { ru: "Детское кресло, обеспечивающее безопасность ребёнка. Багажник, рама и колени взрослого сиденьем не считаются.", en: "A child seat that secures the child. A rack, the frame and an adult's lap do not count as one." } }
          ],
          explain: {
            blocks: [
              { text: { ru: `Везти второго человека на электровелосипеде можно только в одном случае: если аппарат <em>специально для этого предназначен</em> — то есть конструкцией предусмотрено место для ещё одного человека.<br><br>Не «если пассажиру есть 16», не «если недалеко». Условие ровно одно, и оно про велосипед, а не про людей на нём.<br><br>И отдельно: <strong>кому ещё нет 14, не может везти никого</strong> — каким бы подходящим ни был велосипед.`, en: `You may carry a second person on an electric bicycle in one case only: if the machine is <em>purpose-built for it</em> — that is, a place for another person is part of its design.<br><br>Not "if the passenger is 16", not "if it is a short way". There is exactly one condition, and it is about the bicycle rather than about the people on it.<br><br>And separately: <strong>anyone under 14 may carry nobody at all</strong>, however suitable the bicycle.` } },
              { heading: { ru: "Шлем обязателен всегда — но это другое правило", en: "Helmets are always required — but that is a different rule" }, text: { ru: `Шлем нужен и водителю, и пассажиру, всегда. Но требование это живёт не в правиле о перевозке, а отдельно — поэтому в экзаменационном вопросе «оба в шлемах» и есть <em>неверный</em> ответ.<br><br>Шлем обязателен независимо от того, везёте вы кого-то или едете один. Значит, он не может быть тем условием, которое <em>разрешает</em> перевозку: разрешает конструкция. Обязательным он при этом быть не перестаёт.<br><br>Для электровелосипеда послаблений нет: взрослый на обычном велосипеде в городе от шлема освобождён, но как только на велосипеде есть мотор, освобождение не работает.`, en: `Both rider and passenger need a helmet, always. But that duty lives in a different rule from the one about carrying people — which is exactly why "both wearing helmets" is the <em>wrong</em> answer on the exam.<br><br>A helmet is required whether or not you are carrying anyone. So it cannot be the condition that <em>permits</em> carrying: the construction is. That does not make it any less mandatory.<br><br>For electric bicycles there is no let-off. An adult on an ordinary bicycle in town is exempt from the helmet, but the moment the bicycle has a motor the exemption stops applying.` } },
              { heading: { ru: "Ребёнок до 8 лет — отдельное правило", en: "A child under 8 is a separate rule" }, text: { ru: `Ребёнка младше восьми лет везти разрешено, но при двух условиях сразу: велосипед оборудован отдельным сиденьем, обеспечивающим безопасность ребёнка, и ребёнок в подходящем шлеме. Багажник, рама и колени взрослого сиденьем не считаются.<br><br>Заметьте асимметрию: для взрослого пассажира достаточно, чтобы конструкция это допускала, а для ребёнка требуется ещё и специальное кресло, и шлем.`, en: `A child under eight may be carried, but on two conditions at once: the bicycle is fitted with a separate seat that secures the child, and the child wears a suitable helmet. A rack, the frame and an adult's lap do not count as a seat.<br><br>Note the asymmetry: for an adult passenger it is enough that the design allows it, while a child additionally requires the dedicated seat and the helmet.` } },
              { heading: { ru: "Почему второй человек меняет физику", en: "Why a second person changes the physics" }, text: { ru: `Пассажир — это не «плюс вес». Это поднявшийся и подвижный центр тяжести: человек за спиной шевелится, наклоняется в поворотах не туда и не удерживает равновесие вместе с вами.<br><br>Тормозной путь растёт, а рама и тормоза, рассчитанные на одного, работают на пределе. Отсюда требование к конструкции, а не к добрым намерениям: сиденье с подножками фиксирует пассажира там, где велосипед к этому готов.`, en: `A passenger is not "plus weight" but a centre of gravity that has risen and started moving on its own: the person behind you shifts, leans the wrong way through corners, and does not hold the balance with you.<br><br>Braking distance grows while a frame built for one works at its limit. Hence a requirement about design rather than about good intentions.` } }
            ],
            analogy: { ru: `Пассажирское место — как второе кресло в самолёте: оно либо предусмотрено конструкцией, либо нет, и «посидеть на подлокотнике» не вариант ни при каких обстоятельствах. Разница в том, что в самолёте кресло видно сразу, а велосипедный багажник выглядит как сиденье — поэтому закон описывает не удобство, а назначение.`, en: `A passenger place is like a second seat on an aircraft: either the design has one or it does not, and perching on the armrest is not an option under any circumstances. The difference is that on a plane you can see the seat at once, while a bicycle rack looks like somewhere to sit — which is why the law describes purpose rather than comfort.` },
            sources: [
              { ref: { ru: `<bdi>תקנות התעבורה, התשכ״א-1961, תקנה 124 — «הרכבת אנשים על אופניים»</bdi>. Полный текст: nevo.co.il/law_html/law01/p230_011.htm`, en: `Israeli Traffic Regulations 1961, reg. 124 — <bdi>תקנות התעבורה, התשכ״א-1961, תקנה 124 — «הרכבת אנשים על אופניים»</bdi>. Full text: nevo.co.il/law_html/law01/p230_011.htm` }, note: { ru: `Норма о перевозке людей: требование к конструкции, отдельное сиденье для ребёнка до 8 лет и запрет возить кого-либо тем, кому нет 14. О шлеме в ней не сказано ничего — он в другом законе.`, en: `The regulation on carrying people: the design requirement, the separate seat for a child under 8, and the ban on anyone under 14 carrying a passenger. It says nothing about helmets — those are in a different statute.` } },
              { ref: { ru: `<bdi>פקודת התעבורה [נוסח חדש], סעיף 65ג — «חובת חבישת קסדת מגן»</bdi>. Изложение на сайте Управления по безопасности дорожного движения: gov.il/he/pages/helmet_regulations`, en: `Israeli Traffic Ordinance [New Version], s. 65C — <bdi>«חובת חבישת קסדת מגן»</bdi>. Summarised by the National Road Safety Authority: gov.il/he/pages/helmet_regulations` }, note: { ru: `«לא ירכב אדם על אופניים, ולא ירכיב אדם אחר, אלא אם כן הם חובשים קסדת מגן» — шлем на обоих. Там же исключение для взрослого в городе и оговорка, что оно не действует, если на велосипеде есть мотор.`, en: `"A person shall not ride a bicycle, nor carry another person, unless they are wearing a helmet" — both of them. The same section carries the urban exemption for adults and the proviso that it lapses once the bicycle has a motor.` } },
              { ref: { ru: `Официальный банк вопросов теоретического экзамена, категория «A3» — Министерство транспорта и дорожной безопасности (gov.il/ru/departments/dynamiccollectors/theory-exam-a3), вопросы 0009 и 0031.`, en: `Official theory-exam question bank, category A3 — Ministry of Transport and Road Safety (gov.il/en/departments/dynamiccollectors/theory-exam-a3), questions 0009 and 0031.` }, note: { ru: `Экзаменационные формулировки про взрослого пассажира и про ребёнка до 8 лет, вместе с ложными условиями.`, en: `The exam wordings for an adult passenger and for a child under 8, together with their false conditions.` } }
            ]
          },
          example: {
            label: { ru: "Кого можно везти, а кого нет", en: "Who may be carried and who may not" },
            steps: [
              { ru: `Двухместный электровелосипед с задним сиденьем и подножками, пассажиру 17 — <strong>можно</strong>: конструкция предусматривает второго человека.`, en: `A two-seat electric bicycle with a rear seat and footrests, passenger aged 17 — <strong>allowed</strong>: the design provides for a second person.` },
              { ru: `Обычный односедельный велосипед, друг садится на багажник, оба в шлемах — <strong>нельзя</strong>. Шлемы не превращают багажник в сиденье.`, en: `An ordinary single-seat bicycle, a friend perched on the rack, both in helmets — <strong>not allowed</strong>. Helmets do not turn a rack into a seat.` },
              { ru: `Ребёнку 5 лет, установлено детское кресло, на ребёнке подходящий шлем — <strong>можно</strong>: оба условия выполнены.`, en: `A five-year-old, a child seat fitted, a suitable helmet on the child — <strong>allowed</strong>: both conditions are met.` },
              { ru: `Тот же ребёнок, кресло есть, шлема нет — <strong>нельзя</strong>. Условия работают вместе, а не по выбору.`, en: `The same child, seat fitted, no helmet — <strong>not allowed</strong>. The conditions work together, not as a choice.` }
            ]
          },
          quiz: {
            question: { ru: "У вас обычный электровелосипед без второго сиденья. Подруга просит подвезти её один квартал: оба в шлемах, ехать по велодорожке. Что говорит закон?", en: "You have an ordinary electric bicycle with no second seat. A friend asks for a lift one block: both of you in helmets, along the cycle lane. What does the law say?" },
            options: [
              { ru: "Нельзя: перевозка второго человека разрешена, только если сам велосипед предназначен для этого конструкцией.", en: "Not allowed: carrying a second person is permitted only if the bicycle itself is built for it." },
              { ru: "Можно: шлемы на обоих — это как раз то условие, при котором перевозка пассажира разрешается.", en: "Allowed: helmets on both is exactly the condition under which carrying a passenger is permitted." },
              { ru: "Можно, потому что вы едете по велодорожке, а не по проезжей части.", en: "Allowed, because you are on a cycle lane rather than the carriageway." },
              { ru: "Можно: запрет касается только детей до 8 лет, для взрослых ограничений нет.", en: "Allowed: the ban covers only children under 8; there is no restriction for adults." }
            ],
            correct: 0,
            explanation: { ru: `Условие в законе описывает велосипед, а не пассажира и не маршрут: место для второго человека либо предусмотрено конструкцией, либо нет. Вариант со шлемами — самая частая подмена: шлем обязателен сам по себе и никакого дополнительного права не открывает. А правило про ребёнка до 8 лет общее требование не ослабляет, а ужесточает.`, en: `The condition in the law describes the bicycle, not the passenger and not the route: either the design provides a place for a second person or it does not. The helmet option is the commonest substitution — a helmet is mandatory in its own right and unlocks no additional permission. And the rule about children under 8 does not loosen the general requirement, it tightens it.` }
          },
          recall: {
            prompt: { ru: "Что нужно, чтобы везти второго человека на электровелосипеде, и при чём здесь шлем?", en: "What does carrying a second person on an electric bicycle require, and where does the helmet come into it?" },
            answer: { ru: `Взрослого пассажира можно везти только на велосипеде, конструкция которого специально предусматривает второго человека; кроме того, водителю должно быть не меньше 14 лет. Ребёнка младше 8 лет можно везти при двух условиях сразу: установлено отдельное сиденье, обеспечивающее его безопасность, и на ребёнке подходящий шлем. Багажник или рама сиденьем не считаются. Шлем при этом обязателен всем и всегда — и водителю, и пассажиру, — но это отдельная норма, а не то условие, которое разрешает перевозку. Именно поэтому на экзамене «оба в шлемах» — неверный вариант.`, en: `An adult passenger may be carried only on a bicycle whose design specifically provides for a second person, and the rider must additionally be at least 14. A child under 8 may be carried on two conditions at once: a separate seat securing the child is fitted, and the child wears a suitable helmet. A rack or the frame does not count as a seat. A helmet is mandatory for everyone at all times, rider and passenger alike — but that is a separate rule, not the condition that permits carrying. Which is precisely why "both wearing helmets" is the wrong option on the exam.` },
            points: [
              { ru: `Взрослый — только если велосипед предназначен для двоих`, en: `An adult — only if the bicycle is built for two` },
              { ru: `Шлем обязателен всем и всегда — но это отдельная норма`, en: `A helmet is always mandatory — but as a separate rule` },
              { ru: `Ребёнок до 8 лет — отдельное сиденье`, en: `A child under 8 — a separate seat` },
              { ru: `Водителю младше 14 везти никого нельзя`, en: `A rider under 14 may carry nobody` }
            ]
          },
          wisdomTags: ["limits", "simplicity"]
        },

        {
          title: { ru: "Буксировка, сцепка и нестандартный аппарат", en: "Towing, Hitching On, and a Non-Standard Machine" },
          glossary: [
            { term: { ru: "Буксировка", en: "Towing" }, definition: { ru: "Тянуть за собой другого человека или транспорт. На электровелосипеде запрещена без исключений.", en: "Pulling another person or vehicle behind you. Forbidden on an electric bicycle without exception." } },
            { term: { ru: "Сцепка", en: "Hitching on" }, definition: { ru: "Держаться за движущийся автомобиль, автобус или другой велосипед. Запрещена тем же правилом.", en: "Holding on to a moving car, bus or another bicycle. Forbidden by the same rule." } }
          ],
          explain: {
            blocks: [
              { text: { ru: `Буксировать другого человека на электровелосипеде запрещено. Не «если он в шлеме», не «если это не по дороге» — просто нельзя.<br><br>Тем же правилом закрыт и обратный вариант: цепляться самому за движущийся автомобиль, автобус или другой велосипед. Соблазн понятный — не крутить педали в горку, — и именно поэтому норма сформулирована без исключений.`, en: `Towing another person on an electric bicycle is forbidden. Not "if he wears a helmet", not "if it is off the road" — simply not allowed.<br><br>The same rule closes the reverse case: hitching yourself to a moving car, bus or another bicycle. The temptation is obvious — not pedalling up the hill — and that is exactly why the regulation carries no exceptions.` } },
              { heading: { ru: "Что физически происходит при сцепке", en: "What physically happens when you hitch on" }, text: { ru: `Буксировка связывает два тела, у которых нет общего управления. Тянущий не чувствует, что происходит сзади; буксируемый не управляет ни скоростью, ни моментом торможения. Любое торможение или поворот переднего превращается для заднего в рывок вбок.<br><br>Велосипед держится на равновесии, а не на четырёх точках опоры, поэтому один такой рывок — это падение, а не «неприятный момент».`, en: `Towing links two bodies that share no control. The one in front cannot feel what is happening behind; the one behind governs neither the speed nor the moment of braking. Any braking or turn by the leader becomes a sideways jerk for the follower.<br><br>A bicycle stands on balance rather than on four points of contact, so one such jerk is a fall, not an awkward moment.` } },
              { heading: { ru: "И ещё раз про стандарт", en: "And once more about the standard" }, text: { ru: `Сюда же относится запрет ездить на велосипеде, не отвечающем требованиям стандарта электровелосипеда. Формулировка в банке нарочно провокационная: варианты «если поездка короткая» и «если по тротуару» предлагают вам самому придумать исключение.<br><br>Исключений нет. Ни длина поездки, ни выбор покрытия не влияют на то, соответствует аппарат стандарту или нет.`, en: `The ban on riding a bicycle that fails the electric-bicycle standard belongs here too. The bank's wording is deliberately provocative: the options "only if it is a short ride" and "only on the pavement" invite you to invent an exception yourself.<br><br>There are none. Neither the length of the trip nor the choice of surface has any bearing on whether the machine meets the standard.` } }
            ],
            analogy: { ru: `Сцепка двух велосипедов похожа на бег в мешках вдвоём: пока оба делают ровно одно и то же, всё держится, а первая же несогласованная попытка поймать равновесие валит обоих. Разница в том, что в игре вы падаете на траву и с малой скорости, а на дороге — на асфальт и в поток машин.`, en: `Two bicycles hitched together are like a two-person sack race: while both do exactly the same thing it holds, and the first uncoordinated attempt to catch balance drops them both. The difference is that in the game you land on grass at walking pace, and on the road you land on asphalt in traffic.` },
            sources: [
              { ref: { ru: `<bdi>תקנות התעבורה, התשכ״א-1961, תקנה 126 — «איסור להתחבר אל רכב אחר ואיסור גרירה»</bdi>. Полный текст: nevo.co.il/law_html/law01/p230_011.htm`, en: `Israeli Traffic Regulations 1961, reg. 126 — <bdi>תקנות התעבורה, התשכ״א-1961, תקנה 126 — «איסור להתחבר אל רכב אחר ואיסור גרירה»</bdi>. Full text: nevo.co.il/law_html/law01/p230_011.htm` }, note: { ru: `Сама норма: запрет присоединяться к другому транспортному средству и запрет буксировки.`, en: `The regulation itself: the ban on attaching to another vehicle and the ban on towing.` } },
              { ref: { ru: `Официальный банк вопросов теоретического экзамена, категория «A3» — Министерство транспорта и дорожной безопасности (gov.il/ru/departments/dynamiccollectors/theory-exam-a3), вопросы 0008 и 0010.`, en: `Official theory-exam question bank, category A3 — Ministry of Transport and Road Safety (gov.il/en/departments/dynamiccollectors/theory-exam-a3), questions 0008 and 0010.` }, note: { ru: `Экзаменационные формулировки про буксировку и про езду на нестандартном велосипеде — вместе с ложными исключениями «короткая поездка» и «по тротуару».`, en: `The exam wordings on towing and on riding a non-standard bicycle — together with the false exceptions "a short ride" and "on the pavement".` } }
            ]
          },
          example: {
            label: { ru: "Четыре «а если?» — и один и тот же ответ", en: "Four \"but what if\"s — and one answer" },
            steps: [
              { ru: `«Потяну друга на скейте, он же в шлеме» — <strong>нельзя</strong>. Шлем не входит в условия, потому что условий нет вообще.`, en: `"I'll tow my friend on his skateboard, he's got a helmet on" — <strong>no</strong>. The helmet is not among the conditions because there are no conditions.` },
              { ru: `«Поедем не по дороге, а через парк» — <strong>нельзя</strong>. Запрет не привязан к типу покрытия.`, en: `"We'll go through the park, not on the road" — <strong>no</strong>. The ban is not tied to the type of surface.` },
              { ru: `«Подержусь за борт грузовика, всего до перекрёстка» — <strong>нельзя</strong>, и это самый опасный из четырёх: водитель вас не видит и не знает, что вы там.`, en: `"I'll hold the side of the lorry, only as far as the junction" — <strong>no</strong>, and this is the most dangerous of the four: the driver cannot see you and does not know you are there.` },
              { ru: `«Велосипед нестандартный, но еду 300 метров до дома» — <strong>нельзя</strong>. Та же схема: короткая поездка исключения не создаёт.`, en: `"The bicycle is non-standard, but it's 300 metres to my door" — <strong>no</strong>. Same pattern: a short ride creates no exception.` }
            ]
          },
          quiz: {
            question: { ru: "Вы едете в горку и видите, что рядом медленно тянется грузовик. Мысль: «подержусь за борт метров двести, он всё равно ползёт». Что здесь главное?", en: "You are climbing a hill and a lorry is crawling along beside you. The thought: \"I'll hold the side for a couple of hundred metres, it's barely moving anyway.\" What matters here?" },
            options: [
              { ru: "Пока грузовик едет медленнее 25 км/ч, сцепка формально допустима.", en: "While the lorry is under 25 km/h, hitching on is formally permissible." },
              { ru: "Всё зависит от того, заметил вас водитель: если он кивнул, ответственность переходит на него.", en: "It depends on whether the driver noticed you: once he nods, liability passes to him." },
              { ru: "Цепляться к другому транспортному средству запрещено, и физика на стороне запрета: вы не управляете ни своей скоростью, ни моментом торможения.", en: "Hitching on to another vehicle is forbidden, and the physics backs the ban: you control neither your speed nor the moment of braking." },
              { ru: "Запрещено только буксировать кого-то самому; держаться за чужой транспорт закон не регулирует.", en: "Only towing someone yourself is banned; holding on to another vehicle is unregulated." }
            ],
            correct: 2,
            explanation: { ru: `Запрет симметричен: нельзя ни тянуть, ни цепляться. Первый вариант играет на числе 25 из прошлой темы — оно относится к отсечке двигателя и к сцепке отношения не имеет. А «водитель кивнул» не меняет ничего: он всё равно не почувствует вас при торможении и не увидит в зеркале в момент поворота.`, en: `The ban is symmetrical: neither pulling nor hitching. The first option plays on the number 25 from the previous topic — that figure belongs to the motor's cut-off and has nothing to do with hitching. And a nod from the driver changes nothing: he still will not feel you when he brakes, and will not see you in the mirror when he turns.` }
          },
          recall: {
            prompt: { ru: "Что запрещает правило о буксировке и сцепке и почему у него нет исключений?", en: "What does the towing-and-hitching rule forbid, and why does it carry no exceptions?" },
            answer: { ru: `Запрещено буксировать другого человека на электровелосипеде и запрещено цепляться самому к другому транспортному средству. Оговорки про шлем, про короткое расстояние и про езду вне дорог — приманки: исключений нет. Причина в физике: связка из двух тел без общего управления превращает любое торможение или поворот переднего в боковой рывок для заднего, а велосипед держится на равновесии и такого рывка не переживает. Сюда же относится запрет ездить на аппарате, не отвечающем стандарту, — тоже без оговорок про длину поездки.`, en: `Towing another person on an electric bicycle is forbidden, and so is hitching yourself to another vehicle. The qualifiers about a helmet, a short distance and riding off-road are bait: there are no exceptions. The reason is physical — two bodies linked without shared control turn any braking or turn by the leader into a sideways jerk for the follower, and a bicycle stands on balance and does not survive that jerk. The ban on riding a machine that fails the standard belongs to the same family, and likewise carries no qualifier about trip length.` },
            points: [
              { ru: `Буксировать человека нельзя`, en: `You may not tow a person` },
              { ru: `Цепляться за другой транспорт нельзя`, en: `You may not hitch on to another vehicle` },
              { ru: `Ни шлем, ни короткая дистанция исключением не являются`, en: `Neither a helmet nor a short distance is an exception` },
              { ru: `Причина — потеря равновесия при несогласованном торможении`, en: `The reason is loss of balance under uncoordinated braking` }
            ]
          },
          wisdomTags: ["limits", "self-deception"]
        }
      ],
      examQuestions: [
        {
          question: { ru: "С какого возраста разрешена езда на электровелосипеде?", en: "What is the minimum permitted age for riding an electric bicycle?" },
          options: [
            { ru: "С 16 лет.", en: "16 years old." },
            { ru: "С 14 лет.", en: "14 years old." },
            { ru: "С 12 лет.", en: "12 years old." },
            { ru: "С 18 лет.", en: "18 years old." }
          ],
          correct: 0
        },
        {
          question: { ru: "Разрешено ли законом ездить на велосипеде, не соответствующем стандартным требованиям, предъявляемым к электровелосипеду?", en: "Is it legal to ride a bicycle that is non-compliant with the standard requirements for an electric bicycle?" },
          options: [
            { ru: "Да.", en: "Yes." },
            { ru: "Нет.", en: "No." },
            { ru: "Да. Только если поездка короткая.", en: "Yes. Only if it is a short ride." },
            { ru: "Да. Только если поездка совершается по тротуару.", en: "Yes. Only if the ride is done on the sidewalk." }
          ],
          correct: 1
        },
        {
          question: { ru: "Разрешено ли законом перевозить пассажира на электровелосипеде?", en: "Is it legal to carry an additional passenger on an electric bicycle?" },
          options: [
            { ru: "Да. Только если велосипедисту исполнилось 16 лет.", en: "Yes. Provided the rider is 16 years old or more." },
            { ru: "Да. Только если электровелосипед специально для этого предназначен, то есть на нём можно перевезти ещё одного человека.", en: "Yes. Only if the electric bicycle is purpose-built for this, meaning that it is possible to transport an additional person on it." },
            { ru: "Да. Только если велосипедист и его пассажир одеты в шлемы.", en: "Yes. Provided the riders are wearing a helmet." },
            { ru: "Все ответы верны.", en: "All answers are correct." }
          ],
          correct: 1
        },
        {
          question: { ru: "Разрешено ли законом использовать электровелосипед для буксировки другого человека?", en: "Is it legal to use an electric bicycle to tow another person?" },
          options: [
            { ru: "Нет.", en: "No." },
            { ru: "Да.", en: "Yes." },
            { ru: "Да. Если этот человек в шлеме.", en: "Yes. Provided he is wearing a helmet." },
            { ru: "Да. Если поездка выполняется не по дорогам.", en: "Yes. Provided the journey is not on roads." }
          ],
          correct: 0
        },
        {
          question: { ru: "Разрешено ли перевозить на велосипеде ребёнка до 8 лет?", en: "Is it permitted to transport a child under the age of 8 on a bicycle?" },
          options: [
            { ru: "Это категорически запрещено.", en: "This is absolutely forbidden." },
            { ru: "Разрешено.", en: "Allowed." },
            { ru: "Разрешено. Если велосипед оборудован отдельным сиденьем, обеспечивающим безопасность ребёнка. Кроме того, ребёнок должен быть в подходящем шлеме.", en: "Permitted. Provided the bicycle is equipped with a separate seat ensuring the child’s safety. In addition, the child must wear a suitable helmet." },
            { ru: "Разрешено при наличии у велосипедиста водительских прав.", en: "Allowed, provided the rider has a driving license." }
          ],
          correct: 2
        }
      ]
    },
    // ============================================================
    {
      id: "bike-where",
      title: { ru: "Где ездить можно и нельзя", en: "Where You May Ride and Where You May Not" },
      desc: { ru: "Правая сторона, обочина, тротуар, туннель, скоростная дорога и пешеходный переход", en: "The right-hand side, the shoulder, the pavement, tunnels, fast roads and the pedestrian crossing" },
      icon: "\u{1F6E3}️",
      chunks: [
        {
          title: { ru: "Правая сторона и обочина", en: "The Right-Hand Side, and the Shoulder" },
          glossary: [
            { term: { ru: "«Как можно ближе к правой стороне»", en: "\"As close as possible to the right\"" }, definition: { ru: "Формулировка закона: держаться правого края, но с запасом на выбоины, решётки ливнёвки и открывающиеся двери.", en: "The law's wording: hold the right-hand edge, but leave room for potholes, drain grates and opening doors." } },
            { term: { ru: "Обочина", en: "Shoulder" }, definition: { ru: "Полоса вдоль проезжей части за её краем. На междугородной дороге, если она чистая и заасфальтирована, ехать по ней необходимо.", en: "The strip beyond the edge of the carriageway. On an intercity road, if it is clear and surfaced with asphalt, riding on it is mandatory." } }
          ],
          predict: {
            question: { ru: "По какой стороне дороги должен ехать электровелосипедист?", en: "On what side of the road must an electric bicycle rider ride?" },
            options: [
              { ru: "По центру полосы — так вас лучше видно", en: "In the middle of the lane — you are more visible there" },
              { ru: "Как можно ближе к правой стороне", en: "As close as possible to the right" },
              { ru: "Как можно ближе к левой стороне, навстречу потоку — как ходят пешеходы за городом", en: "As close as possible to the left, facing the traffic — the way pedestrians walk on country roads" },
              { ru: "По любой стороне, если дорога свободна", en: "Either side, if the road is clear" }
            ],
            reveal: { ru: "Пешеходов за городом действительно учат идти навстречу движению, и поэтому «слева» звучит разумно. Для велосипеда правило обратное — дальше видно почему.", en: "Pedestrians on country roads really are taught to walk facing the traffic, which is why \"the left\" sounds sensible. For a bicycle the rule is the opposite — and next you will see why." }
          },
          explain: {
            blocks: [
              { text: { ru: `Электровелосипедист едет <strong>как можно ближе к правой стороне дороги</strong>. Не по центру полосы, не «где удобно» и не навстречу потоку.<br><br>Правило простое, но у него есть неочевидная половина: «как можно ближе» не значит «вплотную к бордюру». Между вами и краем нужен запас на решётку ливнёвки, выбоину и внезапно открывшуюся дверь.`, en: `An electric bicycle rider rides <strong>as close as possible to the right-hand side of the road</strong>. Not down the middle of the lane, not wherever is convenient, and not against the flow.<br><br>The rule is simple, but half of it is easy to miss: "as close as possible" does not mean hugging the kerb. Between you and the edge there has to be room for a drain grate, a pothole and a door that opens without warning.` } },
              { heading: { ru: "Обочина за городом", en: "The shoulder out of town" }, text: { ru: `На междугородной дороге ситуация меняется: если обочина чистая и заасфальтирована, ехать по ней <em>необходимо</em>. Это редкий случай, когда закон не просто разрешает, а требует уйти с проезжей части — разница скоростей между вами и потоком там доходит до 70–80 км/ч.<br><br>Слово «чистая» здесь рабочее: гравий, песок и мусор на обочине опаснее соседства с машинами.`, en: `On an intercity road the picture changes: if the shoulder is clear and surfaced with asphalt, riding on it is <em>mandatory</em>. This is the rare case where the law does not merely permit but requires you to leave the carriageway — the speed difference between you and the traffic there reaches 70–80 km/h.<br><br>The word "clear" is doing real work: gravel, sand and debris on the shoulder are more dangerous than the proximity of cars.` } },
              { heading: { ru: "Почему именно справа", en: "Why the right specifically" }, text: { ru: `Движение в стране правостороннее, и медленный участник держится ближе к краю, чтобы быстрые обгоняли его слева — со стороны, куда водитель смотрит и где у него зеркало.<br><br>Поехав слева, вы встречаетесь с машинами лоб в лоб: скорости складываются, и времени на реакцию не остаётся ни у кого. Логика «как пешеход» здесь ломается — пешеход идёт 5 км/ч и может шагнуть в сторону, вы едете 25 и не можете.`, en: `Traffic here drives on the right, and the slow participant keeps to the edge so that faster ones overtake on the left — the side the driver is facing and where the mirror is.<br><br>Ride on the left and you meet cars head-on: the speeds add together and nobody has any time to react. The "just like a pedestrian" logic breaks here — a pedestrian walks at 5 km/h and can step aside, you are doing 25 and cannot.` } }
            ],
            analogy: { ru: `Правая сторона — как правая сторона эскалатора: стоишь справа, идёшь слева. Работает не потому, что кто-то главнее, а потому, что все знают, где искать медленных. Разница в цене ошибки: на эскалаторе вы услышите «извините», а на дороге ваше «не туда» называется встречной полосой.`, en: `The right-hand side works like the right-hand side of an escalator: stand right, walk left. It holds not because anyone outranks anyone, but because everybody knows where to look for the slow ones. The difference is the price of getting it wrong: on an escalator you hear "excuse me", and on the road your wrong side is called oncoming traffic.` },
            sources: [
              { ref: { ru: `<bdi>תקנות התעבורה, התשכ״א-1961, תקנה 128 — «נסיעה בצד ימין»</bdi>. Полный текст: nevo.co.il/law_html/law01/p230_011.htm`, en: `Israeli Traffic Regulations 1961, reg. 128 — <bdi>תקנות התעבורה, התשכ״א-1961, תקנה 128 — «נסיעה בצד ימין»</bdi>. Full text: nevo.co.il/law_html/law01/p230_011.htm` }, note: { ru: `Норма, требующая от велосипедиста держаться правой стороны дороги.`, en: `The regulation requiring a rider to keep to the right-hand side of the road.` } },
              { ref: { ru: `Официальный банк вопросов теоретического экзамена, категория «A3» — Министерство транспорта и дорожной безопасности (gov.il/ru/departments/dynamiccollectors/theory-exam-a3), вопросы 0011 и 0025.`, en: `Official theory-exam question bank, category A3 — Ministry of Transport and Road Safety (gov.il/en/departments/dynamiccollectors/theory-exam-a3), questions 0011 and 0025.` }, note: { ru: `Формулировки про правую сторону и про обязанность ехать по чистой асфальтированной обочине междугородной дороги.`, en: `The wordings on the right-hand side and on the duty to use a clear asphalt shoulder on an intercity road.` } }
            ]
          },
          example: {
            label: { ru: "Где ваше место на четырёх разных дорогах", en: "Where you belong on four different roads" },
            steps: [
              { ru: `Городская улица, по одной полосе в каждую сторону — <strong>правее</strong>, но с запасом полуметра-метра от бордюра и от припаркованных машин.`, en: `A city street, one lane each way — <strong>keep right</strong>, but with half a metre to a metre in hand from the kerb and from parked cars.` },
              { ru: `Междугородная дорога, обочина чистая и заасфальтирована — <strong>на обочину</strong>: там ваше место, а не в правой полосе.`, en: `An intercity road with a clear asphalt shoulder — <strong>onto the shoulder</strong>: that is where you belong, not in the right-hand lane.` },
              { ru: `Та же дорога, но обочина в гравии и битом стекле — <strong>обочина небезопасна</strong>; тогда правый край проезжей части, максимально заметно и предсказуемо.`, en: `The same road, but the shoulder is gravel and broken glass — <strong>the shoulder is unsafe</strong>; then the right-hand edge of the carriageway, as visibly and as predictably as you can manage.` },
              { ru: `Улица с велодорожкой вдоль неё — <strong>на велодорожку</strong>: правило «правее» описывает поведение на дороге, а не отменяет выделенную инфраструктуру.`, en: `A street with a cycle lane running along it — <strong>use the cycle lane</strong>: the "keep right" rule describes behaviour on the road, it does not override dedicated infrastructure.` }
            ]
          },
          quiz: {
            question: { ru: "Разрешено ли электровелосипедисту ездить по обочине?", en: "Is an electric bicycle rider allowed to ride on the shoulder?" },
            options: [
              { ru: "Это категорически запрещено.", en: "This is absolutely forbidden." },
              { ru: "Это необходимо при езде по междугородной дороге, обочина которой чистая и заасфальтирована.", en: "This is mandatory when riding along an intercity road, where the shoulder is clear and surfaced with asphalt." },
              { ru: "Разрешено.", en: "Allowed." },
              { ru: "Разрешено при наличии у велосипедиста водительских прав.", en: "Allowed, provided the rider has a driving license." }
            ],
            correct: 1,
            explanation: { ru: `Ключ — слово «необходимо»: на междугородной дороге чистая асфальтированная обочина не альтернатива, а предписание. Вариант «разрешено» звучит мягче и потому притягивает, но он стирает разницу между «можно» и «нужно». А полного запрета на обочину нет вовсе — этот вариант проверяет, не спутали ли вы обочину с тротуаром.`, en: `The key word is "mandatory": on an intercity road a clear asphalt shoulder is not an alternative but an instruction. The bare "allowed" sounds gentler and therefore attracts, but it erases the difference between may and must. And there is no outright ban on the shoulder at all — that option is checking whether you have confused the shoulder with the pavement.` }
          },
          recall: {
            prompt: { ru: "Где именно на дороге место электровелосипедиста — в городе и за городом?", en: "Where exactly on the road does an electric bicycle rider belong, in town and out of it?" },
            answer: { ru: `В городе — как можно ближе к правой стороне дороги, но с запасом от бордюра и от припаркованных машин, чтобы не оказаться в решётке ливнёвки или под открывающейся дверью. За городом, на междугородной дороге, ехать по обочине необходимо, если она чистая и заасфальтирована: разница скоростей с потоком там слишком велика. Слева ехать нельзя никогда — правило «идти навстречу движению» относится к пешеходам, а не к транспортным средствам.`, en: `In town, as close as possible to the right-hand side of the road, but with room in hand from the kerb and from parked cars so you do not end up in a drain grate or behind an opening door. Out of town, on an intercity road, riding on the shoulder is mandatory if it is clear and surfaced with asphalt: the speed difference with the traffic there is simply too great. Riding on the left is never allowed — the "face the traffic" rule belongs to pedestrians, not to vehicles.` },
            points: [
              { ru: `Правая сторона, как можно ближе к краю`, en: `The right-hand side, as close to the edge as possible` },
              { ru: `Но с запасом от бордюра и припаркованных машин`, en: `But with room in hand from the kerb and parked cars` },
              { ru: `За городом чистая асфальтированная обочина обязательна`, en: `Out of town a clear asphalt shoulder is mandatory` },
              { ru: `Слева ехать нельзя: это встречный поток`, en: `Never ride on the left: that is oncoming traffic` }
            ]
          },
          wisdomTags: ["tradition", "planning"]
        },

        {
          title: { ru: "Тротуар, туннель, скоростная дорога", en: "Pavement, Tunnel, Fast Road" },
          glossary: [
            { term: { ru: "Скоростная дорога", en: "Fast road" }, definition: { ru: "Дорога для быстрого движения с ограниченным доступом. Езда на электровелосипеде запрещена, включая её обочину.", en: "A limited-access road built for speed. Electric bicycles are banned from it, shoulder included." } },
            { term: { ru: "Слезть и вести", en: "Dismount and walk it" }, definition: { ru: "Универсальный законный выход: человек, ведущий велосипед рядом, — пешеход, и на него действуют правила для пешехода.", en: "The universal lawful way out: someone walking a bicycle alongside is a pedestrian, and pedestrian rules apply." } }
          ],
          explain: {
            blocks: [
              { text: { ru: `Три места, где электровелосипеду не место совсем: <strong>тротуар</strong>, <strong>туннель</strong> и <strong>скоростная дорога</strong>. В экзаменационном вопросе они собраны в один список именно затем, чтобы вы запомнили их вместе.<br><br>Тротуар из них — главный источник спора. Ответ короткий: ездить по нему нельзя. Ни «если пешеходов нет», ни «если дорога перекрыта».`, en: `Three places where an electric bicycle does not belong at all: the <strong>pavement</strong>, a <strong>tunnel</strong> and a <strong>fast road</strong>. The exam gathers them into a single list precisely so that you remember them together.<br><br>The pavement is the contested one. The answer is short: you may not ride on it. Not "if there are no pedestrians", not "if the road is closed".` } },
              { heading: { ru: "Почему тротуар опаснее, чем кажется", en: "Why the pavement is more dangerous than it looks" }, text: { ru: `На тротуаре вы едете 20 км/ч среди людей, идущих 5 км/ч и не ожидающих ничего быстрее себя. Они выходят из подъездов и магазинов не глядя, потому что на тротуаре это нормально.<br><br>Добавьте невидимость: водитель, выезжающий из двора, смотрит на проезжую часть, а не на тротуар, и не рассчитывает, что оттуда появится транспорт со скоростью машины.`, en: `On the pavement you are doing 20 km/h among people doing 5 who expect nothing faster than themselves. They step out of doorways and shops without looking, because on a pavement that is normal.<br><br>Add invisibility: a driver pulling out of a courtyard is watching the carriageway, not the pavement, and is not expecting a vehicle at car speed to arrive from there.` } },
              { heading: { ru: "Туннель и скоростная дорога", en: "Tunnels and fast roads" }, text: { ru: `В туннеле проблема в свете и в геометрии: глаз водителя перестраивается на входе и выходе, обочины часто нет, объехать вас негде. На скоростной дороге поток идёт 90–110 км/ч, и вы в нём уже не медленный участник, а почти неподвижное препятствие.<br><br>Общий признак у всех трёх мест один: разница скоростей, которую нельзя компенсировать аккуратностью.`, en: `In a tunnel the problem is light and geometry: a driver's eyes are readjusting at the entrance and the exit, there is often no shoulder, and there is nowhere to go around you. On a fast road the traffic runs at 90–110 km/h, and in it you are no longer a slow participant but very nearly a stationary obstacle.<br><br>All three share one feature: a speed difference that care cannot compensate for.` } }
            ],
            analogy: { ru: `Запрет ездить по тротуару похож на запрет катить чемодан по проходу самолёта во время посадки: технически ничего не мешает, мешает то, что пространство рассчитано на другую скорость. Разница в том, что в самолёте вам скажут об этом сразу, а на тротуаре вы узнаете о конфликте в момент столкновения.`, en: `The ban on riding along the pavement is like the ban on wheeling a suitcase down the aisle during boarding: technically nothing stops you, what stops you is that the space is scaled for a different speed. The difference is that on a plane someone tells you immediately, whereas on the pavement you learn about the conflict at the moment of impact.` },
            sources: [
              { ref: { ru: `<bdi>תקנות התעבורה, התשכ״א-1961, תקנה 129 — «רכיבה על אופניים במקומות מסויימים»</bdi>. Полный текст: nevo.co.il/law_html/law01/p230_011.htm`, en: `Israeli Traffic Regulations 1961, reg. 129 — <bdi>תקנות התעבורה, התשכ״א-1961, תקנה 129 — «רכיבה על אופניים במקומות מסויימים»</bdi>. Full text: nevo.co.il/law_html/law01/p230_011.htm` }, note: { ru: `Норма о местах, в которых езда на велосипеде запрещена.`, en: `The regulation on places where riding a bicycle is forbidden.` } },
              { ref: { ru: `Официальный банк вопросов теоретического экзамена, категория «A3» — Министерство транспорта и дорожной безопасности (gov.il/ru/departments/dynamiccollectors/theory-exam-a3), вопросы 0016 и 0024.`, en: `Official theory-exam question bank, category A3 — Ministry of Transport and Road Safety (gov.il/en/departments/dynamiccollectors/theory-exam-a3), questions 0016 and 0024.` }, note: { ru: `Безусловный запрет на тротуар и перечень запрещённых мест единым списком.`, en: `The unconditional pavement ban and the list of forbidden places as a single set.` } }
            ]
          },
          example: {
            label: { ru: "Четыре ситуации, один и тот же запрет", en: "Four situations, one and the same ban" },
            steps: [
              { ru: `Тротуар пуст, до дома сто метров — <strong>нельзя</strong>. «Нет пешеходов» не входит в условия, потому что условий нет.`, en: `The pavement is empty and home is a hundred metres away — <strong>no</strong>. "No pedestrians" is not among the conditions, because there are none.` },
              { ru: `Дорогу перекрыли ремонтом, объезда нет — <strong>ехать по тротуару нельзя</strong>, но можно слезть и вести велосипед рядом: пешком вы пешеход.`, en: `The road is closed for works and there is no detour — <strong>you may not ride on the pavement</strong>, but you may dismount and walk the bicycle: on foot you are a pedestrian.` },
              { ru: `Короткий городской туннель, внутри есть тротуар — <strong>нельзя</strong>. Запрет относится к туннелю целиком.`, en: `A short city tunnel with a walkway inside — <strong>no</strong>. The ban covers the tunnel as a whole.` },
              { ru: `Скоростная дорога с широкой обочиной — <strong>нельзя</strong>. Обочина скоростной дороги остаётся частью скоростной дороги.`, en: `A fast road with a wide shoulder — <strong>no</strong>. The shoulder of a fast road is still part of the fast road.` }
            ]
          },
          quiz: {
            question: { ru: "Улицу закрыли на ремонт, объезд длинный, тротуар рядом свободен. Как проехать этот участок законно?", en: "The street is closed for works, the detour is long, and the pavement beside it is empty. How do you get past this stretch lawfully?" },
            options: [
              { ru: "По тротуару, но медленно и уступая пешеходам — ремонт как раз тот случай, ради которого сделано исключение.", en: "Along the pavement, slowly and giving way to pedestrians — roadworks are exactly the case the exception exists for." },
              { ru: "По тротуару, раз на нём в этот момент нет пешеходов.", en: "Along the pavement, since there are no pedestrians on it right now." },
              { ru: "По встречной стороне дороги: движение перекрыто, встречных машин нет.", en: "Along the opposite side of the road: the street is closed, so there is nothing coming." },
              { ru: "Слезть с велосипеда и провести его по тротуару пешком — тогда вы пешеход, а не транспорт.", en: "Dismount and walk the bicycle along the pavement — at that point you are a pedestrian, not a vehicle." }
            ],
            correct: 3,
            explanation: { ru: `У запрета на тротуар нет исключений — ни по загруженности, ни по причине объезда. Но выход есть, и он тот же, что в вопросе про пешеходный переход: как только вы слезли и ведёте велосипед рядом, к вам применяются правила для пешехода. Вариант со встречной стороной проверяет, не решили ли вы, что перекрытая дорога перестаёт быть дорогой.`, en: `The pavement ban has no exceptions — not for how busy it is, not for why you are detouring. But there is a way out, and it is the same one as in the pedestrian-crossing question: the moment you dismount and walk the bicycle, pedestrian rules apply to you. The opposite-side option is checking whether you have decided that a closed road stops being a road.` }
          },
          recall: {
            prompt: { ru: "Назовите три места, где езда на электровелосипеде запрещена, и объясните, что у них общего.", en: "Name the three places where riding an electric bicycle is forbidden, and explain what they have in common." },
            answer: { ru: `Тротуар, туннель и скоростная дорога. Общее у них — разница скоростей, которую нельзя компенсировать аккуратностью: на тротуаре вы вчетверо быстрее пешеходов, которые вас не ждут; в туннеле водители въезжают из света в темноту и объехать вас негде; на скоростной дороге поток идёт вчетверо быстрее вас. Запрет на тротуар безусловен — ни отсутствие пешеходов, ни перекрытая дорога исключения не создают, — но провести велосипед пешком можно всегда.`, en: `The pavement, a tunnel and a fast road. What they share is a speed difference that care cannot compensate for: on the pavement you are four times faster than pedestrians who are not expecting you; in a tunnel drivers come from light into dark and there is nowhere to go around you; on a fast road the traffic is four times faster than you. The pavement ban is unconditional — neither an absence of pedestrians nor a closed road creates an exception — but you may always walk the bicycle.` },
            points: [
              { ru: `Тротуар`, en: `The pavement` },
              { ru: `Туннель`, en: `A tunnel` },
              { ru: `Скоростная дорога`, en: `Fast road` },
              { ru: `Общая причина — неустранимая разница скоростей`, en: `The shared cause: an irreducible speed difference` }
            ]
          },
          wisdomTags: ["limits", "uncertainty"]
        },

        {
          title: { ru: "Пешеходный переход и пешеходы", en: "The Pedestrian Crossing, and Pedestrians" },
          glossary: [
            { term: { ru: "Перекатить велосипед", en: "Walk the bicycle across" }, definition: { ru: "Пересечь переход пешком, ведя велосипед рядом. Единственный законный способ проехать переход.", en: "Crossing on foot with the bicycle beside you. The only lawful way to use a crossing." } },
            { term: { ru: "Уступить дорогу", en: "Give way" }, definition: { ru: "Не заставить другого участника менять скорость или направление. На переходе — обязанность велосипедиста перед пешеходом.", en: "Not forcing another road user to change speed or direction. At a crossing, the rider's duty towards the pedestrian." } }
          ],
          explain: {
            blocks: [
              { text: { ru: `Пересекать дорогу по пешеходному переходу <em>верхом</em> на велосипеде нельзя. Можно другое: слезть и перекатить велосипед через дорогу рядом с собой — тогда вы пешеход и переход ваш.<br><br>Это не формальность. Переход — единственное место, где водитель обязан пропустить человека, и весь его расчёт построен на скорости пешехода.`, en: `You may not cross the road on a pedestrian crossing while <em>riding</em>. You may do something else: dismount and walk the bicycle across beside you — at that point you are a pedestrian and the crossing is yours.<br><br>This is not a formality. The crossing is the one place where a driver is obliged to stop for a person, and his entire judgement is built around pedestrian speed.` } },
              { heading: { ru: "Почему верхом не работает", en: "Why riding across does not work" }, text: { ru: `Пешеход появляется на переходе со скоростью 5 км/ч, и у водителя есть пара секунд, чтобы его заметить и остановиться. Велосипедист выезжает на переход со скоростью 20–25 км/ч — вчетверо быстрее и часто из-за припаркованной машины или куста.<br><br>Водитель при этом делает всё правильно: посмотрел, никого нет, тронулся. Вы появляетесь в его поле зрения уже на переходе. Формально виноватого нет, а результат один.`, en: `A pedestrian arrives at the crossing at 5 km/h, and the driver has a couple of seconds to notice and stop. A rider arrives at 20–25 km/h — four times faster, and often from behind a parked car or a hedge.<br><br>The driver meanwhile does everything right: looked, nobody there, moved off. You enter his field of view already on the crossing. Formally nobody is at fault, and the outcome is the same either way.` } },
              { heading: { ru: "Обратная сторона: уступать обязаны вы", en: "The other side: you are the one who gives way" }, text: { ru: `Когда пешеход переходит дорогу по переходу, электровелосипедист обязан уступить ему дорогу. Безусловно — без «если есть права» и «если исполнилось 18».<br><br>Симметрия здесь честная: на переходе вы либо пешеход, который идёт, либо участник движения, который пропускает. Третьего состояния — «еду через переход, потому что почти пешеход» — закон не знает.`, en: `When a pedestrian is crossing at a crossing, the electric bicycle rider must give way. Unconditionally — no "if he has a licence", no "if he is 18".<br><br>The symmetry here is honest: at a crossing you are either a pedestrian who walks or a road user who yields. A third state — riding across because you are nearly a pedestrian — does not exist in law.` } }
            ],
            analogy: { ru: `Переход работает как касса самообслуживания: правила там рассчитаны на определённый темп, и очередь держится, пока все двигаются примерно одинаково. Влетевший бегом ничего не нарушает по духу, но ломает расчёт остальных. Разница в том, что в магазине сбой стоит минуту, а на переходе — здоровья.`, en: `A crossing works like a self-checkout: the rules there are scaled to a certain tempo, and the queue holds while everyone moves at roughly the same rate. Someone arriving at a run breaks nothing in spirit, but wrecks everyone else's timing. The difference is that in a shop the glitch costs a minute, and at a crossing it costs your health.` },
            sources: [
              { ref: { ru: `Официальный банк вопросов теоретического экзамена, категория «A3» — Министерство транспорта и дорожной безопасности (gov.il/ru/departments/dynamiccollectors/theory-exam-a3), вопросы 0005 и 0006.`, en: `Official theory-exam question bank, category A3 — Ministry of Transport and Road Safety (gov.il/en/departments/dynamiccollectors/theory-exam-a3), questions 0005 and 0006.` }, note: { ru: `Запрет пересекать переход верхом, разрешение перекатить велосипед и безусловная обязанность уступать пешеходам.`, en: `The ban on riding across, the permission to walk the bicycle across, and the unconditional duty to give way to pedestrians.` } },
              { ref: { ru: `<bdi>תקנות התעבורה, התשכ״א-1961, תקנה 123 — «רכיבה על אופניים»</bdi>. Полный текст: nevo.co.il/law_html/law01/p230_011.htm`, en: `Israeli Traffic Regulations 1961, reg. 123 — <bdi>תקנות התעבורה, התשכ״א-1961, תקנה 123 — «רכיבה על אופניים»</bdi>. Full text: nevo.co.il/law_html/law01/p230_011.htm` }, note: { ru: `Общая норма о езде на велосипеде, внутри которой действует и приоритет пешехода.`, en: `The general regulation on riding a bicycle, which is where pedestrian priority sits.` } }
            ]
          },
          example: {
            label: { ru: "Один переход, четыре решения", en: "One crossing, four decisions" },
            steps: [
              { ru: `Слезли и идёте рядом с велосипедом — <strong>законно</strong>: вы пешеход, и водитель обязан вас пропустить.`, en: `You dismount and walk beside the bicycle — <strong>lawful</strong>: you are a pedestrian, and the driver must let you cross.` },
              { ru: `Едете через переход со скоростью пешехода — <strong>всё равно нарушение</strong>: закон смотрит не на скорость, а на то, сидите вы на велосипеде или нет.`, en: `You ride across at walking pace — <strong>still an offence</strong>: the law is not looking at your speed but at whether you are sitting on the bicycle.` },
              { ru: `Пешеход уже ступил на переход, вы едете по дороге — <strong>обязаны уступить</strong>. Это обязанность участника движения, а не вежливость.`, en: `A pedestrian has stepped onto the crossing while you are on the road — <strong>you must give way</strong>. That is a road user's duty, not a courtesy.` },
              { ru: `Переход пуст, вы проехали верхом и никого не задели — <strong>нарушение всё равно</strong>: запрет не зависит от того, чем всё закончилось.`, en: `The crossing was empty, you rode over it and hit nobody — <strong>an offence all the same</strong>: the ban does not depend on how it turned out.` }
            ]
          },
          quiz: {
            question: { ru: "Вы подъезжаете к пешеходному переходу и хотите оказаться на другой стороне. Машин не видно. Что законно?", en: "You come up to a pedestrian crossing and want to get to the other side. No cars in sight. What is lawful?" },
            options: [
              { ru: "Слезть с велосипеда и перекатить его через переход — в этот момент вы пешеход.", en: "Dismount and walk the bicycle across — at that moment you are a pedestrian." },
              { ru: "Проехать верхом, но медленно: скорость пешехода снимает вопрос.", en: "Ride across, but slowly: walking pace settles the question." },
              { ru: "Проехать верхом, раз на переходе нет пешеходов, которым можно помешать.", en: "Ride across, since there are no pedestrians there to obstruct." },
              { ru: "Проехать верхом — переход для того и сделан, чтобы пересекать дорогу вне перекрёстка.", en: "Ride across — a crossing exists precisely so you can cross away from a junction." }
            ],
            correct: 0,
            explanation: { ru: `Закон различает не скорость, а положение: сидите на велосипеде — вы транспортное средство, и переход не для вас; ведёте его рядом — вы пешеход. Второй вариант соблазнителен, потому что кажется безопасным по сути, но водитель принимает решение по одному признаку: появился человек или нет. Велосипед под вами меняет и скорость появления, и то, откуда вы появитесь.`, en: `The law distinguishes posture, not speed: sitting on the bicycle you are a vehicle and the crossing is not for you; walking it beside you, you are a pedestrian. The second option tempts because it feels safe in substance, but the driver decides on one signal — has a person appeared or not. The bicycle under you changes both how fast you appear and where you appear from.` }
          },
          recall: {
            prompt: { ru: "Как электровелосипедисту законно пересечь дорогу по пешеходному переходу и что он обязан пешеходам?", en: "How does an electric bicycle rider lawfully cross at a pedestrian crossing, and what do they owe pedestrians?" },
            answer: { ru: `Пересекать переход верхом запрещено. Законный способ один: слезть и перекатить велосипед через дорогу — в этот момент вы пешеход и переход ваш. Одновременно действует встречная обязанность: когда пешеход переходит дорогу по переходу, велосипедист обязан уступить ему дорогу, безусловно, без оговорок про права и возраст. Причина в расчёте водителя: он готов остановиться перед человеком, идущим 5 км/ч, а не перед транспортом, выезжающим на переход со скоростью 25 км/ч.`, en: `Riding across a crossing is forbidden. There is one lawful way: dismount and walk the bicycle over — at that moment you are a pedestrian and the crossing is yours. A matching duty runs the other way: when a pedestrian is crossing at a crossing, the rider must give way, unconditionally, with no qualifier about licence or age. The reason lies in the driver's judgement: he is ready to stop for a person walking at 5 km/h, not for a vehicle entering the crossing at 25.` },
            points: [
              { ru: `Верхом через переход нельзя`, en: `You may not ride across a crossing` },
              { ru: `Слезть и перекатить — можно`, en: `Dismounting and walking it across is allowed` },
              { ru: `Уступать пешеходам на переходе обязательно`, en: `Giving way to pedestrians at a crossing is mandatory` },
              { ru: `Причина — скорость появления на переходе`, en: `The reason is how fast you appear on the crossing` }
            ]
          },
          wisdomTags: ["correction", "simplicity"]
        }
      ],
      examQuestions: [
        {
          question: { ru: "По какой стороне дороги должен ездить электровелосипедист?", en: "On what side of the road must an electric bicycle rider ride?" },
          options: [
            { ru: "По центру дороги.", en: "In the center of the road." },
            { ru: "Как можно ближе к левой стороне дороги.", en: "As close as possible to the left side of the road." },
            { ru: "Как можно ближе к правой стороне дороги.", en: "As close as possible to the right side of the road." },
            { ru: "По любой стороне дороги.", en: "Any side of the road is permissible." }
          ],
          correct: 2
        },
        {
          question: { ru: "Разрешено ли электровелосипедисту ездить по тротуару?", en: "Is a rider on an electric bicycle allowed to ride on a sidewalk?" },
          options: [
            { ru: "Да.", en: "Yes." },
            { ru: "Нет.", en: "No." },
            { ru: "Да. Только если на тротуаре нет пешеходов.", en: "Yes. Only if there are no pedestrians on the sidewalk." },
            { ru: "Да, если дорога перекрыта.", en: "Yes, if the road is blocked." }
          ],
          correct: 1
        },
        {
          question: { ru: "В каких из следующих мест запрещено движение электровелосипедов?", en: "Which of the following places are forbidden for electric bicycles?" },
          options: [
            { ru: "Туннель.", en: "Tunnel." },
            { ru: "Скоростная дорога.", en: "Fast road." },
            { ru: "Тротуар.", en: "Sidewalk." },
            { ru: "Все ответы верны.", en: "All answers are correct." }
          ],
          correct: 3
        },
        {
          question: { ru: "Разрешается ли электровелосипедисту пересекать дорогу по пешеходному переходу на велосипеде?", en: "Is an electric bicycle rider permitted to cross the road at a pedestrian crossing while riding?" },
          options: [
            { ru: "Нет. Однако пешеходу разрешено перекатить через дорогу свой велосипед по пешеходному переходу.", en: "No. However a pedestrian is permitted to guide his bicycle across a pedestrian crossing." },
            { ru: "Да. Если у велосипедиста есть водительские права.", en: "Yes. Provided the rider has a driving license." },
            { ru: "Да. Если велосипедисту исполнилось 18 лет.", en: "Yes. Provided the rider is at least 18 years old." },
            { ru: "Да. Если на пешеходном переходе нет пешеходов.", en: "Yes. Provided there are no pedestrians on the pedestrian crossing." }
          ],
          correct: 0
        },
        {
          question: { ru: "Обязан ли электровелосипедист уступать дорогу пешеходам, переходящим дорогу по пешеходному переходу?", en: "Is a rider on an electric bicycle required to give the right of way to pedestrians crossing at a pedestrian crossing?" },
          options: [
            { ru: "Да.", en: "Yes." },
            { ru: "Нет.", en: "No." },
            { ru: "Да. Если у него есть водительские права.", en: "Yes. Provided he has a driving license." },
            { ru: "Да. Если ему исполнилось 18 лет.", en: "Provided he is at least 18 years old." }
          ],
          correct: 0
        }
      ]
    },
    // ============================================================
    {
      id: "bike-traffic",
      title: { ru: "В потоке: дистанция, обгон, перекрёстки", en: "In Traffic: Distance, Overtaking, Junctions" },
      desc: { ru: "Сколько держать до машины, почему обгон справа хуже всего и что значит мигающий жёлтый", en: "How much room to leave, why overtaking on the right is the worst of it, and what a flashing amber means" },
      icon: "\u{1F6A6}",
      chunks: [
        {
          title: { ru: "Дистанция и слепые зоны", en: "Distance, and Blind Spots" },
          glossary: [
            { term: { ru: "Дистанция", en: "Distance" }, definition: { ru: "Не число в метрах, а запас, позволяющий немедленно остановиться, если передний встал или включил поворотник.", en: "Not a figure in metres but the room to stop immediately if the vehicle ahead halts or signals a turn." } },
            { term: { ru: "Боковой интервал", en: "Side clearance" }, definition: { ru: "Запас сбоку от припаркованных машин — примерно ширина открытой двери.", en: "Room to the side of parked cars — roughly the width of an open door." } },
            { term: { ru: "Езда между рядами", en: "Filtering between columns" }, definition: { ru: "Движение в промежутке между стоящими у перекрёстка машинами. Главная опасность — пешеход, выходящий между кузовами.", en: "Riding through the gap between cars queuing at a junction. The main danger is a pedestrian stepping out between them." } }
          ],
          predict: {
            question: { ru: "Какую дистанцию должен держать электровелосипедист до едущего впереди автомобиля?", en: "What is the distance a rider on an electric bicycle must keep from a vehicle in front of him?" },
            options: [
              { ru: "Ровно два метра", en: "Exactly two metres" },
              { ru: "Двухсекундную — как учат для автомобилей", en: "Two seconds — the way drivers are taught" },
              { ru: "Такую, чтобы успеть остановиться, если передний встанет или включит поворотник", en: "Enough to stop in time if the vehicle ahead halts or signals" },
              { ru: "Для велосипеда дистанция не важна: он лёгкий и тормозит быстро", en: "Distance hardly matters on a bicycle: it is light and stops quickly" }
            ],
            reveal: { ru: "Три из четырёх вариантов взяты из официального вопроса почти дословно, и все они звучат разумно. Дальше — почему закон формулирует это не в метрах и не в секундах.", en: "Three of the four options are lifted almost word for word from the official question, and all of them sound reasonable. Next: why the law states this in neither metres nor seconds." }
          },
          explain: {
            blocks: [
              { text: { ru: `Дистанция до едущего впереди автомобиля описывается не числом. Правильная формулировка: <strong>такая, которая позволит немедленно остановиться, не рискуя аварией, если передний остановится или включит сигнал поворота</strong>.<br><br>Числа — «два метра», «две секунды» — на экзамене неверны, и это не придирка: на разной скорости и на разном покрытии одно и то же число означает совершенно разный запас.`, en: `The distance to the vehicle ahead is not described by a number. The correct formulation is: <strong>a distance that will let you stop immediately, without risking a collision, if the car in front halts or signals a turn</strong>.<br><br>Figures — two metres, two seconds — are wrong on the exam, and that is not pedantry: at different speeds and on different surfaces the same figure buys wildly different room.` } },
              { heading: { ru: "Между рядами машин", en: "Between the columns" }, text: { ru: `Отдельный сюжет — езда между рядами машин, стоящих у перекрёстка. Опасность здесь не сами машины, а пешеход, переходящий дорогу между ними не по переходу: он появляется из-за кузова за долю секунды, и заранее его не видит ни он, ни вы.<br><br>Вторая половина проблемы — место у стоп-линии: двухколёсные скапливаются в голове колонны, и остановиться там уже негде.`, en: `Filtering between the columns of cars queuing at a junction is its own story. The danger is not the cars but the pedestrian crossing between them away from a crossing: he appears from behind a body panel in a fraction of a second, and neither of you sees the other coming.<br><br>The second half of the problem is space at the stop line: two-wheelers pile up at the head of the queue, and there is nowhere left to stop.` } },
              { heading: { ru: "Припаркованные машины сбоку", en: "Parked cars alongside" }, text: { ru: `Боковой интервал от припаркованных автомобилей защищает сразу от трёх вещей: от двери, которую открывают не глядя; от машины, внезапно отъезжающей с парковки; и от пешехода, ребёнка или животного, выбегающих на дорогу из-за кузова.<br><br>Отсюда практическое правило: держитесь примерно на ширину открытой двери — около метра, а не «сколько получится».`, en: `Side clearance from parked cars protects against three things at once: a door opened without looking; a car pulling out of its space without warning; and a pedestrian, a child or an animal darting into the road from behind a body.<br><br>Hence the practical rule: keep roughly the width of an open door — about a metre — rather than whatever happens to be left.` } }
            ],
            analogy: { ru: `Дистанция — это не расстояние, а время. Как пауза в разговоре: полсекунды уместны за столом и катастрофичны у синхронного переводчика, хотя длина одна и та же. Ваш запас перед машиной меряется не метрами, а тем, успеете ли вы что-то сделать. Разница с разговором: там за короткую паузу вас переспросят, здесь — нет.`, en: `Distance is time, not length. Like a pause in speech: half a second is fine at dinner and catastrophic for a simultaneous interpreter, though the duration is identical. Your room ahead is measured not in metres but in whether you can still act. The difference from conversation: there a short pause gets you asked again, here it does not.` },
            sources: [
              { ref: { ru: `<bdi>תקנות התעבורה, התשכ״א-1961, תקנה 127 — «ריווח בין אופניים לרכב אחר»</bdi>. Полный текст: nevo.co.il/law_html/law01/p230_011.htm`, en: `Israeli Traffic Regulations 1961, reg. 127 — <bdi>תקנות התעבורה, התשכ״א-1961, תקנה 127 — «ריווח בין אופניים לרכב אחר»</bdi>. Full text: nevo.co.il/law_html/law01/p230_011.htm` }, note: { ru: `Норма об интервале между велосипедом и другим транспортным средством.`, en: `The regulation on clearance between a bicycle and another vehicle.` } },
              { ref: { ru: `Официальный банк вопросов теоретического экзамена, категория «A3» — Министерство транспорта и дорожной безопасности (gov.il/ru/departments/dynamiccollectors/theory-exam-a3), вопросы 0012, 0032 и 0034.`, en: `Official theory-exam question bank, category A3 — Ministry of Transport and Road Safety (gov.il/en/departments/dynamiccollectors/theory-exam-a3), questions 0012, 0032 and 0034.` }, note: { ru: `Формулировка дистанции через возможность остановиться, опасность езды между рядами и три причины держать боковой интервал.`, en: `Distance defined by the ability to stop, the danger of filtering between columns, and the three reasons for side clearance.` } }
            ]
          },
          example: {
            label: { ru: "Одна дистанция — четыре разные обстановки", en: "One rule about distance, four different situations" },
            steps: [
              { ru: `20 км/ч по сухому асфальту, впереди машина — запас, при котором вы останавливаетесь спокойно, а не «в упор». Метры здесь у каждого свои.`, en: `20 km/h on dry asphalt with a car ahead — enough room to stop calmly rather than at the last inch. The metres are different for everybody.` },
              { ru: `Тот же поток, но дождь — тормозной путь вырос, значит вырос и запас. Правило не изменилось, изменились условия.`, en: `The same traffic in rain — braking distance grew, so the gap grows with it. The rule did not change; the conditions did.` },
              { ru: `Ряд припаркованных машин справа — добавьте боковой метр: это ширина открытой двери.`, en: `A row of parked cars on your right — add a metre to the side: that is the width of an open door.` },
              { ru: `Пробка, вы едете между рядами — проблема уже не в дистанции спереди, а в пешеходе, который вот-вот шагнёт между кузовами.`, en: `A jam, and you are filtering between the columns — the problem is no longer the gap ahead but the pedestrian about to step out between two cars.` }
            ]
          },
          quiz: {
            question: { ru: "Какую дистанцию должен держать электровелосипедист до едущего впереди автомобиля?", en: "What is the distance a rider on an electric bicycle must keep from a vehicle in front of him?" },
            options: [
              { ru: "Два метра.", en: "Two meters distance." },
              { ru: "Дистанция не важна.", en: "Distance is not important." },
              { ru: "Дистанцию, которая позволит велосипедисту немедленно остановиться, не рискуя попасть в аварию, в случае, если едущий впереди автомобиль остановится или включит сигнал поворота.", en: "A distance that will enable the rider to come to an immediate stop, without risking an accident, in case the car in front stops or if the car in front gives a turn signal." },
              { ru: "Двухсекундную дистанцию.", en: "Two seconds distance." }
            ],
            correct: 2,
            explanation: { ru: `Единственный вариант, который описывает не число, а результат: вы должны успеть остановиться. Самый коварный здесь — «двухсекундная дистанция»: это настоящее и полезное правило для автомобилей, и потому оно выглядит как верный ответ. Экзамен же спрашивает формулировку закона, привязанную к возможности остановиться, а не к секундомеру.`, en: `The only option that describes an outcome rather than a number: you must be able to stop in time. The trickiest is the two-second gap — a real and useful rule for cars, which is exactly why it looks like the right answer. The exam is asking for the law's wording, and that is tied to the ability to stop, not to a stopwatch.` }
          },
          recall: {
            prompt: { ru: "Как закон описывает дистанцию до едущего впереди автомобиля и почему не в метрах?", en: "How does the law describe the distance to the vehicle ahead, and why not in metres?" },
            answer: { ru: `Дистанция должна позволять немедленно остановиться, не рискуя аварией, если передний автомобиль остановится или включит сигнал поворота. В метрах и секундах это не задаётся, потому что нужный запас зависит от скорости, покрытия, погоды и состояния тормозов: два метра на 10 км/ч по сухому — это одно, а те же два метра на 25 км/ч по мокрому — уже столкновение. Отдельно держится боковой интервал от припаркованных машин, примерно на ширину открытой двери.`, en: `The distance must let you stop immediately, without risking a collision, if the car ahead halts or signals a turn. It is not fixed in metres or seconds because the room you need depends on speed, surface, weather and the state of your brakes: two metres at 10 km/h on dry asphalt is one thing, and the same two metres at 25 km/h in the wet is a collision. Side clearance from parked cars is kept separately, at roughly the width of an open door.` },
            points: [
              { ru: `Дистанция = возможность немедленно остановиться`, en: `Distance = the ability to stop immediately` },
              { ru: `Не два метра и не две секунды`, en: `Not two metres and not two seconds` },
              { ru: `Зависит от скорости, покрытия и погоды`, en: `Depends on speed, surface and weather` },
              { ru: `Боковой интервал от припаркованных — около ширины двери`, en: `Side clearance from parked cars — about a door's width` }
            ]
          },
          wisdomTags: ["uncertainty", "planning"]
        },

        {
          title: { ru: "Обгон и возвращение в полосу", en: "Overtaking, and Coming Back In" },
          glossary: [
            { term: { ru: "Слепая зона", en: "Blind spot" }, definition: { ru: "Сектор сзади-сбоку, который не показывает ни одно зеркало. Пока вы в нём, водитель действует так, будто вас нет.", en: "The sector behind and to the side that no mirror shows. While you are in it, the driver acts as though you were not there." } },
            { term: { ru: "Взгляд через плечо", en: "Shoulder check" }, definition: { ru: "Короткий поворот головы назад перед возвращением в полосу. Закрывает ровно то, чего не видно в зеркалах.", en: "A short glance back before moving in. It covers exactly what the mirrors do not." } }
          ],
          explain: {
            blocks: [
              { text: { ru: `Обгонять автомобиль <strong>справа</strong> — самое опасное, что можно сделать на велосипеде в городе, и официальный вопрос перечисляет сразу три причины, ни одна из которых не отменяет остальные.<br><br>Первая: вы зажаты между бордюром и кузовом, и уходить в сторону некуда. Вторая: вы в слепой зоне, водитель не видит вас ни в одно зеркало. Третья: обгоняемая машина может внезапно вильнуть вправо.`, en: `Overtaking a car <strong>on the right</strong> is the most dangerous thing you can do on a bicycle in town, and the official question lists three reasons at once, none of which cancels the others.<br><br>First: you are pinned between the kerb and the bodywork with nowhere to move sideways. Second: you are in the blind spot and the driver sees you in no mirror at all. Third: the car being overtaken may swerve right without warning.` } },
              { heading: { ru: "Почему «он же меня видит» не работает", en: "Why \"but he can see me\" does not hold" }, text: { ru: `Слепая зона — это не невнимательность водителя, а геометрия зеркал. Справа сзади у любой машины есть сектор, где велосипедист не отражается ни в боковом зеркале, ни в салонном.<br><br>Отсюда неприятный вывод: пока вы там, водитель принимает решения так, как будто вас нет. Он поворачивает направо, прижимается к бордюру, открывает дверь — и всё это не «против вас», а просто без вас.`, en: `A blind spot is not a driver's inattention, it is the geometry of mirrors. Every car has a sector behind and to the right where a rider appears in neither the wing mirror nor the interior one.<br><br>The uncomfortable consequence: while you are there, the driver makes decisions as though you did not exist. He turns right, pulls to the kerb, opens a door — none of it against you, simply without you.` } },
              { heading: { ru: "Возвращение в полосу", en: "Coming back into lane" }, text: { ru: `Закончив обгон, возвращаться в свою полосу можно только после того, как вы посмотрели в зеркала и дополнительно бросили короткий взгляд назад через плечо.<br><br>Взгляд через плечо здесь не перестраховка, а обязательная часть манёвра: он закрывает ровно ту зону, которую зеркала не показывают. Вариант «по прошествии разумного времени» неверен именно потому, что время само по себе ничего не проверяет.`, en: `Having finished the overtake, you may return to your lane only after checking the mirrors and additionally throwing a short glance back over your shoulder.<br><br>The shoulder check is not belt-and-braces here, it is a required part of the manoeuvre: it covers precisely the zone the mirrors do not show. The option "after a reasonable length of time" is wrong exactly because time on its own verifies nothing.` } }
            ],
            analogy: { ru: `Слепая зона похожа на разговор со спины с человеком в наушниках: он не игнорирует вас, он физически не получает сигнала. Кричать громче бесполезно — нужно выйти туда, где вас видно. Разница в том, что человек в наушниках рано или поздно обернётся сам, а водитель обернётся, только если вы уже там, куда он смотрит.`, en: `A blind spot is like talking to the back of someone wearing headphones: they are not ignoring you, they physically receive no signal. Shouting louder is useless — you have to move to where you can be seen. The difference is that the person in headphones will eventually turn round on their own, while the driver will only look where he is already looking.` },
            sources: [
              { ref: { ru: `Официальный банк вопросов теоретического экзамена, категория «A3» — Министерство транспорта и дорожной безопасности (gov.il/ru/departments/dynamiccollectors/theory-exam-a3), вопросы 0021 и 0041.`, en: `Official theory-exam question bank, category A3 — Ministry of Transport and Road Safety (gov.il/en/departments/dynamiccollectors/theory-exam-a3), questions 0021 and 0041.` }, note: { ru: `Три причины опасности обгона справа и порядок возвращения в полосу после обгона.`, en: `The three reasons overtaking on the right is dangerous, and the procedure for returning to lane.` } },
              { ref: { ru: `<bdi>תקנות התעבורה, התשכ״א-1961, תקנה 127 — «ריווח בין אופניים לרכב אחר»</bdi>. Полный текст: nevo.co.il/law_html/law01/p230_011.htm`, en: `Israeli Traffic Regulations 1961, reg. 127 — <bdi>תקנות התעבורה, התשכ״א-1961, תקנה 127 — «ריווח בין אופניים לרכב אחר»</bdi>. Full text: nevo.co.il/law_html/law01/p230_011.htm` }, note: { ru: `Обязанность держать интервал от другого транспорта — именно её нарушает обгон вплотную к кузову.`, en: `The duty to keep clearance from other vehicles — precisely what squeezing past a body panel breaks.` } }
            ]
          },
          example: {
            label: { ru: "Обгон справа: три независимые опасности", en: "Overtaking on the right: three independent dangers" },
            steps: [
              { ru: `Коридор шириной меньше метра: бордюр с одной стороны, кузов с другой. Потеря равновесия здесь заканчивается не на асфальте, а под колесом.`, en: `A corridor under a metre wide: kerb on one side, bodywork on the other. Losing balance here ends not on the asphalt but under a wheel.` },
              { ru: `Слепая зона: водитель смотрит в правое зеркало и видит пустую полосу. Для него вас в этот момент не существует.`, en: `The blind spot: the driver checks his right mirror and sees an empty lane. As far as he is concerned you do not exist.` },
              { ru: `Машина вильнула вправо — объехать выбоину, прижаться к бордюру, свернуть во двор. Всё это законно, и всё это происходит поверх вас.`, en: `The car swerves right — around a pothole, in to the kerb, into a courtyard. All of it lawful, and all of it happening on top of you.` },
              { ru: `Три причины действуют одновременно — поэтому в вопросе верен ответ «все ответы верны». Редкий случай, когда он не приманка.`, en: `All three operate at once — which is why "all answers are correct" is right here. A rare case where that option is not bait.` }
            ]
          },
          quiz: {
            question: { ru: "Какая опасность возникает, когда велосипедист обгоняет автомобиль справа?", en: "What is dangerous about a bicycle rider overtaking a vehicle from the right?" },
            options: [
              { ru: "Обгоняющий велосипедист находится рядом с бордюром с одной стороны и рядом с автомобилем с другой, из-за чего он может потерять равновесие.", en: "The overtaking rider is near the kerb on the one side and near the vehicle on the other side, meaning he could lose his balance." },
              { ru: "Обгоняющий велосипедист находится в «слепой зоне» автомобиля, то есть водитель не может видеть его в зеркала.", en: "The overtaking rider is in the vehicle’s “blind spot”, meaning the vehicle driver cannot see the bicycle rider in his mirrors." },
              { ru: "Обгоняемый автомобиль может внезапно вильнуть вправо.", en: "The vehicle being overtaken might swerve suddenly to the right." },
              { ru: "Все ответы верны.", en: "All answers are correct." }
            ],
            correct: 3,
            explanation: { ru: `Здесь «все ответы верны» — не отговорка составителя, а содержание правила: три опасности независимы и складываются. Проверить себя просто: уберите любую одну, и оставшихся двух всё равно достаточно, чтобы обгон справа оставался худшим из вариантов.`, en: `Here "all answers are correct" is not the examiner hedging, it is the substance of the rule: the three dangers are independent and they stack. The self-check is easy — remove any one of them and the remaining two are still enough to make overtaking on the right the worst option available.` }
          },
          recall: {
            prompt: { ru: "Почему обгон автомобиля справа опаснее всего и что обязательно сделать перед возвращением в полосу?", en: "Why is overtaking a car on the right the most dangerous option, and what must you do before returning to your lane?" },
            answer: { ru: `Три причины действуют одновременно: вы зажаты между бордюром и кузовом и не можете уйти в сторону; вы в слепой зоне, и водитель принимает решения так, будто вас нет; обгоняемая машина в любой момент может вильнуть вправо — к бордюру, во двор, в объезд ямы. Возвращаться в свою полосу можно только посмотрев в зеркала и дополнительно бросив короткий взгляд назад через плечо: именно он закрывает зону, которую зеркала не показывают. «Через разумное время» критерием не является.`, en: `Three reasons operate at once: you are pinned between kerb and bodywork with nowhere to go sideways; you are in the blind spot, and the driver decides as though you were not there; the car being overtaken may swerve right at any moment — to the kerb, into a courtyard, around a pothole. You may return to your lane only after checking the mirrors and adding a short glance back over the shoulder: that glance covers the zone the mirrors do not show. "After a reasonable time" is not a criterion.` },
            points: [
              { ru: `Зажаты между бордюром и кузовом`, en: `Pinned between kerb and bodywork` },
              { ru: `Слепая зона: водитель вас не видит`, en: `The blind spot: the driver cannot see you` },
              { ru: `Машина может вильнуть вправо`, en: `The car may swerve right` },
              { ru: `Возврат в полосу — только после зеркал и взгляда через плечо`, en: `Return to lane only after mirrors and a shoulder check` }
            ]
          },
          wisdomTags: ["uncertainty", "feedback"]
        },

        {
          title: { ru: "Перекрёсток, сигнал и групповая езда", en: "Junctions, Signals and Riding in a Group" },
          glossary: [
            { term: { ru: "Мигающий жёлтый", en: "Flashing amber" }, definition: { ru: "Перекрёсток не регулируется: приоритет никому не роздан, решение принимает сам участник движения.", en: "The junction is unregulated: priority has been given to nobody, and the decision is the road user's own." } },
            { term: { ru: "Автомобиль сопровождения", en: "Escort vehicle" }, definition: { ru: "Машина с включённой аварийной сигнализацией позади группы более десяти велосипедистов на междугородной дороге.", en: "A car running its hazard lights behind a group of more than ten riders on an intercity road." } }
          ],
          explain: {
            blocks: [
              { text: { ru: `Сигнал рукой подают в одном случае: <strong>когда собираются свернуть с текущего направления движения</strong>. Не на спуске, не на подъёме и не перед железнодорожным переездом.<br><br>Все три «соседа» в официальном вопросе выглядят как забота о безопасности, и в этом их сила как приманки. Но сигнал сообщает окружающим ровно одно: «я меняю направление».`, en: `You signal by hand in one case: <strong>when you intend to swerve from your current path along the road</strong>. Not on a descent, not on a climb, not before a level crossing.<br><br>All three neighbours in the official question look like safety-mindedness, and that is precisely their strength as bait. But a signal tells everyone around you exactly one thing: I am changing direction.` } },
              { heading: { ru: "Мигающий жёлтый", en: "Flashing amber" }, text: { ru: `Мигающий жёлтый — не «проезжай быстрее» и не «стой всегда». Он означает: перекрёсток не регулируется, приоритет никому не роздан, разбирайтесь по обстановке.<br><br>Правильное поведение: снизить скорость и при необходимости полностью остановиться — в зависимости от того, что происходит вокруг. Соблазн «успеть до красного» здесь особенно вреден, потому что при мигающем жёлтом красного не будет вовсе.`, en: `Flashing amber does not mean hurry through, and it does not mean always stop. It means: the junction is unregulated, priority has been assigned to nobody, work it out from what is around you.<br><br>The correct behaviour is to slow down and, if necessary, come to a full stop, depending on the traffic nearby. The urge to beat the red is especially useless here, because in this mode the red is never coming.` } },
              { heading: { ru: "Группой по загородной дороге", en: "In a group on a country road" }, text: { ru: `Если по междугородной дороге едет группа больше десяти велосипедистов, сзади должен идти автомобиль сопровождения с включённой аварийной сигнализацией.<br><br>Один автомобиль и именно сзади. Он работает как подвижный знак «впереди медленные» и даёт догоняющему потоку то, чего у группы нет своими силами, — заметность на расстоянии тормозного пути.`, en: `If a group of more than ten riders is travelling along an intercity road, an escort vehicle must follow behind them with its hazard lights on.<br><br>One vehicle, and specifically behind. It works as a moving sign reading slow traffic ahead and gives approaching drivers what the group cannot provide for itself — visibility at the length of a braking distance.` } }
            ],
            analogy: { ru: `Мигающий жёлтый — как перекрёсток в незнакомом дворе, где нет ни знаков, ни разметки. Никто вам ничего не должен и ничего не запрещает; безопасность держится только на том, что все едут медленно и смотрят друг на друга. Разница с двором одна: здесь на вас выезжают со скоростью городской улицы.`, en: `Flashing amber is like a junction in an unfamiliar courtyard where there are neither signs nor markings. Nobody owes you anything and nobody forbids you anything; safety rests entirely on everyone moving slowly and watching each other. One difference from the courtyard: here they arrive at city-street speed.` },
            sources: [
              { ref: { ru: `<bdi>תקנות התעבורה, התשכ״א-1961, תקנה 129א — «רכיבה על אופניים בליווי רכב ליווי»</bdi>. Полный текст: nevo.co.il/law_html/law01/p230_011.htm`, en: `Israeli Traffic Regulations 1961, reg. 129A — <bdi>תקנות התעבורה, התשכ״א-1961, תקנה 129א — «רכיבה על אופניים בליווי רכב ליווי»</bdi>. Full text: nevo.co.il/law_html/law01/p230_011.htm` }, note: { ru: `Норма о групповой езде на велосипедах с автомобилем сопровождения.`, en: `The regulation on group riding with an escort vehicle.` } },
              { ref: { ru: `Официальный банк вопросов теоретического экзамена, категория «A3» — Министерство транспорта и дорожной безопасности (gov.il/ru/departments/dynamiccollectors/theory-exam-a3), вопросы 0020, 0023 и 0035.`, en: `Official theory-exam question bank, category A3 — Ministry of Transport and Road Safety (gov.il/en/departments/dynamiccollectors/theory-exam-a3), questions 0020, 0023 and 0035.` }, note: { ru: `Когда подаётся сигнал, как вести себя при мигающем жёлтом и требование сопровождения для группы больше десяти.`, en: `When to signal, how to behave at a flashing amber, and the escort requirement for a group of more than ten.` } }
            ]
          },
          example: {
            label: { ru: "Три перекрёстка подряд", en: "Three junctions in a row" },
            steps: [
              { ru: `Обычный светофор, зелёный — едете, правила те же, что для машин.`, en: `An ordinary green light — you go, on the same rules as the cars.` },
              { ru: `Мигающий жёлтый, справа приближается автомобиль — снижаете скорость и при необходимости останавливаетесь: приоритет не роздан никому.`, en: `Flashing amber with a car approaching from the right — you slow and if necessary stop: priority has been given to nobody.` },
              { ru: `Собираетесь свернуть во двор — сигнал рукой заранее, а не в момент поворота.`, en: `About to turn into a courtyard — signal by hand in advance, not as you turn.` },
              { ru: `Впереди крутой спуск — сигнал не нужен: направление вы не меняете. Ровно на этой подмене и построен вопрос.`, en: `A steep descent ahead — no signal: you are not changing direction. That substitution is exactly what the question is built on.` }
            ]
          },
          quiz: {
            question: { ru: "Что должен сделать электровелосипедист, подъехав к перекрёстку, на котором мигает жёлтый сигнал светофора?", en: "What must a rider on an electric bicycle do when he approaches an intersection in which there is a yellow flashing traffic light?" },
            options: [
              { ru: "В любом случае остановиться перед пешеходным переходом.", en: "In any case, he will stop before the pedestrian crossing." },
              { ru: "Снизить скорость и при необходимости полностью остановиться — в зависимости от движения транспорта вокруг него.", en: "He will slow down, and even come to a full stop if necessary - depending on the nearby traffic." },
              { ru: "Ускориться, чтобы пересечь перекрёсток до того, как загорится красный сигнал светофора.", en: "He will accelerate to cross the intersection before the traffic light turns red." },
              { ru: "Снизить скорость и уступать дорогу только транспортным средствам, приближающимся слева.", en: "He will slow down and give right of way only to vehicles approaching from the left." }
            ],
            correct: 1,
            explanation: { ru: `Мигающий жёлтый передаёт решение вам, а не назначает готовый порядок. Поэтому «в любом случае остановиться» и «уступать только левым» неверны одинаково: оба подставляют жёсткое правило туда, где его нет. А «ускориться до красного» опирается на светофор, который в этом режиме красный не покажет.`, en: `Flashing amber hands the decision to you rather than assigning a ready-made order. So "stop in any case" and "give way only to those on the left" are wrong in the same way: both substitute a rigid rule where none exists. And "accelerate before the red" leans on a signal that in this mode will never show red at all.` }
          },
          recall: {
            prompt: { ru: "Когда велосипедист обязан подать сигнал, как вести себя при мигающем жёлтом и что требуется группе больше десяти велосипедистов за городом?", en: "When must a rider signal, how should they behave at a flashing amber, and what does a group of more than ten riders need out of town?" },
            answer: { ru: `Сигнал подаётся, когда вы намерены свернуть с текущего направления движения, и только тогда: подъём, спуск и железнодорожный переезд сигнала не требуют. При мигающем жёлтом перекрёсток не регулируется — нужно снизить скорость и при необходимости полностью остановиться, ориентируясь на движение вокруг. Группе больше десяти велосипедистов на междугородной дороге нужен один автомобиль сопровождения, идущий сзади с включённой аварийной сигнализацией.`, en: `You signal when you intend to swerve from your current path, and only then: a climb, a descent and a level crossing require no signal. At a flashing amber the junction is unregulated — slow down and, if necessary, stop completely, judging by the traffic around you. A group of more than ten riders on an intercity road needs one escort vehicle, travelling behind with its hazard lights on.` },
            points: [
              { ru: `Сигнал — только при смене направления`, en: `Signal only when changing direction` },
              { ru: `Мигающий жёлтый: снизить скорость, при необходимости остановиться`, en: `Flashing amber: slow down, stop if necessary` },
              { ru: `Группа больше десяти за городом — автомобиль сопровождения`, en: `A group of more than ten out of town needs an escort vehicle` },
              { ru: `Сопровождение идёт сзади, с аварийной сигнализацией`, en: `The escort follows behind, hazard lights on` }
            ]
          },
          wisdomTags: ["uncertainty", "evidence"]
        }
      ],
      examQuestions: [
        {
          question: { ru: "Какой опасности подвергается электровелосипедист, двигаясь между рядами машин, стоящими у перекрёстка?", en: "What dangers is a rider on an electric bicycle exposed to when he advances between columns of cars waiting at an intersection?" },
          options: [
            { ru: "Водители автомобилей выбрасывают из окон окурки, которые могут попасть в электровелосипедиста.", en: "Car drivers flick cigarette butts from their windows, which might hit the electric bicycle rider." },
            { ru: "Он может столкнуться с пешеходами, переходящими дорогу не по пешеходному переходу.", en: "He might collide with pedestrians crossing the road not on a proper pedestrian crossing." },
            { ru: "В голове колонны и у стоп-линии перекрёстка не осталось места для остановки из-за большого количества двухколёсного транспорта.", en: "There is no more space left at the head of the column and at the intersection stop line due to the large number of two-wheeled vehicles." },
            { ru: "Велосипедист не подвергается опасности. Между автомобилями всегда будет достаточно свободного пространства для безопасного и лёгкого проезда электровелосипеда.", en: "The rider is not exposed to any danger. There will always be sufficient clearance to enable safe, easy passage of an electric bicycle." }
          ],
          correct: 1
        },
        {
          question: { ru: "Когда электровелосипедист обязан подавать сигнал?", en: "When is a rider on an electric bicycle required to signal?" },
          options: [
            { ru: "Когда намеревается свернуть с текущего направления движения по дороге.", en: "When the rider intends to swerve from his current path along the road." },
            { ru: "Когда подъезжает к длинному подъёму.", en: "When the rider reaches a long uphill slope." },
            { ru: "Когда подъезжает к крутому спуску.", en: "When the rider reaches a steep downhill slope." },
            { ru: "Когда приближается к железнодорожному переезду со шлагбаумом.", en: "When the rider approaches a railway level crossing with a barrier." }
          ],
          correct: 0
        },
        {
          question: { ru: "Каковы преимущества соблюдения боковой дистанции от припаркованных автомобилей при езде на электровелосипеде?", en: "What are the advantages of keeping side-distance from parked cars when riding an electric bicycle?" },
          options: [
            { ru: "Все ответы верны.", en: "All answers are correct." },
            { ru: "Автомобиль может неожиданно отъехать с парковочного места и столкнуться с велосипедистом.", en: "A car might abruptly exit the parking space and collide with the rider." },
            { ru: "Водитель или пассажир могут не глядя открыть дверь автомобиля и ударить велосипедиста.", en: "The driver or passenger might open a car door without looking, hitting the rider." },
            { ru: "Пешеходы, дети и животные могут выбежать на дорогу из-за автомобилей и столкнуться с велосипедом.", en: "Pedestrians, children and animals might burst out onto the road from between the cars and cause the rider to collide with them." }
          ],
          correct: 0
        },
        {
          question: { ru: "Какое из следующих утверждений верно относительно групповой езды на велосипеде по междугородной дороге?", en: "Which of the following statements is correct regarding riding a bicycle in a group, on an intercity road?" },
          options: [
            { ru: "При движении группой более десяти велосипедистов по междугородной дороге сзади должен ехать автомобиль сопровождения с включённой аварийной сигнализацией (четыре мигающих поворотника).", en: "When riding in a group of more than ten riders on an intercity road, a vehicle escort is required to accompany them from behind with the four indicator lights flashing." },
            { ru: "При езде группой более десяти велосипедистов сопровождение автомобиля не требуется.", en: "When riding in a group of more than ten riders, a vehicle escort is not required." },
            { ru: "При езде группой из более чем десяти велосипедистов необходимы два автомобиля сопровождения: один спереди и один сзади.", en: "When riding in a group of more than ten riders, two vehicle escorts are required - one in front and one behind." },
            { ru: "При движении группой более десяти велосипедистов сопровождение автомобиля требуется только в ночное время.", en: "When riding in a group of more than ten riders, a vehicle escort is required only at night." }
          ],
          correct: 0
        },
        {
          question: { ru: "Когда велосипедист должен вернуться на свою обычную полосу после обгона?", en: "When should a bicycle rider return to his regular lane at the end of an overtake?" },
          options: [
            { ru: "При езде на велосипеде нет необходимости возвращаться на полосу, которую велосипед занимал до обгона.", en: "When riding a bicycle there is no need to return to the original lane." },
            { ru: "После того как посмотрит в зеркала заднего вида и бросит короткий взгляд назад через плечо, чтобы ещё раз убедиться, что место свободно.", en: "After checking the rear view mirrors and after a short glance backwards over the right-hand shoulder to double-check that the space is clear." },
            { ru: "После того как велосипедист увидит в обоих зеркалах заднего вида транспортное средство, которое он обогнал.", en: "After you are able to see the vehicle you have overtaken in both rear-view mirrors." },
            { ru: "По прошествии разумного периода времени после опережения транспортного средства, которое он обгоняет.", en: "After a reasonable length of time after passing the vehicle you are overtaking." }
          ],
          correct: 1
        }
      ]
    },
    // ============================================================
    {
      id: "bike-control",
      title: { ru: "Контроль: скорость, тормоза, занос", en: "Control: Speed, Brakes, Skids" },
      desc: { ru: "Откуда берётся управляемость, почему в повороте срывается заднее колесо и что делать на мокром", en: "Where control comes from, why it is the rear wheel that goes in a corner, and what to do in the wet" },
      icon: "\u{1F6DE}",
      chunks: [
        {
          title: { ru: "Скорость и управляемость", en: "Speed, and Control" },
          glossary: [
            { term: { ru: "Пятно контакта", en: "Contact patch" }, definition: { ru: "Площадка, которой шина касается дороги. У велосипеда их два, размером примерно с монету.", en: "The area where the tyre touches the road. A bicycle has two, each about the size of a coin." } },
            { term: { ru: "Разумная скорость", en: "Reasonable speed" }, definition: { ru: "Не число, а скорость, при которой вы успеваете остановиться в пределах видимости и сохраняете запас сцепления.", en: "Not a number, but the speed at which you can still stop within your sight line and keep grip in reserve." } },
            { term: { ru: "Занос", en: "Skid" }, definition: { ru: "Срыв колеса в скольжение: запрос на сцепление превысил доступный запас.", en: "A wheel breaking away into a slide: the demand for grip exceeded what was available." } }
          ],
          predict: {
            question: { ru: "Управляемость электровелосипеда…", en: "The ability to control an electric bicycle…" },
            options: [
              { ru: "Тем лучше, чем быстрее вы едете: на скорости велосипед устойчивее", en: "Improves the faster you go: a bicycle is more stable at speed" },
              { ru: "Лучше при движении на разумной скорости", en: "Is better when riding at a reasonable speed" },
              { ru: "От скорости не зависит вообще", en: "Does not depend on speed at all" },
              { ru: "Зависит только от дороги и никак не связана с велосипедистом", en: "Depends only on the road and has nothing to do with the rider" }
            ],
            reveal: { ru: "Первый вариант не выдумка: на ходу велосипед действительно устойчивее, чем на месте. Дальше — где эта закономерность разворачивается в обратную сторону.", en: "The first option is not made up: a moving bicycle really is more stable than a stationary one. Next: where that relationship turns around and runs the other way." }
          },
          explain: {
            blocks: [
              { text: { ru: `Управляемость электровелосипеда лучше всего <strong>на разумной скорости</strong> — не на максимальной и не на минимальной.<br><br>Ответ выглядит скучно, и поэтому его легко пропустить. Между тем он держит на себе всю тему: торможение, повороты и занос — это просто разные способы потратить сцепление, которого у двух узких колёс изначально немного.`, en: `An electric bicycle handles best <strong>at a reasonable speed</strong> — not at its maximum and not at its minimum.<br><br>The answer looks dull, which is why it is easy to skim past. Yet the whole topic rests on it: braking, cornering and skidding are simply different ways of spending grip, and two narrow tyres never had much of it to begin with.` } },
              { heading: { ru: "Сколько у вас сцепления", en: "How much grip you actually have" }, text: { ru: `Велосипед касается дороги двумя пятнами размером с монету. Всё, что вы делаете — разгоняетесь, тормозите, поворачиваете, — оплачивается из этого небольшого запаса, и запас один на всё сразу.<br><br>Поэтому торможение в повороте опаснее торможения по прямой: вы тратите один и тот же ресурс дважды и упираетесь в его предел раньше, чем ожидали.`, en: `A bicycle touches the road through two patches the size of a coin. Everything you do — accelerate, brake, turn — is paid for out of that small reserve, and it is one reserve for all of it at once.<br><br>That is why braking in a corner is worse than braking in a straight line: you are spending the same resource twice and hit its limit sooner than you expected.` } },
              { heading: { ru: "Что значит «разумная»", en: "What \"reasonable\" means" }, text: { ru: `Разумная скорость — не число, а способность остановиться в пределах видимости и вписаться в то, что откроется за поворотом. Она падает с дождём, гравием, темнотой и усталостью.<br><br>Отсюда и рецепт против заноса, который спрашивают отдельным вопросом: держать разумную скорость, пользоваться тормозами правильно и контролируемо, следить за разгоном. Три части одного и того же — не тратить сцепление резко.`, en: `A reasonable speed is not a number but the ability to stop within your sight line and to fit whatever appears round the bend. It drops with rain, gravel, darkness and fatigue.<br><br>Hence the recipe against skidding, which the bank asks as its own question: hold a reasonable speed, use the brakes correctly and under control, watch your acceleration. Three parts of one instruction — do not spend grip suddenly.` } }
            ],
            analogy: { ru: `Сцепление — как бюджет на неделю: потратить всё на одно можно, но тогда на остальное не останется. Резкое торможение в повороте — это оплата двух счетов одной суммой: первый пройдёт, по второму откажут. Разница с бюджетом одна: перерасход обнаруживается не в конце недели, а в ту же секунду и уже лёжа на асфальте.`, en: `Grip is like a week's budget: you may spend it all on one thing, but then nothing is left for the rest. Braking hard mid-corner is paying two bills with one sum: the first clears and the second is declined. One difference from a budget — you discover the overspend not at the end of the week but in the same second, already lying on the asphalt.` },
            sources: [
              { ref: { ru: `Официальный банк вопросов теоретического экзамена, категория «A3» — Министерство транспорта и дорожной безопасности (gov.il/ru/departments/dynamiccollectors/theory-exam-a3), вопросы 0015 и 0043.`, en: `Official theory-exam question bank, category A3 — Ministry of Transport and Road Safety (gov.il/en/departments/dynamiccollectors/theory-exam-a3), questions 0015 and 0043.` }, note: { ru: `Формулировка про управляемость на разумной скорости и полный ответ о том, как предотвращают занос.`, en: `The wording on control at a reasonable speed, and the full answer on how skidding is prevented.` } },
              { ref: `Gillespie, T. D. (1992). <em>Fundamentals of Vehicle Dynamics</em>. Warrendale, PA: SAE International.`, note: { ru: `Стандартный справочник по сцеплению шины с дорогой: продольные и поперечные усилия делят один и тот же предел.`, en: `The standard reference on tyre-road grip: longitudinal and lateral forces share a single limit.` } }
            ]
          },
          example: {
            label: { ru: "Куда уходит сцепление", en: "Where the grip goes" },
            steps: [
              { ru: `Едете прямо, тормозите плавно — весь запас работает на замедление. Всё в порядке.`, en: `Straight line, gentle braking — the whole reserve is working on slowing you. Everything is fine.` },
              { ru: `Едете прямо на 25 км/ч и резко хватаете тормоз — колесо блокируется: вы запросили больше, чем есть.`, en: `Straight line at 25 km/h and you grab the brake — the wheel locks: you asked for more than there was.` },
              { ru: `Проходите поворот на разумной скорости, не тормозя — запас работает на удержание траектории.`, en: `Through a corner at a reasonable speed without braking — the reserve is working on holding your line.` },
              { ru: `Тормозите посреди того же поворота — просите и то и другое сразу, и колесо срывается в занос.`, en: `Brake in the middle of that same corner — you ask for both at once, and the wheel breaks away.` }
            ]
          },
          quiz: {
            question: { ru: "Как предотвратить занос электровелосипеда на дороге?", en: "How can you prevent an electric bicycle from skidding on the road?" },
            options: [
              { ru: "Поддерживая разумную скорость, правильно и контролируемо используя тормоза, а также контролируя ускорение.", en: "By maintaining reasonable speed and by correct, controlled use of the brakes and by controlled acceleration." },
              { ru: "Повернув руль вправо — так можно выровнять велосипед.", en: "By swerving the handlebar to the right to stabilize the bicycle." },
              { ru: "Долго и сильно нажимая на рычаг переднего тормоза.", en: "By pressing long and hard on the front brake lever." },
              { ru: "Крепко взявшись за руль обеими руками и двигаясь со скоростью, аналогичной скорости остальных транспортных средств на дороге.", en: "By gripping the handlebar firmly with both hands and by riding at a speed similar to that of the rest of the vehicles on the road." }
            ],
            correct: 0,
            explanation: { ru: `Занос предотвращают заранее, а не исправляют в момент. Самый сильный отвлекающий здесь — последний: «двигаться со скоростью потока» звучит как разумный совет из курса вождения, но для велосипеда это прямое приглашение ехать быстрее, чем позволяет сцепление двух узких колёс.`, en: `Skids are prevented in advance, not corrected in the moment. The strongest distractor is the last one: keeping pace with the traffic sounds like sensible advice from a driving course, but on a bicycle it is a direct invitation to ride faster than two narrow contact patches allow.` }
          },
          recall: {
            prompt: { ru: "Почему управляемость велосипеда лучше на разумной скорости и как это связано с заносом?", en: "Why does a bicycle handle better at a reasonable speed, and how does that connect to skidding?" },
            answer: { ru: `Велосипед держится на двух пятнах контакта размером с монету, и запас сцепления один на всё: разгон, торможение и поворот. Разумная скорость — та, при которой ваш запрос не упирается в этот предел и остаётся резерв на неожиданное. На максимальной скорости резерва нет: любое резкое действие превышает запас и срывает колесо. Поэтому занос предотвращают тремя вещами сразу — разумной скоростью, правильным и контролируемым торможением и контролем разгона.`, en: `A bicycle stands on two coin-sized contact patches, and there is one reserve of grip for everything: acceleration, braking and cornering. A reasonable speed is one where your demand does not reach that limit and something is left over for the unexpected. At maximum speed nothing is left over: any sudden input exceeds the reserve and breaks a wheel away. So skids are prevented by three things at once — a reasonable speed, correct and controlled braking, and control of acceleration.` },
            points: [
              { ru: `Два маленьких пятна контакта — общий запас сцепления`, en: `Two small contact patches — one shared reserve of grip` },
              { ru: `Разгон, торможение и поворот тратят один и тот же запас`, en: `Acceleration, braking and cornering spend the same reserve` },
              { ru: `Разумная скорость оставляет резерв на неожиданное`, en: `A reasonable speed leaves something over for the unexpected` },
              { ru: `Занос предотвращают заранее, а не исправляют на ходу`, en: `Skids are prevented in advance, not corrected on the move` }
            ]
          },
          wisdomTags: ["limits", "self-knowledge"]
        },

        {
          title: { ru: "Тормоза: спуск и поворот", en: "Brakes: Descents and Corners" },
          glossary: [
            { term: { ru: "Блокировка колеса", en: "Wheel lock" }, definition: { ru: "Колесо перестаёт вращаться и скользит. Управление в этот момент теряется.", en: "The wheel stops turning and slides. Steering is lost at that moment." } },
            { term: { ru: "Перенос нагрузки", en: "Load transfer" }, definition: { ru: "При торможении вес смещается на переднее колесо, заднее разгружается и теряет сцепление первым.", en: "Under braking the weight shifts onto the front wheel; the rear unloads and loses grip first." } }
          ],
          explain: {
            blocks: [
              { text: { ru: `Два самых опасных места для резкого торможения — крутой спуск и поворот, и опасны они по-разному.<br><br>На спуске резкий тормоз даёт сразу три беды: колёса блокируются и контроль теряется; колодки перегреваются и тормозят хуже обычного; переднее колесо блокируется, велосипед опрокидывается вперёд, и ездок летит через руль. В официальном вопросе верны все три ответа одновременно.`, en: `The two worst places to brake hard are a steep descent and a corner, and they are dangerous in different ways.<br><br>On a descent a sudden grab gives you three problems at once: the wheels lock and control is lost; the pads overheat and brake worse than normal; the front wheel locks, the bicycle pitches forward and the rider goes over the bars. In the official question all three answers are true simultaneously.` } },
              { heading: { ru: "Почему в повороте срывается заднее", en: "Why it is the rear that goes in a corner" }, text: { ru: `При резком торможении в повороте в занос уходит <strong>заднее</strong> колесо. Вес при торможении переносится вперёд, заднее разгружается, и сцепления ему остаётся меньше всего — а поворот уже забрал часть запаса.<br><br>Заднее колесо уходит вбок, и велосипед разворачивает поперёк движения. Лечится это одним: торможение заканчивается до входа в поворот, а не внутри него.`, en: `Braking hard mid-corner sends the <strong>rear</strong> wheel into a skid. Braking transfers weight forward, the rear unloads, and it is left with the least grip of all — while the corner has already taken part of the reserve.<br><br>The rear steps out and the bicycle swings sideways across your direction of travel. There is one cure: finish braking before you enter the corner, not inside it.` } },
              { heading: { ru: "Если тормоз перестал держать", en: "If a brake stops holding" }, text: { ru: `Отдельный случай — ручной тормоз, который перестал тормозить на ходу. Правильный ответ один: <strong>немедленно прекратить движение</strong>.<br><br>Не «доехать аккуратно», не «подкачать шины», не «поменять колёса местами» — все эти варианты есть в банке и все звучат как ремонт. Тормоз не та вещь, с которой едут «пока что»: неизвестно, что откажет следующим и на какой скорости.`, en: `A separate case is a hand brake that stops braking while you are riding. There is one correct answer: <strong>stop riding immediately</strong>.<br><br>Not "ride home carefully", not "pump up the tyres", not "swap the wheels round" — all of these are in the bank and all of them sound like maintenance. A brake is not something you ride on for now: you do not know what fails next, or at what speed.` } }
            ],
            analogy: { ru: `Тормоз в повороте — как резко дёрнуть скатерть под посудой: пока движение плавное, всё стоит, а резкость переводит трение в скольжение, и дальше не держится ничего. Разница в том, что со скатертью момент выбираете вы, а в повороте момент выбирает встречный автомобиль.`, en: `Braking in a corner is like yanking the tablecloth from under the crockery: while the movement is smooth everything stays put, and sharpness converts friction into sliding, after which nothing holds at all. The difference is that with the tablecloth you choose the moment, and in a corner the oncoming car chooses it for you.` },
            sources: [
              { ref: { ru: `Официальный банк вопросов теоретического экзамена, категория «A3» — Министерство транспорта и дорожной безопасности (gov.il/ru/departments/dynamiccollectors/theory-exam-a3), вопросы 0036, 0037 и 0039.`, en: `Official theory-exam question bank, category A3 — Ministry of Transport and Road Safety (gov.il/en/departments/dynamiccollectors/theory-exam-a3), questions 0036, 0037 and 0039.` }, note: { ru: `Три опасности резкого торможения на спуске, занос заднего колеса в повороте и требование немедленно прекратить движение при отказе тормоза.`, en: `The three dangers of braking hard on a descent, the rear-wheel skid in a corner, and the requirement to stop riding at once when a brake fails.` } },
              { ref: `Gillespie, T. D. (1992). <em>Fundamentals of Vehicle Dynamics</em>. Warrendale, PA: SAE International.`, note: { ru: `Перенос нагрузки вперёд при торможении и блокировка колеса как механизм потери управления.`, en: `Forward load transfer under braking, and wheel lock as the mechanism by which control is lost.` } }
            ]
          },
          example: {
            label: { ru: "Одно и то же торможение в четырёх местах", en: "The same braking input in four different places" },
            steps: [
              { ru: `Ровная сухая дорога, тормозите плавно и заранее — штатный режим, ничего не происходит.`, en: `Flat dry road, braking gently and early — normal operation, nothing happens.` },
              { ru: `Крутой спуск, зажали тормоз до упора — переднее колесо блокируется, велосипед опрокидывается вперёд.`, en: `Steep descent, brake squeezed to the stop — the front wheel locks and the bicycle pitches forward.` },
              { ru: `Длинный спуск, тормоз зажат постоянно — колодки перегреваются и тормозят слабее ровно тогда, когда понадобятся по-настоящему.`, en: `Long descent with the brake held on constantly — the pads overheat and brake weakest exactly when you really need them.` },
              { ru: `Поворот, резко хватаете тормоз — уходит заднее колесо, велосипед разворачивает поперёк.`, en: `A corner, and you grab the brake — the rear steps out and the bicycle swings sideways.` }
            ]
          },
          quiz: {
            question: { ru: "К чему приведёт резкое торможение при повороте на электровелосипеде?", en: "What will an abrupt braking cause while turning with an electric bicycle?" },
            options: [
              { ru: "К заносу переднего колеса.", en: "Skidding of the front wheel." },
              { ru: "К увеличению скорости велосипеда.", en: "Increased bicycle speed." },
              { ru: "К заносу заднего колеса.", en: "Skidding of the rear wheel." },
              { ru: "К потере передним колесом контакта с землёй.", en: "Front wheel rising off the ground." }
            ],
            correct: 2,
            explanation: { ru: `Вариант «переднее колесо» выглядит логично: передний тормоз мощнее, и вес переносится вперёд. Но именно поэтому переднее колесо в повороте прижато к дороге, а разгруженное заднее остаётся с минимальным сцеплением и срывается первым. Эти два случая стоит различать: опрокидывание через руль — это спуск и прямая, занос заднего — это поворот.`, en: `The front-wheel option looks logical: the front brake is stronger and weight moves forward. But that is exactly why the front wheel is pressed into the road through a corner, while the unloaded rear is left with minimal grip and lets go first. The two cases are worth keeping apart: going over the bars belongs to descents and straight lines, a rear-wheel skid belongs to corners.` }
          },
          recall: {
            prompt: { ru: "Что происходит при резком торможении на крутом спуске и что — при резком торможении в повороте?", en: "What happens when you brake hard on a steep descent, and what happens when you brake hard in a corner?" },
            answer: { ru: `На крутом спуске резкое торможение опасно тремя вещами сразу: колёса блокируются и контроль теряется; тормозные колодки перегреваются и начинают тормозить хуже; переднее колесо блокируется, велосипед опрокидывается вперёд и ездок падает через руль. В повороте картина другая: вес перенесён вперёд, заднее колесо разгружено, и в занос уходит именно оно — велосипед разворачивает поперёк движения. Если ручной тормоз перестал держать на ходу, единственное правильное решение — немедленно прекратить движение.`, en: `On a steep descent braking hard is dangerous in three ways at once: the wheels lock and control is lost; the pads overheat and start braking worse; the front wheel locks, the bicycle pitches forward and the rider goes over the bars. In a corner the picture is different: weight has moved forward, the rear wheel is unloaded, and it is the rear that skids — the bicycle swings sideways across your direction of travel. If a hand brake stops holding while you ride, the only correct decision is to stop riding immediately.` },
            points: [
              { ru: `Спуск: блокировка колёс и потеря контроля`, en: `Descent: wheels lock and control is lost` },
              { ru: `Спуск: перегрев колодок и ухудшение торможения`, en: `Descent: pads overheat and braking weakens` },
              { ru: `Спуск: опрокидывание через переднее колесо`, en: `Descent: pitching over the front wheel` },
              { ru: `Поворот: занос заднего колеса`, en: `Corner: the rear wheel skids` },
              { ru: `Отказавший тормоз — немедленно прекратить движение`, en: `A failed brake — stop riding immediately` }
            ]
          },
          wisdomTags: ["correction", "limits"]
        },

        {
          title: { ru: "Мокрая дорога и состояние ездока", en: "Wet Roads, and the State You Are In" },
          glossary: [
            { term: { ru: "Полный контроль", en: "Full control" }, definition: { ru: "Состояние, в котором вы способны управлять велосипедом. Ехать без него запрещено категорически.", en: "The condition in which you are capable of controlling the bicycle. Riding without it is absolutely forbidden." } },
            { term: { ru: "Первые минуты дождя", en: "The first minutes of rain" }, definition: { ru: "Самое скользкое время: вода поднимает с асфальта пыль и масло.", en: "The most slippery window: water lifts dust and oil off the asphalt." } }
          ],
          explain: {
            blocks: [
              { text: { ru: `На мокрой дороге правило одно: <strong>снизить скорость до разумной, если позволяют обстоятельства</strong>. Не «ехать как обычно», не «периодически подтормаживать» и уж точно не «быстрее проскочить мокрый участок».<br><br>Вода уменьшает сцепление, а с ним и весь ваш запас на торможение и на поворот. Всё, что легко даётся на сухом, на мокром требует больше места.`, en: `On a wet road there is one rule: <strong>slow to a sensible speed, as the circumstances permit</strong>. Not "ride as usual", not "dab the brake now and then", and certainly not "get through the wet stretch faster".<br><br>Water reduces grip, and with it your entire reserve for braking and cornering. Everything that comes easily on dry asphalt needs more room in the wet.` } },
              { heading: { ru: "Три опасности мокрого асфальта", en: "Three dangers of wet asphalt" }, text: { ru: `Официальный вопрос перечисляет их вместе, потому что они складываются: занос и опрокидывание набок, причём опасность растёт со скоростью; переворот через руль при резком торможении; и лужа, за которой не видно ни ямы, ни решётки, ни масляного пятна.<br><br>Особенно коварны первые минуты дождя: вода поднимает с асфальта пыль и масло, и покрытие становится скользким сильнее, чем через час ливня.`, en: `The official question lists them together because they stack: skidding and going down on your side, with the danger rising as speed rises; going over the bars under sudden braking; and a puddle hiding a pothole, a grate or a patch of oil.<br><br>The first minutes of rain are the treacherous ones: water lifts dust and oil off the asphalt, and the surface turns more slippery than it will be an hour into the downpour.` } },
              { heading: { ru: "И ещё одно состояние — ваше", en: "And one more condition — your own" }, text: { ru: `Закон запрещает ехать в состоянии, не позволяющем сохранять полный контроль над велосипедом. Категорически — без оговорок про «короткую дорогу домой», «рекомендацию врача» или «только проверить велосипед».<br><br>Принцип тот же, что и с мокрой дорогой: не важно, что вы намеревались сделать. Важно, каким запасом вы располагаете в ту секунду, когда что-то пойдёт не так.`, en: `The law forbids riding in a state that prevents you from keeping full control of the bicycle. Absolutely — with no qualifier about a short ride home, a doctor's advice, or just testing the bicycle.<br><br>The principle is the same as with a wet road: what you intended to do does not matter. What matters is the reserve you are holding in the second when something goes wrong.` } }
            ],
            analogy: { ru: `Мокрый асфальт — как разговор по плохой связи: слова те же, но каждое приходится произносить медленнее и повторять. Говорить в обычном темпе — значит гарантированно потерять половину. Разница в том, что в разговоре потерянное можно переспросить, а потерянное сцепление возвращается только после падения.`, en: `Wet asphalt is like a conversation on a bad line: the words are the same, but each has to be said slower and repeated. Speaking at normal pace guarantees losing half of it. The difference is that in a conversation you can ask again, whereas lost grip only comes back after the fall.` },
            sources: [
              { ref: { ru: `Официальный банк вопросов теоретического экзамена, категория «A3» — Министерство транспорта и дорожной безопасности (gov.il/ru/departments/dynamiccollectors/theory-exam-a3), вопросы 0013, 0046 и 0047.`, en: `Official theory-exam question bank, category A3 — Ministry of Transport and Road Safety (gov.il/en/departments/dynamiccollectors/theory-exam-a3), questions 0013, 0046 and 0047.` }, note: { ru: `Требование снизить скорость на мокрой дороге, перечень трёх опасностей и категорический запрет ехать без полного контроля.`, en: `The requirement to slow down in the wet, the list of three dangers, and the absolute ban on riding without full control.` } },
              { ref: { ru: `<bdi>תקנות התעבורה, התשכ״א-1961, תקנה 123 — «רכיבה על אופניים»</bdi>. Полный текст: nevo.co.il/law_html/law01/p230_011.htm`, en: `Israeli Traffic Regulations 1961, reg. 123 — <bdi>תקנות התעבורה, התשכ״א-1961, תקנה 123 — «רכיבה על אופניים»</bdi>. Full text: nevo.co.il/law_html/law01/p230_011.htm` }, note: { ru: `Общая норма о езде на велосипеде, включая обязанность сохранять контроль над ним.`, en: `The general regulation on riding a bicycle, including the duty to keep control of it.` } }
            ]
          },
          example: {
            label: { ru: "Дождь начался: что меняется", en: "The rain starts: what changes" },
            steps: [
              { ru: `Первые пять минут дождя — самый скользкий момент: вода подняла пыль и масло. Скорость вниз сильнее, чем кажется нужным.`, en: `The first five minutes of rain are the most slippery: water has lifted the dust and oil. Drop your speed more than feels necessary.` },
              { ru: `Впереди лужа во всю полосу — не «проскочить», а объехать или проехать медленно: под водой не видно ни ямы, ни решётки.`, en: `A puddle across the whole lane ahead — not something to blast through but to go around, or take slowly: under the water you can see neither pothole nor grate.` },
              { ru: `Торможение — заранее и плавно: резкое на мокром опрокидывает через руль.`, en: `Brake early and smoothly: a sudden grab in the wet puts you over the bars.` },
              { ru: `Поворот — на уже сниженной скорости и без торможения внутри: мокрый асфальт срывает заднее колесо охотнее сухого.`, en: `Corner at a speed you have already reduced, with no braking inside it: wet asphalt lets the rear go far more readily than dry.` }
            ]
          },
          quiz: {
            question: { ru: "Как электровелосипедист должен двигаться по мокрой дороге?", en: "How will an electric bicycle rider ride when the road is wet?" },
            options: [
              { ru: "Так же, как и по сухой дороге. Никакой разницы.", en: "Same as on a dry road. No difference." },
              { ru: "Периодически нажимать на тормоз.", en: "He will intermittently press the brake." },
              { ru: "Ускоряться до тех пор, пока не проедет мокрый участок, — так безопаснее.", en: "He will accelerate until he has passed the wet stretch - to increase safety." },
              { ru: "Замедлиться до разумной скорости, если позволяют обстоятельства.", en: "He will slow down to a sensible speed as the circumstances permit." }
            ],
            correct: 3,
            explanation: { ru: `«Периодически нажимать на тормоз» — единственный вариант с рациональным зерном: так действительно подсушивают колодки на длинном спуске. Именно поэтому он и опаснее остальных как ответ — подсушенные колодки не решают главную проблему мокрой дороги, а она в уменьшившемся сцеплении. Оно лечится только скоростью.`, en: `Dabbing the brake is the one option with a grain of sense in it: that really is how you dry pads on a long descent. Which is precisely what makes it the most dangerous answer — dried pads do not touch the main problem of a wet road, and that problem is reduced grip. The only cure for that is speed.` }
          },
          recall: {
            prompt: { ru: "Как ехать по мокрой дороге и что закон говорит о состоянии самого велосипедиста?", en: "How should you ride on a wet road, and what does the law say about the rider's own condition?" },
            answer: { ru: `На мокрой дороге нужно снизить скорость до разумной, если позволяют обстоятельства: вода уменьшает сцепление, а с ним и весь запас на торможение и на поворот. Опасностей три, и они складываются: занос и опрокидывание набок, растущие со скоростью; переворот через руль при резком торможении; лужа, скрывающая яму, решётку или масло. Отдельно: ехать в состоянии, не позволяющем сохранять полный контроль над велосипедом, категорически запрещено — без оговорок про короткую дорогу домой, рекомендацию врача или проверку велосипеда.`, en: `On a wet road you slow to a sensible speed as the circumstances permit: water reduces grip, and with it the whole reserve for braking and cornering. There are three dangers and they stack: skidding and going down on your side, worsening with speed; going over the bars under sudden braking; a puddle hiding a pothole, a grate or oil. Separately: riding in a state that prevents you from keeping full control of the bicycle is absolutely forbidden — with no qualifier about a short ride home, a doctor's advice, or testing the bicycle.` },
            points: [
              { ru: `Снизить скорость до разумной`, en: `Slow to a sensible speed` },
              { ru: `Занос и опрокидывание набок — опасность растёт со скоростью`, en: `Skidding and going down sideways — worse the faster you go` },
              { ru: `Резкое торможение переворачивает через руль`, en: `Sudden braking puts you over the bars` },
              { ru: `Лужа скрывает то, что под ней`, en: `A puddle hides whatever is under it` },
              { ru: `Ехать без полного контроля запрещено категорически`, en: `Riding without full control is absolutely forbidden` }
            ]
          },
          wisdomTags: ["uncertainty", "self-knowledge"]
        }
      ],
      examQuestions: [
        {
          question: { ru: "Разрешено ли электровелосипедисту ездить в состоянии, не позволяющем ему сохранять полный контроль над велосипедом?", en: "Is a rider allowed to ride an electric bicycle in a state that prevents him from maintaining full control of the bicycle?" },
          options: [
            { ru: "Разрешено только по рекомендации врача.", en: "This is allowed only as advised by a doctor." },
            { ru: "Это категорически запрещено.", en: "This is absolutely forbidden." },
            { ru: "Разрешено только для короткой поездки домой.", en: "This is allowed only for a short ride home." },
            { ru: "Разрешено только для проверки электровелосипеда.", en: "This is allowed only to test the electric bicycle." }
          ],
          correct: 1
        },
        {
          question: { ru: "Управляемость электровелосипеда:", en: "The ability to control an electric bicycle:" },
          options: [
            { ru: "Лучше при движении на разумной скорости.", en: "Is better when driving at a reasonable speed." },
            { ru: "Чем быстрее вы едете, тем лучше.", en: "Improves the faster you go." },
            { ru: "Не зависит от скорости велосипеда.", en: "Does not depend on the bicycle’s speed." },
            { ru: "Зависит от дорожных условий и не связана с велосипедистом или велосипедом.", en: "Depends on the road conditions and has nothing to do with the rider or the bicycle." }
          ],
          correct: 0
        },
        {
          question: { ru: "Чем опасно резкое торможение при езде по крутому спуску на электровелосипеде?", en: "What is the danger in a sudden braking while descending along a steep downhill slope on an electric bicycle?" },
          options: [
            { ru: "Опасность блокировки колёс и потери контроля над велосипедом.", en: "Danger of the wheels locking and losing control over the bicycle." },
            { ru: "Перегрев тормозных колодок и ухудшение торможения по сравнению с нормальными условиями.", en: "Overheating of the brake pads and weakening of the deceleration, compared to normal conditions." },
            { ru: "Переднее колесо блокируется, велосипед опрокидывается, и велосипедист падает.", en: "The front wheel locking, thereby overturning the rider." },
            { ru: "Все ответы верны.", en: "All answers are correct." }
          ],
          correct: 3
        },
        {
          question: { ru: "Если велосипедист чувствует, что его ручной тормоз не тормозит велосипед во время езды, он должен:", en: "If a rider feels that his hand brake is not braking the bicycle while riding, he must:" },
          options: [
            { ru: "Немедленно прекратить движение на велосипеде.", en: "Immediately stop riding the bicycle." },
            { ru: "Поменять местами передние и задние колёса.", en: "Switch the front and rear wheels." },
            { ru: "Поехать на ближайшую заправку и сильнее накачать шины.", en: "Go to the nearest gas station and increase air pressure in the wheels." },
            { ru: "Выпустить немного воздуха из шин, чтобы решить проблему.", en: "Release a little bit of air from the tires to overcome the problem." }
          ],
          correct: 0
        },
        {
          question: { ru: "При езде на велосипеде по мокрой дороге существует опасность:", en: "When riding a bicycle on a wet road, there is a danger of:" },
          options: [
            { ru: "Заноса и опрокидывания велосипеда, причём опасность увеличивается с увеличением скорости.", en: "Skidding and overturning of the bicycle - the danger increases with speed." },
            { ru: "Переворачивания велосипеда, если велосипедисту приходится резко затормозить.", en: "Bicycle overturning if the rider has to brake suddenly." },
            { ru: "Въезда в лужу и потери контроля над велосипедом.", en: "Entering a puddle and losing control of the bicycle." },
            { ru: "Все ответы верны.", en: "All answers are correct." }
          ],
          correct: 3
        }
      ]
    },
    // ============================================================
    {
      id: "bike-hazards",
      title: { ru: "Видимость, снаряжение, ответственность", en: "Visibility, Equipment, Accountability" },
      desc: { ru: "Обязательное оснащение, свет в темноте, уязвимость велосипедиста и полномочия полиции", en: "Mandatory equipment, lights after dark, the rider's exposure, and what the police may do" },
      icon: "\u{1F319}",
      chunks: [
        {
          title: { ru: "Обязательное оснащение и свет", en: "Mandatory Equipment, and Lights" },
          glossary: [
            { term: { ru: "150 метров", en: "150 metres" }, definition: { ru: "Расстояние, на которое белая передняя фара должна освещать дорогу при нормальной видимости.", en: "The distance a white front lamp must throw its beam under normal visibility." } },
            { term: { ru: "Отражатель", en: "Reflector" }, definition: { ru: "Пассивный элемент, светящийся в чужих фарах. Обязателен сзади, а в темноте — и на педалях.", en: "A passive part that lights up in someone else's headlights. Mandatory at the rear, and after dark on the pedals too." } }
          ],
          predict: {
            question: { ru: "Что из перечисленного должно быть на велосипеде всегда, чтобы езда была разрешена?", en: "Which of these must be on the bicycle at all times for riding to be permitted?" },
            options: [
              { ru: "Звонок", en: "A bell" },
              { ru: "Эффективный тормоз", en: "An efficient brake" },
              { ru: "Задний отражатель", en: "A rear reflector" },
              { ru: "Всё перечисленное", en: "All of the above" }
            ],
            reveal: { ru: "Один из немногих вопросов, где «все ответы верны» действительно верны. Дальше — почему список именно такой и что добавляется, когда стемнело.", en: "One of the few questions where \"all answers are correct\" genuinely is correct. Next: why the list looks like this, and what gets added once it is dark." }
          },
          explain: {
            blocks: [
              { text: { ru: `Ездить на велосипеде разрешено, только если на нём всегда есть три вещи: <strong>звонок</strong>, <strong>эффективный тормоз</strong> и <strong>задний отражатель</strong>. Всё вместе, а не на выбор.<br><br>Список выглядит мелочью ровно до того момента, когда посмотришь, от чего защищает каждый пункт: звонок — чтобы вас услышали, тормоз — чтобы вы остановились, отражатель — чтобы вас увидели сзади.`, en: `Riding a bicycle is permitted only if three things are on it at all times: a <strong>bell</strong>, an <strong>efficient brake</strong> and a <strong>rear reflector</strong>. All together, not a choice of one.<br><br>The list looks trivial right up to the moment you ask what each item protects against: the bell so you are heard, the brake so you stop, the reflector so you are seen from behind.` } },
              { heading: { ru: "Что добавляет темнота", en: "What darkness adds" }, text: { ru: `В тёмное время суток требований становится больше, и они тоже действуют вместе: спереди — белая фара, освещающая дорогу не менее чем на <strong>150 метров</strong> при нормальной видимости; сзади — красный фонарь; на педалях — жёлтые отражатели.<br><br>Сто пятьдесят метров нужны не для того, чтобы вы разглядели дорогу на такую даль. Это про то, чтобы вас заметили издалека: фара работает и как прожектор, и как маяк.<br><br>Есть и требование, о котором почти никто не знает: на шлеме электровелосипедиста должен быть <strong>светоотражатель</strong>, ясно видимый другим участникам движения.`, en: `After dark the requirements multiply, and these work together too: at the front, a white lamp throwing its beam at least <strong>150 metres</strong> under normal visibility; at the rear, a red light; on the pedals, yellow reflectors.<br><br>The hundred and fifty metres are not there so that you can make out the road that far ahead. They are there so that you are noticed from a distance: the lamp works as a searchlight and as a beacon at once.<br><br>There is also a requirement almost nobody knows about: an electric bicycle rider's helmet must carry a <strong>reflector</strong>, clearly visible to other road users.` } },
              { heading: { ru: "Почему педали, а не рама", en: "Why the pedals rather than the frame" }, text: { ru: `Жёлтые отражатели ставят именно на педали, потому что педали двигаются. Неподвижная точка света в темноте читается как фонарь, отблеск или что угодно ещё; ритмично поднимающиеся и опускающиеся точки водитель распознаёт как велосипедиста мгновенно.<br><br>Редкий случай, когда требование объясняется не силой света, а движением — тем самым, что глаз замечает раньше всего остального.`, en: `The yellow reflectors go on the pedals specifically because pedals move. A stationary point of light in the dark reads as a lamp post, a reflection, anything at all; points rising and falling in rhythm are recognised as a cyclist instantly.<br><br>A rare case where the requirement is explained not by brightness but by motion — the one thing the eye notices before everything else.` } }
            ],
            analogy: { ru: `Комплект света на велосипеде — как подпись и печать на документе: по отдельности каждый элемент почти ничего не доказывает, а вместе они опознаются с одного взгляда. Уберите одно — и остальное перестаёт работать как система. Разница в том, что документ разглядывают не спеша, а вас — боковым зрением из движущейся машины.`, en: `A bicycle's set of lights is like a signature and a stamp on a document: separately each proves almost nothing, together they are recognised at a glance. Remove one and the rest stops working as a system. The difference is that a document is examined at leisure, and you are read in peripheral vision from a moving car.` },
            sources: [
              { ref: { ru: `<bdi>תקנות התעבורה, התשכ״א-1961, תקנה 130 — «ציוד אופניים» и תקנה 132 — «אורות אופניים»</bdi>. Полный текст: nevo.co.il/law_html/law01/p230_011.htm`, en: `Israeli Traffic Regulations 1961, regs. 130 and 132 — <bdi>תקנה 130 — «ציוד אופניים»</bdi>, <bdi>תקנה 132 — «אורות אופניים»</bdi>. Full text: nevo.co.il/law_html/law01/p230_011.htm` }, note: { ru: `Обязательный комплект оснащения и требования к освещению в тёмное время суток. Отражатель на шлеме — <bdi>תקנה 39טז(4)</bdi>.`, en: `The mandatory equipment set and the lighting requirements after dark. The helmet reflector is <bdi>תקנה 39טז(4)</bdi>.` } },
              { ref: { ru: `Официальный банк вопросов теоретического экзамена, категория «A3» — Министерство транспорта и дорожной безопасности (gov.il/ru/departments/dynamiccollectors/theory-exam-a3), вопросы 0018 и 0019.`, en: `Official theory-exam question bank, category A3 — Ministry of Transport and Road Safety (gov.il/en/departments/dynamiccollectors/theory-exam-a3), questions 0018 and 0019.` }, note: { ru: `Постоянное оснащение (звонок, тормоз, отражатель) и три условия езды в темноте, включая дистанцию в 150 метров.`, en: `The permanent equipment (bell, brake, reflector) and the three conditions for riding after dark, including the 150-metre figure.` } }
            ]
          },
          example: {
            label: { ru: "Что проверить перед вечерней поездкой", en: "What to check before an evening ride" },
            steps: [
              { ru: `Звонок на месте, тормоз держит, задний отражатель цел — базовый набор, без которого нельзя и днём.`, en: `Bell in place, brake holding, rear reflector intact — the basic set, without which you may not ride even by day.` },
              { ru: `Стемнело: горит ли белая фара спереди? Она должна освещать дорогу примерно на 150 метров.`, en: `It is dark: is the white front lamp on? It has to light the road for about 150 metres.` },
              { ru: `Горит ли красный фонарь сзади? Именно он делает вас заметным для догоняющих.`, en: `Is the red rear light on? That is what makes you visible to anyone coming up behind.` },
              { ru: `Целы ли жёлтые отражатели на педалях? Движущиеся точки водитель распознаёт быстрее любых неподвижных.`, en: `Are the yellow pedal reflectors intact? Moving points register with a driver faster than any stationary ones.` }
            ]
          },
          quiz: {
            question: { ru: "Вечером вы выезжаете: фара горит, красный фонарь сзади горит, тормоза в порядке. Отражатели на педалях отвалились ещё неделю назад. Можно ехать?", en: "You set off in the evening: front lamp on, red rear light on, brakes fine. The pedal reflectors fell off a week ago. May you ride?" },
            options: [
              { ru: "Можно: фара и фонарь дают несравнимо больше света, чем отражатели, и полностью их заменяют.", en: "Yes: the lamp and the rear light give incomparably more light than reflectors and fully replace them." },
              { ru: "Нельзя: требования к езде в темноте действуют вместе, а отражатели на педалях — отдельный пункт списка.", en: "No: the requirements for riding after dark operate together, and pedal reflectors are their own item on the list." },
              { ru: "Можно, если ехать только по освещённым улицам: при уличном освещении отражатели не нужны.", en: "Yes, if you stay on lit streets: with street lighting reflectors are unnecessary." },
              { ru: "Можно: отражатели обязательны только для обычных велосипедов, у электрических есть собственное освещение.", en: "Yes: reflectors are mandatory only on ordinary bicycles; electric ones have lighting of their own." }
            ],
            correct: 1,
            explanation: { ru: `Список для тёмного времени — не набор взаимозаменяемых опций: фара, задний фонарь и отражатели на педалях закрывают разные ракурсы и разные способы вас обнаружить. Первый вариант убедителен по яркости, но яркость и распознаваемость — не одно и то же: именно движущиеся точки на педалях сообщают водителю, что впереди велосипедист, а не фонарный столб.`, en: `The after-dark list is not a set of interchangeable options: the lamp, the rear light and the pedal reflectors cover different angles and different ways of being spotted. The first option is persuasive on brightness, but brightness and recognisability are not the same thing — it is the moving points on the pedals that tell a driver there is a cyclist ahead rather than a lamp post.` }
          },
          recall: {
            prompt: { ru: "Какое оснащение обязательно на велосипеде всегда и что добавляется в тёмное время суток?", en: "What equipment is mandatory on a bicycle at all times, and what is added after dark?" },
            answer: { ru: `Всегда: звонок, эффективный тормоз и задний отражатель — все три сразу. В тёмное время суток добавляются три условия, которые тоже действуют вместе: белая фара спереди, освещающая дорогу не менее чем на 150 метров при нормальной видимости; красный фонарь сзади; жёлтые отражатели на педалях. Отражатели ставят именно на педали, потому что движущиеся точки света глаз распознаёт как велосипедиста быстрее, чем любую неподвижную.`, en: `At all times: a bell, an efficient brake and a rear reflector — all three together. After dark three more conditions apply, and they also work together: a white front lamp lighting the road at least 150 metres under normal visibility; a red light at the rear; yellow reflectors on the pedals. The reflectors go on the pedals specifically because the eye recognises moving points of light as a cyclist faster than any stationary one.` },
            points: [
              { ru: `Звонок`, en: `A bell` },
              { ru: `Эффективный тормоз`, en: `An efficient brake` },
              { ru: `Задний отражатель`, en: `A rear reflector` },
              { ru: `В темноте: фара на 150 м, красный фонарь сзади, жёлтые отражатели на педалях, светоотражатель на шлеме`, en: `After dark: lamp to 150 m, red rear light, yellow pedal reflectors, a reflector on the helmet` }
            ]
          },
          wisdomTags: ["planning", "evidence"]
        },

        {
          title: { ru: "Темнота: что не видите вы и кто не видит вас", en: "Darkness: What You Cannot See, and Who Cannot See You" },
          glossary: [
            { term: { ru: "Дистанция обнаружения", en: "Detection distance" }, definition: { ru: "Расстояние, на котором вы успеваете заметить препятствие. Ночью она в разы короче дневной.", en: "The range at which you still manage to spot an obstacle. At night it is several times shorter than by day." } },
            { term: { ru: "Щиток шлема", en: "Helmet visor" }, definition: { ru: "Прозрачный визор. В царапинах и грязи рассеивает свет встречных фар и ухудшает видимость именно в темноте.", en: "The clear shield. Scratched or dirty it scatters oncoming headlights and ruins vision specifically in the dark." } }
          ],
          explain: {
            blocks: [
              { text: { ru: `Главная опасность езды в темноте — <strong>плохая видимость дороги впереди</strong>: препятствия обнаруживаются слишком поздно. Яма, решётка, бордюр, лежащая ветка днём видны за десятки метров, ночью — за несколько.<br><br>Это и есть правильный ответ на официальный вопрос. Варианты про холод и про воздействие низких температур на велосипед выглядят заботливо, но от темноты не мёрзнут ни люди, ни велосипеды.`, en: `The main danger of riding in the dark is <strong>poor visibility of the road ahead</strong>: obstacles are detected too late. A pothole, a grate, a kerb, a fallen branch are visible from tens of metres by day and from a few at night.<br><br>That is the correct answer to the official question. The options about cold and about low temperatures affecting the bicycle look caring, but darkness does not chill either people or bicycles.` } },
              { heading: { ru: "Щиток шлема", en: "Helmet visor" }, text: { ru: `Поцарапанный или грязный щиток шлема в темноте <em>отражает</em> свет и сильно ухудшает видимость. Каждая царапина рассеивает встречные фары в сплошную пелену, и вы получаете ровно противоположное тому, ради чего щиток надет.<br><br>Днём тот же щиток работает нормально: рассеяние заметно только когда источник яркий, а вокруг темно. Поэтому «днём всё было в порядке» — не аргумент.`, en: `A scratched or dirty helmet visor <em>deflects</em> light in the dark and severely reduces vision. Every scratch scatters oncoming headlights into a solid veil, and you get precisely the opposite of what the visor was put on for.<br><br>By day the same visor behaves normally: the scattering only shows when the source is bright and everything around it is dark. Which is why "it was fine this afternoon" is not an argument.` } },
              { heading: { ru: "И то, чего не видят в вас", en: "And what others cannot see of you" }, text: { ru: `Вторая половина темноты — ваша собственная заметность. Красный фонарь и отражатели на педалях существуют потому, что габариты велосипеда в темноте не читаются: водитель видит точку света и до последнего не понимает, далеко она или близко.<br><br>Практический вывод: ночью ваша разумная скорость ниже дневной ровно настолько, насколько сократилась дистанция обнаружения.`, en: `The other half of darkness is how visible you are. The red light and the pedal reflectors exist because a bicycle's dimensions do not read at night: a driver sees a point of light and until the last moment cannot tell whether it is far away or close.<br><br>The practical consequence: at night your reasonable speed is lower than your daytime one by exactly as much as your detection distance has shrunk.` } }
            ],
            analogy: { ru: `Поцарапанный щиток в темноте работает как запотевшее кухонное окно вечером: днём через него всё видно, а ночью каждый уличный фонарь размазывается в пятно, и различать перестаёшь даже близкое. Разница в том, что окно можно протереть после ужина, а мутный щиток вы обнаруживаете уже на скорости.`, en: `A scratched visor at night behaves like a steamed-up kitchen window in the evening: by day you see through it fine, and after dark every street lamp smears into a blob until you cannot make out even what is close. The difference is that the window can be wiped after dinner, while you discover the clouded visor already at speed.` },
            sources: [
              { ref: { ru: `Официальный банк вопросов теоретического экзамена, категория «A3» — Министерство транспорта и дорожной безопасности (gov.il/ru/departments/dynamiccollectors/theory-exam-a3), вопросы 0038 и 0040.`, en: `Official theory-exam question bank, category A3 — Ministry of Transport and Road Safety (gov.il/en/departments/dynamiccollectors/theory-exam-a3), questions 0038 and 0040.` }, note: { ru: `Влияние поцарапанного или грязного щитка шлема в темноте и главная опасность ночной езды.`, en: `The effect of a scratched or dirty visor in the dark, and the main danger of riding at night.` } },
              { ref: { ru: `<bdi>תקנות התעבורה, התשכ״א-1961, תקנה 132 — «אורות אופניים»</bdi>. Полный текст: nevo.co.il/law_html/law01/p230_011.htm`, en: `Israeli Traffic Regulations 1961, reg. 132 — <bdi>תקנות התעבורה, התשכ״א-1961, תקנה 132 — «אורות אופניים»</bdi>. Full text: nevo.co.il/law_html/law01/p230_011.htm` }, note: { ru: `Требования к освещению велосипеда в тёмное время суток — вторая половина той же проблемы: заметность.`, en: `The lighting requirements after dark — the other half of the same problem: being seen.` } }
            ]
          },
          example: {
            label: { ru: "Ночь: четыре обстановки", en: "Night: four situations" },
            steps: [
              { ru: `Освещённая улица, щиток чистый — видимость близка к дневной, но дистанция обнаружения всё равно меньше.`, en: `A lit street with a clean visor — visibility close to daytime, but the detection distance is still shorter.` },
              { ru: `Тёмная улица, щиток поцарапан — встречные фары размазываются в пелену; поднять щиток безопаснее, чем ехать вслепую.`, en: `A dark street with a scratched visor — oncoming headlights smear into a veil; lifting the visor is safer than riding blind.` },
              { ru: `Загородная дорога без фонарей — работает только ваша фара: всё, что дальше её луча, для вас не существует.`, en: `An unlit country road — only your own lamp is working: anything beyond its beam does not exist for you.` },
              { ru: `Вы едете медленно и со светом, но водитель сзади видит лишь точку и не понимает расстояния — фонарь не заменяет запаса по скорости.`, en: `You are riding slowly and lit up, but the driver behind sees only a point and cannot judge the distance — a light does not substitute for margin in your speed.` }
            ]
          },
          quiz: {
            question: { ru: "Как щиток шлема повлияет на езду на электровелосипеде в темноте?", en: "How will the helmet visor affect riding on an electric bicycle in the dark?" },
            options: [
              { ru: "Поцарапанный или грязный щиток шлема отражает свет и сильно ухудшает видимость в темноте.", en: "A scratched or dirty helmet visor deflects the light and severely reduces vision in the dark." },
              { ru: "Поцарапанный или грязный щиток шлема облегчает езду в темноте.", en: "A scratched or dirty helmet visor makes riding in the dark easier." },
              { ru: "Щиток шлема раздражает велосипедиста, даже если он об этом не подозревает.", en: "The visor aggravates the rider - even if the rider is unaware of this." },
              { ru: "Езда в шлеме без щитка всегда помогает улучшить зрение в тёмное время суток.", en: "Riding on a two-wheeled vehicle without a visor always helps improve vision in the dark." }
            ],
            correct: 0,
            explanation: { ru: `Царапины и грязь не затемняют щиток, а рассеивают на нём чужой свет — эффект проявляется именно ночью, когда вокруг темно, а источники яркие. Последний вариант ловит на слове «всегда»: снять щиток иногда действительно лучше, но «всегда» превращает частный приём в правило, а щиток защищает глаза от ветра, пыли и насекомых.`, en: `Scratches and dirt do not darken the visor, they scatter other people's light across it — an effect that shows specifically at night, when the surroundings are dark and the sources are bright. The last option is baited with the word always: taking the visor off is sometimes genuinely better, but "always" turns a situational trick into a rule, and the visor is protecting your eyes from wind, dust and insects.` }
          },
          recall: {
            prompt: { ru: "В чём главная опасность езды в темноте и что делает с видимостью поцарапанный щиток шлема?", en: "What is the main danger of riding in the dark, and what does a scratched visor do to your vision?" },
            answer: { ru: `Главная опасность — плохая видимость дороги впереди: препятствия обнаруживаются слишком поздно, потому что дистанция обнаружения ночью в разы короче дневной. Поцарапанный или грязный щиток шлема эту проблему усугубляет: он не затемняет обзор, а отражает и рассеивает свет встречных фар, превращая его в пелену. Вторая половина темноты — ваша собственная заметность: водитель видит только точку света и не понимает расстояния, поэтому фонарь и отражатели не заменяют сниженной скорости.`, en: `The main danger is poor visibility of the road ahead: obstacles are detected too late, because the detection distance at night is several times shorter than by day. A scratched or dirty visor makes it worse: it does not darken your view, it deflects and scatters oncoming headlights into a veil. The other half of darkness is your own visibility: a driver sees only a point of light and cannot judge the distance, so lights and reflectors do not substitute for reducing speed.` },
            points: [
              { ru: `Главная опасность — позднее обнаружение препятствий`, en: `The main danger is detecting obstacles too late` },
              { ru: `Щиток отражает и рассеивает свет, а не затемняет`, en: `The visor deflects and scatters light rather than darkening it` },
              { ru: `Эффект проявляется именно в темноте`, en: `The effect shows specifically in the dark` },
              { ru: `Ночью разумная скорость ниже дневной`, en: `At night a reasonable speed is lower than by day` }
            ]
          },
          wisdomTags: ["uncertainty", "correction"]
        },

        {
          title: { ru: "Уязвимость и ответственность", en: "Exposure, and Accountability" },
          glossary: [
            { term: { ru: "Веские основания", en: "Reasonable grounds" }, definition: { ru: "Условие, при котором полицейский вправе потребовать проверку на алкоголь или наркотики. Постановление суда не требуется.", en: "The condition under which a police officer may require an alcohol or drugs test. No court order is needed." } },
            { term: { ru: "Запрет продолжать движение", en: "Ending the ride" }, definition: { ru: "Полномочие полиции прекратить незаконную езду — вплоть до спуска шин и снятия вентилей.", en: "The police power to stop unlawful riding — extending to deflating the tyres and removing the valves." } }
          ],
          explain: {
            blocks: [
              { text: { ru: `Велосипедист уязвимее водителя и пассажира автомобиля сразу по трём причинам, и в официальном вопросе верны все: он открыт погоде; он может потерять равновесие и уйти в занос; его хуже видно, чем машину.<br><br>Ни одна из трёх не устраняется опытом. Их можно только компенсировать — скоростью, дистанцией и заметностью.`, en: `A rider is more exposed than a car's driver and passengers for three reasons at once, and in the official question all of them are correct: they are exposed to the elements; they can lose balance and skid; they are harder to see than a car.<br><br>None of the three is cured by experience. They can only be compensated for — with speed, distance and visibility.` } },
              { heading: { ru: "Что вправе полиция", en: "What the police may do" }, text: { ru: `Полицейский вправе остановить электровелосипедиста, нарушающего закон, и запретить ему продолжать движение — вплоть до того, чтобы спустить шины и снять вентили, если иначе езду не прекратить.<br><br>Он же вправе потребовать анализ крови на алкоголь и наркотики, если есть веские основания подозревать опьянение. Постановление суда для этого не нужно, и звание полицейского значения не имеет.`, en: `A police officer may stop a rider who is breaking the law and end the ride — to the point of deflating the tyres and removing the valves, if there is no other way to stop it.<br><br>The same officer may require a blood test for alcohol and drugs where there are reasonable grounds to suspect intoxication. No court order is needed for this, and the officer's rank makes no difference.` } },
              { heading: { ru: "Почему к велосипедисту применяют то же, что к водителю", en: "Why a rider is treated like a driver" }, text: { ru: `Логика та же, что в первой теме: вы транспортное средство в потоке. Алкоголь одинаково убирает и точность руления, и оценку скорости — а на двух колёсах цена этого выше, потому что запаса устойчивости нет вовсе.<br><br>Отсюда и полномочия, кажущиеся чрезмерными для «просто велосипеда»: они соразмерны не массе аппарата, а последствиям.`, en: `The logic is the one from the first topic: you are a vehicle in traffic. Alcohol removes steering precision and speed judgement equally — and on two wheels the price is higher, because there is no reserve of stability at all.<br><br>Hence powers that look excessive for "just a bicycle": they are proportionate not to the machine's mass but to the consequences.` } }
            ],
            analogy: { ru: `Уязвимость велосипедиста — как разница между спором в переписке и спором вслух: содержание то же, но в переписке есть секунда, чтобы стереть и переписать. Машина даёт водителю кузов, подушки и время; велосипед не даёт ничего, кроме вашего собственного запаса. Разница в том, что неудачную фразу можно объяснить, а падение — нет.`, en: `A rider's exposure is the difference between arguing in writing and arguing out loud: the content is the same, but in writing there is a second to delete and rewrite. A car gives its driver a shell, airbags and time; a bicycle gives nothing but the margin you brought yourself. The difference is that a badly chosen sentence can be explained afterwards, and a fall cannot.` },
            sources: [
              { ref: { ru: `Официальный банк вопросов теоретического экзамена, категория «A3» — Министерство транспорта и дорожной безопасности (gov.il/ru/departments/dynamiccollectors/theory-exam-a3), вопросы 0014, 0028 и 0033.`, en: `Official theory-exam question bank, category A3 — Ministry of Transport and Road Safety (gov.il/en/departments/dynamiccollectors/theory-exam-a3), questions 0014, 0028 and 0033.` }, note: { ru: `Три причины уязвимости велосипедиста, право полиции прекратить движение и право потребовать анализ крови при веских основаниях.`, en: `The three reasons a rider is exposed, the police power to end a ride, and the power to require a blood test on reasonable grounds.` } },
              { ref: { ru: `<bdi>פקודת התעבורה [נוסח חדש]</bdi> — Указ о дорожном движении, сводная редакция: разделы о полномочиях полиции и о проверке на алкоголь и наркотики. Полный текст: nevo.co.il`, en: `Israeli Traffic Ordinance [New Version] — <bdi>פקודת התעבורה [נוסח חדש]</bdi>: the provisions on police powers and on testing for alcohol and drugs. Full text: nevo.co.il` }, note: { ru: `Первоисточник тех полномочий, которые банк вопросов даёт в пересказе.`, en: `The primary source of the powers that the question bank presents in paraphrase.` } }
            ]
          },
          example: {
            label: { ru: "Три разговора с полицейским", en: "Three conversations with a police officer" },
            steps: [
              { ru: `Едете по тротуару, вас остановили — полицейский вправе запретить продолжать движение, и «мне тут два дома осталось» ничего не меняет.`, en: `Riding on the pavement and stopped — the officer may end the ride, and "it's two doors from here" changes nothing.` },
              { ru: `Отказываетесь прекратить езду — закон допускает спустить шины и снять вентили: это способ исполнить запрет, а не отдельное наказание.`, en: `You refuse to stop riding — the law allows deflating the tyres and removing the valves: that is a way of enforcing the order, not a separate punishment.` },
              { ru: `Полицейский подозревает опьянение и требует анализ крови — вправе, если основания веские. Постановление суда не требуется.`, en: `The officer suspects intoxication and demands a blood test — permitted, where the grounds are reasonable. No court order required.` },
              { ru: `Вам 16 и прав у вас нет — на объём полномочий полиции это не влияет никак.`, en: `You are 16 and hold no licence — this has no effect whatever on the extent of police powers.` }
            ]
          },
          quiz: {
            question: { ru: "Имеет ли полицейский право остановить электровелосипедиста и запретить ему продолжать движение, если тот нарушает закон?", en: "Is a policeman allowed to stop and end an electric bicycle ride if the rider is breaking the law?" },
            options: [
              { ru: "Нет. Полицейскому не разрешается останавливать электровелосипедиста и запрещать ему продолжать движение, кроме случаев, когда у велосипедиста нет водительских прав.", en: "No. A policeman is not allowed to stop and end a bicycle ride, unless the rider has a driving license." },
              { ru: "Нет. Только полицейский в звании инспектора или выше имеет право останавливать велосипедиста и запрещать ему продолжать движение.", en: "No. Only a police officer, ranked Inspector or higher, is allowed to stop and end a bicycle ride." },
              { ru: "Да. Полицейскому разрешено спустить шины и снять вентили, чтобы предотвратить дальнейшую незаконную езду на электровелосипеде.", en: "Yes. A policeman is allowed to deflate the tires and remove the valves to prevent further riding them illegally." },
              { ru: "Да. Только если велосипедисту исполнилось 18 лет и больше.", en: "Yes. Only if the rider is 18 years old or more." }
            ],
            correct: 2,
            explanation: { ru: `Три неверных варианта добавляют по условию: наличие прав, звание полицейского, возраст 18. Схема та же, что в первой теме, — правильный ответ безусловен. Обратите внимание и на смысл действия: спустить шины здесь не наказание, а способ физически исполнить запрет продолжать движение.`, en: `The three wrong options each attach a condition: holding a licence, the officer's rank, being 18. The pattern is the one from the first topic — the correct answer is unconditional. Note also what the action means: deflating the tyres is not a punishment here but a way of physically enforcing the order to stop.` }
          },
          recall: {
            prompt: { ru: "Чем велосипедист уязвимее водителя автомобиля и что вправе сделать полицейский при нарушении?", en: "How is a rider more exposed than a car driver, and what may a police officer do about an offence?" },
            answer: { ru: `Уязвимость складывается из трёх вещей сразу: велосипедист открыт погоде, может потерять равновесие и уйти в занос и хуже заметен, чем машина. Полицейский вправе остановить нарушающего закон велосипедиста и запретить ему продолжать движение — включая право спустить шины и снять вентили, чтобы этот запрет исполнить. Он также вправе потребовать анализ крови на алкоголь и наркотики, если есть веские основания подозревать опьянение: постановление суда для этого не нужно, звание полицейского роли не играет, возраст велосипедиста — тоже.`, en: `The exposure is made of three things at once: the rider is out in the weather, can lose balance and skid, and is harder to see than a car. A police officer may stop a rider who is breaking the law and end the ride — including by deflating the tyres and removing the valves to enforce it. The officer may also require a blood test for alcohol and drugs where there are reasonable grounds to suspect intoxication: no court order is needed, the officer's rank is irrelevant, and so is the rider's age.` },
            points: [
              { ru: `Открыт погоде`, en: `Out in the weather` },
              { ru: `Может потерять равновесие и уйти в занос`, en: `Can lose balance and skid` },
              { ru: `Хуже заметен, чем автомобиль`, en: `Harder to see than a car` },
              { ru: `Полиция вправе остановить и прекратить движение`, en: `The police may stop the rider and end the ride` },
              { ru: `Анализ крови — при веских основаниях, без постановления суда`, en: `A blood test on reasonable grounds, without a court order` }
            ]
          },
          wisdomTags: ["evidence", "self-knowledge"]
        }
      ],
      examQuestions: [
        {
          question: { ru: "Имеет ли право полицейский потребовать от электровелосипедиста сдать анализ крови, чтобы проверить, находится ли он под воздействием алкоголя или наркотиков?", en: "Is a policeman permitted to require an electric bicycle rider to undergo a blood test to check whether he is under the influence of alcohol or drugs?" },
          options: [
            { ru: "Нет. Полицейскому не разрешается требовать сдачи анализа без постановления суда.", en: "No. A policeman is not permitted to require a test without a court order." },
            { ru: "Нет. Полицейскому не разрешается требовать проведения каких-либо анализов ни при каких обстоятельствах.", en: "No. A policeman is not permitted to require any test whatsoever under any circumstances." },
            { ru: "Да. Полицейский имеет право потребовать сдать анализ крови, если у него есть веские основания подозревать, что велосипедист находится в состоянии алкогольного или наркотического опьянения.", en: "Yes. A policeman is permitted to require a blood test if he has reasonable grounds for suspicion that the rider is under the influence of alcohol or drugs." },
            { ru: "Нет. Полицейскому не разрешается требовать анализ крови для определения количества алкоголя или наркотиков в его крови.", en: "No. A policeman is not permitted to require a blood test to determine the amount of alcohol or drugs in his blood." }
          ],
          correct: 2
        },
        {
          question: { ru: "Езда на велосипеде в тёмное время суток разрешена, только если:", en: "It is permitted to ride a bicycle in the dark only if:" },
          options: [
            { ru: "В передней части велосипеда светится белая фара, освещающая дорогу впереди на расстояние не менее 150 метров при нормальной видимости.", en: "There is a white headlight mounted on the front of the bicycle and it is turned on and it sends a light beam forward to a distance of at least 150 meters under normal visibility conditions." },
            { ru: "На задней части велосипеда светится красный задний фонарь.", en: "There is a red rear light mounted on the rear of the bicycle and it is turned on." },
            { ru: "На педалях велосипеда установлены жёлтые отражатели.", en: "The bicycle has yellow reflectors on its pedals." },
            { ru: "Все ответы верны.", en: "All answers are correct." }
          ],
          correct: 3
        },
        {
          question: { ru: "Езда на велосипеде разрешена только в том случае, если велосипед всегда оснащён следующим:", en: "It is permitted to ride a bicycle only if the bicycle is equipped with the following at all times:" },
          options: [
            { ru: "Звонок.", en: "Bell." },
            { ru: "Эффективный тормоз.", en: "An efficient brake." },
            { ru: "Задний отражатель.", en: "Rear reflector." },
            { ru: "Все ответы верны.", en: "All answers are correct." }
          ],
          correct: 3
        },
        {
          question: { ru: "Какие опасности грозят электровелосипедистам в отличие от водителей и пассажиров автомобилей?", en: "What are the dangers facing electric bicycle riders as opposed to car drivers and passengers?" },
          options: [
            { ru: "Все ответы верны.", en: "All answers are correct." },
            { ru: "Велосипедисты уязвимы к погодным воздействиям.", en: "Bicycle riders are exposed to the elements." },
            { ru: "Велосипедисты могут потерять равновесие и уйти в занос.", en: "Bicycle riders risk losing balance and skidding." },
            { ru: "Они менее заметны, чем автомобили, и их труднее увидеть.", en: "They are less easily-visible than cars and are difficult to see." }
          ],
          correct: 0
        },
        {
          question: { ru: "В чём главная опасность езды на велосипеде в темноте?", en: "What is the main danger in riding a bicycle in the dark?" },
          options: [
            { ru: "Плохая видимость дороги впереди, что мешает вовремя обнаруживать препятствия.", en: "The difficulty in continually making out the road ahead and detecting obstacles in time." },
            { ru: "Низкая заметность других транспортных средств позади вас.", en: "The difficulty seeing the other vehicles behind you." },
            { ru: "Велосипедист может замёрзнуть из-за низких температур.", en: "The low temperatures to which the rider is exposed." },
            { ru: "Воздействие низких температур на велосипед.", en: "The low temperatures to which the bicycle is exposed." }
          ],
          correct: 0
        }
      ]
    }
  ]
};
