// ================================================
// Knell — SHOP / avatar catalogue (pure data)
// ------------------------------------------------
// Pure data. No DOM, no DB. core/profile.js paints the equipped one into
// #profile-avatar and offers them all in the profile dropdown.
//
// Free since 2026-11-22 ("account uses avatars for dollars and we cut
// them out (make them free)"). They used to cost $30 to $75 of wallet
// money, but that money was retired: the same stored number became
// reputation, which is earned in the Garden and spent only on other
// people's Forum posts. Charging it for an avatar contradicted that, so
// an avatar is now simply chosen. The prices are gone with it.
// ================================================

(() => {
  const AVATARS = I18N.resolve([
    { id: "owl",     icon: "\u{1F989}", name: { en: "Owl", ru: "Сова" } },
    { id: "fox",     icon: "\u{1F98A}", name: { en: "Fox", ru: "Лиса" } },
    { id: "wolf",    icon: "\u{1F43A}", name: { en: "Wolf", ru: "Волк" } },
    { id: "brain",   icon: "\u{1F9E0}", name: { en: "Brain", ru: "Мозг" } },
    { id: "robot",   icon: "\u{1F916}", name: { en: "Robot", ru: "Робот" } },
    { id: "dragon",  icon: "\u{1F409}", name: { en: "Dragon", ru: "Дракон" } },
    { id: "unicorn", icon: "\u{1F984}", name: { en: "Unicorn", ru: "Единорог" } },
    { id: "alien",   icon: "\u{1F47D}", name: { en: "Alien", ru: "Пришелец" } }
  ]);

  function avatarIcon(id) {
    const a = AVATARS.find(x => x.id === id);
    return a ? a.icon : null;
  }

  Object.assign(Dojo, { AVATARS, avatarIcon });
})();
