// ================================================
// Knell — SCENES: a course drawn as a diorama
// ------------------------------------------------
// Borrowed from Knell Atlas and translated down. The Atlas draws a cut
// block of the world in WebGL: the Mariana Trench as a slab with its
// strata showing on the sides, things standing on it, labels on pins.
// Knell is a phone app where the scene is the backdrop to a lesson, not
// a place you walk around, so this is the same idea in flat SVG with the
// depth faked by parallax: a far layer, the block and the pins each move
// at a different rate when the pointer moves.
//
// The rule taken from the Atlas, and the one that matters most: a scene
// is a RECIPE run by one engine, never a drawing per course. The Atlas
// runs 15 scenes on 5 archetypes. If every course here had a hand-built
// picture, the second course would cost as much as the first. A recipe
// is data (palette, surface shapes, objects, pins) and everything that
// draws lives in this file.
//
//   Dojo.Scenes.register(id, recipe)
//   Dojo.Scenes.render(container, id, { lang, onChapter })
//     -> { svg, goTo(pinIndex), destroy() }
//   onChapter({ index, n, topic, label }) fires when the runner arrives.
// ================================================
(function () {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const COS30 = Math.cos(Math.PI / 6);
  const VIEW_W = 1000, VIEW_H = 760;
  const recipes = Object.create(null);
  let uidCounter = 0;

  // ---- Small helpers --------------------------------------------------
  function el(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  const r1 = v => Math.round(v * 10) / 10;
  const pts = list => list.map(p => r1(p[0]) + "," + r1(p[1])).join(" ");
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function shade(hex, f) {
    let h = String(hex).replace("#", "");
    if (h.length === 3) h = h.split("").map(c => c + c).join("");
    const n = parseInt(h, 16);
    const ch = s => clamp(Math.round(((n >> s) & 255) * f), 0, 255).toString(16).padStart(2, "0");
    return "#" + ch(16) + ch(8) + ch(0);
  }

  // Seeded, so a scene looks the same on every visit. Lit windows and
  // stars that reshuffled on each render would read as a flicker, not as
  // a city.
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Recipe strings are language bags, the same { en, ru } shape the
  // course content uses.
  const textOf = (v, lang) =>
    v == null ? "" : typeof v === "string" ? v : (v[lang] || v.en || "");

  // ---- Projection -----------------------------------------------------
  // Isometric. Ground axes x and y both project to S pixels per unit,
  // which is why dash lengths can be given in world units and simply
  // multiplied by S. z is up.
  function projector(block) {
    const span = (block.w + block.d) * COS30;
    const S = (VIEW_W * 0.76) / span;
    const OX = VIEW_W / 2 + ((block.d - block.w) / 2) * COS30 * S;
    const OY = block.top || 200;
    const iso = (x, y, z) => [OX + (x - y) * COS30 * S, OY + (x + y) * 0.5 * S - (z || 0) * S];
    return { S, OX, OY, iso };
  }
  const quadTop = (iso, x0, y0, x1, y1, z) =>
    [iso(x0, y0, z), iso(x1, y0, z), iso(x1, y1, z), iso(x0, y1, z)];

  // ---- Shared definitions ---------------------------------------------
  function defs(svg, uid, col) {
    const d = el("defs", null, svg);

    const glow = el("filter", { id: uid + "glow", x: "-200%", y: "-200%", width: "500%", height: "500%" }, d);
    el("feGaussianBlur", { stdDeviation: 2.2, result: "b" }, glow);
    const m = el("feMerge", null, glow);
    el("feMergeNode", { in: "b" }, m);
    el("feMergeNode", { in: "SourceGraphic" }, m);

    const blur = el("filter", { id: uid + "blur", x: "-30%", y: "-30%", width: "160%", height: "160%" }, d);
    el("feGaussianBlur", { stdDeviation: 16 }, blur);

    const grad = (tag, id, attrs, stops) => {
      const g = el(tag, Object.assign({ id: uid + id }, attrs), d);
      stops.forEach(s => el("stop", { offset: s[0], "stop-color": s[1], "stop-opacity": s[2] }, g));
    };
    grad("radialGradient", "pool", {}, [["0%", col("light"), 0.42], ["100%", col("light"), 0]]);
    grad("radialGradient", "stage", {}, [["0%", "#ffffff", 0.07], ["100%", "#ffffff", 0]]);
    grad("linearGradient", "beam", { x1: 0, y1: 0, x2: 1, y2: 0 }, [["0%", "#fff6d0", 0.5], ["100%", "#fff6d0", 0]]);
    grad("linearGradient", "haze", { x1: 0, y1: 0, x2: 0, y2: 1 }, [["0%", col("haze"), 0], ["100%", col("haze"), 0.16]]);
    grad("linearGradient", "ground", { x1: 0, y1: 0, x2: 0, y2: 1 }, [["0%", col("skyline"), 0.95], ["100%", col("skyline"), 0]]);

    // The far layer dissolves at the left and right edges. Inside the app
    // the scene sits on the app's own sky, and a skyline ending in a hard
    // vertical cut reads as a picture pasted on top of it.
    grad("linearGradient", "edgefade", { x1: 0, y1: 0, x2: 1, y2: 0 },
      [["0%", "#fff", 0], ["10%", "#fff", 1], ["90%", "#fff", 1], ["100%", "#fff", 0]]);
    const mask = el("mask", { id: uid + "edges", maskUnits: "userSpaceOnUse", x: -60, y: -60, width: VIEW_W + 120, height: VIEW_H + 120 }, d);
    el("rect", { x: 0, y: -60, width: VIEW_W, height: VIEW_H + 120, fill: `url(#${uid}edgefade)` }, mask);

    // Grain for the gravel strata: a few dots, tiled.
    const pat = el("pattern", { id: uid + "grain", width: 7, height: 7, patternUnits: "userSpaceOnUse" }, d);
    el("circle", { cx: 1.5, cy: 1.8, r: 0.7, fill: "#000", "fill-opacity": 0.35 }, pat);
    el("circle", { cx: 5, cy: 4.6, r: 0.55, fill: "#fff", "fill-opacity": 0.16 }, pat);
    el("circle", { cx: 3.4, cy: 6.1, r: 0.45, fill: "#000", "fill-opacity": 0.25 }, pat);
  }

  // ---- Far layer: what is behind the block -----------------------------
  function drawBackdrop(g, recipe, P, col, rand, uid) {
    const { S, OX, OY } = P;
    const bd = recipe.backdrop || {};

    for (let i = 0; i < (bd.stars || 46); i++) {
      el("circle", {
        cx: r1(rand() * VIEW_W), cy: r1(rand() * (OY + S)), r: r1(0.5 + rand() * 1.1),
        fill: "#fff", "fill-opacity": r1(0.2 + rand() * 0.6)
      }, g);
    }

    // A pale pool of light behind the block, so its silhouette separates
    // from the dark instead of dissolving into it.
    el("ellipse", { cx: OX, cy: OY + 6 * S, rx: 560, ry: 330, fill: `url(#${uid}stage)` }, g);

    if (bd.kind !== "skyline") return;
    const base = OY + 3.2 * S;
    el("rect", { x: 0, y: r1(base - 4.8 * S), width: VIEW_W, height: r1(4.8 * S), fill: `url(#${uid}haze)` }, g);
    el("rect", { x: 0, y: r1(base), width: VIEW_W, height: r1(2.4 * S), fill: `url(#${uid}ground)` }, g);

    let x = 24;
    while (x < VIEW_W - 24) {
      const w = 22 + rand() * 40, h = (1.1 + rand() * 3.6) * S;
      el("rect", { x: r1(x), y: r1(base - h), width: r1(w), height: r1(h), fill: shade(col("skyline"), 0.85 + rand() * 0.35) }, g);
      for (let wy = base - h + 6; wy < base - 4; wy += 7) {
        for (let wx = x + 4; wx < x + w - 3; wx += 6) {
          if (rand() < 0.09) el("rect", { x: r1(wx), y: r1(wy), width: 2, height: 2.4, fill: col("window"), "fill-opacity": 0.5 }, g);
        }
      }
      if (rand() < 0.18) el("rect", { x: r1(x + w / 2 - 0.6), y: r1(base - h - 12), width: 1.2, height: 12, fill: shade(col("skyline"), 1.15) }, g);
      x += w + 2 + rand() * 6;
    }
  }

  // ---- The block ------------------------------------------------------
  // Which surface rect is on top at each point along a front edge, so the
  // cut through the block shows asphalt under the road and soil under the
  // grass. It is computed from the surface rather than written into the
  // recipe, so moving a road cannot leave the cross-section disagreeing
  // with it.
  function edgeRuns(surface, fixed, axis, len) {
    const rects = surface.filter(s => s.kind === "rect");
    const runs = [];
    const step = 0.05;
    let cur = null;
    for (let t = 0; t < len - 1e-9; t += step) {
      const mid = t + step / 2;
      const px = axis === "x" ? mid : fixed, py = axis === "x" ? fixed : mid;
      let fill = null;
      for (const r of rects) {
        if (px >= r.x0 && px <= r.x1 && py >= r.y0 && py <= r.y1) fill = r.edge || r.fill;
      }
      if (cur && cur.fill === fill) cur.b = t + step;
      else { cur = { a: t, b: t + step, fill }; runs.push(cur); }
    }
    return runs;
  }

  function drawBlock(g, recipe, P, col, uid) {
    const { iso } = P;
    const B = recipe.block, surface = recipe.surface || [];
    const skin = B.skin || 0.14;
    const H = skin + B.strata.reduce((s, x) => s + x.t, 0);
    const w = B.w, d = B.d;

    // Shadow on the dark below, which is what makes the block float.
    const foot = [iso(0, 0, -H), iso(w, 0, -H), iso(w, d, -H), iso(0, d, -H)].map(p => [p[0], p[1] + 26]);
    el("polygon", { points: pts(foot), fill: "#000", "fill-opacity": 0.65, filter: `url(#${uid}blur)` }, g);

    // The two faces the camera can see. Light comes from the upper left,
    // so the left face is the brighter of the two.
    const faces = [
      { k: 0.82, at: (t, z) => iso(t, d, z), len: w, runs: edgeRuns(surface, d, "x", w) },
      { k: 0.62, at: (t, z) => iso(w, t, z), len: d, runs: edgeRuns(surface, w, "y", d) }
    ];
    for (const f of faces) {
      for (const r of f.runs) {
        if (!r.fill) continue;
        el("polygon", { points: pts([f.at(r.a, 0), f.at(r.b, 0), f.at(r.b, -skin), f.at(r.a, -skin)]), fill: shade(col(r.fill), f.k) }, g);
      }
      let z = -skin;
      for (const s of B.strata) {
        const z2 = z - s.t;
        const quad = [f.at(0, z), f.at(f.len, z), f.at(f.len, z2), f.at(0, z2)];
        el("polygon", { points: pts(quad), fill: shade(col(s.c), f.k) }, g);
        if (s.grain) el("polygon", { points: pts(quad), fill: `url(#${uid}grain)` }, g);
        el("polyline", { points: pts([f.at(0, z), f.at(f.len, z)]), fill: "none", stroke: "#000", "stroke-opacity": 0.28, "stroke-width": 1 }, g);
        z = z2;
      }
    }
    const front = [iso(w, d, 0), iso(w, d, -H)];
    el("line", { x1: r1(front[0][0]), y1: r1(front[0][1]), x2: r1(front[1][0]), y2: r1(front[1][1]), stroke: "#fff", "stroke-opacity": 0.1, "stroke-width": 1 }, g);

    drawSurface(g, surface, P, col, uid);

    // Rim light along the top, the line the eye reads the block's shape by.
    el("polygon", { points: pts(quadTop(iso, 0, 0, w, d, 0)), fill: "none", stroke: "#fff", "stroke-opacity": 0.16, "stroke-width": 1.2 }, g);
  }

  function drawSurface(g, surface, P, col, uid) {
    const { iso, S } = P;
    for (const s of surface) {
      if (s.kind === "rect") {
        el("polygon", { points: pts(quadTop(iso, s.x0, s.y0, s.x1, s.y1, s.z || 0)), fill: col(s.fill), "fill-opacity": s.opacity }, g);
      } else if (s.kind === "line") {
        const a = iso(s.from[0], s.from[1], 0), b = iso(s.to[0], s.to[1], 0);
        el("line", {
          x1: r1(a[0]), y1: r1(a[1]), x2: r1(b[0]), y2: r1(b[1]),
          stroke: col(s.stroke), "stroke-width": s.width || 1.4, "stroke-opacity": s.opacity,
          "stroke-dasharray": s.dash ? s.dash.map(v => r1(v * S)).join(" ") : null
        }, g);
      } else if (s.kind === "zebra") {
        const a = s.along[0], b = s.along[1], c = s.across[0], dd = s.across[1];
        const n = Math.max(1, Math.floor((dd - c + s.gap) / (s.stripe + s.gap)));
        let o = c + (dd - c - (n * s.stripe + (n - 1) * s.gap)) / 2;
        for (let i = 0; i < n; i++, o += s.stripe + s.gap) {
          const q = s.axis === "x" ? quadTop(iso, a, o, b, o + s.stripe, 0) : quadTop(iso, o, a, o + s.stripe, b, 0);
          el("polygon", { points: pts(q), fill: col(s.fill || "marking"), "fill-opacity": s.opacity == null ? 0.9 : s.opacity }, g);
        }
      } else if (s.kind === "pool") {
        // A circle on the ground projects to an axis-aligned ellipse.
        const c = iso(s.at[0], s.at[1], 0);
        el("ellipse", { cx: r1(c[0]), cy: r1(c[1]), rx: r1(Math.SQRT2 * s.r * COS30 * S), ry: r1(Math.SQRT2 * s.r * 0.5 * S), fill: `url(#${uid}pool)` }, g);
      }
    }
  }

  // ---- Volumes --------------------------------------------------------
  function drawBox(g, o, P, col, rand, uid) {
    const { iso } = P;
    const x0 = o.x0, y0 = o.y0, x1 = o.x1, y1 = o.y1, h = o.h, z0 = o.z0 || 0;
    const c = col(o.wall || "wall");
    const left = [iso(x0, y1, z0 + h), iso(x1, y1, z0 + h), iso(x1, y1, z0), iso(x0, y1, z0)];
    const right = [iso(x1, y0, z0 + h), iso(x1, y1, z0 + h), iso(x1, y1, z0), iso(x1, y0, z0)];
    el("polygon", { points: pts(left), fill: shade(c, 0.82) }, g);
    el("polygon", { points: pts(right), fill: shade(c, 0.62) }, g);
    el("polygon", { points: pts(quadTop(iso, x0, y0, x1, y1, z0 + h)), fill: shade(c, 1.15), stroke: "#fff", "stroke-opacity": 0.14, "stroke-width": 1 }, g);

    if (o.windows !== false) {
      const floors = Math.max(1, Math.floor((h - 0.3) / 0.72));
      const win = (q, lit, k) => el("polygon", { points: pts(q), fill: lit ? col("window") : shade(c, k * 0.55), "fill-opacity": lit ? 0.92 : 1 }, g);
      for (let f = 0; f < floors; f++) {
        const za = z0 + 0.32 + f * 0.72, zb = za + 0.36;
        for (let x = x0 + 0.25; x + 0.26 <= x1 - 0.15; x += 0.5) {
          win([iso(x, y1, zb), iso(x + 0.26, y1, zb), iso(x + 0.26, y1, za), iso(x, y1, za)], rand() < 0.42, 0.82);
        }
        for (let y = y0 + 0.25; y + 0.26 <= y1 - 0.15; y += 0.5) {
          win([iso(x1, y, zb), iso(x1, y + 0.26, zb), iso(x1, y + 0.26, za), iso(x1, y, za)], rand() < 0.42, 0.62);
        }
      }
    }

    if (o.flag) {
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      const a = iso(cx, cy, z0 + h), b = iso(cx, cy, z0 + h + 0.95);
      el("line", { x1: r1(a[0]), y1: r1(a[1]), x2: r1(b[0]), y2: r1(b[1]), stroke: "#c9ced6", "stroke-width": 1.4 }, g);
      el("path", { d: `M${r1(b[0])} ${r1(b[1])} l15 3.5 l-15 3.5 z`, fill: col("accent") }, g);
    }
    if (o.unit) {
      const u = o.unit;
      drawBox(g, { x0: u[0], y0: u[1], x1: u[2], y1: u[3], h: 0.28, z0: z0 + h, wall: "#4a5262", windows: false }, P, col, rand, uid);
    }
  }

  // ---- Billboards -----------------------------------------------------
  // Drawn upright in local pixels with the origin at the foot, then
  // placed at the projected ground point. This is how 2.5D games stand
  // things on an isometric floor: readable, and cheap to author.
  function bikeGlyph(g, cx, cy, color, s) {
    const t = el("g", { transform: `translate(${cx},${cy}) scale(${s})`, fill: "none", stroke: color, "stroke-width": 1.4, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
    el("circle", { cx: -5.2, cy: 2.2, r: 3.6 }, t);
    el("circle", { cx: 5.2, cy: 2.2, r: 3.6 }, t);
    el("path", { d: "M-5.2 2.2 L-1.5 -3.4 L3.4 -3.4 L5.2 2.2 M-1.5 -3.4 L0.4 2.2 L-5.2 2.2 M3.4 -3.4 L2.7 -5.6 M1.4 -5.6 L4 -5.6 M-2.7 -4.8 L-0.4 -4.8" }, t);
  }

  const FACES = {
    bike(g) {
      el("circle", { cx: 0, cy: -48, r: 12, fill: "#1f5fbf", stroke: "#fff", "stroke-width": 1.6 }, g);
      bikeGlyph(g, 0, -47, "#fff", 0.95);
    },
    noBikes(g) {
      el("circle", { cx: 0, cy: -48, r: 12, fill: "#fff", stroke: "#c8202b", "stroke-width": 3.2 }, g);
      bikeGlyph(g, 0, -47, "#1a1a1a", 0.8);
    },
    giveWay(g) {
      el("polygon", { points: "-13,-59 13,-59 0,-36.5", fill: "#fff", stroke: "#c8202b", "stroke-width": 2.8, "stroke-linejoin": "round" }, g);
    },
    crossing(g) {
      el("rect", { x: -11, y: -59, width: 22, height: 22, rx: 2, fill: "#1f5fbf", stroke: "#fff", "stroke-width": 1.2 }, g);
      el("polygon", { points: "-7.5,-41.5 7.5,-41.5 0,-55", fill: "#fff" }, g);
      el("path", { d: "M-4 -43.5 h2 M-1 -43.5 h2 M2 -43.5 h2", stroke: "#111", "stroke-width": 1.6 }, g);
    },
    noEntry(g) {
      el("circle", { cx: 0, cy: -48, r: 12, fill: "#c8202b" }, g);
      el("rect", { x: -8, y: -50, width: 16, height: 4, fill: "#fff" }, g);
    }
  };

  const SPRITES = {
    trafficLight(g, o, ctx) {
      el("ellipse", { cx: 2, cy: 1, rx: 7, ry: 2.6, fill: "#000", "fill-opacity": 0.3 }, g);
      el("rect", { x: -1.5, y: -60, width: 3, height: 60, fill: "#1b1e25" }, g);
      el("rect", { x: -6.5, y: -84, width: 13, height: 27, rx: 2.5, fill: "#121419", stroke: "#2b2f38", "stroke-width": 1 }, g);
      const lamp = (cy, color) => {
        el("circle", { cx: 0, cy, r: 3.4, fill: "#2b2e35" }, g);
        return el("circle", { cx: 0, cy, r: 3.4, fill: color, filter: `url(#${ctx.uid}glow)`, opacity: 0 }, g);
      };
      ctx.lights.push({
        phase: o.phase || 0,
        red: lamp(-78, "#ff4a3d"), yellow: lamp(-70.5, "#ffc23d"), green: lamp(-63, "#37e07a")
      });
    },
    sign(g, o) {
      el("ellipse", { cx: 1.5, cy: 1, rx: 5, ry: 1.8, fill: "#000", "fill-opacity": 0.28 }, g);
      el("rect", { x: -1, y: -38, width: 2, height: 38, fill: "#9aa1ab" }, g);
      if (FACES[o.face]) FACES[o.face](g);
    },
    lamp(g, o, ctx) {
      el("ellipse", { cx: 1.5, cy: 1, rx: 5, ry: 1.8, fill: "#000", "fill-opacity": 0.3 }, g);
      el("rect", { x: -1.4, y: -78, width: 2.8, height: 78, fill: "#1b1e25" }, g);
      el("path", { d: "M0 -76 Q 8 -86 17 -79", stroke: "#1b1e25", "stroke-width": 2.4, fill: "none", "stroke-linecap": "round" }, g);
      el("rect", { x: 12, y: -80, width: 10, height: 3.6, rx: 1.8, fill: "#2b2f38" }, g);
      el("ellipse", { cx: 17, cy: -75.8, rx: 4.2, ry: 1.7, fill: ctx.col("light"), filter: `url(#${ctx.uid}glow)` }, g);
    },
    tree(g, o, ctx) {
      const t = el("g", { transform: `scale(${o.size || 1})` }, g);
      el("ellipse", { cx: 4, cy: 1.5, rx: 15, ry: 5, fill: "#000", "fill-opacity": 0.28 }, t);
      el("rect", { x: -1.8, y: -24, width: 3.6, height: 24, rx: 1, fill: ctx.col("trunk") }, t);
      el("circle", { cx: 0, cy: -42, r: 16, fill: ctx.col("leaf") }, t);
      el("circle", { cx: -9, cy: -34, r: 11, fill: shade(ctx.col("leaf"), 0.88) }, t);
      el("circle", { cx: 9, cy: -33, r: 12, fill: shade(ctx.col("leaf"), 1.08) }, t);
      el("circle", { cx: -5, cy: -48, r: 7, fill: shade(ctx.col("leaf"), 1.3), "fill-opacity": 0.7 }, t);
    },
    bush(g, o, ctx) {
      el("ellipse", { cx: 2, cy: 1, rx: 11, ry: 3.5, fill: "#000", "fill-opacity": 0.25 }, g);
      el("circle", { cx: -5, cy: -5, r: 6.5, fill: shade(ctx.col("leaf"), 0.9) }, g);
      el("circle", { cx: 4, cy: -6, r: 7.5, fill: ctx.col("leaf") }, g);
      el("circle", { cx: 0, cy: -10, r: 5.5, fill: shade(ctx.col("leaf"), 1.2) }, g);
    },
    rider(g, o, ctx) {
      const A = ctx.col("accent"), skin = "#d9dce3";
      el("ellipse", { cx: 0, cy: 1, rx: 13, ry: 3, fill: "#000", "fill-opacity": 0.3 }, g);
      el("polygon", { points: "9,-12 42,-20 42,-3", fill: `url(#${ctx.uid}beam)` }, g);
      const wheels = el("g", { fill: "none", stroke: skin, "stroke-width": 1.6 }, g);
      el("circle", { cx: -8, cy: -5, r: 5 }, wheels);
      el("circle", { cx: 8, cy: -5, r: 5 }, wheels);
      el("path", { d: "M-8 -5 L-2 -13 L6 -13 L8 -5 M-2 -13 L0 -5 L-8 -5 M6 -13 L5 -17 M3 -17.5 L7 -17.5", fill: "none", stroke: A, "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
      el("rect", { x: -4.2, y: -11.6, width: 5.4, height: 2.6, rx: 1, fill: "#2b2f38" }, g);
      const body = el("g", { fill: "none", stroke: skin, "stroke-width": 2.2, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
      el("path", { d: "M-4 -15 L0 -15" }, body);
      el("path", { d: "M-1.5 -15.5 L2.5 -27 M2.2 -25 L6 -17.5 M-1 -15 L2.5 -9 L0.5 -5" }, body);
      el("circle", { cx: 3.6, cy: -30.5, r: 3.2, fill: skin }, g);
      el("path", { d: "M0.2 -31 A3.6 3.6 0 0 1 7.1 -31.2 Z", fill: A }, g);
      el("circle", { cx: 9.2, cy: -12, r: 1.5, fill: "#fff6d0", filter: `url(#${ctx.uid}glow)` }, g);
      el("circle", { cx: -9.3, cy: -13, r: 1.2, fill: "#ff3b3b", filter: `url(#${ctx.uid}glow)` }, g);
    }
  };

  // ---- Pins -----------------------------------------------------------
  // The ring sits on the ground in the block layer and the label floats
  // in the nearer pin layer. The tether between them is redrawn every
  // frame from both layers' offsets: if it lived in either layer, the
  // parallax would slide its foot off the spot it is pointing at.
  function drawPins(ringsG, linesG, pinsG, recipe, P, col, lang) {
    const { iso } = P;
    const A = col("accent");
    const list = [];
    for (const p of recipe.pins || []) {
      const base = iso(p.at[0], p.at[1], p.z0 || 0), top = iso(p.at[0], p.at[1], p.z1);
      el("ellipse", { cx: r1(base[0]), cy: r1(base[1]), rx: 6.5, ry: 3.2, fill: A, "fill-opacity": 0.22, stroke: A, "stroke-opacity": 0.8, "stroke-width": 1.2 }, ringsG);
      el("circle", { cx: r1(base[0]), cy: r1(base[1]), r: 1.6, fill: A }, ringsG);
      const line = el("line", { stroke: A, "stroke-opacity": 0.6, "stroke-width": 1.1 }, linesG);

      const outer = el("g", {
        class: "ks-pin", transform: `translate(${r1(top[0])},${r1(top[1])})`,
        tabindex: 0, role: "button", "aria-label": p.n + ". " + textOf(p.label, lang)
      }, pinsG);
      // Three groups, each owning one transform: `outer` the position,
      // `counter` the scale that keeps labels a constant size however
      // small the scene is drawn, `inner` the CSS hover. One group with
      // two of them loses one — CSS transform replaces the attribute.
      const counter = el("g", null, outer);
      const inner = el("g", { class: "ks-pin-inner" }, counter);
      // A bigger, invisible target than the number itself, for fingers.
      const hit = el("circle", { cy: -12, r: 15, fill: "transparent" }, inner);
      const pill = el("rect", { class: "ks-pill", y: -23, height: 22, rx: 11, fill: "rgba(9,11,17,0.86)", stroke: A, "stroke-opacity": 0.45, "stroke-width": 1 }, inner);
      const num = el("circle", { cy: -12, r: 7.5, fill: A }, inner);
      const numT = el("text", { y: -8.4, "text-anchor": "middle", "font-size": 10, "font-weight": 700, fill: "#15161a" }, inner);
      numT.textContent = String(p.n);
      const label = el("text", { y: -8, "font-size": 12, "font-weight": 600, fill: "#eceae4", "letter-spacing": 0.2 }, inner);
      label.textContent = textOf(p.label, lang);

      let tw = 0;
      try { tw = label.getComputedTextLength(); } catch (e) { /* not laid out yet */ }
      if (!tw) tw = label.textContent.length * 6.6;
      const total = 6 + 15 + 6 + tw + 11, left = -total / 2;
      label.setAttribute("x", r1(left + 27));

      const pin = { base, top, line, outer, counter, inner, hit, pill, num, numT, label, p, full: { left, total }, state: "open" };
      layoutPin(pin, false, false);
      list.push(pin);
    }
    return list;
  }

  // Full: number and name in one pill. Compact, for a scene drawn small:
  // just the number, with the name shown only for the chapter the runner
  // is standing at. Seven names at a readable size do not fit across a
  // phone, and shrinking them until they fit makes them unreadable.
  function layoutPin(pin, compact, active) {
    const show = !compact || active;
    pin.label.style.display = show ? "" : "none";
    const left = show ? pin.full.left : -12, width = show ? pin.full.total : 24;
    const cx = show ? pin.full.left + 13.5 : 0;
    pin.pill.setAttribute("x", r1(left));
    pin.pill.setAttribute("width", r1(width));
    pin.num.setAttribute("cx", r1(cx));
    pin.numT.setAttribute("x", r1(cx));
    pin.hit.setAttribute("cx", r1(cx));
  }

  // done: a tick. locked: a padlock, dimmed, and the runner will not go.
  function paintPinState(pin, state, accent) {
    pin.state = state || "open";
    pin.num.setAttribute("fill", pin.state === "done" ? "#3ccf7f" : pin.state === "locked" ? "#5b6070" : accent);
    pin.numT.textContent = pin.state === "done" ? "✓" : pin.state === "locked" ? "\u{1F512}" : String(pin.p.n);
    pin.numT.setAttribute("font-size", pin.state === "locked" ? 8.5 : 10);
    pin.outer.setAttribute("opacity", pin.state === "locked" ? 0.62 : 1);
    pin.outer.setAttribute("aria-disabled", pin.state === "locked" ? "true" : "false");
  }

  // Opaque blend of two colours. The active pin's pill uses this rather
  // than a translucent tint: a translucent pill let whatever stands
  // behind it, a road sign for one, show through the label.
  function mix(hexA, hexB, t) {
    const rgb = hex => {
      let h = String(hex).replace("#", "");
      if (h.length === 3) h = h.split("").map(c => c + c).join("");
      const n = parseInt(h, 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };
    const a = rgb(hexA), b = rgb(hexB);
    return "#" + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, "0")).join("");
  }

  // ---- The runner -----------------------------------------------------
  // The learner, standing in the scene. Click a pin and he runs to it;
  // arriving is what opens that chapter, the way a figure on a game's
  // world map walks to a level before it starts.
  //
  // He runs on a graph the recipe supplies, not in a straight line. In a
  // course about the rules of the road that is the content: he keeps to
  // the sidewalks and crosses only at the zebras.
  function buildWalk(walk) {
    const nodes = walk.nodes, adj = Object.create(null);
    for (const id in nodes) adj[id] = [];
    for (const e of walk.edges) {
      const a = e[0], b = e[1];
      const d = Math.hypot(nodes[a][0] - nodes[b][0], nodes[a][1] - nodes[b][1]);
      adj[a].push([b, d]);
      adj[b].push([a, d]);
    }
    // Dijkstra. A dozen nodes, so the plain O(n^2) form is the right one.
    function route(from, to) {
      const dist = Object.create(null), prev = Object.create(null), todo = new Set(Object.keys(nodes));
      for (const id of todo) dist[id] = Infinity;
      dist[from] = 0;
      while (todo.size) {
        let u = null;
        for (const id of todo) if (u === null || dist[id] < dist[u]) u = id;
        todo.delete(u);
        if (u === to || dist[u] === Infinity) break;
        for (const [v, w] of adj[u]) {
          if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; prev[v] = u; }
        }
      }
      if (dist[to] === Infinity) return null;
      const out = [to];
      while (out[0] !== from) out.unshift(prev[out[0]]);
      return out;
    }
    return { nodes, route };
  }

  function makeRunner(g, ctx) {
    const skin = "#efd6c0", shirt = ctx.col("runner") || "#7b6cff", pants = "#2c3550";
    el("ellipse", { cx: 0, cy: 0.6, rx: 7, ry: 2.2, fill: "#000", "fill-opacity": 0.32 }, g);
    const flip = el("g", null, g);
    const body = el("g", null, flip);
    const limb = (x1, y1, x2, y2, color, w) =>
      el("line", { x1, y1, x2, y2, stroke: color, "stroke-width": w, "stroke-linecap": "round" }, body);
    // Far limbs first and darker, so the figure reads as having depth.
    const backArm = limb(1.6, -22.5, 1.6, -13.8, shade(shirt, 0.68), 2.4);
    const backLeg = limb(0, -12.5, 0, -0.6, shade(pants, 0.72), 2.8);
    el("line", { x1: 0, y1: -12.5, x2: 1.6, y2: -23, stroke: shirt, "stroke-width": 4.6, "stroke-linecap": "round" }, body);
    const frontLeg = limb(0, -12.5, 0, -0.6, pants, 2.8);
    const frontArm = limb(1.6, -22.5, 1.6, -13.8, shade(shirt, 1.12), 2.4);
    el("circle", { cx: 2.2, cy: -27.4, r: 3.7, fill: skin }, body);
    el("path", { d: "M-1.4 -28 A3.8 3.8 0 0 1 5.9 -28.6 Q2.4 -30.4 -1.4 -28 Z", fill: "#3a2a22" }, body);
    return { flip, body, backArm, backLeg, frontLeg, frontArm };
  }

  function poseRunner(R, phase, running, t) {
    const s = Math.sin(phase);
    const legA = running ? s * 38 : 0;
    const armA = running ? s * 46 : Math.sin(t / 700) * 5;
    R.frontLeg.setAttribute("transform", `rotate(${r1(legA)} 0 -12.5)`);
    R.backLeg.setAttribute("transform", `rotate(${r1(-legA)} 0 -12.5)`);
    R.frontArm.setAttribute("transform", `rotate(${r1(-armA)} 1.6 -22.5)`);
    R.backArm.setAttribute("transform", `rotate(${r1(armA)} 1.6 -22.5)`);
    const bob = running ? -Math.abs(Math.cos(phase)) * 1.8 : Math.sin(t / 900) * 0.4;
    // Leaning into the run, rotated about the feet.
    R.body.setAttribute("transform", `translate(0 ${r1(bob)}) rotate(${running ? 7 : 0})`);
  }

  // ---- Render ---------------------------------------------------------
  function injectStyle() {
    if (document.getElementById("ks-style")) return;
    const st = document.createElement("style");
    st.id = "ks-style";
    st.textContent =
      ".ks-scene{display:block;width:100%;height:auto;overflow:visible}" +
      ".ks-pin{cursor:pointer;outline:none}" +
      ".ks-pin-inner{transition:transform .18s ease;transform-box:fill-box;transform-origin:50% 100%}" +
      ".ks-pin:hover .ks-pin-inner,.ks-pin:focus-visible .ks-pin-inner{transform:scale(1.08)}" +
      ".ks-pin:hover .ks-pill{stroke-opacity:1}" +
      ".ks-pin:focus-visible .ks-pill{stroke-opacity:1;stroke-width:2}" +
      ".ks-pulse{transform-box:fill-box;transform-origin:center;animation:ks-pulse .9s ease-out forwards}" +
      "@keyframes ks-pulse{from{transform:scale(1);opacity:1}to{transform:scale(3.4);opacity:0}}" +
      ".ks-pin[aria-disabled=true]{cursor:not-allowed}" +
      ".ks-shake{animation:ks-shake .4s ease}" +
      "@keyframes ks-shake{20%{transform:translateX(-4px)}40%{transform:translateX(4px)}60%{transform:translateX(-3px)}80%{transform:translateX(2px)}}" +
      "@media (prefers-reduced-motion:reduce){.ks-pulse{animation:none;opacity:0}.ks-shake{animation:none}}";
    document.head.appendChild(st);
  }

  function render(container, id, opts) {
    const recipe = recipes[id];
    if (!recipe || !container) return { destroy() {} };
    opts = opts || {};
    const lang = opts.lang || "en";
    const uid = "ks" + (++uidCounter) + "-";
    const palette = recipe.palette || {};
    const col = c => (c && palette[c]) || c;
    const rand = rng(recipe.seed || 1);
    const P = projector(recipe.block);
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    injectStyle();
    const svg = el("svg", {
      viewBox: `0 0 ${VIEW_W} ${VIEW_H}`, class: "ks-scene", role: "img",
      "aria-label": textOf(recipe.title, lang), preserveAspectRatio: "xMidYMid meet"
    });
    container.appendChild(svg);   // before the pins, which measure their text
    defs(svg, uid, col);

    const far = el("g", { mask: `url(#${uid}edges)` }, svg);
    const block = el("g", null, svg);
    const lines = el("g", null, svg);
    const pinsLayer = el("g", null, svg);

    drawBackdrop(far, recipe, P, col, rand, uid);
    drawBlock(block, recipe, P, col, uid);

    // Objects, back to front. For billboards depth is x + y of the foot;
    // for a box it is the centre, which stops a sign standing in front
    // of a building's face from being painted over by it.
    const objectsG = el("g", null, block);
    const ctx = { uid, col, lights: [] };
    // Sprites are drawn for a 12-unit block; spriteScale lets a recipe
    // exaggerate them the way a diorama does, so small things stay
    // legible on a phone.
    const k = (P.S / 36.57) * (recipe.spriteScale || 1);
    const items = [];
    for (const o of recipe.objects || []) {
      if (o.kind === "box") items.push({ depth: (o.x0 + o.x1) / 2 + (o.y0 + o.y1) / 2, o });
      else items.push({ depth: o.at[0] + o.at[1], o });
    }
    items.sort((a, b) => a.depth - b.depth);
    for (const it of items) {
      const g = el("g", { "data-depth": it.depth }, objectsG);
      if (it.o.kind === "box") { drawBox(g, it.o, P, col, rand, uid); continue; }
      const p = P.iso(it.o.at[0], it.o.at[1], 0);
      g.setAttribute("transform", `translate(${r1(p[0])},${r1(p[1])}) scale(${r1(k * 100) / 100})`);
      if (SPRITES[it.o.kind]) SPRITES[it.o.kind](g, it.o, ctx);
    }

    // Movers walk a straight line on the ground and re-sort themselves
    // among the objects as they go, so they pass behind a sign rather
    // than through it.
    const movers = [];
    for (const m of recipe.movers || []) {
      const g = el("g", null, objectsG);
      if (SPRITES[m.kind]) SPRITES[m.kind](g, m, ctx);
      movers.push({ m, g });
    }

    const rings = el("g", null, block);
    const pins = drawPins(rings, lines, pinsLayer, recipe, P, col, lang);
    const kStr = r1(k * 100) / 100;

    function sortInto(node, depth) {
      let before = null;
      for (const c of objectsG.children) {
        if (c !== node && c.dataset.depth !== undefined && Number(c.dataset.depth) > depth) { before = c; break; }
      }
      if (node.nextSibling !== before) objectsG.insertBefore(node, before);
    }

    // ---- Runner ----
    const RUN_SPEED = 3.2;   // world units a second; a sidewalk crossing in ~1 s
    let runner = null;
    // Chapter states come from the caller, who knows the learner's
    // progress; the recipe only knows the picture.
    pins.forEach((p, i) => paintPinState(p, opts.pinState ? opts.pinState(p.p, i) : "open", col("accent")));

    if (recipe.walk) {
      const W = buildWalk(recipe.walk);
      // Unless told otherwise he stands at the next chapter to do: the
      // first one that is neither done nor locked.
      const startIdx = typeof opts.start === "number" ? opts.start : Math.max(0, pins.findIndex(p => p.state === "open"));
      const startPin = (recipe.pins || [])[startIdx];
      const start = (startPin && startPin.stand) || recipe.walk.start || (recipe.pins && recipe.pins[0] && recipe.pins[0].stand);
      if (W.nodes[start]) {
        const g = el("g", null, objectsG);
        runner = {
          W, g, R: makeRunner(g, ctx), node: start, pos: W.nodes[start].slice(),
          path: null, pathIds: null, seg: 0, target: -1, phase: 0, face: 1, hop: 0
        };
      }
    }

    let here = -1, compact = false;
    function setHere(i) {
      here = i;
      pins.forEach((p, j) => {
        const on = j === i;
        p.pill.setAttribute("fill", on ? mix("#090b11", col("accent"), 0.26) : "rgba(9,11,17,0.86)");
        p.pill.setAttribute("stroke-opacity", on ? 1 : 0.45);
        p.outer.classList.toggle("ks-here", on);
        layoutPin(p, compact, on);
      });
    }

    // Labels hold a constant on-screen size: the counter-scale undoes
    // whatever scale the browser drew the scene at. Below ~620 px wide
    // the names fold away to numbers, see layoutPin.
    function relayout() {
      const w = svg.getBoundingClientRect().width;
      if (!w) return;
      const s = w / VIEW_W;
      const c = clamp(1 / s, 0.85, 2.6);
      compact = s < 0.62;
      pins.forEach((p, j) => {
        p.counter.setAttribute("transform", `scale(${r1(c * 100) / 100})`);
        layoutPin(p, compact, j === here);
      });
    }

    function refuse(i) {
      const n = pins[i].inner;
      n.classList.remove("ks-shake");
      void n.getBoundingClientRect();   // restart the animation if it is mid-run
      n.classList.add("ks-shake");
    }

    function pulse(i) {
      const b = pins[i].base;
      const ring = el("ellipse", { class: "ks-pulse", cx: r1(b[0]), cy: r1(b[1]), rx: 7, ry: 3.4, fill: "none", stroke: col("accent"), "stroke-width": 1.6 }, rings);
      setTimeout(() => ring.remove(), 950);
    }

    function arrive(i) {
      setHere(i);
      pulse(i);
      if (runner) runner.hop = performance.now();
      if (opts.onChapter) {
        const p = recipe.pins[i];
        opts.onChapter({ index: i, n: p.n, topic: p.topic, label: textOf(p.label, lang) });
      }
    }

    function placeRunner(now) {
      const r = runner;
      const t = r.hop ? now - r.hop : Infinity;
      const hopY = t < 380 ? -36 * (t / 380) * (1 - t / 380) : 0;   // a 9 px hop on arrival
      const p = P.iso(r.pos[0], r.pos[1], 0);
      r.g.setAttribute("transform", `translate(${r1(p[0])},${r1(p[1] + hopY)}) scale(${kStr})`);
      r.R.flip.setAttribute("transform", r.face < 0 ? "scale(-1 1)" : "scale(1 1)");
      poseRunner(r.R, r.phase, !!r.path, now);
      sortInto(r.g, r.pos[0] + r.pos[1]);
    }

    function stepRunner(dt) {
      const r = runner;
      if (!r.path) return;
      let left = dt * RUN_SPEED;
      r.phase += dt * RUN_SPEED * 6.5;
      while (left > 0 && r.path) {
        const b = r.path[r.seg + 1];
        const dx = b[0] - r.pos[0], dy = b[1] - r.pos[1], d = Math.hypot(dx, dy);
        // Screen x runs along (x - y), so that sign decides which way he faces.
        if (Math.abs(dx - dy) > 1e-6) r.face = dx - dy > 0 ? 1 : -1;
        if (d <= left) {
          r.pos = b.slice();
          left -= d;
          r.seg++;
          if (r.seg >= r.path.length - 1) {
            r.node = r.pathIds[r.pathIds.length - 1];
            r.path = null;
            arrive(r.target);
          }
        } else {
          r.pos = [r.pos[0] + (dx / d) * left, r.pos[1] + (dy / d) * left];
          left = 0;
        }
      }
    }

    function goTo(i) {
      const pin = recipe.pins && recipe.pins[i];
      if (!pin) return;
      if (pins[i].state === "locked") { refuse(i); return; }
      const r = runner;
      if (!r || !pin.stand || !r.W.nodes[pin.stand]) { arrive(i); return; }
      // Mid-run he finishes the stretch he is on, then turns: rerouting
      // from wherever he stands would cut across a road.
      let from = r.node, lead = [];
      if (r.path) { from = r.pathIds[r.seg + 1]; lead = [r.pos.slice()]; }
      if (!r.path && from === pin.stand) { arrive(i); return; }
      const ids = r.W.route(from, pin.stand);
      if (!ids) return;
      if (reduced) {
        r.pos = r.W.nodes[pin.stand].slice();
        r.node = pin.stand;
        r.path = null;
        arrive(i);
        placeRunner(performance.now());
        return;
      }
      r.path = lead.concat(ids.map(id => r.W.nodes[id].slice()));
      r.pathIds = (lead.length ? [null] : []).concat(ids);
      r.seg = 0;
      r.target = i;
      r.node = null;
      setHere(-1);
      if (visible && !raf) raf = requestAnimationFrame(frame);
    }

    pins.forEach((p, i) => {
      p.outer.addEventListener("click", () => goTo(i));
      p.outer.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goTo(i); }
      });
    });
    if (runner) setHere((recipe.pins || []).findIndex(p => p.stand === runner.node));
    relayout();
    let ro = null;
    if ("ResizeObserver" in window) { ro = new ResizeObserver(relayout); ro.observe(svg); }

    // ---- Motion ----
    const layers = [{ g: far, f: 0.35 }, { g: block, f: 1 }, { g: pinsLayer, f: 1.9 }];
    const AMP = 11;
    let tx = 0, ty = 0, cx = 0, cy = 0, lastMove = -1e9, raf = 0, visible = true, lastT = 0;

    function onMove(e) {
      const r = svg.getBoundingClientRect();
      if (!r.width) return;
      tx = clamp(((e.clientX - r.left) / r.width - 0.5) * 2, -1, 1);
      ty = clamp(((e.clientY - r.top) / r.height - 0.5) * 2, -1, 1);
      lastMove = performance.now();
    }

    function placeMover(mv, now) {
      const m = mv.m, len = m.to - m.from;
      const x = reduced ? m.from + len * 0.2 : m.from + ((now / 1000) * m.speed) % len;
      const fade = reduced ? 1 : clamp(Math.min(x - m.from, m.to - x) / 0.6, 0, 1);
      const p = P.iso(x, m.y, 0);
      mv.g.setAttribute("transform", `translate(${r1(p[0])},${r1(p[1])}) scale(${kStr})`);
      mv.g.setAttribute("opacity", r1(fade * 100) / 100);
      sortInto(mv.g, x + m.y);
    }

    function setLights(now) {
      for (const L of ctx.lights) {
        const t = reduced ? (L.phase ? 6 : 1) : ((now / 1000) + L.phase) % 10;
        L.green.setAttribute("opacity", t < 4 ? 1 : 0);
        L.yellow.setAttribute("opacity", t >= 4 && t < 5 ? 1 : 0);
        L.red.setAttribute("opacity", t >= 5 ? 1 : 0);
      }
    }

    function frame(now) {
      raf = 0;
      // Capped, so a tab coming back from the background does not move
      // the runner several streets in a single frame.
      const dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 0;
      lastT = now;
      if (!reduced && now - lastMove > 2500) {
        tx = Math.sin(now / 4200) * 0.45;
        ty = Math.cos(now / 5300) * 0.3;
      }
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      const shift = f => [-cx * AMP * f, -cy * AMP * 0.6 * f];
      for (const L of layers) {
        const s = shift(L.f);
        L.g.setAttribute("transform", `translate(${r1(s[0])},${r1(s[1])})`);
      }
      const sb = shift(1), sp = shift(1.9);
      for (const p of pins) {
        p.line.setAttribute("x1", r1(p.base[0] + sb[0]));
        p.line.setAttribute("y1", r1(p.base[1] + sb[1]));
        p.line.setAttribute("x2", r1(p.top[0] + sp[0]));
        p.line.setAttribute("y2", r1(p.top[1] + sp[1] - 1));
      }
      setLights(now);
      for (const mv of movers) placeMover(mv, now);
      if (runner) { stepRunner(dt); placeRunner(now); }
      if (visible && !reduced) raf = requestAnimationFrame(frame);
    }

    // Off screen, nothing runs. A phone scrolling a lesson should not be
    // animating a traffic light it cannot see.
    let io = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(frame);
      });
      io.observe(svg);
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    frame(performance.now());

    return {
      svg,
      goTo,
      destroy() {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        visible = false;
        window.removeEventListener("pointermove", onMove);
        if (io) io.disconnect();
        if (ro) ro.disconnect();
        svg.remove();
      }
    };
  }

  function register(id, recipe) { recipes[id] = recipe; }
  function has(id) { return !!recipes[id]; }

  window.Dojo = window.Dojo || {};
  Dojo.Scenes = { register, render, has };
})();
