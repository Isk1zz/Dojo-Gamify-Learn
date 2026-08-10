// ================================================
// CS Dojo — STORY / content
// ------------------------------------------------
// PURE DATA. No DOM, no DB, no logic. story/story.js is the engine
// that reads this; stage 6 (writing the narrative) should touch this
// file and nothing else.
//
// ---- Scene shape ----
//
// {
//   id, act, title,
//   requires: [nodeId],        every one must be complete to unlock
//   needFlags: [flag],         narrative facts a scene depends on
//   cost: { money },           charged on OPENING the scene
//   body: [ "paragraph", ... ]     prose; `null` renders a placeholder
//   choices: [{
//     id, label,
//     need:   { money, item, vital: { key, min } },   shown but not charged
//     roll:   0.65,            chance of `win`; omit for a certain outcome
//     win:  { text, money, vitals: {}, shelter, item, flag,
//             unlock: [nodeId], complete: true },
//     lose: { text, money, vitals: {}, demote: true, flag }
//   }]
// }
//
// ---- The rules the engine enforces ----
//
// * `complete: true` is what marks a node done and opens what follows.
//   A losing branch normally omits it, so the node can be retried —
//   and the entry `cost` is charged again. That is the price of failing.
// * `demote: true` knocks you one rung down the shelter ladder. This is
//   the only way to LOSE GROUND, and every act has at least one.
// * A scene never touches course progress, charge, or the Library.
//
// ---- Tone (settled here so it doesn't drift) ----
// Second person, present tense, short sentences. Dry and observational:
// the narration reports what happens and what it costs, and lets the
// reader supply the feeling.
//
// NOT bleak-documentary — misery with no exit is exhausting in a study
// app you open at 7am, and the arc is about climbing out.
// NOT jokey — the subject is people's actual lives, and a punchline
// every scene would make the whole mode feel cheap.
// The character is competent and unlucky, never pitiable. Nobody in
// these scenes is a punchline, including the people who say no.
//
// ---- Why scenes can be failed ----
// An arc where the only question is whether you can afford the next fee
// is a shopping list with narration. Rolls give the money a stake:
// buying a better option raises the odds, it doesn't buy the outcome.
// Every roll here is at least 50/50 — this is a study app's side
// activity, not a punishment engine.
// ================================================

const STORY_ACTS = [
  { id: 1, title: "The Fall",               sub: "Street survival, loss of identity" },
  { id: 2, title: "The Grind",              sub: "Street economy, illness, medicine" },
  { id: 3, title: "The Bureaucratic Climb", sub: "Hostel, reclaiming your documents" },
  { id: 4, title: "Reclaiming Life",        sub: "A lease, a licence, a road out" }
];

const STORY_SCENES = [
  // ---------- Act I — The Fall ----------
  {
    id: "act1_node1", act: 1, title: "First night out",
    requires: [], cost: null, body: [
      "The last bus goes at eleven. You watch it go, because getting on it means having somewhere to be at the other end, and you don't.",
      "The cold arrives in stages. First your hands, then your face, then the part of you that was still treating this as temporary."
    ],
    choices: [
      { id: "doorway", label: "Sleep in a shop doorway",
        win: { text: "The shutter is warm for about an hour. You sleep in ninety-minute pieces and wake up filthy, but you wake up.", vitals: { hygiene: -10 }, complete: true, unlock: ["act1_node2"], flag: "slept_rough" } },
      { id: "station", label: "Try the station waiting room",
        roll: 0.6,
        win:  { text: "Nobody asks you anything. You sit upright with your bag on your lap like a man waiting for the 06:40, and by morning you almost believe it.", vitals: { hygiene: -4 }, complete: true, unlock: ["act1_node2"], flag: "knows_station" },
        lose: { text: "The guard is apologetic about it, which is somehow worse. You're outside by one, and it has started raining.", vitals: { hygiene: -12, thirst: -10 } } }
    ]
  },
  {
    id: "act1_node2", act: 1, title: "Nothing in the bag",
    requires: ["act1_node1"], cost: null, body: [
      "You go through the bag twice. The second time is not for finding anything. It's for the eleven seconds where you haven't finished looking yet.",
      "Yesterday you would have called this skipping lunch."
    ],
    choices: [
      { id: "ask", label: "Ask someone for change", roll: 0.55,
        win:  { text: "The fourth person stops. She doesn't make a speech about it, just hands you the coins and carries on, and you're grateful for both halves of that.", money: 12, complete: true, unlock: ["act1_node3"] },
        lose: { text: "Twenty minutes of being looked through. It isn't cruelty. It's a skill people learn on this street, and you'd learned it too.", vitals: { hunger: -8 } } },
      { id: "bins", label: "Work the bins behind the bakery",
        win: { text: "Yesterday's sourdough, and a lot of it. You eat standing up behind the bins and try not to think about the smell you're taking with you.", vitals: { hunger: 20, hygiene: -15 }, complete: true, unlock: ["act1_node3"] } }
    ]
  },
  {
    id: "act1_node3", act: 1, title: "Somebody wants the spot",
    requires: ["act1_node2"], cost: null, body: [
      "There's a man in the doorway when you get back. Older than you, and he's been out here longer, which out here is the only seniority there is.",
      "He isn't threatening you. He's explaining, patiently, the way you'd explain a rota."
    ],
    choices: [
      { id: "move", label: "Move on without arguing",
        win: { text: "You take the corner by the car park instead. It's louder and it's colder and it's yours, which turns out to matter.", vitals: { hunger: -5 }, complete: true, unlock: ["act2_node1"] } },
      { id: "hold", label: "Hold your ground", roll: 0.5,
        win:  { text: "You stay. He looks at you for a while, decides it isn't worth it, and goes. Neither of you enjoys any part of it.", flag: "stood_ground", complete: true, unlock: ["act2_node1"] },
        lose: { text: "It goes badly and it goes fast. You lose the spot, the coins in your pocket, and any illusion that you're good at this.", money: -15, vitals: { hygiene: -20, hunger: -10 } } }
    ]
  },

  // ---------- Act II — The Grind ----------
  {
    id: "act2_node1", act: 2, title: "A day's work, cash only",
    requires: ["act1_node3"], cost: null, body: [
      "The van pulls up at six and a man leans out and counts heads. Cash at the end of the day, no names taken, no questions asked in either direction.",
      "Everyone here knows the arrangement. Some of them have known it for years."
    ],
    choices: [
      { id: "shift", label: "Take the shift", roll: 0.75,
        win:  { text: "Eleven hours of lifting. Your back is finished and your hands are ruined and there are notes in your pocket, which is the first time that's been true in a while.", money: 45, vitals: { hunger: -15, thirst: -15 }, complete: true, unlock: ["act2_node2"] },
        lose: { text: "They fill the van before they get to you. You've spent the morning's energy standing in a queue, and there's nothing to show for it.", vitals: { hunger: -15, thirst: -15 } } },
      { id: "wait", label: "Wait for something better",
        win: { text: "You let the van go. Later, a woman closing up the shop pays you a tenner to shift boxes for twenty minutes and thanks you properly for it.", money: 10, complete: true, unlock: ["act2_node2"] } }
    ]
  },
  {
    id: "act2_node2", act: 2, title: "The cough",
    requires: ["act2_node1"], cost: { money: 20 }, body: [
      "It started as a throat thing. It's in your chest now, and it wakes you up, and out here being tired is not a thing you can afford to be.",
      "You know exactly what a sensible person would do. You also know what it costs."
    ],
    choices: [
      { id: "clinic", label: "Walk-in clinic", need: { money: 20 }, roll: 0.85,
        win:  { text: "Two hours in a plastic chair, six minutes with a doctor who doesn't ask where you're staying. Antibiotics, and the first useful thing anyone has given you in weeks.", vitals: { hunger: -5 }, complete: true, unlock: ["act2_node3"], flag: "seen_a_doctor" },
        lose: { text: "They send you away with paracetamol and a leaflet. You keep the leaflet, because it has an address on it, and addresses are worth something now.", vitals: { hunger: -15, thirst: -15 } } },
      { id: "ride", label: "Ride it out", roll: 0.5,
        win:  { text: "It burns itself out in nine days. You're thinner and slower at the end of it, but it's gone, and you got there for nothing.", complete: true, unlock: ["act2_node3"] },
        lose: { text: "It doesn't burn out. It gets into your chest properly and takes two weeks and everything you'd built up, and you end up further back than you started.", vitals: { hunger: -25, thirst: -25, hygiene: -15 }, demote: true } }
    ]
  },
  {
    id: "act2_node3", act: 2, title: "Everything you own, in one bag",
    requires: ["act2_node2"], cost: null, body: [
      "Everything you own fits in one bag, and the bag is the problem. Carry it and you're visibly homeless everywhere you go. Leave it and you might not own anything by evening.",
      "There is no version of this where you get to stop thinking about the bag."
    ],
    choices: [
      { id: "carry", label: "Carry it everywhere",
        win: { text: "You carry it. Doors close a little faster when you walk in, and you get very good at pretending not to notice.", vitals: { hunger: -8 }, complete: true, unlock: ["act3_node1"] } },
      { id: "stash", label: "Stash it and hope", roll: 0.55,
        win:  { text: "Behind the loose panel by the depot fence. It's still there when you come back, and you stand there for a second feeling almost lucky.", complete: true, unlock: ["act3_node1"] },
        lose: { text: "It's gone. Not taken by anyone in particular — just gone, the way things go. You replace what you can and stop owning the rest.", money: -40, complete: true, unlock: ["act3_node1"] } }
    ]
  },

  // ---------- Act III — The Bureaucratic Climb ----------
  {
    id: "act3_node1", act: 3, title: "A bed with a number on it",
    requires: ["act2_node3"], cost: { money: 25 }, body: [
      "Twenty-five a night for a bed in a room with five other beds. There's a lock on the door and a shower down the hall and both of those are worth more than the sleep.",
      "The man at the desk writes you into a book. It's the first time in months anyone has written your name down."
    ],
    choices: [
      { id: "book", label: "Pay for the bed", need: { money: 25 },
        win: { text: "A real mattress and a hot shower. You sleep nine hours straight and wake up feeling like a person who could be argued into having plans.", shelter: "hostel", vitals: { hygiene: 25 }, complete: true,
               unlock: ["act3_node2"], flag: "has_bed" } }
    ]
  },
  {
    id: "act3_node2", act: 3, title: "Proof that you exist",
    requires: ["act3_node1"], cost: { money: 60 }, body: [
      "To replace the card you need an address. To get an address you need the card. Everyone you speak to understands this perfectly and none of them can do anything about it.",
      "The hostel's address is not really your address. It is, however, an address."
    ],
    choices: [
      { id: "apply", label: "Apply with the hostel's address", need: { item: "hostel", money: 60 }, roll: 0.8,
        win:  { text: "The clerk looks at the hostel letter, then at you, then decides it counts. Six weeks later there is a card with your name on it and your face on it.", item: "id_card", complete: true, unlock: ["act3_node3"], flag: "has_id" },
        lose: { text: "Wrong form. You'll need to come back with the other one, and the other one needs something you don't have yet.", vitals: { hunger: -10 } } },
      { id: "queue", label: "Queue at the counter and argue", roll: 0.5,
        win:  { text: "You stay polite and you stay there, and somewhere in the third hour it becomes easier to help you than to keep explaining why they can't.", item: "id_card", complete: true, unlock: ["act3_node3"], flag: "has_id" },
        lose: { text: "You lose your temper about forty minutes in. You're right about all of it and it doesn't help you even slightly.", vitals: { hunger: -20, thirst: -20 } } }
    ]
  },
  {
    id: "act3_node3", act: 3, title: "An address they'll accept",
    requires: ["act3_node2"], needFlags: ["has_id"], cost: null, body: [
      "With the card, doors that were closed turn out to have been merely locked. It's a small distinction and it changes everything.",
      "Nobody congratulates you. The system simply stops treating you as a problem and starts treating you as a queue position."
    ],
    choices: [
      { id: "bank", label: "Open an account",
        win: { text: "An account, a card, a statement with your name on it. Boring, official, and the most valuable thing you've held in a year.", flag: "has_account", complete: true, unlock: ["act4_node1"] } },
      { id: "job", label: "Go after a job on the books", roll: 0.7,
        win:  { text: "On the books, with a contract and a payslip at the end of it. The work is dull. You have never been so pleased about dull.", money: 80, flag: "has_payslip", complete: true, unlock: ["act4_node1"] },
        lose: { text: "They want a reference and a work history with no gaps in it. You have a gap. It's about a year long and it's the reason you're standing there.", vitals: { hunger: -10, thirst: -10 } } }
    ]
  },

  // ---------- Act IV — Reclaiming Life ----------
  {
    id: "act4_node1", act: 4, title: "A door of your own",
    requires: ["act3_node3"], cost: { money: 250 }, body: [
      "Two hundred and fifty for the deposit and a landlord who wants the payslip, the bank statement and the card, all three, in that order.",
      "You have all three. It took eleven months, and you have all three."
    ],
    choices: [
      { id: "sign", label: "Sign the lease", need: { money: 250, item: "id_card" },
        win: { text: "You sign it at his kitchen table and he hands you two keys on a ring with no fob. That night you close a door behind you that only you can open.", shelter: "apartment", vitals: { hygiene: 30 }, complete: true,
               unlock: ["act4_node2"], flag: "has_lease" } }
    ]
  },
  {
    id: "act4_node2", act: 4, title: "Keys and a road",
    requires: ["act4_node1"], cost: { money: 150 }, body: [
      "The licence went the same way everything else went. Getting it back is a fee and a test and a morning off work you can't really spare.",
      "You can spare it now. That's the whole difference."
    ],
    choices: [
      { id: "test", label: "Sit the test", need: { money: 150 }, roll: 0.7,
        win:  { text: "Second attempt at the roundabout and a clean sheet on everything else. The examiner says the word 'passed' like it's nothing at all.", item: "licence", complete: true, unlock: ["act4_node3"], flag: "can_drive" },
        lose: { text: "Failed on observation. You knew as you did it. You'll book again, and it will cost the same again." } },
      { id: "lessons", label: "Pay for lessons first", need: { money: 220 }, roll: 0.9,
        win:  { text: "Six lessons first, which you resent paying for right up until the moment you pass on the first attempt.", money: -70, item: "licence", complete: true, unlock: ["act4_node3"], flag: "can_drive" },
        lose: { text: "Six lessons and you still fail it. The instructor is kind about it, which you'd rather he wasn't.", money: -70 } }
    ]
  },
  {
    id: "act4_node3", act: 4, title: "Somewhere to be in the morning",
    requires: ["act4_node2"], needFlags: ["can_drive"], cost: null, body: [
      "Nobody gives you a certificate for this. There's no moment where it's officially over — just a Tuesday where you notice you haven't thought about the bag in weeks.",
      "The street is still out there and you know exactly how close it is. That knowledge is going to stay with you, and on balance you'd rather it did."
    ],
    choices: [
      { id: "stay", label: "Stay where you are and keep at it",
        win: { text: "You stay. The job gets slightly less dull, the flat gets a second chair, and you stop flinching when the post arrives.", complete: true, flag: "arc_complete" } },
      { id: "leave", label: "Pack the car and go",
        need: { item: "car" },
        win: { text: "You load what you own into the back, which takes one trip, and drive out at six in the morning with nobody watching you go.", complete: true, flag: "arc_complete" } }
    ]
  }
];
