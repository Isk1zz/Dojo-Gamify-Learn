// ================================================
// Философия · Рим — Цицерон
// ------------------------------------------------
// Всё сверено по docs/research/cicero.md. Ни одно утверждение здесь не
// написано по памяти: у каждого чанка два источника, и там, где источники
// расходятся или молчат, текст говорит об этом вслух, а не выбирает
// удобное.
//
// ---- Порядок намеренный ----
// Сначала человек, потом вклад. Если открыть темой «он придумал слово
// moralis», читателю нечего с этим делать: он не знает, кто это и почему
// должен стараться. Поэтому: смерть → восхождение → крушение → и только
// затем то, что из крушения вышло.
//
// ---- Три поправки, которые стоили работы ----
//   · Ливий: голова была ПОЛОЖЕНА МЕЖДУ рук, а не прибита; руки отрубили
//     именно за то, что ими он ПИСАЛ
//   · «Верона» у Петрарки — выброшена, источник её не подтверждает
//   · список выдуманных им слов: humanitas, individuum и quantitas
//     убраны — их нет ни у фон Альбрехта, ни у Роусон
// ================================================

const MODULE_PHIL_ROME = {
  id: "phil-rome-cicero",
  unit: 41,
  title: { ru: "Рим: Цицерон", en: "Rome: Cicero" },
  icon: "\u{1F3DB}️",
  topics: [

    // ============================================================
    // ТЕМА 1 — человек
    // ============================================================
    {
      id: "cicero-man",
      title: { ru: "Человек, которого убили за слова", en: "The Man Killed for Words" },
      desc: { ru: "Декабрь 43 года, руки на ростре, и восемь месяцев до этого — та же трибуна", en: "December 43 BC, the hands on the Rostra, and eight months earlier — the same platform" },
      icon: "\u{270B}",
      chunks: [
        {
          title: { ru: "Руки", en: "The Hands" },
          glossary: [
            { term: { ru: "Ростра", en: "The Rostra" }, definition: { ru: "Трибуна на римском форуме, с которой обращались к народу. Названа по корабельным носам (rostra), которыми была украшена.", en: "The speakers' platform in the Roman Forum. Named for the ships' beaks (rostra) that decorated it." } },
            { term: { ru: "Проскрипции", en: "Proscription" }, definition: { ru: "Список объявленных вне закона. Имя в списке означало смерть и конфискацию, а убийце полагалась награда.", en: "A published list of the outlawed. A name on it meant death and confiscation, with a reward for the killer." } }
          ],
          predict: {
            question: { ru: "Солдаты отрубили ему не только голову, но и руки. Зачем?", en: "The soldiers cut off not only his head but his hands. Why?" },
            options: [
              { ru: "Чтобы опознать тело — так подтверждали исполнение", en: "To identify the body — that was how a killing was confirmed" },
              { ru: "В укор тем самым рукам: ими он писал против Антония", en: "As a reproach to those hands: they were what wrote against Antony" },
              { ru: "Таков был обычай при проскрипциях", en: "It was simply the custom in a proscription" },
              { ru: "Чтобы снять перстни — они были частью награды", en: "To take the rings, which were part of the reward" }
            ],
            reveal: { ru: "Ливий говорит об этом прямо, и это не догадка историка. Дальше — почему выбор пал именно на руки и что стояло на той трибуне восемью месяцами раньше.", en: "Livy says so outright, and it is not a historian's guess. Next: why the hands specifically, and what stood on that platform eight months earlier." }
          },
          explain: {
            blocks: [
              { text: { ru: `Декабрь 43 года до н. э., дорога у побережья близ Кайеты. Его несут в носилках, он не бежит и не прячется. Дальше — по рассказу Ливия, дошедшему до нас через Сенеку Старшего: он <strong>высунулся из носилок и подставил шею, не дрогнув</strong>.<br><br>А потом случилось то, чего не требовал ни один закон о проскрипциях. Солдатам этого показалось мало: они отрубили ему и руки — <em>«в укор им за то, что ими было написано нечто против Антония»</em>.`, en: `December 43 BC, a coast road near Caieta. He is being carried in a litter; he is not running and not hiding. What follows comes from Livy, surviving through Seneca the Elder: he <strong>leaned out of the litter and offered his neck, unflinching</strong>.<br><br>Then came the thing no proscription law required. The soldiers were not satisfied: they cut off his hands as well — <em>"reproaching them for having written something against Antony."</em>` } },
              { heading: { ru: "Та же трибуна, восемью месяцами раньше", en: "The same platform, eight months earlier" }, text: { ru: `Голову принесли Антонию, и по его приказу её <strong>положили между двух рук</strong> на ростре — трибуне римского форума.<br><br>Двадцатого апреля того же года на эту трибуну он поднялся сам. После побед над Антонием при Форум Галлорум и Мутине толпа встретила его у дома и проводила на форум, где он взошёл на ростру победителем. Он назвал это лучшей наградой за свои труды.<br><br>Восемь месяцев. Тот же камень.`, en: `The head was brought to Antony, and at his command it was <strong>placed between the two hands</strong> on the Rostra, the speakers' platform of the Roman Forum.<br><br>On the twentieth of April that same year he had climbed that platform himself. After the victories over Antony at Forum Gallorum and Mutina, a crowd met him at his house and escorted him to the Forum, where he ascended the Rostra in triumph. He called it the greatest reward for his labours.<br><br>Eight months. The same stone.` } },
              { heading: { ru: "Почему именно руки", en: "Why the hands" }, text: { ru: `Ювенал скажет об этом столетием позже без всякой жалости: <em>«та рука и шея отрублены за талант — ростра никогда не была залита кровью мелкого стряпчего»</em>.<br><br>Здесь есть ловушка, и её стоит заметить сразу. Связывать его смерть с силой его речей — значит делать эти речи самодоказательными: раз убили, значит попал в цель. Логика приятная и негодная. Но руки отрубили, и отрубили за написанное, — а это уже не наша интерпретация, а то, что говорит источник.`, en: `Juvenal would put it a century later without any pity: <em>"that hand and neck were cut off because of talent — the rostra never dripped with the blood of a petty pleader."</em><br><br>There is a trap here worth spotting at once. Tying his death to the force of his speeches makes those speeches self-proving: he was killed, therefore he must have struck home. Agreeable logic, and worthless. But the hands were taken, and taken for what was written — and that is not our reading, it is what the source says.` } }
            ],
            analogy: { ru: `Это как если бы у музыканта отобрали не жизнь, а сначала руки — и выставили инструмент рядом с ним. Наказание адресовано не человеку, а его способности: смотрите, вот чем он это делал, и вот чего он больше делать не будет. Убийство закрывает вопрос, увечье его проговаривает вслух.`, en: `It is as if a musician were deprived not of life first but of hands — and the instrument set out beside him. The punishment is addressed not to the man but to the capacity: look, this is what he did it with, and this is what he will not do again. Killing closes the question; mutilation says it out loud.` },
            sources: [
              { ref: { ru: `Livy fr. 60 (Weissenborn/Müller), через Seneca the Elder, <em>Suasoriae</em> 6.17. Перевод: Pieper, Ch. & van der Velden, B. (ред.), <em>Reading Cicero's Final Years</em>, Berlin: De Gruyter, 2020, с. 17 (открытый доступ, CC BY-NC-ND).`, en: `Livy fr. 60 (Weissenborn/Müller), surviving via Seneca the Elder, <em>Suasoriae</em> 6.17. Translation in Pieper, Ch. & van der Velden, B. (eds.), <em>Reading Cicero's Final Years</em>, Berlin: De Gruyter, 2020, p. 17 (open access, CC BY-NC-ND).` }, note: { ru: `Источник и подставленной шеи, и отрубленных рук, и формулировки «в укор им за написанное», и того, что голову ПОЛОЖИЛИ между рук, а не прибили.`, en: `The source for the offered neck, the severed hands, the phrase about reproaching them for what they wrote, and for the head being PLACED between the hands rather than nailed up.` } },
              { ref: { ru: `Juvenal, <em>Satires</em> 10.120–121, цит. по тому же изданию; о триумфе на ростре 20 апреля 43 г. — Cicero, <em>ad Brutum</em> 1.3.2, по Zarecki, J., <em>Cicero's Ideal Statesman in Theory and Practice</em>, London: Bloomsbury, 2014, гл. 6.`, en: `Juvenal, <em>Satires</em> 10.120–121, quoted in the same volume; for the triumph on the Rostra of 20 April 43, Cicero, <em>ad Brutum</em> 1.3.2, via Zarecki, J., <em>Cicero's Ideal Statesman in Theory and Practice</em>, London: Bloomsbury, 2014, ch. 6.` }, note: { ru: `Строка Ювенала и дата апрельского триумфа — то есть оба конца этих восьми месяцев.`, en: `Juvenal's line and the date of the April triumph — that is, both ends of those eight months.` } }
            ]
          },
          example: {
            label: { ru: "Восемь месяцев одной трибуны", en: "Eight months of one platform" },
            steps: [
              { ru: `20 апреля 43 г. Толпа ведёт его от дома к форуму, он поднимается на ростру. Лучший день его жизни, по его собственным словам.`, en: `20 April 43. A crowd walks him from his house to the Forum and he climbs the Rostra. The best day of his life, by his own account.` },
              { ru: `Лето. Октавиан идёт на Рим. Осенью он, Антоний и Лепид делают себя триумвирами и составляют списки.`, en: `Summer. Octavian marches on Rome. In the autumn he, Antony and Lepidus make themselves triumvirs and draw up the lists.` },
              { ru: `7 декабря, дорога у Кайеты. Он не бежит. Голова и руки едут в Рим.`, en: `7 December, the road near Caieta. He does not run. The head and hands travel to Rome.` },
              { ru: `Та же ростра. На ней теперь лежит то, чем он с неё говорил и писал.`, en: `The same Rostra. On it now lies what he had spoken and written from it.` }
            ]
          },
          quiz: {
            question: { ru: "Что именно сообщает источник о том, как поступили с головой?", en: "What exactly does the source say was done with the head?" },
            options: [
              { ru: "Её прибили к ростре вместе с руками", en: "It was nailed to the Rostra along with the hands" },
              { ru: "Её положили на ростре между двух отрубленных рук", en: "It was placed on the Rostra between the two severed hands" },
              { ru: "Её выставили у дома Антония как трофей", en: "It was displayed at Antony's house as a trophy" },
              { ru: "Её бросили в Тибр после того, как показали народу", en: "It was thrown into the Tiber after being shown to the people" }
            ],
            correct: 1,
            explanation: { ru: `Ливий говорит: голову принесли Антонию и по его приказу поместили <em>между двух рук</em>. Разница не косметическая: прибитая голова — казнь напоказ, а голова, положенная между собственных рук, — композиция, высказывание. Кто-то потратил на это отдельную мысль.`, en: `Livy says the head was brought to Antony and by his command set <em>between the two hands</em>. The difference is not cosmetic: a nailed-up head is an execution on display, while a head laid between its own hands is a composition, a statement. Somebody spent a separate thought on it.` }
          },
          recall: {
            prompt: { ru: "Что сделали с телом Цицерона и почему именно так?", en: "What was done with Cicero's body, and why in that particular way?" },
            answer: { ru: `Его убили на дороге у Кайеты 7 декабря 43 г.; он не бежал и, по Ливию, сам подставил шею. Кроме головы солдаты отрубили руки — прямо сказано, в укор им за то, что ими было написано против Антония. Голову доставили Антонию, и он приказал положить её на ростре между двух рук. Восемью месяцами раньше, 20 апреля, он поднимался на эту же трибуну победителем.`, en: `He was killed on the road near Caieta on 7 December 43; he did not flee and, per Livy, offered his neck himself. Besides the head the soldiers took the hands — explicitly as a reproach for what they had written against Antony. The head was brought to Antony, who had it placed on the Rostra between the two hands. Eight months earlier, on 20 April, he had climbed that same platform in triumph.` },
            points: [
              { ru: `Подставил шею сам, не бежал`, en: `Offered his neck; did not flee` },
              { ru: `Руки отрубили за написанное`, en: `The hands were taken for what they wrote` },
              { ru: `Голову ПОЛОЖИЛИ между рук, не прибили`, en: `The head was PLACED between the hands, not nailed` },
              { ru: `Восемь месяцев назад — триумф на той же ростре`, en: `Eight months before — a triumph on that same Rostra` }
            ]
          },
          wisdomTags: ["evidence", "limits"]
        },

        {
          title: { ru: "Дважды уверен", en: "Certain Twice" },
          glossary: [
            { term: { ru: "Novus homo", en: "Novus homo" }, definition: { ru: "«Новый человек» — тот, кто первым в роду достиг консульства. В Риме власть наследовали; Цицерон её не унаследовал.", en: "A \"new man\" — first of his family to reach the consulship. In Rome power was inherited; Cicero inherited none." } },
            { term: { ru: "Senatus consultum ultimum", en: "Senatus consultum ultimum" }, definition: { ru: "Чрезвычайное постановление сената, дававшее магистратам особые полномочия. Насколько особые — римляне так и не договорились.", en: "The senate's emergency decree granting magistrates extraordinary powers. Quite how extraordinary, the Romans never settled." } }
          ],
          explain: {
            blocks: [
              { text: { ru: `В Риме почти всё наследовалось. Он не унаследовал ничего: <strong>novus homo</strong>, первый в роду. Единственным его капиталом было умение говорить, и этим умением он дошёл до консульства — в самом раннем возрасте, какой допускал закон.<br><br>Год консульства, 63-й, стал вершиной и ядом сразу. Он раскрыл заговор Катилины и <strong>казнил римских граждан без суда</strong>.`, en: `In Rome nearly everything was inherited. He inherited nothing: a <strong>novus homo</strong>, first of his line. His only capital was that he could speak, and with it he reached the consulship — at the earliest age the law allowed.<br><br>His consular year, 63, was summit and poison at once. He uncovered Catiline's conspiracy and <strong>executed Roman citizens without trial</strong>.` } },
              { heading: { ru: "Был ли он вправе — Рим не решил", en: "Whether he had the right — Rome never decided" }, text: { ru: `За ним стояли доводы. Сенат проголосовал за эти меры; он не арестовал никого, пока не вступило в силу чрезвычайное постановление; и можно было доказывать, что постановление лишило заговорщиков гражданства, а только оно давало право на суд.<br><br>Через пять лет Рим ответил единственным способом, каким может ответить республика: провёл закон и отправил его в изгнание — за казнь граждан без суда.<br><br>Не пытайтесь решить этот спор. Его не решили ни современники, ни историки: сенат разрешил в 63-м, народ осудил в 58-м.`, en: `He had arguments. The senate had voted for the measures; he arrested nobody until the emergency decree was in force; and it could be argued that the decree had stripped the conspirators of the citizenship that alone entitled them to trial.<br><br>Five years later Rome answered in the only way a republic can: it passed a law and sent him into exile — for executing citizens without trial.<br><br>Do not try to settle this. Neither his contemporaries nor historians have: the senate permitted it in 63, the people condemned it in 58.` } },
              { heading: { ru: "И ровно то же самое в шестьдесят три", en: "And exactly the same thing at sixty-three" }, text: { ru: `Двадцатью годами позже он был уверен снова — теперь в том, что справится с девятнадцатилетним наследником Цезаря. О нём он писал: <em>laudandum, ornandum, tollendum</em> — «юношу надо хвалить, украшать почестями, а затем отодвинуть».<br><br>Октавиан об этом узнал.<br><br>Дважды он был совершенно уверен, и оба раза платил именно за уверенность. Это стоит держать в голове, когда дойдём до его философии: человек, чья школа учила, что достоверность недостижима.`, en: `Twenty years on he was certain again — this time that he could manage Caesar's nineteen-year-old heir. Of him he wrote: <em>laudandum, ornandum, tollendum</em> — "the youth must be praised, decorated with honours, and then pushed aside."<br><br>Octavian heard about it.<br><br>Twice he was entirely certain, and both times it was the certainty he paid for. Worth holding on to when we reach his philosophy: this is a man whose school taught that certainty is unavailable.` } }
            ],
            analogy: { ru: `Уверенность работает как страховка, которую не читали: пока ничего не случилось, она ощущается как защита, и именно поэтому с ней ведут себя смелее. Цена выясняется в тот единственный день, когда она понадобилась. У него таких дней было два, с промежутком в двадцать лет, и во второй он вёл себя так, будто первого не было.`, en: `Certainty works like an insurance policy nobody read: while nothing has happened it feels like protection, which is exactly why one behaves more boldly with it. The price emerges on the single day it is needed. He had two such days, twenty years apart, and on the second he behaved as though the first had not happened.` },
            sources: [
              { ref: { ru: `Rawson, E., «Cicero (106–43 B.C.)», в <em>Ancient Writers: Greece and Rome</em>, New York: Charles Scribner's Sons, 1982, с. 557.`, en: `Rawson, E., "Cicero (106–43 B.C.)", in <em>Ancient Writers: Greece and Rome</em>, New York: Charles Scribner's Sons, 1982, p. 557.` }, note: { ru: `И закон Клодия 58 г. об изгнании «за казнь без суда», и защита Цицерона: сенат голосовал, а постановление лишило осуждённых гражданства, дававшего право на суд.`, en: `Both Clodius' law of 58 exiling him for "death without public trial" and Cicero's answer: the senate had voted, and the decree had removed the citizenship that entitled them to trial.` } },
              { ref: { ru: `Zarecki, J., <em>Cicero's Ideal Statesman in Theory and Practice</em>, London: Bloomsbury, 2014, гл. 5–6; <em>Philippica</em> 2.11 и <em>ad Familiares</em> 11.20.2.`, en: `Zarecki, J., <em>Cicero's Ideal Statesman in Theory and Practice</em>, London: Bloomsbury, 2014, chs. 5–6; <em>Philippics</em> 2.11 and <em>ad Familiares</em> 11.20.2.` }, note: { ru: `Что он выждал постановления, прежде чем действовать, и мог «не без изрядной доли правды» говорить, что действовал заодно с сенатом; и фраза laudandum, ornandum, tollendum.`, en: `That he waited for the decree before acting and could claim "with no small measure of truth" to have acted with the senate; and the phrase laudandum, ornandum, tollendum.` } }
            ]
          },
          example: {
            label: { ru: "Две уверенности, двадцать лет между ними", en: "Two certainties, twenty years apart" },
            steps: [
              { ru: `63 г. Он уверен, что чрезвычайное постановление покрывает казнь. Сенат с ним согласен.`, en: `63 BC. He is certain the emergency decree covers the executions. The senate agrees with him.` },
              { ru: `58 г. Народное собрание принимает закон, и он уходит в изгнание за то самое действие.`, en: `58 BC. The assembly passes a law and he goes into exile for that same act.` },
              { ru: `44–43 гг. Он уверен, что употребит Октавиана и отодвинет: laudandum, ornandum, tollendum.`, en: `44–43 BC. He is certain he will use Octavian and then set him aside: laudandum, ornandum, tollendum.` },
              { ru: `Октавиан узнаёт о фразе. В декабре Цицерон в проскрипционных списках.`, en: `Octavian learns of the phrase. By December, Cicero is on the proscription lists.` }
            ]
          },
          quiz: {
            question: { ru: "Как правильно описать вопрос о законности казни катилинариев?", en: "How should the question of the Catilinarian executions' legality be described?" },
            options: [
              { ru: "Он был очевидно виновен: казнь без суда незаконна в любом случае", en: "He was plainly guilty: execution without trial is unlawful in any case" },
              { ru: "Он был очевидно прав: сенат проголосовал, значит вопрос закрыт", en: "He was plainly right: the senate voted, so the matter is closed" },
              { ru: "Вопрос остался открытым: сенат разрешил в 63-м, народ осудил в 58-м", en: "It stayed open: the senate permitted it in 63, the people condemned it in 58" },
              { ru: "Вопрос решён современной наукой в его пользу", en: "Modern scholarship has settled it in his favour" }
            ],
            correct: 2,
            explanation: { ru: `Обе стороны имели опору. За него — голосование сената, выжданное постановление и довод о гражданстве; против него — закон 58 года и изгнание. Историки, работающие с этим материалом, тоже не выносят приговора. Открытость здесь не уклончивость: именно она показывает, чего стоит уверенность в спорном.`, en: `Both sides had ground. For him: the senate's vote, the decree he waited for, and the citizenship argument. Against him: the law of 58 and the exile. Historians working on this decline to give a verdict too. The openness is not evasion — it is precisely what shows the cost of certainty in a contested matter.` }
          },
          recall: {
            prompt: { ru: "В чём состояли две его уверенности и чем каждая обошлась?", en: "What were his two certainties, and what did each cost?" },
            answer: { ru: `В 63 году, будучи консулом и novus homo без наследственной опоры, он был уверен, что чрезвычайное постановление сената позволяет казнить катилинариев без суда. Через пять лет закон Клодия отправил его за это в изгнание, и Рим так и не решил, кто был прав. В 44–43 годах он был уверен, что употребит юного Октавиана и отодвинет — laudandum, ornandum, tollendum, — Октавиан узнал о фразе, и в декабре 43 года Цицерон оказался в проскрипциях.`, en: `In 63, as consul and a novus homo with no inherited standing, he was certain the senate's emergency decree let him execute the Catilinarians without trial. Five years later Clodius' law exiled him for it, and Rome never settled who was right. In 44–43 he was certain he would use the young Octavian and then set him aside — laudandum, ornandum, tollendum — Octavian heard of the phrase, and by December 43 Cicero was on the proscription lists.` },
            points: [
              { ru: `Novus homo: власть не наследовал, дошёл речью`, en: `Novus homo: inherited no power, talked his way up` },
              { ru: `63 — казнь без суда, доводы с обеих сторон`, en: `63 — execution without trial, arguments both ways` },
              { ru: `58 — изгнание за неё; спор не решён до сих пор`, en: `58 — exiled for it; the question is still open` },
              { ru: `laudandum, ornandum, tollendum — и Октавиан узнал`, en: `laudandum, ornandum, tollendum — and Octavian found out` }
            ]
          },
          wisdomTags: ["self-deception", "humility"]
        },

        {
          title: { ru: "Туллия", en: "Tullia" },
          glossary: [
            { term: { ru: "Consolatio", en: "Consolatio" }, definition: { ru: "Жанр утешительного сочинения, писавшегося для другого. Цицерон написал такое себе — по его словам, первым.", en: "The consolation, a recognised genre, written for someone else. Cicero wrote one to himself — by his own account, the first ever." } },
            { term: { ru: "Otium", en: "Otium" }, definition: { ru: "Досуг, свободный от общественных дел. Для римлянина — не отдых, а вынужденная отставка, если он не выбирал её сам.", en: "Leisure free of public business. For a Roman not a holiday but enforced retirement, unless he chose it himself." } }
          ],
          explain: {
            blocks: [
              { text: { ru: `Февраль 45 года. Умирает его дочь Туллия.<br><br>Он разваливается. Письма к Аттику этих месяцев читать тяжело. Положение и без того было худшим в его жизни: дважды разведён, в ссоре с братом, племянник публично на него доносит, а в политике при диктатуре Цезаря для него места нет.<br><br>Он пишет <strong>Consolatio</strong> — утешение. Жанр был известный, но такие сочинения писали для <em>другого</em>. Цицерон говорит, что <strong>до него никто не обращал утешение к самому себе</strong>. Текст утрачен.`, en: `February 45 BC. His daughter Tullia dies.<br><br>He falls apart. The letters to Atticus from these months are hard reading. His position was already the worst of his life: twice divorced, estranged from his brother, publicly denounced by his own nephew, and with no place in politics under Caesar's dictatorship.<br><br>He writes a <strong>Consolatio</strong>. The genre was well established, but such things were written for <em>someone else</em>. Cicero says <strong>nobody before him had ever addressed one to himself</strong>. The text is lost.` } },
              { heading: { ru: "Шесть книг за шесть месяцев", en: "Six books in six months" }, text: { ru: `И дальше происходит то, ради чего эта тема вообще существует.<br><br>За полгода после её смерти он пишет шесть больших философских сочинений: <em>Consolatio</em>, <em>Hortensius</em>, <em>Academica</em>, <em>De Finibus</em>, <em>Tusculanae Disputationes</em>, <em>De Natura Deorum</em>. Почти весь его философский корпус — из этого года.<br><br>Он не выбирал философию как поприще. Он не сочинял трактаты, потому что кончились другие занятия. Он писал их <strong>как лечение</strong>, и это меняет, чем они являются.`, en: `And then comes the thing this topic exists for.<br><br>In the six months after her death he writes six major philosophical works: the <em>Consolatio</em>, <em>Hortensius</em>, <em>Academica</em>, <em>De Finibus</em>, <em>Tusculan Disputations</em>, <em>On the Nature of the Gods</em>. Nearly the whole philosophical corpus comes out of that year.<br><br>He did not choose philosophy as a career. He was not composing treatises because other occupations had run out. He wrote them <strong>as treatment</strong>, and that changes what they are.` } },
              { heading: { ru: "Зачем он это делал — его слова", en: "Why, in his own words" }, text: { ru: `В предисловии к <em>De Natura Deorum</em> он объясняет сам: <em>«когда я чах в жизни, лишённой обязанностей, и государство было в таком положении, что им правили замысел и прихоть одного человека, я счёл, что будет на пользу республике изложить основания философии для наших современников»</em>.<br><br>Отсюда прямая дорога во вторую тему. Он взялся переложить греческую философию на латынь не из любви к предмету, а потому что больше служить было нечем.`, en: `In the preface to <em>On the Nature of the Gods</em> he explains it himself: <em>"when I was withering away in a life without duties, and the state of the Republic was such that it was being helmed by the plan and whim of a single man, I thought it would be good for the Republic to set forth the tenets of philosophy for our contemporaries."</em><br><br>From here the road runs straight into the second topic. He set about putting Greek philosophy into Latin not out of love for the subject but because there was nothing else left to serve with.` } }
            ],
            analogy: { ru: `Похоже на человека, который начинает бегать не ради формы, а потому что иначе не спит. Со стороны выглядит как хобби, изнутри это единственный способ дотянуть до утра. И работа выходит другой, чем у того, кто выбрал предмет спокойно: она делается на износ и потому не терпит украшений.`, en: `Like someone who starts running not for fitness but because otherwise he cannot sleep. From outside it looks like a hobby; from inside it is the only way to reach morning. And the work comes out different from that of someone who chose the subject calmly: it is done at full stretch, and so it will not tolerate ornament.` },
            sources: [
              { ref: { ru: `Zarecki, J., <em>Cicero's Ideal Statesman in Theory and Practice</em>, London: Bloomsbury, 2014, гл. 4; письма — <em>ad Atticum</em> 12.13.2, 12.14.1–3, 12.15, 12.18.1, утешение Сульпиция Руфа — <em>ad Familiares</em> 4.5.`, en: `Zarecki, J., <em>Cicero's Ideal Statesman in Theory and Practice</em>, London: Bloomsbury, 2014, ch. 4; the letters at <em>ad Atticum</em> 12.13.2, 12.14.1–3, 12.15, 12.18.1; Sulpicius Rufus' consolation at <em>ad Familiares</em> 4.5.` }, note: { ru: `Дата смерти Туллии, перечень шести сочинений за полгода и вывод, что её смерть стала причиной поворота к философии, а не совпала с ним.`, en: `The date of Tullia's death, the list of six works in six months, and the conclusion that her death caused the turn to philosophy rather than merely coinciding with it.` } },
              { ref: { ru: `Rawson, E., «Cicero (106–43 B.C.)», в <em>Ancient Writers: Greece and Rome</em>, New York: Charles Scribner's Sons, 1982, с. 577; Cicero, <em>De Natura Deorum</em> 1.7.`, en: `Rawson, E., "Cicero (106–43 B.C.)", in <em>Ancient Writers: Greece and Rome</em>, New York: Charles Scribner's Sons, 1982, p. 577; Cicero, <em>On the Nature of the Gods</em> 1.7.` }, note: { ru: `Что Consolatio была обращена к себе и что, по его собственному утверждению, так до него не делал никто; и его объяснение, зачем он писал философию на латыни.`, en: `That the Consolatio was addressed to himself and that, by his own claim, nobody had done so before; and his own explanation of why he wrote philosophy in Latin.` } }
            ]
          },
          example: {
            label: { ru: "Год, из которого вышла вся его философия", en: "The year the whole philosophy came out of" },
            steps: [
              { ru: `Февраль 45 г. Умирает Туллия. Он уходит от людей.`, en: `February 45. Tullia dies. He withdraws from people.` },
              { ru: `Он пишет утешение — себе. Жанр требовал писать другому; он говорит, что так ещё не делали.`, en: `He writes a consolation — to himself. The genre required writing for another; he says it had not been done.` },
              { ru: `Следующие полгода: шесть больших сочинений, почти весь корпус.`, en: `The next six months: six major works, nearly the entire corpus.` },
              { ru: `В предисловии объясняет: служить государству больше нечем, остаётся дать ему философию по-латыни.`, en: `In a preface he explains: there is no other way left to serve the state, so it gets philosophy in Latin.` }
            ]
          },
          quiz: {
            question: { ru: "Почему Consolatio Цицерона считают необычной для своего жанра?", en: "Why is Cicero's Consolatio considered unusual for its genre?" },
            options: [
              { ru: "Он обратил утешение к себе — по его словам, первым", en: "He addressed the consolation to himself — the first to do so, by his account" },
              { ru: "Она была написана стихами, а не прозой", en: "It was written in verse rather than prose" },
              { ru: "Он отказался в ней от всякого утешения как от самообмана", en: "In it he rejected consolation itself as self-deception" },
              { ru: "Она была написана по-гречески, а не на латыни", en: "It was written in Greek rather than Latin" }
            ],
            correct: 0,
            explanation: { ru: `Жанр был совершенно обычный — необычен был адресат. Утешения писали скорбящему; Цицерон написал его себе и сам отметил, что до него так никто не поступал. Текст до нас не дошёл, так что судить мы можем только по этому свидетельству — и по шести книгам, которые вышли следом за полгода.`, en: `The genre was entirely ordinary — the addressee was not. Consolations were written to the bereaved; Cicero wrote one to himself and noted that nobody had done it before. The text does not survive, so we judge it only by that testimony — and by the six books that followed in six months.` }
          },
          recall: {
            prompt: { ru: "Что связывает смерть Туллии с философским корпусом Цицерона?", en: "What connects Tullia's death with Cicero's philosophical corpus?" },
            answer: { ru: `Туллия умерла в феврале 45 года, и в последовавшие полгода он написал шесть больших сочинений — Consolatio, Hortensius, Academica, De Finibus, Tusculanae Disputationes, De Natura Deorum, — то есть почти весь свой философский корпус. Consolatio он обратил к себе, чего, по его словам, до него не делал никто; она утрачена. Причина, названная им самим в De Natura Deorum 1.7: государством правит один человек, обязанностей у него не осталось, и единственная оставшаяся служба республике — дать ей философию на латыни.`, en: `Tullia died in February 45, and in the following six months he wrote six major works — the Consolatio, Hortensius, Academica, De Finibus, Tusculan Disputations, On the Nature of the Gods — that is, nearly his whole philosophical corpus. The Consolatio he addressed to himself, which he says nobody had done before; it is lost. His own stated reason, at On the Nature of the Gods 1.7: the state is helmed by one man's whim, he has no duties left, and the one remaining service to the Republic is to give it philosophy in Latin.` },
            points: [
              { ru: `Февраль 45 — смерть Туллии`, en: `February 45 — Tullia's death` },
              { ru: `Шесть сочинений за шесть месяцев`, en: `Six works in six months` },
              { ru: `Consolatio — себе, первым; утрачена`, en: `The Consolatio — to himself, the first; lost` },
              { ru: `Философия как служба, когда служить больше нечем`, en: `Philosophy as service when no service is left` }
            ]
          },
          wisdomTags: ["persistence", "change"]
        }
      ],
      examQuestions: [
        {
          question: { ru: "Согласно Ливию, что солдаты сделали сверх убийства и по какой названной причине?", en: "According to Livy, what did the soldiers do beyond the killing, and for what stated reason?" },
          options: [
            { ru: "Отрубили руки — в укор им за написанное против Антония", en: "Cut off the hands — reproaching them for what they wrote against Antony" },
            { ru: "Сожгли его бумаги на форуме", en: "Burned his papers in the Forum" },
            { ru: "Разрушили его дом в Риме", en: "Destroyed his house in Rome" },
            { ru: "Запретили упоминать его имя", en: "Forbade the mention of his name" }
          ],
          correct: 0,
          explanation: { ru: `Ливий (через Сенеку Старшего) прямо называет причину: руки отрубили за то, что ими было написано. Дом действительно разрушали, но это случилось на двадцать лет раньше, при изгнании 58 года.`, en: `Livy, through Seneca the Elder, gives the reason outright: the hands were taken for what they had written. His house was indeed destroyed, but that happened twenty years earlier, at the exile of 58.` }
        },
        {
          question: { ru: "Что произошло на той же ростре 20 апреля 43 года?", en: "What happened on that same Rostra on 20 April 43 BC?" },
          options: [
            { ru: "Антоний объявил его вне закона", en: "Antony declared him an outlaw" },
            { ru: "Он взошёл на неё победителем, встреченный толпой", en: "He ascended it in triumph, met by a crowd" },
            { ru: "Он произнёс первую Филиппику", en: "He delivered the First Philippic" },
            { ru: "Сенат проголосовал за союз с Октавианом", en: "The senate voted for the alliance with Octavian" }
          ],
          correct: 1,
          explanation: { ru: `После побед при Форум Галлорум и Мутине толпа встретила его у дома и проводила на форум; он назвал это лучшей наградой за свои труды. Через восемь месяцев на этой трибуне лежала его голова.`, en: `After the victories at Forum Gallorum and Mutina a crowd met him at his house and escorted him to the Forum; he called it the greatest reward for his labours. Eight months later his head lay on that platform.` }
        },
        {
          question: { ru: "Как соотносятся решения Рима о казни катилинариев?", en: "How do Rome's decisions about the Catilinarian executions relate?" },
          options: [
            { ru: "Сенат и народ одинаково её одобрили", en: "Senate and people alike approved it" },
            { ru: "Сенат и народ одинаково её осудили", en: "Senate and people alike condemned it" },
            { ru: "Сенат разрешил в 63 году, народ осудил законом в 58-м", en: "The senate permitted it in 63; the people condemned it by law in 58" },
            { ru: "Вопрос никогда не ставился официально", en: "The question was never formally raised" }
          ],
          correct: 2,
          explanation: { ru: `Именно это расхождение и делает вопрос неразрешимым: у Цицерона было голосование сената и выжданное чрезвычайное постановление, а у его противников — принятый закон и его изгнание.`, en: `That divergence is what makes the question unresolvable: Cicero had the senate's vote and the emergency decree he waited for; his opponents had a law passed and his exile.` }
        },
        {
          question: { ru: "Что означает фраза laudandum, ornandum, tollendum и о ком она сказана?", en: "What does laudandum, ornandum, tollendum mean, and of whom was it said?" },
          options: [
            { ru: "«Хвалить, украшать почестями, отодвинуть» — об Октавиане", en: "\"Praise, decorate with honours, push aside\" — of Octavian" },
            { ru: "«Учить, испытывать, назначать» — о молодых ораторах", en: "\"Teach, test, appoint\" — of young orators" },
            { ru: "«Обвинять, судить, изгонять» — о Катилине", en: "\"Accuse, try, banish\" — of Catiline" },
            { ru: "«Читать, спорить, записывать» — о методе Академии", en: "\"Read, argue, record\" — of the Academy's method" }
          ],
          correct: 0,
          explanation: { ru: `Сказано о девятнадцатилетнем наследнике Цезаря, в письме. Октавиан о фразе узнал — и это одна из причин, по которым имя Цицерона оказалось в проскрипциях.`, en: `Said of Caesar's nineteen-year-old heir, in a letter. Octavian heard about it — one of the reasons Cicero's name ended up on the proscription lists.` }
        },
        {
          question: { ru: "Сколько крупных философских сочинений он написал за полгода после смерти Туллии?", en: "How many major philosophical works did he write in the six months after Tullia's death?" },
          options: [
            { ru: "Одно — утраченную Consolatio", en: "One — the lost Consolatio" },
            { ru: "Три", en: "Three" },
            { ru: "Шесть — почти весь свой философский корпус", en: "Six — nearly his entire philosophical corpus" },
            { ru: "Ни одного: он не мог работать весь этот год", en: "None: he could not work at all that year" }
          ],
          correct: 2,
          explanation: { ru: `Consolatio, Hortensius, Academica, De Finibus, Tusculanae Disputationes, De Natura Deorum. Это и есть основание считать, что философию он писал не как поприще, а как лечение.`, en: `The Consolatio, Hortensius, Academica, De Finibus, Tusculan Disputations, On the Nature of the Gods. That is the ground for saying he wrote philosophy not as a career but as treatment.` }
        }
      ]
    },

    // ============================================================
    // ТЕМА 2 — что он сделал
    // ============================================================
    {
      id: "cicero-work",
      title: { ru: "Что он оставил", en: "What He Left" },
      desc: { ru: "Язык, на котором до него нельзя было думать, метод спорить с обеих сторон и письма, погубившие его репутацию", en: "A language that could not think before him, a method of arguing both sides, and the letters that ruined his reputation" },
      icon: "\u{1F58B}️",
      chunks: [
        {
          title: { ru: "Язык, который не мог", en: "The Language That Could Not" },
          glossary: [
            { term: { ru: "Subtilis iunctura", en: "Subtilis iunctura" }, definition: { ru: "«Тонкое соединение» — расстановка и сочетание уже существующих слов так, чтобы они несли то, чего поодиночке не несут.", en: "\"Shrewd conjoining\" — placing and combining words that already exist so they carry what none carries alone." } },
            { term: { ru: "Probabile", en: "Probabile" }, definition: { ru: "Его перевод греческого to pithanon — «вероятное». Слово, которым он назвал то, чем приходится довольствоваться вместо достоверности.", en: "His rendering of Greek to pithanon — \"the probable\". The word he coined for what one settles for instead of certainty." } }
          ],
          predict: {
            question: { ru: "Латынь до него не умела говорить о философии. В чём была главная трудность?", en: "Latin could not discuss philosophy before him. What was the main difficulty?" },
            options: [
              { ru: "Не хватало слов — и он их сотнями придумал", en: "It lacked words — and he invented them by the hundred" },
              { ru: "Латынь не имела письменной традиции для прозы", en: "Latin had no written tradition for prose" },
              { ru: "Синтаксис: в латыни нет артикля, и «благо» на ней просто не сказать", en: "Syntax: Latin has no article, so \"the good\" cannot cleanly be said at all" },
              { ru: "Философия была в Риме под запретом", en: "Philosophy was banned in Rome" }
            ],
            reveal: { ru: "Слова он придумывал — но осторожно и немного, и специалисты прямо предостерегают от того, чтобы считать его изобретателем словаря. Настоящая беда была в устройстве языка.", en: "He did coin words — cautiously and few, and specialists warn explicitly against casting him as an inventor of vocabulary. The real trouble was in how the language was built." }
          },
          explain: {
            blocks: [
              { text: { ru: `Начнём с того, чего он <em>не</em> делал. Соблазнительно сказать: он придумал слова, на которых Европа думает. Фон Альбрехт предостерегает прямо: Цицерон <strong>«был меньше заинтересован в изобретении новых слов, чем в уместном употреблении существующих»</strong>, и слова, впервые засвидетельствованные у него, не обязательно им созданы.<br><br>Больше того, латынь <strong>плохо принимала неологизмы</strong>, а на вершине своей отделки имела, по замечанию Нордена, крайне бедный словарь.`, en: `Start with what he did <em>not</em> do. It is tempting to say he invented the words Europe thinks in. Von Albrecht warns against it outright: Cicero <strong>"was less interested in the invention of new words than in the appropriate use of the extant vocabulary"</strong>, and words first attested in him were not necessarily made by him.<br><br>More than that, Latin <strong>barely accepted neologisms</strong>, and at the height of its polish had, in Norden's phrase, an extremely poor vocabulary.` } },
              { heading: { ru: "Настоящая трудность — устройство", en: "The real difficulty was structure" }, text: { ru: `Роусон называет её точно: главная беда была не в словах, а <strong>в синтаксисе</strong>. В латыни <strong>нет определённого артикля</strong>. По-гречески «благо» — <em>τὸ ἀγαθόν</em>, два слова; по-русски и по-английски тоже просто. На латыни это сказать <em>однозначно нельзя</em>.<br><br>Поэтому он и не мог просто наштамповать существительных. Он <strong>возмещал стилем</strong>: расстановкой, сочетанием, оборотом — тем, что называют <em>subtilis iunctura</em>. Одно и то же греческое слово он иногда переводит в разных местах по-разному.`, en: `Rawson names it exactly: the real trouble was not the words but <strong>the syntax</strong>. Latin <strong>has no definite article</strong>. In Greek "the good" is <em>τὸ ἀγαθόν</em>, two words; in English it is easy too. In Latin it <em>cannot be said unambiguously at all</em>.<br><br>Which is why he could not simply stamp out nouns. He <strong>compensated through style</strong>: placement, combination, periphrasis — what is called <em>subtilis iunctura</em>. The same Greek word he sometimes renders differently in different places.` } },
              { heading: { ru: "И всё-таки — семь слов", en: "And still — seven words" }, text: { ru: `Список короткий и проверенный. Созданы им: <strong>qualitas</strong>, <strong>perceptio</strong>, <strong>probabilitas</strong>, <strong>evidentia</strong>, <strong>essentia</strong>, <strong>moralis</strong>. Существовало до него, но разошлось благодаря ему — <strong>intellegentia</strong>.<br><br>Посмотрите, о чём они. Качество, восприятие, вероятность, очевидность, понимание. Это словарь <em>знания</em>. Человек, чья школа учила, что достоверность недостижима, построил латинские слова для взвешивания того, что достоверностью не является.<br><br>Настоящие же его выдумки — по большей части шутки в частных письмах: <em>sullaturit</em>, «его тянет побыть Суллой».`, en: `The list is short and checked. Coined by him: <strong>qualitas</strong>, <strong>perceptio</strong>, <strong>probabilitas</strong>, <strong>evidentia</strong>, <strong>essentia</strong>, <strong>moralis</strong>. Existing before him but spread by him: <strong>intellegentia</strong>.<br><br>Look at what they are about. Quality, perception, probability, evidence, understanding. This is the vocabulary of <em>knowing</em>. A man whose school taught that certainty is unavailable built the Latin for weighing what falls short of it.<br><br>His genuine inventions are mostly jokes in private letters: <em>sullaturit</em>, "he is in the mood to be a Sulla."` } }
            ],
            analogy: { ru: `Представьте, что вам надо сыграть симфонию на инструменте с пятью струнами, и добавить шестую нельзя — устройство не позволяет. Можно выть на бедность, а можно научиться так ставить пальцы и так соединять звуки, что пяти хватает. Второе труднее и слышно дольше. Латинская проза Цицерона — это шестая струна, которой не было.`, en: `Imagine having to play a symphony on a five-string instrument, with a sixth string ruled out — the build will not take one. You can complain about the poverty, or you can learn to place your fingers and join the notes so that five suffice. The second is harder and is heard for longer. Cicero's Latin prose is the sixth string that was never there.` },
            sources: [
              { ref: { ru: `von Albrecht, M., <em>Cicero's Style: A Synopsis. Followed by Selected Analytic Studies</em>, Leiden: Brill, 2003, гл. 1, с. 35 и гл. 4, с. 129, 136, 142.`, en: `von Albrecht, M., <em>Cicero's Style: A Synopsis. Followed by Selected Analytic Studies</em>, Leiden: Brill, 2003, ch. 1 p. 35 and ch. 4 pp. 129, 136, 142.` }, note: { ru: `Предостережение против образа «создателя слов»; сопротивление латыни неологизмам и приём subtilis iunctura; список qualitas, perceptio, probabilitas, evidentia и то, что intellegentia он не создал, а распространил.`, en: `The warning against the "creator of words" picture; Latin's resistance to neologisms and the subtilis iunctura technique; the list qualitas, perceptio, probabilitas, evidentia, and that intellegentia was propagated rather than coined.` } },
              { ref: { ru: `Rawson, E., «Cicero (106–43 B.C.)», в <em>Ancient Writers: Greece and Rome</em>, New York: Charles Scribner's Sons, 1982, с. 573.`, en: `Rawson, E., "Cicero (106–43 B.C.)", in <em>Ancient Writers: Greece and Rome</em>, New York: Charles Scribner's Sons, 1982, p. 573.` }, note: { ru: `Что главная трудность лежала в синтаксисе, а не в словаре; отсутствие артикля и невозможность однозначно сказать «благо»; и авторство essentia и moralis наряду с qualitas.`, en: `That the main difficulty lay in syntax rather than vocabulary; the missing article and the impossibility of saying "the good" unambiguously; and the coinage of essentia and moralis alongside qualitas.` } }
            ]
          },
          example: {
            label: { ru: "Как перевести «благо» на язык без артикля", en: "How to say \"the good\" in a language without \"the\"" },
            steps: [
              { ru: `По-гречески τὸ ἀγαθόν: артикль превращает прилагательное в предмет разговора. Два слова, никакой двусмысленности.`, en: `In Greek τὸ ἀγαθόν: the article turns an adjective into the thing under discussion. Two words, no ambiguity.` },
              { ru: `В латыни артикля нет. bonum может значить «благо», «нечто хорошее», «имущество».`, en: `Latin has no article. bonum can mean "the good", "a good thing", or "property".` },
              { ru: `Прямой выход — придумать слово. Но латынь неологизмы отторгает, и он это знал.`, en: `The direct fix is to coin a word. But Latin rejects neologisms, and he knew it.` },
              { ru: `Остаётся расстановка и оборот: одно и то же греческое слово он переводит по-разному, смотря что вокруг.`, en: `What remains is placement and periphrasis: he renders the same Greek word differently depending on what stands around it.` }
            ]
          },
          quiz: {
            question: { ru: "Что специалисты называют главным вкладом Цицерона в латынь?", en: "What do specialists name as Cicero's main contribution to Latin?" },
            options: [
              { ru: "Он изобрёл сотни слов и тем восполнил бедность словаря", en: "He invented hundreds of words and so repaired a poor vocabulary" },
              { ru: "Он ввёл в латынь определённый артикль по греческому образцу", en: "He introduced a definite article into Latin on the Greek model" },
              { ru: "Он перевёл всю греческую философию дословно, слово в слово", en: "He translated all Greek philosophy literally, word for word" },
              { ru: "Он создал прозаический стиль, способный нести отвлечённую мысль", en: "He created a prose style able to carry abstract thought" }
            ],
            correct: 3,
            explanation: { ru: `Фон Альбрехт формулирует это так: Цицерон заложил основания для языка отвлечённой мысли на латыни. Не наштамповав существительных — их у него семь, — а построив стиль, которым можно было думать. Артикля в латыни как не было, так и нет, а дословный перевод он как раз отвергал: одно греческое слово он передавал по-разному, смотря по месту.`, en: `Von Albrecht puts it this way: Cicero laid the foundations for the language of abstract thought in Latin. Not by stamping out nouns — there are seven — but by building a style one could think in. Latin still has no article, and literal translation is exactly what he refused: he rendered one Greek word several ways depending on where it stood.` }
          },
          recall: {
            prompt: { ru: "В чём состояла настоящая трудность перевода философии на латынь и как он её обошёл?", en: "What was the real difficulty in putting philosophy into Latin, and how did he get round it?" },
            answer: { ru: `Трудность была не в словаре, а в устройстве языка: в латыни нет определённого артикля, и греческое «благо», τὸ ἀγαθόν, однозначно на ней не выразить. Плюс латынь плохо принимала новые слова. Поэтому он придумал их мало — qualitas, perceptio, probabilitas, evidentia, essentia, moralis, и распространил чужую intellegentia, — а всё остальное возместил стилем: расстановкой и сочетанием существующих слов, subtilis iunctura, вплоть до того, что одно греческое слово переводил в разных местах по-разному.`, en: `The difficulty was not vocabulary but structure: Latin has no definite article, so the Greek "the good", τὸ ἀγαθόν, cannot be said unambiguously. Latin also resisted new words. So he coined few — qualitas, perceptio, probabilitas, evidentia, essentia, moralis, and spread the pre-existing intellegentia — and made up the rest through style: the placement and combining of existing words, subtilis iunctura, to the point of rendering one Greek word differently in different places.` },
            points: [
              { ru: `Беда в синтаксисе: нет артикля`, en: `The trouble is syntax: no article` },
              { ru: `Латынь отторгает неологизмы — потому их мало`, en: `Latin rejects neologisms — hence so few` },
              { ru: `Шесть созданных слов плюс распространённая intellegentia`, en: `Six coined words plus intellegentia, propagated` },
              { ru: `Возмещал стилем: subtilis iunctura`, en: `Compensated through style: subtilis iunctura` }
            ]
          },
          wisdomTags: ["simplicity", "precision"]
        },

        {
          title: { ru: "С обеих сторон", en: "From Both Sides" },
          glossary: [
            { term: { ru: "In utramque partem", en: "In utramque partem" }, definition: { ru: "«С обеих сторон вопроса» — тренировочный метод Академии: разобрать доводы за и против, прежде чем к чему-то склониться.", en: "\"From both sides of the issue\" — the Academy's training method: argue for and against before leaning either way." } },
            { term: { ru: "Новая Академия", en: "The New Academy" }, definition: { ru: "Скептическое направление платоновской школы. Достоверность недостижима, но вероятное найти можно и по нему можно действовать.", en: "The sceptical turn of Plato's school. Certainty is unattainable, but the probable can be found and acted on." } }
          ],
          explain: {
            blocks: [
              { text: { ru: `Он принадлежал <strong>Новой Академии</strong>, и это не украшение биографии, а рабочий метод.<br><br>Положение такое: <strong>достоверность недостижима</strong>, но знание временное — вполне. Мерой истины служит <em>to pithanon</em>, которое Цицерон и перевёл словом <strong>probabile</strong> — «вероятное». Отсюда название всего направления: пробабилизм.`, en: `He belonged to the <strong>New Academy</strong>, and this is not biographical decoration but a working method.<br><br>The position runs: <strong>certainty is unattainable</strong>, but provisional knowledge is not. The criterion of truth is <em>to pithanon</em>, which Cicero rendered as <strong>probabile</strong>, "the probable". Hence the name of the whole tendency: probabilism.` } },
              { heading: { ru: "Как это делается", en: "How it is done" }, text: { ru: `Вопрос подвергают строгому разбору, <strong>взвешивая все доводы с обеих сторон</strong>. После этого скептик вправе согласиться с положением и <strong>действовать</strong> — не объявляя, что он получил знание.<br><br>И условие, ради которого всё затевалось: мнения обязаны оставаться <strong>изменчивыми и временными, подлежащими пересмотру при новых свидетельствах</strong>.<br><br>Отсюда и форма его сочинений — диалог, где стороны говорят длинно и по очереди, а вывод не навязан. Мелочей этот метод не касается: он для больших вопросов.`, en: `The question is put to rigorous scrutiny, <strong>weighing all the evidence on both sides</strong>. After that the sceptic may assent to a proposition and <strong>act</strong> — without claiming to have obtained knowledge.<br><br>And the condition the whole thing exists for: opinions must remain <strong>mutable and provisional, subject to change in the face of new evidence</strong>.<br><br>Hence the form of his works — the dialogue, where each side speaks at length in turn and no conclusion is forced. The method is not for trifles: it is for large questions.` } },
              { heading: { ru: "Метод, применённый к собственной жизни", en: "The method applied to his own life" }, text: { ru: `Его знаменитую нерешительность 49 года — между Помпеем и Цезарем — принято считать слабостью. Зарецкий читает иначе: это была попытка <em>определить, какая сторона даёт больше шансов на нравственное государство</em>.<br><br>То есть <em>in utramque partem</em> в исполнении на живом решении и за реальную цену. Он колебался не потому, что не имел характера, а потому что честно не знал — а притворяться, будто знаешь, его школа запрещала.<br><br>Вспомните первую тему. Дважды он всё же был уверен. Оба раза уверенность и стоила ему всего.`, en: `His famous indecision of 49 — between Pompey and Caesar — is usually read as weakness. Zarecki reads it otherwise: it was an attempt <em>to determine which side offered the better chance of a moral state</em>.<br><br>That is <em>in utramque partem</em> performed on a live decision at real cost. He wavered not from want of character but because he honestly did not know — and pretending to know was what his school forbade.<br><br>Recall the first topic. Twice he was certain anyway. Both times the certainty is what cost him everything.` } }
            ],
            analogy: { ru: `Это ближе всего к тому, как работает исправный суд: обвинение и защита говорят обе, и говорят всерьёз, а решение выносится не потому, что истина найдена, а потому, что доводы взвешены и жить дальше как-то надо. Приговор при этом можно пересмотреть, если появятся новые обстоятельства. Скептик Академии устраивает такой суд у себя в голове, по каждому крупному вопросу, и остаётся готов пересмотреть.`, en: `It is nearest to how a sound court works: prosecution and defence both speak, and both speak seriously, and a decision is reached not because the truth has been found but because the arguments have been weighed and life has to go on. The verdict can be reopened if new circumstances appear. The Academic sceptic convenes that court inside his own head, on every large question, and stays ready to reopen it.` },
            sources: [
              { ref: { ru: `Zarecki, J., <em>Cicero's Ideal Statesman in Theory and Practice</em>, London: Bloomsbury, 2014, гл. 1 «Academic Skepticism and Cicero's Political Philosophy»; Cicero, <em>Academica</em> 2.59 и 2.99, <em>De Fato</em> 1.`, en: `Zarecki, J., <em>Cicero's Ideal Statesman in Theory and Practice</em>, London: Bloomsbury, 2014, ch. 1 "Academic Skepticism and Cicero's Political Philosophy"; Cicero, <em>Academica</em> 2.59 and 2.99, <em>On Fate</em> 1.` }, note: { ru: `Недостижимость достоверности при возможности временного знания; probabile как перевод to pithanon; требование взвесить доводы с обеих сторон; право действовать без притязания на знание и обязанность держать мнения пересматриваемыми.`, en: `Certainty unattainable while provisional knowledge is possible; probabile as the rendering of to pithanon; the requirement to weigh both sides; the right to act without claiming knowledge, and the duty to keep opinions revisable.` } },
              { ref: { ru: `Zarecki, там же, заключение: «Цицерон не был догматиком, как бы близко он ни следовал стоикам в философских сочинениях»; о нерешительности 49 года — там же, гл. 3.`, en: `Zarecki, ibid., conclusion: "Cicero was not a dogmatist, no matter how closely he followed the Stoics in his philosophical works"; on the indecision of 49, ibid., ch. 3.` }, note: { ru: `Чтение колебаний между Помпеем и Цезарем как попытки определить, какая сторона даёт больше шансов нравственному государству, а не как бесхарактерности.`, en: `The reading of his wavering between Pompey and Caesar as an attempt to determine which side offered the better chance of a moral state, rather than as weakness of character.` } }
            ]
          },
          example: {
            label: { ru: "Четыре шага метода", en: "The method in four steps" },
            steps: [
              { ru: `Вопрос должен быть крупным. На мелочи метод не тратят.`, en: `The question must be large. The method is not spent on trifles.` },
              { ru: `Разобрать доводы обеих сторон — всерьёз, а не для вида.`, en: `Argue both sides — seriously, not for show.` },
              { ru: `Склониться к более вероятному и действовать, не объявляя это знанием.`, en: `Lean to the more probable and act, without calling it knowledge.` },
              { ru: `Держать вывод открытым: новое свидетельство обязано его менять.`, en: `Keep the conclusion open: new evidence must be allowed to move it.` }
            ]
          },
          quiz: {
            question: { ru: "Что, по учению Новой Академии, обязан делать скептик после того, как склонился к вероятному?", en: "On the New Academy's teaching, what must a sceptic do after leaning towards the probable?" },
            options: [
              { ru: "Воздержаться от действия, пока не получено достоверное знание", en: "Refrain from acting until certain knowledge is obtained" },
              { ru: "Действовать, но держать вывод открытым для новых свидетельств", en: "Act, but keep the conclusion open to new evidence" },
              { ru: "Объявить вывод знанием, иначе действие невозможно", en: "Declare the conclusion knowledge, since action is impossible otherwise" },
              { ru: "Передать решение более сведущему человеку", en: "Hand the decision to someone better informed" }
            ],
            correct: 1,
            explanation: { ru: `Скептик вправе согласиться и действовать — именно потому, что иначе жить нельзя, — но не вправе называть это знанием и обязан пересмотреть при новых свидетельствах. Воздержание от действия было бы параличом, а объявление знанием — ровно тем догматизмом, от которого школа отказалась.`, en: `The sceptic may assent and act — precisely because life is otherwise impossible — but may not call it knowledge, and must revise on new evidence. Refusing to act would be paralysis, and declaring it knowledge is exactly the dogmatism the school had abandoned.` }
          },
          recall: {
            prompt: { ru: "Изложите метод Новой Академии так, как им пользовался Цицерон.", en: "State the New Academy's method as Cicero used it." },
            answer: { ru: `Достоверность недостижима, но временное знание возможно. Мерой служит вероятное — to pithanon, по-латыни probabile. Крупный вопрос разбирают, взвешивая доводы с обеих сторон, in utramque partem; после этого можно согласиться и действовать, не притязая на знание; и мнение обязано оставаться изменчивым, подлежащим пересмотру при новых свидетельствах. Отсюда форма диалога, где стороны говорят по очереди и вывод не навязан. Зарецкий читает его колебания 49 года не как бесхарактерность, а как этот самый метод, применённый к живому решению.`, en: `Certainty is unattainable, but provisional knowledge is possible. The criterion is the probable — to pithanon, in Latin probabile. A large question is examined by weighing the arguments on both sides, in utramque partem; then one may assent and act without claiming knowledge; and the opinion must remain mutable, open to revision on new evidence. Hence the dialogue form, where the sides speak in turn and no conclusion is forced. Zarecki reads his wavering of 49 not as weakness but as this very method applied to a live decision.` },
            points: [
              { ru: `Достоверности нет, временное знание есть`, en: `No certainty; provisional knowledge yes` },
              { ru: `probabile — его перевод to pithanon`, en: `probabile — his rendering of to pithanon` },
              { ru: `In utramque partem: обе стороны всерьёз`, en: `In utramque partem: both sides, seriously` },
              { ru: `Действовать можно; называть знанием — нет`, en: `Acting is allowed; calling it knowledge is not` }
            ]
          },
          wisdomTags: ["uncertainty", "evidence"]
        },

        {
          title: { ru: "Письма", en: "The Letters" },
          glossary: [
            { term: { ru: "Ad Atticum", en: "Ad Atticum" }, definition: { ru: "Письма к Аттику — ближайшему другу. Не предназначались для чтения посторонними и потому сохранили его без отделки.", en: "The letters to Atticus, his closest friend. Never meant for other eyes, and so preserve him unpolished." } },
            { term: { ru: "Проскрипционный список", en: "Proscription list" }, definition: { ru: "См. тему 1. Здесь важно другое: письма последних месяцев жизни, вероятно, уничтожены как неудобные будущему Августу.", en: "See topic 1. What matters here: the letters of his last months were probably suppressed as awkward for the future Augustus." } }
          ],
          explain: {
            blocks: [
              { text: { ru: `1345 год, Италия. Петрарка впервые читает письма Цицерона к Аттику — и приходит в ярость.<br><br>Средневековье знало отрешённого мудреца, автора трактатов о долге и старости. В письмах обнаружился <strong>другой человек</strong>: тревожный, тщеславный, колеблющийся, торгующийся. Петрарка написал <strong>письмо самому Цицерону</strong> — через четырнадцать веков, — чтобы высказать своё негодование.`, en: `1345, Italy. Petrarch reads Cicero's letters to Atticus for the first time — and is furious.<br><br>The Middle Ages had known a detached sage, author of treatises on duty and old age. The letters revealed <strong>a different man</strong>: anxious, vain, wavering, bargaining. Petrarch wrote <strong>a letter to Cicero himself</strong> — across fourteen centuries — to register his distress.` } },
              { heading: { ru: "И самая неудобная страница", en: "And the most awkward page" }, text: { ru: `Во Второй Филиппике он писал Антонию: <em>«Я защищал республику юношей и не оставлю её стариком. Я презрел кинжалы Катилины — не устрашусь и твоих»</em>.<br><br>Когда Антоний с войском двинулся вверх по Италии, Цицерон решил ехать в Рим — и по дороге <strong>запаниковал</strong>, свернул и бежал в родной Арпин, куда Антоний не дойдёт. Вернулся, когда тот из Рима ушёл.<br><br>Роусон, приведя оба факта подряд, отказывается называть это неискренностью: <em>«он, несомненно, страстно верил каждому слову, когда его писал»</em>.`, en: `In the Second Philippic he wrote to Antony: <em>"I defended the Republic when I was young; I shall not abandon her in my old age. I scorned Catiline's daggers; I shall not tremble before yours."</em><br><br>When Antony marched up Italy with a force, Cicero set out for Rome — and on the road <strong>panicked</strong>, turned aside and fled to his birthplace at Arpinum, where Antony would not reach. He came back once Antony had left Rome.<br><br>Rawson, setting both facts side by side, refuses to call it insincerity: <em>"doubtless he passionately believed every word as he penned it."</em>` } },
              { heading: { ru: "Почему уцелел именно он", en: "Why he is the one who survived" }, text: { ru: `Здесь и лежит развязка. Тщательно отделанные трактаты сохранились у многих римлян. Уцелел и остался живым <strong>тот, чей беспорядок дошёл до нас вместе с ним</strong>.<br><br>Заметьте и обратное: <em>Hortensius</em>, сочинение, обратившее к философии молодого Августина, — <strong>утрачен</strong>. Уцелело то, что он не готовил к печати.<br><br>А приговор ему вынес противник. Цезарь, завоеватель Галлии, сказал, что Цицерон <strong>раздвинул границы римского духа</strong> — намекая, кажется, что раздвинуть границы империи было делом меньшим.`, en: `Here is the resolution. Carefully polished treatises survive from plenty of Romans. The one who survived <em>alive</em> is <strong>the one whose mess came down to us with him</strong>.<br><br>Note the converse: the <em>Hortensius</em>, the work that turned the young Augustine to philosophy, is <strong>lost</strong>. What survived is what he never prepared for publication.<br><br>And his verdict was passed by an opponent. Caesar, the conqueror of Gaul, said that Cicero <strong>had extended the boundaries of the Roman spirit</strong> — implying, it seems, that extending the boundaries of the empire was the lesser feat.` } }
            ],
            analogy: { ru: `Так работает разница между парадным портретом и снимком, сделанным между делом. Портрет говорит, каким человек хотел бы запомниться, и через сто лет от него остаётся поза. Случайный снимок ничего не утверждает и потому не устаревает: на нём видно, как человек стоял на самом деле. Петрарка искал портрет и наткнулся на снимок — и не простил.`, en: `It is the difference between a formal portrait and a snapshot taken in passing. The portrait says how a man wished to be remembered, and a century later only the pose is left. The candid shot claims nothing and so does not date: it shows how he actually stood. Petrarch went looking for the portrait and found the snapshot — and never forgave it.` },
            sources: [
              { ref: { ru: `Pieper, Ch. & van der Velden, B. (ред.), <em>Reading Cicero's Final Years</em>, Berlin: De Gruyter, 2020 (открытый доступ, CC BY-NC-ND); Petrarch, <em>Familiares</em> 24.3.`, en: `Pieper, Ch. & van der Velden, B. (eds.), <em>Reading Cicero's Final Years</em>, Berlin: De Gruyter, 2020 (open access, CC BY-NC-ND); Petrarch, <em>Familiares</em> 24.3.` }, note: { ru: `Дата 1345, первое чтение писем к Аттику, обнаруженный оппортунизм и знаменитое письмо, обращённое к самому Цицерону. Место находки в источнике не названо, поэтому здесь оно и не названо.`, en: `The date 1345, the first reading of the letters to Atticus, the opportunism it revealed, and the famous letter addressed to Cicero himself. The volume does not name the place of the find, so neither does this text.` } },
              { ref: { ru: `Rawson, E., «Cicero (106–43 B.C.)», в <em>Ancient Writers: Greece and Rome</em>, New York: Charles Scribner's Sons, 1982, с. 555, 568, 573–574, 579; Cicero, <em>Philippica</em> 2.118.`, en: `Rawson, E., "Cicero (106–43 B.C.)", in <em>Ancient Writers: Greece and Rome</em>, New York: Charles Scribner's Sons, 1982, pp. 555, 568, 573–574, 579; Cicero, <em>Philippics</em> 2.118.` }, note: { ru: `Слова Цезаря о границах римского духа; бегство в Арпин сразу после «не устрашусь твоих кинжалов» и отказ Роусон считать это неискренностью; утрата Hortensius и свидетельство Августина.`, en: `Caesar's remark about the boundaries of the Roman spirit; the flight to Arpinum right after "I shall not tremble before yours" and Rawson's refusal to call it insincerity; the loss of the Hortensius and Augustine's testimony.` } }
            ]
          },
          example: {
            label: { ru: "Что уцелело и что пропало", en: "What survived and what did not" },
            steps: [
              { ru: `Пропал Hortensius — тот самый, что обратил Августина к философии.`, en: `Lost: the Hortensius — the very book that turned Augustine to philosophy.` },
              { ru: `Пропала Consolatio, написанная себе после смерти Туллии.`, en: `Lost: the Consolatio, written to himself after Tullia's death.` },
              { ru: `Уцелели письма, которых он никому не показывал.`, en: `Survived: the letters he showed to nobody.` },
              { ru: `Именно из-за них Петрарка в 1345 году потерял своего мудреца — и именно они оставили нам человека.`, en: `Because of them Petrarch lost his sage in 1345 — and because of them we still have the man.` }
            ]
          },
          quiz: {
            question: { ru: "Почему открытие писем в 1345 году так подействовало на Петрарку?", en: "Why did the discovery of the letters in 1345 affect Petrarch so strongly?" },
            options: [
              { ru: "Они оказались подделкой, и он это доказал", en: "They turned out to be forgeries, and he proved it" },
              { ru: "Они были написаны на непонятной ему поздней латыни", en: "They were written in a late Latin he could not follow" },
              { ru: "Вместо отрешённого мудреца в них обнаружился тревожный и колеблющийся человек", en: "Instead of a detached sage they revealed an anxious, wavering man" },
              { ru: "В них Цицерон отрекался от собственных трактатов", en: "In them Cicero disavowed his own treatises" }
            ],
            correct: 2,
            explanation: { ru: `Средневековье знало Цицерона по трактатам и представляло себе отрешённого созерцателя. Письма к Аттику показали оппортунизм, тревогу и торг — и переменили заодно его суждение о Цезаре. Негодование было такой силы, что он написал письмо мёртвому.`, en: `The Middle Ages knew Cicero through the treatises and imagined a detached contemplative. The letters to Atticus showed opportunism, anxiety and bargaining — and changed his judgement of Caesar into the bargain. The indignation was strong enough that he wrote a letter to a dead man.` }
          },
          recall: {
            prompt: { ru: "Что открыли письма к Аттику и почему уцелел именно этот Цицерон?", en: "What did the letters to Atticus reveal, and why is this the Cicero who survived?" },
            answer: { ru: `В 1345 году Петрарка впервые прочёл письма к Аттику и обнаружил вместо отрешённого мудреца тревожного, тщеславного и колеблющегося человека; он написал негодующее письмо самому Цицерону через четырнадцать веков. Самый неудобный пример: во Второй Филиппике он заявил, что не устрашится кинжалов Антония, а услышав о его походе, запаниковал по дороге и бежал в Арпин — и Роусон отказывается называть это неискренностью, потому что верил он в момент письма непритворно. Отделанные трактаты вроде Hortensius утрачены, а неподготовленные к печати письма дошли — и именно они оставили нам живого человека.`, en: `In 1345 Petrarch first read the letters to Atticus and found, in place of a detached sage, an anxious, vain, wavering man; he wrote an indignant letter to Cicero himself across fourteen centuries. The most awkward instance: in the Second Philippic he declared he would not tremble before Antony's daggers, then on hearing of Antony's march panicked on the road and fled to Arpinum — and Rawson refuses to call this insincerity, because he believed it unfeignedly as he wrote it. Polished works like the Hortensius are lost, while the letters he never prepared for publication came through — and they are what left us a living man.` },
            points: [
              { ru: `1345, Петрарка, письма к Аттику`, en: `1345, Petrarch, the letters to Atticus` },
              { ru: `Письмо негодования, адресованное мёртвому`, en: `A letter of reproach addressed to a dead man` },
              { ru: `«Не устрашусь твоих кинжалов» — и бегство в Арпин`, en: `"I shall not tremble before yours" — and the flight to Arpinum` },
              { ru: `Уцелело неотделанное; Hortensius утрачен`, en: `The unpolished survived; the Hortensius is lost` }
            ]
          },
          wisdomTags: ["self-knowledge", "self-deception"]
        }
      ],
      examQuestions: [
        {
          question: { ru: "Какие слова, по сверенным источникам, создал сам Цицерон?", en: "Which words, on the checked sources, did Cicero himself coin?" },
          options: [
            { ru: "humanitas, individuum, quantitas", en: "humanitas, individuum, quantitas" },
            { ru: "qualitas, perceptio, probabilitas, evidentia, essentia, moralis", en: "qualitas, perceptio, probabilitas, evidentia, essentia, moralis" },
            { ru: "Никаких: все они существовали до него", en: "None: all of them existed before him" },
            { ru: "Больше двухсот слов философского словаря", en: "Over two hundred words of philosophical vocabulary" }
          ],
          correct: 1,
          explanation: { ru: `Фон Альбрехт даёт qualitas, perceptio, probabilitas, evidentia; Роусон подтверждает qualitas и добавляет essentia и moralis. Intellegentia существовала до него — он её распространил. Про humanitas, individuum и quantitas ни один из этих источников не говорит, поэтому их здесь нет.`, en: `Von Albrecht gives qualitas, perceptio, probabilitas, evidentia; Rawson confirms qualitas and adds essentia and moralis. Intellegentia existed before him — he spread it. Neither source says anything about humanitas, individuum or quantitas, so they are not here.` }
        },
        {
          question: { ru: "Почему выражение «благо» составляло для латыни трудность?", en: "Why was the expression \"the good\" a difficulty for Latin?" },
          options: [
            { ru: "В латыни нет определённого артикля, и однозначно это не сказать", en: "Latin has no definite article, so it cannot be said unambiguously" },
            { ru: "Слово bonum считалось непристойным", en: "The word bonum was considered indecent" },
            { ru: "Понятие блага было в Риме под религиозным запретом", en: "The notion of the good was under religious prohibition in Rome" },
            { ru: "Греческое ἀγαθόν не имело латинского корня", en: "Greek ἀγαθόν had no Latin cognate" }
          ],
          correct: 0,
          explanation: { ru: `Греческий артикль превращает прилагательное в предмет разговора: τὸ ἀγαθόν. Латынь этого хода не имеет, и bonum остаётся двусмысленным. Роусон называет это главной трудностью — более важной, чем нехватка слов.`, en: `The Greek article turns an adjective into the thing under discussion: τὸ ἀγαθόν. Latin has no such move, and bonum stays ambiguous. Rawson names this the main difficulty — more serious than any lack of words.` }
        },
        {
          question: { ru: "Что означает in utramque partem?", en: "What does in utramque partem mean?" },
          options: [
            { ru: "«В обе стороны» — о свободе перемещения по империи", en: "\"In both directions\" — of freedom of movement in the empire" },
            { ru: "«Разделяй и властвуй» — о политике сената", en: "\"Divide and rule\" — of senatorial policy" },
            { ru: "«С обеих сторон вопроса» — разбирать доводы за и против", en: "\"From both sides of the issue\" — argue for and against" },
            { ru: "«Обеими руками» — о риторическом жесте", en: "\"With both hands\" — of a rhetorical gesture" }
          ],
          correct: 2,
          explanation: { ru: `Тренировочный метод Новой Академии: прежде чем склониться, разобрать обе стороны всерьёз. Форма диалогов Цицерона — прямое следствие: стороны говорят по очереди и длинно, а вывод читателю не навязывают.`, en: `The New Academy's training method: before leaning either way, argue both sides seriously. The form of Cicero's dialogues follows directly — the sides speak at length in turn and no conclusion is forced on the reader.` }
        },
        {
          question: { ru: "Как Роусон оценивает бегство в Арпин после слов «не устрашусь твоих кинжалов»?", en: "How does Rawson assess the flight to Arpinum after \"I shall not tremble before yours\"?" },
          options: [
            { ru: "Как доказанную неискренность", en: "As proven insincerity" },
            { ru: "Как позднейшую выдумку враждебных источников", en: "As a later invention of hostile sources" },
            { ru: "Она отказывается называть это неискренностью: он верил каждому слову, когда писал", en: "She refuses to call it insincerity: he believed every word as he wrote it" },
            { ru: "Как обдуманный тактический манёвр", en: "As a deliberate tactical manoeuvre" }
          ],
          correct: 2,
          explanation: { ru: `Её формулировка: «он, несомненно, страстно верил каждому слову, когда его писал». В этом и суть: самообман не притворство. Человек может писать правду о себе и через неделю поступить наоборот, не солгав ни разу.`, en: `Her formulation: "doubtless he passionately believed every word as he penned it." That is the point: self-deception is not pretence. A man can write the truth about himself and act against it a week later without having lied once.` }
        },
        {
          question: { ru: "Что сказал о Цицероне Цезарь?", en: "What did Caesar say about Cicero?" },
          options: [
            { ru: "Что тот раздвинул границы римского духа", en: "That he had extended the boundaries of the Roman spirit" },
            { ru: "Что тот был опаснее целого легиона", en: "That he was more dangerous than a legion" },
            { ru: "Что тот погубил республику своей нерешительностью", en: "That his indecision destroyed the Republic" },
            { ru: "Что его философия — пересказ греков без единой своей мысли", en: "That his philosophy was Greek paraphrase without a thought of his own" }
          ],
          correct: 0,
          explanation: { ru: `Комплимент от политического противника, и Роусон отмечает подразумеваемое: раздвинуть границы империи до Галлии — а это сделал сам Цезарь — было, выходит, делом меньшим.`, en: `A compliment from a political adversary, and Rawson notes the implication: extending the boundaries of the empire into Gaul — which Caesar himself had done — was by that measure the lesser achievement.` }
        }
      ]
    }
    ,

    // ============================================================
    // ТЕМА 3 — что он думал
    // ============================================================
    {
      id: "cicero-thought",
      title: { ru: "Что он думал", en: "What He Argued" },
      desc: { ru: "Республика, которую он хотел, долг, который дороже удобства, и как он готовился к собственной смерти", en: "The Republic he wanted, a duty worth more than convenience, and how he prepared for his own death" },
      icon: "\u{2696}️",
      chunks: [
        {
          title: { ru: "Республика, которую он хотел", en: "The Republic He Wanted" },
          glossary: [
            { term: { ru: "Rector rei publicae", en: "Rector rei publicae" }, definition: { ru: "«Правящий государством» — идеал Цицерона: не царь, а гражданин, ведущий государство знанием законов, личным примером и влиянием на мнение, а не силой.", en: "\"The one who steers the state\" — Cicero's ideal: not a king, but a citizen who guides the state through knowledge of the laws, personal example and influence on opinion, never force." } },
            { term: { ru: "Смешанная конституция", en: "Mixed constitution" }, definition: { ru: "Сочетание монархии, аристократии и демократии в одном устройстве. По Цицерону, именно оно делает государство устойчивым — и именно таким он считал Рим.", en: "A blend of monarchy, aristocracy and democracy in one system. Cicero held this to be what makes a state stable — and held Rome to be the best example of it." } }
          ],
          predict: {
            question: { ru: "В теме 1 Цицерон дважды был «уверен» — с Катилиной и с Октавианом — и оба раза платил. Против какого стандарта он мог сам себя мерить?", en: "In Topic 1, Cicero was \"certain\" twice — with Catiline and with Octavian — and paid both times. Against what standard might he have been measuring himself?" },
            options: [
              { ru: "Против воли большинства в народном собрании", en: "Against the will of the majority in the popular assembly" },
              { ru: "Против собственного идеала правителя, которого сам же и описал", en: "Against his own ideal of a statesman, which he himself had written" },
              { ru: "Против военных заслуг, как Помпей и Цезарь", en: "Against military achievement, like Pompey and Caesar" },
              { ru: "Ни против чего — решения принимались спонтанно", en: "Against nothing — the decisions were made on impulse" }
            ],
            reveal: { ru: "У него был написанный идеал, и это меняет всю тему 1: он не просто ошибался — он мерил себя по стандарту, который сам сформулировал в трактате о государстве.", en: "He had a written ideal, and that changes the whole of Topic 1: he was not simply wrong — he was measuring himself against a standard he had formulated himself, in a treatise on the state." }
          },
          explain: {
            blocks: [
              { text: { ru: `В трактате «О государстве» Цицерон — устами Сципиона Эмилиана — доказывает то же, что до него доказывали греки: лучшее устройство не монархия, не аристократия и не демократия по отдельности, а <strong>их смесь</strong>. Каждая форма в одиночку скатывается в свою испорченную версию; смешанная — держит равновесие. Рим, по Цицерону, был лучшим живым примером этого равновесия — пока не начал его терять.<br><br>Государству, по его мысли, нужен не царь, а <strong>rector rei publicae</strong> — гражданин, который его ведёт.`, en: `In *On the Republic*, Cicero — through Scipio Aemilianus — argues what the Greeks had argued before him: the best constitution is neither monarchy, aristocracy nor democracy alone, but <strong>a mixture</strong> of the three. Each form alone decays into its own corrupt version; a mixed one holds its balance. Rome, in his view, was the best living example of that balance — until it began losing it.<br><br>What such a state needs, he argued, is not a king but a <strong>rector rei publicae</strong> — a citizen who steers it.` } },
              { heading: { ru: "Не сила, а влияние", en: "Not force, but influence" }, text: { ru: `Важно, чем rector НЕ является. Не военачальник: Цицерон нигде не даёт ему военной роли, хотя почти все его исторические образцы, включая Сципиона, славу заслужили на войне. Он ведёт государство знанием законов, личным примером и <strong>влиянием на общественное мнение</strong> — не приказом.<br><br>И ещё одна деталь, которую легко пропустить: даже красноречие, собственный главный дар Цицерона, у идеального правителя должно быть простым и сдержанным — не тем оружием толпы, каким он владел сам в судах.`, en: `What matters is what the rector is <em>not</em>. Not a military commander: Cicero gives him no military role anywhere, even though nearly all his historical models, Scipio included, earned their fame in war. He leads through knowledge of the laws, personal example, and <strong>influence on public opinion</strong> — not command.<br><br>And one detail easy to miss: even eloquence, Cicero's own greatest gift, is supposed to be simple and restrained in the ideal statesman — not the crowd-weapon he himself wielded in the courts.` } },
              { heading: { ru: "Сон Сципиона", en: "Scipio's dream" }, text: { ru: `Трактат заканчивается сном: Сципион возносится на небеса, и дед объясняет ему, что настоящих государственных мужей боги награждают бессмертием — а земная слава, увиденная оттуда, ничтожна. Урок не «не гонись за славой», а честнее: <em>гонись за правильным, а слава пусть будет побочным следствием</em>.<br><br>Именно этим стандартом он мерил себя в теме 1 — и именно поэтому оба его «дважды уверен» были не просто тактическими промахами, а срывами собственного идеала.`, en: `The treatise ends in a dream: Scipio is carried up to the heavens, and his grandfather explains that the gods reward genuine statesmen with immortality — while earthly fame, seen from there, is small. The lesson is not "don't chase glory" but the more honest version: <em>chase what is right, and let glory be a side effect.</em><br><br>This is precisely the standard he was measuring himself against in Topic 1 — and precisely why both of his "certain twice" moments were not merely tactical errors, but failures of his own ideal.` } }
            ],
            analogy: { ru: `Идеал rector-а работает как чертёж, который архитектор сам начертил и потом сам же нарушил при стройке в спешке. Чертёж не становится хуже от того, что здание вышло кривым — но кривизну теперь видно точнее, потому что есть с чем сравнивать. У Цицерона было ровно так: собственный текст стал линейкой для его же ошибок.`, en: `The rector ideal works like a blueprint an architect draws himself and then violates on his own rushed building site. The blueprint is none the worse for the building coming out crooked — but the crookedness is now visible with precision, because there is something to measure it against. That is exactly Cicero's position: his own text became the ruler for his own mistakes.` },
            sources: [
              { ref: { ru: `Rawson, E., «Cicero (106–43 B.C.)», в <em>Ancient Writers: Greece and Rome</em>, New York: Charles Scribner's Sons, 1982, с. 570–571.`, en: `Rawson, E., "Cicero (106–43 B.C.)", in <em>Ancient Writers: Greece and Rome</em>, New York: Charles Scribner's Sons, 1982, pp. 570–571.` }, note: { ru: `Смешанная конституция как синтез трёх форм и Рим как её лучший пример; что rector-ов может быть несколько и он ведёт влиянием, а не силой; отсутствие у него военной роли и требование простой, сдержанной речи; пересказ Сна Сципиона.`, en: `The mixed constitution as a synthesis of the three forms and Rome as its best example; that there may be more than one rector, leading by influence rather than force; his lack of a military role and the requirement of plain, restrained speech; the retelling of Scipio's dream.` } },
              { ref: { ru: `Zarecki, J., <em>Cicero's Ideal Statesman in Theory and Practice</em>, London: Bloomsbury, 2014, гл. 3–4; Cicero, <em>De Re Publica</em> 6.12.`, en: `Zarecki, J., <em>Cicero's Ideal Statesman in Theory and Practice</em>, London: Bloomsbury, 2014, chs. 3–4; Cicero, <em>De Re Publica</em> 6.12.` }, note: { ru: `Разбор rector-идеала как личного кодекса поведения Цицерона на протяжении всей гражданской войны и после неё — то есть ровно тот стандарт, которым он мерил и Катилину, и Октавиана.`, en: `The analysis of the rector-ideal as Cicero's own personal code of conduct through the civil war and after — precisely the standard he measured both Catiline and Octavian against.` } }
            ]
          },
          example: {
            label: { ru: "Один текст, два срыва из темы 1", en: "One text, two failures from Topic 1" },
            steps: [
              { ru: `Идеал: rector ведёт влиянием и примером, никогда — силой без разбора.`, en: `The ideal: the rector leads by influence and example, never by indiscriminate force.` },
              { ru: `63 год: он казнил заговорщиков без суда — сила там, где идеал требовал закона.`, en: `63 BC: he executed the conspirators without trial — force where the ideal demanded law.` },
              { ru: `44–43 годы: он рассчитывал управлять Октавианом влиянием — и не рассчитал его собственную волю.`, en: `44–43 BC: he expected to steer Octavian through influence — and misjudged Octavian's own will.` },
              { ru: `Оба раза — не случайная ошибка, а срыв собственного, письменно зафиксированного стандарта.`, en: `Both times, not a random mistake, but a failure of his own, written-down standard.` }
            ]
          },
          quiz: {
            question: { ru: "Какую роль Цицерон НЕ отводит своему идеальному правителю?", en: "Which role does Cicero NOT give his ideal statesman?" },
            options: [
              { ru: "Знание законов", en: "Knowledge of the laws" },
              { ru: "Личный пример", en: "Personal example" },
              { ru: "Военное командование", en: "Military command" },
              { ru: "Влияние на общественное мнение", en: "Influence on public opinion" }
            ],
            correct: 2,
            explanation: { ru: `Rector нигде не описан как военачальник, хотя почти все исторические образцы Цицерона, включая самого Сципиона, прославились именно на войне. Это осознанный пропуск: правитель у Цицерона ведёт государство убеждением и примером, а не оружием.`, en: `The rector is nowhere described as a military commander, even though almost all of Cicero's historical models, Scipio included, earned their fame in war. The omission is deliberate: Cicero's statesman leads the state through persuasion and example, not weapons.` }
          },
          recall: {
            prompt: { ru: "Что такое rector rei publicae, и почему этот идеал важен для понимания темы 1?", en: "What is the rector rei publicae, and why does this ideal matter for understanding Topic 1?" },
            answer: { ru: `Rector — не царь, а гражданин, ведущий смешанную конституцию (монархию, аристократию и демократию в одном устройстве) знанием законов, личным примером и влиянием на мнение, никогда — военной силой. Сон Сципиона в конце трактата обещает таким людям бессмертие, а земную славу называет ничтожной со стороны. Это тот самый стандарт, по которому в теме 1 Цицерон измерял себя дважды — с Катилиной и с Октавианом, — и дважды сорвался: применил силу там, где идеал требовал закона, и переоценил своё влияние там, где не рассчитал чужую волю.`, en: `The rector is not a king but a citizen who leads a mixed constitution (monarchy, aristocracy and democracy in one system) through knowledge of the laws, personal example, and influence on opinion — never military force. Scipio's dream, closing the treatise, promises such people immortality and calls earthly fame small when viewed from above. This is the very standard Cicero measured himself against twice in Topic 1 — with Catiline and with Octavian — and failed twice: he used force where the ideal demanded law, and overestimated his influence where he misjudged another man's will.` },
            points: [
              { ru: `Rector — не царь; ведёт влиянием, не силой`, en: `Rector — not a king; leads by influence, not force` },
              { ru: `Смешанная конституция: монархия + аристократия + демократия`, en: `Mixed constitution: monarchy + aristocracy + democracy` },
              { ru: `Никакой военной роли, даже у образцов вроде Сципиона`, en: `No military role, even for models like Scipio` },
              { ru: `Сон Сципиона: бессмертие за дело, не за славу`, en: `Scipio's dream: immortality for the deed, not the fame` }
            ]
          },
          wisdomTags: ["planning", "humility"]
        },

        {
          title: { ru: "Долг, когда он дорого стоит", en: "Duty When It Costs Something" },
          glossary: [
            { term: { ru: "Honestum и utile", en: "Honestum and utile" }, definition: { ru: "Честное (нравственно верное) и полезное (выгодное). Центральный вопрос «Об обязанностях»: могут ли они по-настоящему противоречить друг другу.", en: "The honourable (morally right) and the useful (advantageous). The central question of On Duties: whether the two can ever genuinely conflict." } },
            { term: { ru: "Calliditas", en: "Calliditas" }, definition: { ru: "Хитрость, ловкость без нравственной основы. Цицерон отличает её от мудрости (sapientia): ум без добра — не мудрость, а именно это.", en: "Cunning, cleverness with no moral foundation. Cicero distinguishes it from wisdom (sapientia): intelligence without goodness is not wisdom, but exactly this." } }
          ],
          explain: {
            blocks: [
              { text: { ru: `«Об обязанностях» он писал в 44 году — тем же летом, что и в теме 1: без Туллии, без политической роли, зная, что рискует, и обращаясь не к publike, а к собственному сыну, студенту в Афинах. Это его последнее и самое читаемое сочинение — в Англии его столетиями знали под именем <em>«Tully's Offices»</em>.<br><br>Главный вопрос книги: может ли честное (<strong>honestum</strong>) по-настоящему противоречить полезному (<strong>utile</strong>)? Его ответ — нет: конфликт между ними всегда мнимый.`, en: `He wrote *On Duties* in 44 BC — the same summer as Topic 1: without Tullia, without a political role, aware he was taking a risk, and addressing not the public but his own son, a student in Athens. It is his last and most-read work — in England it was known for centuries as <em>"Tully's Offices."</em><br><br>The book's central question: can the honourable (<strong>honestum</strong>) genuinely conflict with the useful (<strong>utile</strong>)? His answer: no — the conflict is always only apparent.` } },
              { heading: { ru: "Мудрость без добра — не мудрость", en: "Wisdom without goodness is not wisdom" }, text: { ru: `Он определяет две ключевые добродетели правителя, те же, что стоят за rector-идеалом: <strong>sapientia</strong> — «знание божественного и человеческого» — и <strong>prudentia</strong> — «знание, к чему стремиться и чего избегать».<br><br>И здесь его формулировка бьёт точно: sapientia неотделима от нравственной доброты, потому что <em>ум без добра — не мудрость, а хитрость</em> (<strong>calliditas</strong>). Умный расчёт без честности — это не более высокая форма ума. Это просто другое слово для обмана.`, en: `He names two central statesman's virtues, the same pair behind the rector ideal: <strong>sapientia</strong> — "knowledge of divine and human affairs" — and <strong>prudentia</strong> — "knowledge of what must be sought and what must be avoided."<br><br>And here his formulation lands precisely: sapientia cannot be separated from moral goodness, because <em>intelligence without goodness is not wisdom but cunning</em> (<strong>calliditas</strong>). Clever calculation without honesty is not a higher form of intelligence. It is simply another word for deceit.` } },
              { heading: { ru: "Написано против конкретного человека", en: "Written against a specific man" }, text: { ru: `Книга не абстрактна. Он прямо обвиняет Цезаря в <strong>temeritas</strong> — безрассудстве, попиравшем «все законы божеские и человеческие» ради власти, которую тот вообразил себе. Цезарь для него — доказательство от противного: ум без доброты, обращённый в тиранию.<br><br>И последняя строка первой книги звучит почти как предупреждение самому себе на будущий год: <em>«острее укус вновь обретённой свободы, чем свободы, никогда не терявшейся»</em>.`, en: `The book is not abstract. He accuses Caesar directly of <strong>temeritas</strong> — recklessness that trampled "all laws of gods and men" for a supremacy Caesar had imagined for himself. Caesar functions as proof by contradiction: intelligence without goodness, turned into tyranny.<br><br>And the closing line of Book One reads almost like a warning to himself for the year ahead: <em>"the fangs of a liberty regained are sharper than those of a liberty never repressed."</em>` } }
            ],
            analogy: { ru: `Различие между sapientia и calliditas — как различие между врачом и отравителем, знающими одну и ту же химию. Знание идентично; решает не объём ума, а то, ради чего он применён. Назвать отравителя «умным» технически верно и морально бесполезно — примерно это и хочет сказать Цицерон, ставя добро внутрь самого определения мудрости, а не рядом с ним.`, en: `The distinction between sapientia and calliditas is like the distinction between a doctor and a poisoner who know the same chemistry. The knowledge is identical; what decides is not the amount of intelligence but what it serves. Calling the poisoner "clever" is technically accurate and morally useless — which is roughly Cicero's point in placing goodness inside the very definition of wisdom, rather than beside it.` },
            sources: [
              { ref: { ru: `Zarecki, J., <em>Cicero's Ideal Statesman in Theory and Practice</em>, London: Bloomsbury, 2014, гл. 5; Cicero, <em>De Officiis</em> 1.63, 1.153, 1.26, 2.24.`, en: `Zarecki, J., <em>Cicero's Ideal Statesman in Theory and Practice</em>, London: Bloomsbury, 2014, ch. 5; Cicero, <em>De Officiis</em> 1.63, 1.153, 1.26, 2.24.` }, note: { ru: `Определения sapientia и prudentia (1.153); что мудрость без добра — calliditas (1.63); обвинение Цезаря в temeritas, попирающем законы (1.26); строка о свободе (2.24).`, en: `The definitions of sapientia and prudentia (1.153); that wisdom without goodness is calliditas (1.63); the charge that Caesar's temeritas trampled the laws (1.26); the line about liberty (2.24).` } },
              { ref: { ru: `Rawson, E., «Cicero (106–43 B.C.)», в <em>Ancient Writers: Greece and Rome</em>, New York: Charles Scribner's Sons, 1982, с. 577.`, en: `Rawson, E., "Cicero (106–43 B.C.)", in <em>Ancient Writers: Greece and Rome</em>, New York: Charles Scribner's Sons, 1982, p. 577.` }, note: { ru: `Датировка (44 год, сыну в Афинах), тезис о honestum и utile и английское прозвище «Tully's Offices».`, en: `The dating (44 BC, to his son in Athens), the honestum/utile thesis, and the English nickname "Tully's Offices."` } }
            ]
          },
          example: {
            label: { ru: "Один и тот же ум, два разных имени", en: "The same intelligence, two different names" },
            steps: [
              { ru: `Человек находит выгодный, но нечестный способ решить проблему.`, en: `A person finds a profitable but dishonest way to solve a problem.` },
              { ru: `Расчёт безупречен: цель достигнута, риск минимален.`, en: `The calculation is flawless: the goal is met, the risk is minimal.` },
              { ru: `По Цицерону, называть это «мудростью» неверно — это calliditas, хитрость без добра.`, en: `By Cicero's account, calling this "wisdom" is wrong — it is calliditas, cunning without goodness.` },
              { ru: `Разница не в уме, а в том, ради чего он применён — и это единственное, что стоит называть sapientia.`, en: `The difference is not in the intelligence but in what it serves — and only that deserves to be called sapientia.` }
            ]
          },
          quiz: {
            question: { ru: "Как Цицерон отвечает на вопрос, может ли честное (honestum) противоречить полезному (utile)?", en: "How does Cicero answer whether the honourable (honestum) can conflict with the useful (utile)?" },
            options: [
              { ru: "Да, и в этом случае нужно выбирать полезное", en: "Yes, and in that case one should choose the useful" },
              { ru: "Да, и выбор всегда зависит от обстоятельств", en: "Yes, and the choice always depends on circumstance" },
              { ru: "Нет — конфликт между ними только кажущийся", en: "No — the conflict between them is only apparent" },
              { ru: "Вопрос он оставляет открытым, не давая ответа", en: "He leaves the question open, giving no answer" }
            ],
            correct: 2,
            explanation: { ru: `Это и есть стержень книги: подлинного конфликта между честным и полезным не существует, а то, что кажется таким конфликтом, — ошибка в расчёте полезного, а не исключение из правила. Он строит на этом же различении и разбор Цезаря: тот считал свои действия полезными для себя, но именно потому, что они не были честными, они не были полезны и ему самому в итоге.`, en: `That is the spine of the book: no genuine conflict between the honourable and the useful exists, and what looks like one is a miscalculation of the useful, not an exception to the rule. He builds his reading of Caesar on the same distinction: Caesar thought his actions useful to himself, but precisely because they were not honourable, they were not, in the end, useful to him either.` }
          },
          recall: {
            prompt: { ru: "Что означает различие между sapientia и calliditas, и как оно применено к Цезарю?", en: "What is the sapientia/calliditas distinction, and how is it applied to Caesar?" },
            answer: { ru: `Sapientia — «знание божественного и человеческого» — по Цицерону неотделима от нравственной доброты: ум без добра называется не мудростью, а calliditas, хитростью. Цезарь служит доказательством от противного — он обвинён в temeritas, безрассудстве, попиравшем законы ради власти, которую он вообразил себе; его ум был реальным, но, лишённый честности, не был sapientia. Книга написана в 44 году сыну в Афинах, тем летом, что описано в теме 1, и центральный тезис — что честное и полезное никогда по-настоящему не противоречат друг другу.`, en: `Sapientia — "knowledge of divine and human affairs" — is, for Cicero, inseparable from moral goodness: intelligence without goodness is not wisdom but calliditas, cunning. Caesar serves as proof by contradiction — accused of temeritas, recklessness that trampled the laws for a supremacy he had imagined for himself; his intelligence was real, but lacking honesty it was not sapientia. The book was written in 44 BC to his son in Athens, the same summer described in Topic 1, and its central claim is that the honourable and the useful never genuinely conflict.` },
            points: [
              { ru: `Sapientia требует нравственной доброты`, en: `Sapientia requires moral goodness` },
              { ru: `Ум без добра — calliditas, хитрость`, en: `Intelligence without goodness — calliditas, cunning` },
              { ru: `Цезарь: temeritas, попиравшая законы`, en: `Caesar: temeritas that trampled the laws` },
              { ru: `Тезис книги: честное и полезное не противоречат друг другу`, en: `The book's thesis: the honourable and the useful do not conflict` }
            ]
          },
          wisdomTags: ["evidence", "correction"]
        },

        {
          title: { ru: "Как встречать смерть", en: "How to Face Death" },
          glossary: [
            { term: { ru: "Tusculanae Disputationes", en: "Tusculan Disputations" }, definition: { ru: "Диалоги, написанные в его вилле в Тускуле в 45 году — том же году, что и смерть Туллии. Меньше техники, больше прямого убеждения читателя и себя самого.", en: "Dialogues written at his villa at Tusculum in 45 BC — the same year as Tullia's death. Less technical than his other works, more a direct attempt to persuade the reader, and himself." } },
            { term: { ru: "Commentatio mortis", en: "Commentatio mortis" }, definition: { ru: "«Изучение смерти» — формула, которой Цицерон описывает саму философию: вся жизнь философа есть подготовка к смерти, отделение духа от тела ещё при жизни.", en: "\"A study of death\" — the phrase Cicero uses for philosophy itself: the whole life of a philosopher is a rehearsal for death, separating the spirit from the body while still alive." } }
          ],
          explain: {
            blocks: [
              { text: { ru: `«Тускуланские беседы» он написал в 45 году в собственной вилле — в тот же год, что и смерть Туллии из темы 1. Книга менее техническая, чем его другие философские труды: меньше разбора школ, больше прямого убеждения — не только читателя, но, как замечают исследователи, и самого автора.<br><br>Первая книга целиком посвящена одному вопросу: как перестать бояться смерти.`, en: `He wrote the *Tusculan Disputations* in 45 BC at his own villa — the same year as Tullia's death in Topic 1. The book is less technical than his other philosophical works: less comparison of schools, more direct persuasion — not only of the reader but, as scholars have noted, of the author himself.<br><br>The first book is devoted entirely to one question: how to stop fearing death.` } },
              { heading: { ru: "Вся жизнь философа — изучение смерти", en: "The whole life of a philosopher is a study of death" }, text: { ru: `Его формула, которую он приписывает Сократу: <strong>«вся жизнь философов есть изучение смерти»</strong>. Не потому, что философы одержимы концом, а потому что каждый раз, отвлекая дух от тела — от удовольствия, от имущества, от общественных дел, — человек тренирует ровно то умение, что понадобится в самом конце: отделить дух от тела насовсем.<br><br>Отсюда его вывод, звучащий почти как упражнение: <em>«приучимся отделяться от тела — то есть приучимся умирать»</em>, — и тогда сам переход не будет промедлен.`, en: `His formula, attributed to Socrates: <strong>"the whole life of philosophers is a study of death."</strong> Not because philosophers are morbid, but because every time a person calls the spirit away from the body — from pleasure, from possessions, from public business — they are practising exactly the skill the very end will require: separating spirit from body for good.<br><br>His conclusion reads almost like a drill: <em>"let us accustom ourselves to separating from the body — that is, let us accustom ourselves to dying"</em> — so that the passage itself will not be slowed.` } },
              { heading: { ru: "Слова, которые он потом исполнил", en: "The words he later kept" }, text: { ru: `Восемнадцать месяцев спустя, на дороге у Кайеты, — тема 1: он высунулся из носилок и подставил шею, не дрогнув. Ливий пишет об этом почти без пафоса, как о факте.<br><br>Между «Тускуланскими беседами» и той дорогой лежит именно то время, что описано в темах 1 и 2 этого курса: гибель дочери, разгром республики, письма Петрарке ещё неведомому потомку. Он писал о том, как не бояться смерти, за полтора года до того, как ему пришлось это на самом деле не бояться — и, судя по единственному дошедшему рассказу, у него получилось.`, en: `Eighteen months later, on the road near Caieta — Topic 1: he leaned out of the litter and offered his neck without flinching. Livy records it almost without pathos, as a plain fact.<br><br>Between the *Tusculan Disputations* and that road lies exactly the span this course has covered: his daughter's death, the Republic's collapse, a letter Petrarch had not yet been born to receive. He wrote about not fearing death eighteen months before he actually had to not fear it — and, on the one account that survives, he did.` } }
            ],
            analogy: { ru: `«Тускуланские беседы» работают как записка, которую пишешь себе накануне трудного дня — не потому, что уверен в исходе, а чтобы прочитать её именно тогда, когда испугаешься. Большинство таких записок никогда не проверяются: день проходит спокойно, и записка остаётся просто утешением. Записка Цицерона оказалась исключением: день настал, и есть свидетель, что он её прочитал.`, en: `The Tusculan Disputations work like a note you write yourself the night before a hard day — not because you are certain how it ends, but so you have something to read exactly when you get frightened. Most such notes are never tested: the day passes quietly, and the note stays only a comfort. Cicero's turned out to be the exception: the day came, and there is a witness that he read it.` },
            sources: [
              { ref: { ru: `Rawson, E., «Cicero (106–43 B.C.)», в <em>Ancient Writers: Greece and Rome</em>, New York: Charles Scribner's Sons, 1982, с. 574–575; Cicero, <em>Tusculanae Disputationes</em> 1.30.74.`, en: `Rawson, E., "Cicero (106–43 B.C.)", in <em>Ancient Writers: Greece and Rome</em>, New York: Charles Scribner's Sons, 1982, pp. 574–575; Cicero, <em>Tusculan Disputations</em> 1.30.74.` }, note: { ru: `Датировка, место написания, «менее технический» и более личный характер книги, и перевод формулы commentatio mortis и призыва «приучимся отделяться от тела».`, en: `The dating, the place of composition, the book's "less technical" and more personal character, and the translation of the commentatio mortis formula and the call to "accustom ourselves to separating from the body."` } },
              { ref: { ru: `Zarecki, J., <em>Cicero's Ideal Statesman in Theory and Practice</em>, London: Bloomsbury, 2014, гл. 4 (список шести сочинений 45 года, включая Tusculanae Disputationes); Pieper, Ch. & van der Velden, B. (ред.), <em>Reading Cicero's Final Years</em>, Berlin: De Gruyter, 2020, с. 17 (сцена гибели).`, en: `Zarecki, J., <em>Cicero's Ideal Statesman in Theory and Practice</em>, London: Bloomsbury, 2014, ch. 4 (the list of six works of 45 BC, including the Tusculan Disputations); Pieper, Ch. & van der Velden, B. (eds.), <em>Reading Cicero's Final Years</em>, Berlin: De Gruyter, 2020, p. 17 (the death scene).` }, note: { ru: `Место Tusculanae Disputationes среди шести сочинений, написанных в год смерти Туллии, и рассказ Ливия о подставленной шее, замыкающий круг к теме 1.`, en: `The Tusculan Disputations' place among the six works written in the year of Tullia's death, and Livy's account of the offered neck, closing the circle back to Topic 1.` } }
            ]
          },
          example: {
            label: { ru: "Восемнадцать месяцев между текстом и дорогой", en: "Eighteen months between the text and the road" },
            steps: [
              { ru: `45 год, вилла в Тускуле: он пишет, что вся жизнь философа — подготовка к смерти.`, en: `45 BC, the villa at Tusculum: he writes that a philosopher's whole life is a rehearsal for death.` },
              { ru: `Он формулирует упражнение: приучаться отделять дух от тела заранее.`, en: `He formulates the exercise: practise separating spirit from body in advance.` },
              { ru: `Проходит около полутора лет — гибель республики, проскрипции.`, en: `About a year and a half passes — the Republic's collapse, the proscriptions.` },
              { ru: `Декабрь 43-го, дорога у Кайеты: он подставляет шею, не дрогнув. По единственному свидетельству — исполнил написанное.`, en: `December 43, the road near Caieta: he offers his neck without flinching. By the one surviving account, he kept what he wrote.` }
            ]
          },
          quiz: {
            question: { ru: "Какую формулу Цицерон приписывает Сократу в первой книге «Тускуланских бесед»?", en: "What formula does Cicero attribute to Socrates in the first book of the Tusculan Disputations?" },
            options: [
              { ru: "«Познай самого себя»", en: "\"Know thyself\"" },
              { ru: "«Вся жизнь философов есть изучение смерти»", en: "\"The whole life of philosophers is a study of death\"" },
              { ru: "«Добродетель довлеет себе для счастья»", en: "\"Virtue is sufficient unto itself for happiness\"" },
              { ru: "«Ничего сверх меры»", en: "\"Nothing in excess\"" }
            ],
            correct: 1,
            explanation: { ru: `Формула держит на себе всю первую книгу: не изучение смерти как одержимость концом, а как ежедневная практика — отвлечение духа от тела ради удовольствия, имущества или дел тренирует то же самое умение, что понадобится один раз окончательно.`, en: `The formula carries the whole first book: not a study of death as an obsession with the end, but as a daily practice — calling the spirit away from the body, whether from pleasure, possessions or business, trains the very skill that will be needed once, finally.` }
          },
          recall: {
            prompt: { ru: "О чём «Тускуланские беседы», когда они написаны, и как это связано со сценой из темы 1?", en: "What are the Tusculan Disputations about, when were they written, and how does that connect to the scene in Topic 1?" },
            answer: { ru: `Написаны в 45 году на вилле в Тускуле, в год смерти Туллии — книга менее техническая и более личная, чем прочие. Первая книга целиком о том, как перестать бояться смерти; формула, приписанная Сократу, — «вся жизнь философов есть изучение смерти», а вывод — приучаться отделять дух от тела заранее, тренировкой. Через полтора года, в декабре 43-го, на дороге у Кайеты (тема 1), он, по рассказу Ливия, высунулся из носилок и подставил шею, не дрогнув — то есть, судя по единственному свидетельству, исполнил то, что сам же и написал.`, en: `Written in 45 BC at the villa at Tusculum, the year of Tullia's death — a book less technical and more personal than his others. The first book is entirely about how to stop fearing death; the formula attributed to Socrates is "the whole life of philosophers is a study of death," and the conclusion is to practise separating spirit from body in advance. Eighteen months later, in December 43, on the road near Caieta (Topic 1), by Livy's account he leaned out of the litter and offered his neck without flinching — that is, on the one surviving account, he kept what he had written.` },
            points: [
              { ru: `45 год, Тускул, год смерти Туллии`, en: `45 BC, Tusculum, the year of Tullia's death` },
              { ru: `«Вся жизнь философов есть изучение смерти»`, en: `"The whole life of philosophers is a study of death"` },
              { ru: `Упражнение: приучаться отделять дух от тела`, en: `The exercise: practise separating spirit from body` },
              { ru: `Дорога у Кайеты — он исполнил написанное`, en: `The road near Caieta — he kept what he wrote` }
            ]
          },
          wisdomTags: ["planning", "self-knowledge"]
        }
      ],
      examQuestions: [
        {
          question: { ru: "Какую форму государственного устройства Цицерон считал наиболее устойчивой?", en: "Which form of government did Cicero consider most stable?" },
          options: [
            { ru: "Чистую демократию", en: "Pure democracy" },
            { ru: "Просвещённую монархию", en: "Enlightened monarchy" },
            { ru: "Смешанную конституцию из трёх форм разом", en: "A mixed constitution of all three forms at once" },
            { ru: "Власть Сената без народного собрания", en: "Senate rule with no popular assembly" }
          ],
          correct: 2,
          explanation: { ru: `Каждая форма в одиночку, по его мысли, скатывается в свою испорченную версию; смешанная держит равновесие. Рим он считал лучшим живым примером такого равновесия.`, en: `Each form alone, in his view, decays into its own corrupt version; a mixed one holds its balance. He held Rome to be the best living example of that balance.` }
        },
        {
          question: { ru: "Кем, по Цицерону, НЕ является rector rei publicae?", en: "What is the rector rei publicae, by Cicero's account, NOT?" },
          options: [
            { ru: "Гражданином, ведущим личным примером", en: "A citizen who leads by personal example" },
            { ru: "Царём с абсолютной властью", en: "A king with absolute power" },
            { ru: "Знатоком законов", en: "An expert in the laws" },
            { ru: "Человеком, влияющим на общественное мнение", en: "Someone who influences public opinion" }
          ],
          correct: 1,
          explanation: { ru: `Rector — не царь, и Цицерон нигде не даёт ему военной роли, хотя почти все его исторические образцы прославились на войне. Ведёт он влиянием и знанием, не приказом.`, en: `The rector is not a king, and Cicero gives him no military role anywhere, even though almost all his historical models earned fame in war. He leads through influence and knowledge, not command.` }
        },
        {
          question: { ru: "Как Цицерон отличает sapientia (мудрость) от calliditas (хитрости)?", en: "How does Cicero distinguish sapientia (wisdom) from calliditas (cunning)?" },
          options: [
            { ru: "Sapientia требует нравственной доброты, calliditas — только ума", en: "Sapientia requires moral goodness, calliditas only intelligence" },
            { ru: "Sapientia — врождённый дар, calliditas — приобретённый навык", en: "Sapientia is innate, calliditas is a learned skill" },
            { ru: "Разницы нет — это синонимы в его текстах", en: "There is no difference — they are synonyms in his texts" },
            { ru: "Sapientia доступна только философам, calliditas — всем", en: "Sapientia is available only to philosophers, calliditas to everyone" }
          ],
          correct: 0,
          explanation: { ru: `Ум без нравственной доброты — не мудрость, а именно calliditas. Цицерон строит на этом различении и свой разбор Цезаря: ум был, добра не было.`, en: `Intelligence without moral goodness is not wisdom but exactly calliditas. Cicero builds his reading of Caesar on this very distinction: the intelligence was there, the goodness was not.` }
        },
        {
          question: { ru: "В каком году и где написаны «Об обязанностях» (De Officiis)?", en: "When and where was On Duties (De Officiis) written?" },
          options: [
            { ru: "В 63 году, во время консульства", en: "In 63 BC, during his consulship" },
            { ru: "В 45 году, на вилле в Тускуле", en: "In 45 BC, at the villa at Tusculum" },
            { ru: "В 44 году, обращено к сыну в Афинах", en: "In 44 BC, addressed to his son in Athens" },
            { ru: "После его смерти, издано Тироном", en: "After his death, published by Tiro" }
          ],
          correct: 2,
          explanation: { ru: `Последнее и самое читаемое его сочинение, написанное сыну-студенту тем летом 44 года, что описано в теме 1 — без Туллии, без политической роли, с ощущением риска.`, en: `His last and most-read work, written to his student son that same summer of 44 BC described in Topic 1 — without Tullia, without a political role, with a sense of risk.` }
        },
        {
          question: { ru: "Какую формулу приводит Цицерон в «Тускуланских беседах», говоря о философии?", en: "What formula does Cicero give in the Tusculan Disputations when speaking of philosophy?" },
          options: [
            { ru: "«Философия — служанка риторики»", en: "\"Philosophy is the servant of rhetoric\"" },
            { ru: "«Вся жизнь философов есть изучение смерти»", en: "\"The whole life of philosophers is a study of death\"" },
            { ru: "«Философия начинается с удивления»", en: "\"Philosophy begins in wonder\"" },
            { ru: "«Незнание есть начало мудрости»", en: "\"Ignorance is the beginning of wisdom\"" }
          ],
          correct: 1,
          explanation: { ru: `Формула, приписанная Сократу: каждое отвлечение духа от тела при жизни — тренировка того самого разделения, что понадобится один раз окончательно.`, en: `The formula attributed to Socrates: every calling of the spirit away from the body during life trains the very separation that will be needed once, finally.` }
        }
      ]
    }
  ]
};
