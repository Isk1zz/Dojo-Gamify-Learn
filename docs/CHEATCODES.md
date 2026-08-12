# Cheat codes

Type these into **Settings → Codes** and press Apply.

| Code | Effect |
|---|---|
| `admin613` | Marks every topic in every course complete |
| `unlockalltopics` | Marks every topic AND every chunk complete — for testing the custom flashcard deck builder, which needs chunk-level completion, not just topic-level |
| `parnasa100` | +$100 to the wallet |
| `agrala` | Refills arcade tickets to full (7) |
| `capmyrank` | Jumps XP to the top of the ladder — Nobel Laureate, every reward unlocked |
| `nullmyrank` | Resets XP to 0, back to Lab Intern |

---

## Where they live — and why they aren't deployed

Codes live in **`settings/codes.js`**, which is **in `.gitignore`**. It is never
committed, never pushed and never served.

```
settings/codes.example.js   committed — the template
settings/codes.js           gitignored — your working copy
```

To enable them on a fresh clone:

```bash
cp settings/codes.example.js settings/codes.js
```

Without that file, `window.DOJO_CODES` is undefined, `settings.js` hides the
Codes section entirely, and **none of the code strings exist in the shipped
JavaScript**. The `<script>` tag 404s harmlessly.

### Why this rather than a private repo
A private repo hides the **source**. GitHub Pages still serves the **built
site** to anyone with the URL, and devtools reads `settings.js` in about four
seconds. Making the repo private does nothing for a secret that ships inside
the page.

The only way to keep a code secret is not to ship it. That's what this does.

Adding a code is one entry in `codes.js` (plus the same entry in
`codes.example.js`, so a fresh clone still has something to copy). **Don't
scatter codes into the branches they affect** — a cheat hidden in `games/` is a
cheat nobody remembers is there.

## What they deliberately don't do

- **`admin613` doesn't touch reviews, stats or the wallet.** A cheated profile
  still looks obviously cheated in Stats, and the Garden still shows nothing
  growing, because growth comes from review intervals rather than completions.
- **`admin613` still doesn't grant XP.** Completing topics through the code
  doesn't pay, so a cheated profile's rank stays honest unless you also use a
  rank code deliberately.
- **The rank codes are the documented exception.** `capmyrank` and
  `nullmyrank` exist because rank now gates every theme, so there was no way
  to see the late-ladder rewards — or to check what a new profile sees —
  without grinding to 5,000 XP or wiping the profile.

  They set XP directly rather than adding it, and they set *lifetime* XP, so
  the ladder, the bar and theme ownership all agree afterwards. `nullmyrank`
  re-applies the theme, because a reward earned at a rank you no longer hold
  must not stay equipped — `applyTheme` resolves that and falls back to Indigo.

  Pair them: `capmyrank` to review every reward, `nullmyrank` to get back to a
  believable starting state.

If you add a code that breaks one of these rules, write down here *why*, so
future-you knows it was a decision rather than a slip.

## Before shipping

Delete or gate the `CODES` object. There is no other place to check.
