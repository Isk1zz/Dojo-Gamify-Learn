// ================================================
// Knell — SHOP / avatar catalogue (pure data)
// ------------------------------------------------
// Pure data. No DOM, no DB. Bought with $ wallet money (Garden
// dividends, Arcade payouts) — never XP, mirroring the charge/money
// split every other purchase in the app follows. core/profile.js paints
// the equipped one into #profile-avatar and sells them from the
// profile dropdown.
// ================================================

(() => {
  const AVATARS = I18N.resolve([
    { id: "owl",    icon: "\u{1F989}", name: { en: "Owl", ru: "Сова" },     price: 30 },
    { id: "fox",     icon: "\u{1F98A}", name: { en: "Fox", ru: "Лиса" },      price: 30 },
    { id: "wolf",    icon: "\u{1F43A}", name: { en: "Wolf", ru: "Волк" },     price: 40 },
    { id: "brain",   icon: "\u{1F9E0}", name: { en: "Brain", ru: "Мозг" },    price: 40 },
    { id: "robot",   icon: "\u{1F916}", name: { en: "Robot", ru: "Робот" },    price: 50 },
    { id: "dragon",  icon: "\u{1F409}", name: { en: "Dragon", ru: "Дракон" },   price: 60 },
    { id: "unicorn", icon: "\u{1F984}", name: { en: "Unicorn", ru: "Единорог" },  price: 60 },
    { id: "alien",   icon: "\u{1F47D}", name: { en: "Alien", ru: "Пришелец" },    price: 75 }
  ]);

  function avatarIcon(id) {
    const a = AVATARS.find(x => x.id === id);
    return a ? a.icon : null;
  }

  Object.assign(Dojo, { AVATARS, avatarIcon });
})();
