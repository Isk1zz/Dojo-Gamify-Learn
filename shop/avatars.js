// ================================================
// CS Dojo — SHOP / avatar catalogue (pure data)
// ------------------------------------------------
// Pure data. No DOM, no DB. Bought with $ wallet money (Garden
// dividends, Arcade payouts) — never XP, mirroring the charge/money
// split every other purchase in the app follows. core/profile.js paints
// the equipped one into #profile-avatar and sells them from the
// profile dropdown.
// ================================================

(() => {
  const AVATARS = [
    { id: "owl",    icon: "\u{1F989}", name: "Owl",     price: 30 },
    { id: "fox",     icon: "\u{1F98A}", name: "Fox",      price: 30 },
    { id: "wolf",    icon: "\u{1F43A}", name: "Wolf",     price: 40 },
    { id: "brain",   icon: "\u{1F9E0}", name: "Brain",    price: 40 },
    { id: "robot",   icon: "\u{1F916}", name: "Robot",    price: 50 },
    { id: "dragon",  icon: "\u{1F409}", name: "Dragon",   price: 60 },
    { id: "unicorn", icon: "\u{1F984}", name: "Unicorn",  price: 60 },
    { id: "alien",   icon: "\u{1F47D}", name: "Alien",    price: 75 }
  ];

  function avatarIcon(id) {
    const a = AVATARS.find(x => x.id === id);
    return a ? a.icon : null;
  }

  Object.assign(Dojo, { AVATARS, avatarIcon });
})();
