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
//   onChapter({ index, n, topic, unit, label, act, say, icon }) fires
//   when the runner arrives, onPick({ ..., el }) the moment a pin is
//   tapped, and onPass({ index, n }) as he runs past another pin's spot. A pin may also carry `act`, naming a piece that does
//   something when he gets there (the start screen's bell swings), and
//   `say` and `icon`, a sentence and a symbol for the caller to show.
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

    // != null, not ||: a day scene asks for 0 stars, and 0 must mean 0.
    for (let i = 0; i < (bd.stars != null ? bd.stars : 46); i++) {
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

    if (recipe.walls) drawWalls(g, recipe, P, col, uid);
  }

  // ---- A room: the block with its two back walls standing ----------------
  // The cut-away room of a diorama. Only the two walls at the back are
  // built, so the camera looks into the room over where the front walls
  // would be; their cut ends and tops are drawn so the walls read as
  // having thickness. Drawn after the floor and before every object, so
  // whatever stands in the room is in front of them.
  function drawWalls(g, recipe, P, col, uid) {
    const { iso } = P;
    const W = recipe.block.w, D = recipe.block.d;
    const spec = recipe.walls, H = spec.height || 3.6, t = spec.thickness || 0.22;
    const base = col(spec.color || "wall");
    const quad = (pts4, fill) => el("polygon", { points: pts(pts4), fill }, g);

    quad([iso(0, 0, 0), iso(W, 0, 0), iso(W, 0, H), iso(0, 0, H)], shade(base, 0.95));   // back, faces the viewer
    quad([iso(0, 0, 0), iso(0, D, 0), iso(0, D, H), iso(0, 0, H)], shade(base, 0.78));   // left
    // Skirting along the foot of both walls.
    quad([iso(0, 0, 0), iso(W, 0, 0), iso(W, 0, 0.14), iso(0, 0, 0.14)], shade(base, 0.62));
    quad([iso(0, 0, 0), iso(0, D, 0), iso(0, D, 0.14), iso(0, 0, 0.14)], shade(base, 0.52));

    for (const a of spec.art || []) drawWallArt(g, a, P, col, !!recipe.isDay);

    // The cut: each wall's open end, then both tops as one L.
    quad([iso(W, -t, 0), iso(W, 0, 0), iso(W, 0, H), iso(W, -t, H)], shade(base, 0.6));
    quad([iso(-t, D, 0), iso(0, D, 0), iso(0, D, H), iso(-t, D, H)], shade(base, 0.7));
    el("polygon", {
      points: pts([iso(-t, -t, H), iso(W, -t, H), iso(W, 0, H), iso(0, 0, H), iso(0, D, H), iso(-t, D, H)]),
      fill: shade(col(spec.cap || base), 1.2), stroke: "#fff", "stroke-opacity": 0.18, "stroke-width": 1
    }, g);
  }

  // Art lives in the wall's own plane. The group's matrix maps local
  // pixels (u along the wall, v downward) onto the wall, so a rectangle
  // or a line of text drawn flat comes out in isometric perspective. On
  // the left wall u runs toward the viewer's right, so text still reads
  // left to right instead of mirrored.
  function drawWallArt(g, a, P, col, day) {
    const { iso, S } = P;
    const len = (a.to - a.from) * S, h = (a.z1 - a.z0) * S;
    const o = a.wall === "left" ? iso(0, a.to, a.z1) : iso(a.from, 0, a.z1);
    const m = a.wall === "left"
      ? `matrix(${r1(COS30 * 1000) / 1000},-0.5,0,1,${r1(o[0])},${r1(o[1])})`
      : `matrix(${r1(COS30 * 1000) / 1000},0.5,0,1,${r1(o[0])},${r1(o[1])})`;
    const grp = el("g", { transform: m }, g);
    if (WALL_ART[a.art]) WALL_ART[a.art](grp, len, h, a, col, day);
  }

  const MONO = "ui-monospace, Consolas, monospace";
  const WALL_ART = {
    whiteboard(g, w, h, a) {
      el("rect", { width: r1(w), height: r1(h), rx: 2, fill: "#aeb6c3" }, g);
      el("rect", { x: 4, y: 4, width: r1(w - 8), height: r1(h - 12), fill: "#eef2f7" }, g);
      el("rect", { x: 10, y: r1(h - 8), width: r1(w - 20), height: 5, rx: 1, fill: "#8d96a5" }, g);
      (a.lines || []).forEach((line, i) => {
        const tx = el("text", { x: 12, y: 26 + i * 22, "font-size": 16, "font-weight": 700,
          "font-family": "'Segoe Print', 'Comic Sans MS', cursive", fill: i % 2 ? "#c0392b" : "#1d3b8a" }, g);
        tx.textContent = line;
      });
    },
    screen(g, w, h, a) {
      el("rect", { width: r1(w), height: r1(h), rx: 3, fill: "#0b0f16" }, g);
      el("rect", { x: 5, y: 5, width: r1(w - 10), height: r1(h - 10), fill: "#061a10" }, g);
      const lines = a.lines || [];
      lines.forEach((line, i) => {
        const tx = el("text", { x: 11, y: 20 + i * 14, "font-size": 11, "font-family": MONO, fill: "#3ce68a" }, g);
        tx.textContent = line;
      });
      el("rect", { class: "ks-blink", x: 11, y: r1(10 + lines.length * 14), width: 7, height: 11, fill: "#3ce68a" }, g);
    },
    poster(g, w, h, a) {
      el("rect", { width: r1(w), height: r1(h), rx: 2, fill: a.bg || "#1e2a44", stroke: "#0b1020", "stroke-width": 2 }, g);
      const title = el("text", { x: r1(w / 2), y: 18, "text-anchor": "middle", "font-size": 11, "font-weight": 800,
        "letter-spacing": 1.5, "font-family": MONO, fill: a.ink || "#9fd3ff" }, g);
      title.textContent = a.title || "";
      if (a.diagram === "cpu") {
        // Von Neumann in three boxes: the processor, memory, input/output.
        const bx = (x, y, bw, label) => {
          el("rect", { x: r1(x), y: r1(y), width: r1(bw), height: 22, rx: 3, fill: "none", stroke: a.ink || "#9fd3ff", "stroke-width": 1.6 }, g);
          const t2 = el("text", { x: r1(x + bw / 2), y: r1(y + 15), "text-anchor": "middle", "font-size": 10, "font-weight": 700, "font-family": MONO, fill: "#e8eefc" }, g);
          t2.textContent = label;
        };
        const cw = (w - 30) / 2;
        bx(10, 30, cw, "CPU");
        bx(20 + cw, 30, cw, "RAM");
        bx(10 + cw / 2, h - 34, cw + 10, "I/O");
        el("path", { d: `M${r1(10 + cw)} 41 H${r1(20 + cw)} M${r1(10 + cw / 2)} 52 V${r1(h - 34)} M${r1(20 + cw * 1.5)} 52 V${r1(h - 34)}`,
          stroke: "#f2c14e", "stroke-width": 1.6, fill: "none" }, g);
      } else if (a.diagram === "net") {
        // A small neural network: three layers, every node joined forward.
        const layers = [3, 4, 2], cols = layers.length;
        const pos = layers.map((n, li) => Array.from({ length: n }, (_, k) =>
          [r1(18 + li * (w - 36) / (cols - 1)), r1(34 + (k + 0.5) * (h - 44) / n)]));
        for (let li = 0; li < cols - 1; li++) {
          for (const p of pos[li]) for (const q of pos[li + 1]) {
            el("line", { x1: p[0], y1: p[1], x2: q[0], y2: q[1], stroke: a.ink || "#9fd3ff", "stroke-opacity": 0.45, "stroke-width": 1 }, g);
          }
        }
        pos.flat().forEach(p => el("circle", { cx: p[0], cy: p[1], r: 4, fill: "#f2c14e" }, g));
      }
    },
    // A window: stars and the moon at night; by day (a recipe's daylight
    // view) the scene's own sky colour, a cloud and the sun, unless
    // Custom asks for stars whatever the hour (windowView below).
    window(g, w, h, a, col, day) {
      const daylight = day && windowView() !== "stars";
      el("rect", { width: r1(w), height: r1(h), rx: 2, fill: "#5d6a87" }, g);
      el("rect", { x: 5, y: 5, width: r1(w - 10), height: r1(h - 10), fill: daylight ? col("window") : "#0d1a38" }, g);
      if (daylight) {
        el("circle", { cx: r1(w * 0.72), cy: r1(h * 0.34), r: 7, fill: "#ffd76a" }, g);
        el("ellipse", { cx: r1(w * 0.36), cy: r1(h * 0.62), rx: r1(w * 0.16), ry: 4.5, fill: "#fff", "fill-opacity": 0.9 }, g);
        el("ellipse", { cx: r1(w * 0.46), cy: r1(h * 0.58), rx: r1(w * 0.1), ry: 5.5, fill: "#fff", "fill-opacity": 0.9 }, g);
      } else {
        [[0.2, 0.25], [0.7, 0.2], [0.45, 0.55], [0.82, 0.62], [0.3, 0.8]].forEach(([fx, fy]) =>
          el("circle", { cx: r1(5 + fx * (w - 10)), cy: r1(5 + fy * (h - 10)), r: 1.3, fill: "#fff", "fill-opacity": 0.85 }, g));
        el("circle", { cx: r1(w * 0.72), cy: r1(h * 0.36), r: 7, fill: "#f4f1e4", "fill-opacity": 0.9 }, g);
      }
      el("path", { d: `M${r1(w / 2)} 5 V${r1(h - 5)} M5 ${r1(h / 2)} H${r1(w - 5)}`, stroke: "#5d6a87", "stroke-width": 3 }, g);
    }
  };

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

    // A server rack: rack-unit seams and rows of status lights on the face
    // toward the viewer, a few of them blinking out of step.
    if (o.leds) {
      for (let z = z0 + 0.25; z < z0 + h - 0.15; z += 0.3) {
        el("polyline", { points: pts([iso(x0, y1, z), iso(x1, y1, z)]), fill: "none", stroke: "#000", "stroke-opacity": 0.35, "stroke-width": 1 }, g);
        for (let x = x0 + 0.18, i = 0; x + 0.08 < x1 - 0.1 && i < 5; x += 0.22, i++) {
          const on = rand();
          if (on < 0.35) continue;
          const led = el("polygon", {
            points: pts([iso(x, y1, z + 0.13), iso(x + 0.08, y1, z + 0.13), iso(x + 0.08, y1, z + 0.07), iso(x, y1, z + 0.07)]),
            fill: on < 0.8 ? "#3ce68a" : "#ffb547"
          }, g);
          if (on > 0.88) { led.setAttribute("class", "ks-blink"); led.style.animationDelay = r1(rand() * 2) + "s"; }
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

    // A door on one of the two faces toward the viewer: "x" is the face
    // at x1, "y" the face at y1. Dark, centred, with a lit sill.
    if (o.door) {
      const dh = Math.min(1.0, h * 0.4), half = 0.24;
      const q = o.door === "x"
        ? (() => { const m = (y0 + y1) / 2; return [iso(x1, m - half, z0), iso(x1, m + half, z0), iso(x1, m + half, z0 + dh), iso(x1, m - half, z0 + dh)]; })()
        : (() => { const m = (x0 + x1) / 2; return [iso(m - half, y1, z0), iso(m + half, y1, z0), iso(m + half, y1, z0 + dh), iso(m - half, y1, z0 + dh)]; })();
      el("polygon", { points: pts(q), fill: "#0d0f14" }, g);
      el("polyline", { points: pts([q[0], q[1]]), fill: "none", stroke: col("light"), "stroke-opacity": 0.55, "stroke-width": 1.2 }, g);
    }

    // A giant book lying flat: the box is its cover, the face toward the
    // left shows the pages and the face toward the right is the spine,
    // with a gold band where the title would be.
    if (o.book) {
      const lip = Math.min(0.06, h * 0.2), zA = z0 + lip, zB = z0 + h - lip;
      el("polygon", { points: pts([iso(x0 + 0.05, y1, zB), iso(x1 - 0.05, y1, zB), iso(x1 - 0.05, y1, zA), iso(x0 + 0.05, y1, zA)]), fill: "#efe6cf" }, g);
      for (let k = 1; k < 3; k++) {
        const z = zA + (zB - zA) * k / 3;
        el("polyline", { points: pts([iso(x0 + 0.05, y1, z), iso(x1 - 0.05, y1, z)]), fill: "none", stroke: "#cbbf9f", "stroke-width": 0.7 }, g);
      }
      const ya = y0 + (y1 - y0) * 0.3, yb = y0 + (y1 - y0) * 0.7, zm = (zA + zB) / 2;
      el("polygon", { points: pts([iso(x1, ya, zm + 0.05), iso(x1, yb, zm + 0.05), iso(x1, yb, zm - 0.05), iso(x1, ya, zm - 0.05)]), fill: "#e2bd5a" }, g);
    }

    // A roof on the top face. By default a pyramid: the two slopes that
    // face the viewer, meeting at a ridge over the near corner, with a
    // finial. With `gable: "x"` it is pitched, its ridge along x, so its
    // triangular end (a temple's pediment) faces the viewer's right; with
    // "y" the ridge runs along y and the end faces left. Only the slope
    // and the end toward the viewer are drawn; the ridge hides the rest.
    if (o.roof) {
      const top = z0 + h, rh = o.roof.h, rc = col(o.roof.color || "roof");
      const end = col(o.roof.end || o.wall || "wall");
      const ridge = (a, b) => el("polyline", { points: pts([a, b]), fill: "none", stroke: "#fff", "stroke-opacity": 0.16, "stroke-width": 1 }, g);
      if (o.roof.gable === "x") {
        const ym = (y0 + y1) / 2;
        el("polygon", { points: pts([iso(x0, y1, top), iso(x1, y1, top), iso(x1, ym, top + rh), iso(x0, ym, top + rh)]), fill: shade(rc, 0.85) }, g);
        el("polygon", { points: pts([iso(x1, y0, top), iso(x1, y1, top), iso(x1, ym, top + rh)]), fill: shade(end, 0.66) }, g);
        ridge(iso(x0, ym, top + rh), iso(x1, ym, top + rh));
      } else if (o.roof.gable === "y") {
        const xm = (x0 + x1) / 2;
        el("polygon", { points: pts([iso(x1, y0, top), iso(x1, y1, top), iso(xm, y1, top + rh), iso(xm, y0, top + rh)]), fill: shade(rc, 0.62) }, g);
        el("polygon", { points: pts([iso(x0, y1, top), iso(x1, y1, top), iso(xm, y1, top + rh)]), fill: shade(end, 0.85) }, g);
        ridge(iso(xm, y0, top + rh), iso(xm, y1, top + rh));
      } else {
        const apex = iso((x0 + x1) / 2, (y0 + y1) / 2, top + rh), near = iso(x1, y1, top);
        el("polygon", { points: pts([iso(x0, y1, top), near, apex]), fill: shade(rc, 0.85) }, g);
        el("polygon", { points: pts([iso(x1, y0, top), near, apex]), fill: shade(rc, 0.62) }, g);
        ridge(near, apex);
        el("circle", { cx: r1(apex[0]), cy: r1(apex[1] - 2), r: 2.6, fill: col("accent") }, g);
      }
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
      // Lit at night; by day the glass is just glass.
      el("ellipse", ctx.day
        ? { cx: 17, cy: -75.8, rx: 4.2, ry: 1.7, fill: "#cfd4da" }
        : { cx: 17, cy: -75.8, rx: 4.2, ry: 1.7, fill: ctx.col("light"), filter: `url(#${ctx.uid}glow)` }, g);
    },
    tree(g, o, ctx) {
      const t = el("g", { transform: `scale(${o.size || 1})` }, g);
      el("ellipse", { cx: 4, cy: 1.5, rx: 15, ry: 5, fill: "#000", "fill-opacity": 0.28 }, t);
      el("rect", { x: -1.8, y: -24, width: 3.6, height: 24, rx: 1, fill: ctx.col("trunk") }, t);
      el("circle", { cx: 0, cy: -42, r: 16, fill: ctx.col("leaf") }, t);
      el("circle", { cx: -9, cy: -34, r: 11, fill: shade(ctx.col("leaf"), 0.88) }, t);
      el("circle", { cx: 9, cy: -33, r: 12, fill: shade(ctx.col("leaf"), 1.08) }, t);
      el("circle", { cx: -5, cy: -48, r: 7, fill: shade(ctx.col("leaf"), 1.3), "fill-opacity": 0.7 }, t);
      // In bloom: the same tree with flowers over the crown.
      if (o.blossom) {
        [[-10, -40, 3.2], [-3, -52, 2.8], [6, -46, 3.4], [12, -36, 2.8], [-12, -29, 2.6], [2, -36, 3],
         [8, -27, 2.4], [-5, -44, 2.4], [13, -45, 2.2], [-1, -28, 2.2]]
          .forEach(([cx, cy, r], i) => el("circle", { cx, cy, r, fill: shade(ctx.col("blossom"), i % 3 ? 1 : 1.15) }, t));
      }
      // An orange tree: fruit hanging in the crown.
      if (o.fruit) {
        [[-8, -38], [4, -49], [10, -31], [-11, -27], [1, -33], [7, -42], [-4, -46]]
          .forEach(([cx, cy], i) => el("circle", { cx, cy, r: 2.6, fill: shade(ctx.col(o.fruit), i % 2 ? 1 : 1.12) }, t));
      }
    },
    // ---- People, animals and things in the start screen's garden ----
    // A visitor facing the viewer, standing or, with `sit`, seated: the
    // body drops by the height of a seat and the shins hang down from it.
    // `hold` is what is in the near hand: a cup, a book or a plate.
    person(g, o, ctx) {
      const skin = o.skin || "#e9c8a8", shirt = ctx.col(o.shirt || (o.toga ? "toga" : "#5b8def")), pants = o.pants || "#2c3550";
      // sit: true is on a seat; sit: "ground" is cross-legged on the ground.
      const dy = o.sit === "ground" ? 9.5 : o.sit ? 3 : 0, Y = v => v + dy;
      el("ellipse", { cx: 0, cy: 0.6, rx: 7, ry: 2.2, fill: "#000", "fill-opacity": 0.3 }, g);
      const p = el("g", { class: o.bob ? "ks-bob" : null }, g);
      if (o.toga) {
        // A toga: one draped robe from the shoulders to the feet, with a
        // fold across it (for the Roman forum, scenes/philosophy.js).
        el("path", { d: `M-4.4 ${Y(-23)} Q0 ${Y(-25.5)} 4.4 ${Y(-23)} L5.8 -0.8 L-5.8 -0.8 Z`, fill: shirt }, p);
        el("path", { d: `M-3.6 ${Y(-21.5)} Q1.5 ${Y(-14)} 5.2 ${Y(-6)}`, stroke: shade(shirt, 0.78), "stroke-width": 1.3, fill: "none" }, p);
      } else if (o.sit === "ground") {
        el("ellipse", { cx: 0, cy: -1.6, rx: 6.2, ry: 2.1, fill: pants }, p);
      } else if (o.sit) {
        const leg = (s, c) => el("path", { d: `M${s * 2} -8.5 L${s * 2.9} -6.6 L${s * 2.5} -0.6`, stroke: c, "stroke-width": 2.6, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, p);
        leg(-1, shade(pants, 0.8));
        leg(1, pants);
      } else {
        el("line", { x1: -1.6, y1: -12, x2: -1.8, y2: -0.6, stroke: shade(pants, 0.8), "stroke-width": 2.8, "stroke-linecap": "round" }, p);
        el("line", { x1: 1.6, y1: -12, x2: 1.8, y2: -0.6, stroke: pants, "stroke-width": 2.8, "stroke-linecap": "round" }, p);
      }
      if (!o.toga) el("path", { d: `M-4.2 ${Y(-11.5)} L-3.6 ${Y(-23)} Q0 ${Y(-25)} 3.6 ${Y(-23)} L4.2 ${Y(-11.5)} Z`, fill: shirt }, p);
      el("line", { x1: -3.8, y1: Y(-21.5), x2: o.sit ? -3 : -4.8, y2: Y(-13.5), stroke: shade(shirt, 0.8), "stroke-width": 2.2, "stroke-linecap": "round" }, p);
      // arm: "up" raises the near arm, an orator mid-sentence.
      const cam = o.hold === "camera", up = o.arm === "up";
      const hx = up ? 6.8 : cam ? 2.6 : o.hold ? 4.4 : (o.sit ? 3 : 4.8);
      const hy = Y(up ? -34 : cam ? -25 : o.hold ? -16.5 : -13.5);
      el("line", { x1: 3.8, y1: Y(-21.5), x2: hx, y2: hy, stroke: shade(shirt, 1.1), "stroke-width": 2.2, "stroke-linecap": "round" }, p);
      el("circle", { cx: 0, cy: Y(-27.5), r: 3.8, fill: skin }, p);
      el("path", { d: `M-3.9 ${Y(-28)} A3.9 3.9 0 0 1 3.9 ${Y(-28.6)} Q0 ${Y(-30.8)} -3.9 ${Y(-28)} Z`, fill: o.hair || "#3a2a22" }, p);
      if (cam) {
        el("rect", { x: -3.2, y: Y(-29.6), width: 6.4, height: 4.2, rx: 0.8, fill: "#1b1e25" }, p);
        el("circle", { cx: 0, cy: Y(-27.5), r: 1.4, fill: "#5b6b86" }, p);
      }
      if (o.hold === "cup") el("rect", { x: hx - 1, y: hy - 3.6, width: 2.8, height: 3.8, rx: 0.6, fill: "#f4f1ea" }, p);
      if (o.hold === "book") el("rect", { x: hx - 2.4, y: hy - 4.6, width: 5, height: 4.2, rx: 0.5, fill: ctx.col("accent") }, p);
      if (o.hold === "plate") {
        el("ellipse", { cx: hx + 1, cy: hy - 0.6, rx: 3.8, ry: 1.2, fill: "#f4f1ea" }, p);
        el("circle", { cx: hx + 0.2, cy: hy - 1.5, r: 1.1, fill: "#d23a3a" }, p);
        el("circle", { cx: hx + 2, cy: hy - 1.4, r: 1, fill: "#5a3220" }, p);
      }
    },
    // Someone walking a dog: a mover, so it crosses the garden on its own.
    walker(g, o, ctx) {
      SPRITES.person(g, { shirt: o.shirt || "#c2556b", hair: "#2a1d16", bob: true }, ctx);
      const D = o.dog || "#c8a27a";
      el("path", { d: "M4.6 -14 Q10 -9 13.4 -8.2", stroke: "#1b1e25", "stroke-width": 0.8, fill: "none" }, g);
      const dog = el("g", { class: "ks-bob" }, g);
      el("ellipse", { cx: 16, cy: 0.5, rx: 6, ry: 1.8, fill: "#000", "fill-opacity": 0.25 }, dog);
      el("ellipse", { cx: 15.5, cy: -5, rx: 5.2, ry: 2.6, fill: D }, dog);
      el("path", { d: "M11.6 -3.5 V0 M13.6 -3.2 V0 M17.6 -3.2 V0 M19.4 -3.5 V0", stroke: shade(D, 0.75), "stroke-width": 1.3, "stroke-linecap": "round" }, dog);
      el("circle", { cx: 20.6, cy: -8, r: 2.6, fill: D }, dog);
      el("path", { d: "M19.6 -10 Q18.6 -7.4 19.2 -6.6", stroke: shade(D, 0.6), "stroke-width": 1.4, fill: "none", "stroke-linecap": "round" }, dog);
      el("circle", { cx: 23, cy: -7.6, r: 0.8, fill: "#1b1e25" }, dog);
      el("path", { d: "M10.6 -5.6 Q8.6 -9 9.4 -10", stroke: D, "stroke-width": 1.4, fill: "none", "stroke-linecap": "round" }, dog);
    },
    cat(g, o) {
      const C = o.color || "#2b2b33";
      el("ellipse", { cx: 0.5, cy: 0.5, rx: 6, ry: 1.8, fill: "#000", "fill-opacity": 0.25 }, g);
      el("path", { d: "M-4 0 Q-5 -7 -1 -9 Q3 -9 4 -4 Q4.5 -1 3 0 Z", fill: C }, g);
      el("circle", { cx: 0.5, cy: -11, r: 3, fill: C }, g);
      el("path", { d: "M-1.8 -13 L-1.4 -16 L0.2 -13.6 Z M1.2 -13.6 L2.6 -16 L3 -13 Z", fill: C }, g);
      el("path", { d: "M3 -1 Q8.5 -1 7.2 -6.5", stroke: C, "stroke-width": 1.6, fill: "none", "stroke-linecap": "round" }, g);
      el("circle", { cx: -0.6, cy: -11.3, r: 0.6, fill: "#e8d26a" }, g);
      el("circle", { cx: 1.6, cy: -11.3, r: 0.6, fill: "#e8d26a" }, g);
    },
    // A parrot perched in a tree, shifting its weight now and then.
    parrot(g, o) {
      const body = o.color || "#d93a2b", wing = o.wing || "#2f6fd6";
      const p = el("g", { class: "ks-perch" }, g);
      if (o.delay) p.style.animationDelay = o.delay + "s";
      el("path", { d: "M-1.4 -3 Q-3.6 3 -2.2 7 Q-0.2 3 0.6 -1.5 Z", fill: wing }, p);
      el("ellipse", { cx: 0, cy: -6, rx: 2.8, ry: 4.6, fill: body }, p);
      el("path", { d: "M1.4 -8 Q-2 -7 -2.4 -2 Q0.8 -4 2.4 -6.4 Z", fill: shade(wing, 1.12) }, p);
      el("circle", { cx: 0.6, cy: -11.4, r: 2.5, fill: body }, p);
      el("path", { d: "M2.7 -12 Q4.8 -11.2 3.1 -9.6 Z", fill: "#efe6cf" }, p);
      el("circle", { cx: 1.3, cy: -12, r: 0.55, fill: "#111" }, p);
    },
    // ---- Rome, for the Philosophy course (scenes/philosophy.js) ----
    // A column: base, fluted shaft, capital. `h` is its height in px.
    column(g, o, ctx) {
      const h = o.h || 60, c = ctx.col(o.color || "marble");
      el("rect", { x: -6, y: -4, width: 12, height: 4, fill: shade(c, 0.82) }, g);
      el("rect", { x: -4.6, y: -h + 6, width: 9.2, height: h - 10, fill: c }, g);
      [-2.6, 0, 2.6].forEach(x => el("line", { x1: x, y1: -h + 7, x2: x, y2: -5, stroke: shade(c, 0.76), "stroke-width": 0.9 }, g));
      el("rect", { x: -6.5, y: -h, width: 13, height: 6, rx: 1, fill: shade(c, 1.08) }, g);
    },
    // A marble statue in a toga, on a pedestal.
    statue(g, o, ctx) {
      const m = ctx.col("marble");
      el("ellipse", { cx: 1, cy: 0.8, rx: 10, ry: 3, fill: "#000", "fill-opacity": 0.3 }, g);
      el("rect", { x: -7, y: -14, width: 14, height: 14, fill: shade(m, 0.78) }, g);
      el("rect", { x: -8, y: -16, width: 16, height: 3, fill: shade(m, 0.9) }, g);
      el("path", { d: "M-4.4 -38 Q0 -40.5 4.4 -38 L5.6 -16 L-5.6 -16 Z", fill: m }, g);
      el("path", { d: "M-3.6 -36.5 Q1.5 -29 5 -21", stroke: shade(m, 0.8), "stroke-width": 1.2, fill: "none" }, g);
      el("line", { x1: 3.8, y1: -36.5, x2: 7.5, y2: -47, stroke: shade(m, 1.05), "stroke-width": 2.2, "stroke-linecap": "round" }, g);
      el("circle", { cx: 0, cy: -42.5, r: 3.8, fill: shade(m, 1.04) }, g);
    },
    // A cypress: tall, narrow, dark, the tree of Italian roads.
    cypress(g, o, ctx) {
      const s = o.size || 1, L = ctx.col("cypress");
      const t = el("g", { transform: `scale(${s})` }, g);
      el("ellipse", { cx: 2, cy: 1, rx: 7, ry: 2.4, fill: "#000", "fill-opacity": 0.3 }, t);
      el("rect", { x: -1.2, y: -7, width: 2.4, height: 7, fill: ctx.col("trunk") }, t);
      el("path", { d: "M0 -62 Q8 -40 7 -18 Q4 -6 0 -6 Q-4 -6 -7 -18 Q-8 -40 0 -62 Z", fill: L }, t);
      el("path", { d: "M0 -58 Q-6 -38 -5 -18 Q-2 -9 0 -8 Z", fill: shade(L, 1.25), "fill-opacity": 0.6 }, t);
    },
    // A brazier: a bronze bowl on three legs, with a fire that flickers.
    brazier(g, o, ctx) {
      const b = ctx.col("bronze");
      el("ellipse", { cx: 1, cy: 0.6, rx: 7, ry: 2.2, fill: "#000", "fill-opacity": 0.3 }, g);
      el("path", { d: "M-5 0 L-2 -12 M5 0 L2 -12 M0 0 L0 -12", stroke: shade(b, 0.7), "stroke-width": 1.4 }, g);
      el("path", { d: "M-7 -13 Q0 -8 7 -13 L5 -16 L-5 -16 Z", fill: b }, g);
      const fire = el("g", { class: ctx.day ? null : "ks-flicker" }, g);
      if (!ctx.day) el("circle", { cx: 0, cy: -20, r: 9, fill: ctx.col("light"), "fill-opacity": 0.25, filter: `url(#${ctx.uid}glow)` }, fire);
      el("path", { d: "M-4.5 -16 Q-5 -22 -1 -27 Q-1 -22 1 -21 Q2 -26 4.5 -29 Q5.5 -22 4.5 -16 Z", fill: ctx.col("fire") }, fire);
      el("path", { d: "M-2 -16 Q-2 -20 0 -23 Q1 -20 2.4 -16 Z", fill: "#fff3c4" }, fire);
    },
    // Scrolls on a table: rolled papyrus, ends dark, one open.
    scrolls(g, o, ctx) {
      const pp = ctx.col("parchment");
      [[-9, -3], [-3, -3.6], [3.5, -3], [-6, -7], [0.5, -7.4]].forEach(([x, y]) => {
        el("rect", { x, y: y - 3, width: 6.5, height: 3, rx: 1.5, fill: pp }, g);
        el("circle", { cx: x + 6.5, cy: y - 1.5, r: 1.5, fill: shade(pp, 0.7) }, g);
      });
      el("path", { d: "M5 -6 L13 -7.5 L13 -2 L5 -0.5 Z", fill: shade(pp, 1.06) }, g);
      el("path", { d: "M6.5 -4.6 L11.5 -5.6 M6.5 -3 L11 -3.9", stroke: "#6b5a3e", "stroke-width": 0.5 }, g);
    },
    // A café table with a chair either side, backs to the outside, and a
    // cup at each place. Seat sitters at about 13 px either side of it.
    cafe(g) {
      el("ellipse", { cx: 0, cy: 0.8, rx: 19, ry: 3.4, fill: "#000", "fill-opacity": 0.25 }, g);
      [-13, 13].forEach(x => {
        el("path", { d: `M${x - 3.4} 0 L${x - 3} -9 M${x + 3.4} 0 L${x + 3} -9`, stroke: "#1b1e25", "stroke-width": 1.2 }, g);
        el("rect", { x: x - 4.2, y: -10.4, width: 8.4, height: 2, rx: 1, fill: "#3b4a6b" }, g);
        el("rect", { x: x < 0 ? x - 4.4 : x + 2.8, y: -19, width: 1.6, height: 9, rx: 0.6, fill: "#3b4a6b" }, g);
      });
      el("rect", { x: -0.8, y: -11, width: 1.6, height: 11, fill: "#1b1e25" }, g);
      el("ellipse", { cx: 0, cy: -11.5, rx: 7.5, ry: 2.4, fill: "#e9e4d8" }, g);
      el("rect", { x: -3.8, y: -15, width: 2.4, height: 3, rx: 0.5, fill: "#f4f1ea" }, g);
      el("rect", { x: 1.4, y: -14.6, width: 2.4, height: 2.8, rx: 0.5, fill: "#f4f1ea" }, g);
    },
    // A beach parasol: a striped dome on a pole.
    parasol(g, o) {
      const a = o.color || "#e86a5c";
      el("ellipse", { cx: 3, cy: 0.8, rx: 14, ry: 3.6, fill: "#000", "fill-opacity": 0.22 }, g);
      el("line", { x1: 0, y1: 0, x2: 1.5, y2: -31, stroke: "#d9d4c7", "stroke-width": 1.4 }, g);
      el("path", { d: "M-16 -25 Q1.5 -42 19 -25 Q1.5 -29 -16 -25 Z", fill: a }, g);
      el("path", { d: "M1.5 -33.6 L-10 -25.8 L-4.2 -26.6 Z M1.5 -33.6 L7.2 -26.6 L13 -25.8 Z", fill: "#f4f1ea" }, g);
      el("circle", { cx: 1.5, cy: -33.8, r: 1.2, fill: shade(a, 0.8) }, g);
    },
    sandcastle(g) {
      const s = "#d9c08a", d = shade("#d9c08a", 0.82);
      el("ellipse", { cx: 0, cy: 0.6, rx: 10, ry: 2.6, fill: "#000", "fill-opacity": 0.2 }, g);
      el("rect", { x: -9, y: -11, width: 5, height: 11, fill: d }, g);
      el("rect", { x: 4, y: -11, width: 5, height: 11, fill: d }, g);
      el("rect", { x: -7, y: -6, width: 14, height: 6, fill: s }, g);
      el("rect", { x: -2.5, y: -15, width: 5, height: 15, fill: s }, g);
      [-9, -6.4, 4, 6.6].forEach(x => el("rect", { x, y: -12.6, width: 2.4, height: 1.8, fill: d }, g));
      el("path", { d: "M0 -15 V-21", stroke: "#3a2a1d", "stroke-width": 0.8 }, g);
      el("path", { d: "M0 -21 L4.2 -19.6 L0 -18.2 Z", fill: "#d93a2b" }, g);
    },
    // A mailbox with its flag up and a letter showing at the top.
    mailbox(g) {
      const blue = "#2f5b8e";
      el("ellipse", { cx: 1, cy: 0.6, rx: 6, ry: 1.8, fill: "#000", "fill-opacity": 0.3 }, g);
      el("rect", { x: -1, y: -16, width: 2, height: 16, fill: "#3a2a1d" }, g);
      el("rect", { x: -6, y: -30.5, width: 8.5, height: 6, rx: 0.6, fill: "#f4f1ea", transform: "rotate(-8 -2 -27)" }, g);
      el("path", { d: "M-7 -16 V-24 A7 5 0 0 1 7 -24 V-16 Z", fill: blue }, g);
      el("rect", { x: -7, y: -17.2, width: 14, height: 1.4, fill: shade(blue, 0.7) }, g);
      el("rect", { x: 7, y: -28, width: 1.2, height: 10, fill: "#c8102e" }, g);
      el("rect", { x: 8.2, y: -28, width: 4.2, height: 3, fill: "#c8102e" }, g);
    },
    // A few books stacked on the grass, page edges toward the right.
    books(g) {
      el("ellipse", { cx: 0, cy: 0.6, rx: 9, ry: 2.4, fill: "#000", "fill-opacity": 0.28 }, g);
      [[-7, 0, 14, 3.2, "#b5483c"], [-6, -3.2, 12, 3, "#3b6fb5"], [-7.5, -6.2, 13, 3.2, "#d8b45a"], [-5.5, -9.4, 11, 2.8, "#4a8a5a"]]
        .forEach(([x, y, w, h, c]) => {
          el("rect", { x, y: y - h, width: w, height: h, rx: 0.6, fill: c }, g);
          el("rect", { x: x + w - 2.2, y: y - h + 0.6, width: 1.6, height: h - 1.2, fill: "#efe6cf", "fill-opacity": 0.9 }, g);
        });
    },
    // An espresso machine, for the coffee cart. Steam rises off the cup.
    coffee(g) {
      el("rect", { x: -9, y: -17, width: 18, height: 17, rx: 2, fill: "#b8bec8" }, g);
      el("rect", { x: -9.6, y: -20, width: 19.2, height: 3.6, rx: 1.4, fill: "#8d939c" }, g);
      el("rect", { x: -6.5, y: -14, width: 13, height: 5.2, rx: 1, fill: "#2b2f38" }, g);
      el("rect", { x: -2.2, y: -8.6, width: 4.4, height: 3.8, rx: 0.7, fill: "#f4f1ea" }, g);
      el("circle", { cx: 6.4, cy: -17.6, r: 1, fill: "#3ce68a", class: "ks-blink" }, g);
      el("path", { class: "ks-steam", d: "M-0.8 -10 Q-2.4 -13 -0.6 -15.4 Q1 -17.6 -0.4 -20", stroke: "#fff", "stroke-opacity": 0.5, "stroke-width": 1, fill: "none", "stroke-linecap": "round" }, g);
    },
    // A chocolate fountain: three steel tiers with chocolate running
    // down between them into the bowl.
    fountain(g) {
      const choc = "#5a3220", steel = "#c9ced6";
      el("ellipse", { cx: 0, cy: -1.5, rx: 10, ry: 3, fill: steel }, g);
      el("ellipse", { cx: 0, cy: -2, rx: 8.4, ry: 2.2, fill: choc }, g);
      el("rect", { x: -0.8, y: -25, width: 1.6, height: 23, fill: steel }, g);
      [[-9, 7], [-15, 5], [-20.5, 3.2]].forEach(([y, rx]) => {
        el("path", { d: `M${-rx} ${y} Q${-rx - 1} ${y + 4} ${-rx - 1.6} ${y + 6.5} L${rx + 1.6} ${y + 6.5} Q${rx + 1} ${y + 4} ${rx} ${y} Z`, fill: choc, "fill-opacity": 0.92 }, g);
        el("ellipse", { cx: 0, cy: y, rx, ry: rx * 0.3, fill: steel }, g);
        el("ellipse", { cx: 0, cy: y - 0.3, rx: rx * 0.8, ry: rx * 0.22, fill: choc }, g);
      });
      el("circle", { cx: 0, cy: -26, r: 1.6, fill: choc }, g);
    },
    // A plate on the buffet, heaped with `food`: strawberries by default.
    plate(g, o) {
      const c = o.food || "#d23a3a";
      el("ellipse", { cx: 0, cy: -1, rx: 6, ry: 1.9, fill: "#f4f1ea" }, g);
      [[-2.2, -2.4], [0.4, -2.8], [2.6, -2.2], [-0.8, -3.8], [1.6, -3.8]].forEach(([dx, dy]) =>
        el("circle", { cx: dx, cy: dy, r: 1.3, fill: c }, g));
    },
    flowers(g, o, ctx) {
      const cols = o.colors || ["#f4a8c6", "#f2c14e", "#e86a5c", "#c7a6ff"];
      el("ellipse", { cx: 0, cy: 0, rx: 13, ry: 3.8, fill: ctx.col("soil") }, g);
      [[-9, -1], [-5, -3.5], [-1, -0.5], [3, -3], [7, -1], [10, -2.6], [-7, 1.6], [1, 1.8], [6, 1.6]]
        .forEach(([x, y], i) => {
          el("line", { x1: x, y1: y, x2: x, y2: y - 4, stroke: shade(ctx.col("leaf"), 1.1), "stroke-width": 0.9 }, g);
          el("circle", { cx: x, cy: y - 4.6, r: 1.6, fill: cols[i % cols.length] }, g);
        });
    },
    // Fireflies over the water, each blinking out of step.
    fireflies(g, o, ctx) {
      [[-22, -14, 0], [-8, -26, 0.5], [6, -18, 1.1], [18, -30, 0.3], [26, -12, 0.8], [-16, -34, 1.4]]
        .forEach(([x, y, d]) => {
          const f = el("circle", { cx: x, cy: y, r: 1.3, fill: "#e9ff8a", filter: `url(#${ctx.uid}glow)`, class: "ks-blink" }, g);
          f.style.animationDelay = d + "s";
        });
    },
    // ---- The Garden's growth stages, smallest to largest ----
    // Sprout, seedling and growing are drawn here; tree and blossom are
    // the tree above. Each stands on its own patch of soil.
    sprout(g, o, ctx) {
      const L = ctx.col("leaf");
      el("ellipse", { cx: 0, cy: 0, rx: 9, ry: 3, fill: ctx.col("soil") }, g);
      el("path", { d: "M0 0 V-8", stroke: shade(L, 1.15), "stroke-width": 1.6, "stroke-linecap": "round" }, g);
      el("path", { d: "M0 -6 Q-6 -11 -8 -5 Q-3 -4 0 -6 Z", fill: L }, g);
      el("path", { d: "M0 -8 Q6 -14 9 -8 Q4 -6 0 -8 Z", fill: shade(L, 1.2) }, g);
    },
    seedling(g, o, ctx) {
      const L = ctx.col("leaf");
      el("ellipse", { cx: 0, cy: 0, rx: 10, ry: 3.2, fill: ctx.col("soil") }, g);
      el("path", { d: "M0 0 V-18", stroke: shade(L, 1.1), "stroke-width": 1.8, "stroke-linecap": "round" }, g);
      [[-1, -5, 8], [1, -9, 8], [-1, -13, 7], [1, -17, 6]].forEach(([side, y, len], i) =>
        el("path", { d: `M0 ${y} q${side * len * 0.5} ${-len * 0.55} ${side * len} ${-len * 0.1} q${-side * len * 0.4} ${len * 0.35} ${-side * len} ${len * 0.1} Z`,
          fill: shade(L, i % 2 ? 1.18 : 0.95) }, g));
    },
    // "Growing" is ears of grain in the Garden, so it is a clump of them.
    stalks(g, o, ctx) {
      const L = ctx.col("leaf"), G = ctx.col("grain");
      el("ellipse", { cx: 0, cy: 0, rx: 12, ry: 3.6, fill: ctx.col("soil") }, g);
      [[-7, 24, -5], [-3, 30, -2], [1, 33, 1], [5, 28, 3], [8, 22, 6]].forEach(([x, h, lean]) => {
        el("path", { d: `M${x} 0 Q${x + lean * 0.3} ${-h * 0.6} ${x + lean} ${-h}`, stroke: shade(L, 1.1), "stroke-width": 1.4, fill: "none", "stroke-linecap": "round" }, g);
        el("ellipse", { cx: x + lean, cy: -h - 3, rx: 1.9, ry: 4.2, fill: G, transform: `rotate(${lean * 3} ${x + lean} ${-h - 3})` }, g);
      });
    },
    bench(g, o, ctx) {
      const wood = ctx.col("trunk");
      el("ellipse", { cx: 1, cy: 1, rx: 17, ry: 3.5, fill: "#000", "fill-opacity": 0.3 }, g);
      el("rect", { x: -14, y: -9, width: 2.4, height: 9, fill: "#1b1e25" }, g);
      el("rect", { x: 11.6, y: -9, width: 2.4, height: 9, fill: "#1b1e25" }, g);
      el("rect", { x: -16, y: -11, width: 32, height: 3.4, rx: 1, fill: shade(wood, 1.25) }, g);
      el("rect", { x: -16, y: -20, width: 32, height: 3, rx: 1, fill: shade(wood, 1.1) }, g);
      el("rect", { x: -16, y: -15.5, width: 32, height: 3, rx: 1, fill: shade(wood, 1.1) }, g);
    },
    // A bell hanging in a belfry. It registers itself as an actor, so a
    // pin with act: "bell" swings it when the runner gets there. Its own
    // group swings, pivoting at the top, and the beam stays still.
    bell(g, o, ctx) {
      const B = ctx.col("bell");
      el("rect", { x: -16, y: -38, width: 32, height: 3.4, rx: 1.4, fill: "#3a2a1d" }, g);
      const swing = el("g", { class: "ks-bell" }, g);
      el("path", { d: "M-3 -35 Q0 -39 3 -35", stroke: shade(B, 0.7), "stroke-width": 2, fill: "none" }, swing);
      el("path", { d: "M-6 -34 Q-8.5 -34 -9 -27 L-10.5 -12 Q-11.5 -6 -14.5 -4 L14.5 -4 Q11.5 -6 10.5 -12 L9 -27 Q8.5 -34 6 -34 Z", fill: B }, swing);
      el("rect", { x: -15, y: -5.2, width: 30, height: 2.8, rx: 1.4, fill: shade(B, 0.72) }, swing);
      el("path", { d: "M-5 -30 Q-6.6 -20 -8.4 -9", stroke: "#fff", "stroke-opacity": 0.35, "stroke-width": 1.4, fill: "none", "stroke-linecap": "round" }, swing);
      el("circle", { cx: 0, cy: -1.4, r: 2.4, fill: shade(B, 0.55) }, swing);
      const name = o.actor || "bell";
      (ctx.actors[name] = ctx.actors[name] || []).push(swing);
    },
    bush(g, o, ctx) {
      el("ellipse", { cx: 2, cy: 1, rx: 11, ry: 3.5, fill: "#000", "fill-opacity": 0.25 }, g);
      el("circle", { cx: -5, cy: -5, r: 6.5, fill: shade(ctx.col("leaf"), 0.9) }, g);
      el("circle", { cx: 4, cy: -6, r: 7.5, fill: ctx.col("leaf") }, g);
      el("circle", { cx: 0, cy: -10, r: 5.5, fill: shade(ctx.col("leaf"), 1.2) }, g);
    },
    // ---- Indoor pieces, for rooms ----
    monitor(g, o, ctx) {
      const A = ctx.col("accent");
      el("rect", { x: -7, y: -3, width: 14, height: 3, rx: 1, fill: "#1b1f29" }, g);
      el("rect", { x: -1.4, y: -11, width: 2.8, height: 9, fill: "#1b1f29" }, g);
      el("rect", { x: -18, y: -34, width: 36, height: 24, rx: 2, fill: "#0b0f16" }, g);
      el("rect", { x: -16, y: -32, width: 32, height: 19, fill: "#0d1b2a" }, g);
      // Code on the screen: indented lines in three colours.
      [[-14, -29, 12, "#c792ea"], [-11, -26, 18, A], [-11, -23, 10, "#3ce68a"], [-8, -20, 16, A], [-14, -17, 7, "#c792ea"]]
        .forEach(([x, y, w, c]) => el("rect", { x, y, width: w, height: 1.6, rx: 0.8, fill: c }, g));
    },
    database(g, o, ctx) {
      const A = ctx.col("accent");
      el("ellipse", { cx: 3, cy: 1, rx: 15, ry: 4, fill: "#000", "fill-opacity": 0.3 }, g);
      for (let i = 0; i < 3; i++) {
        const y = -14 * (i + 1);
        el("rect", { x: -12, y, width: 24, height: 12, fill: shade(A, 0.55 + i * 0.08) }, g);
        el("ellipse", { cx: 0, cy: y + 12, rx: 12, ry: 4, fill: shade(A, 0.5 + i * 0.08) }, g);
        el("ellipse", { cx: 0, cy: y, rx: 12, ry: 4, fill: shade(A, 0.85 + i * 0.08) }, g);
        el("circle", { cx: 7, cy: y + 7, r: 1.4, fill: "#3ce68a", class: i === 1 ? "ks-blink" : null }, g);
      }
    },
    logicSign(g, o, ctx) {
      const A = ctx.col("accent");
      el("rect", { x: -1, y: -16, width: 2, height: 16, fill: "#5a6378" }, g);
      el("rect", { x: -17, y: -40, width: 34, height: 25, rx: 3, fill: "#101826", stroke: A, "stroke-width": 1.2 }, g);
      // An AND gate: two inputs in, one output out, and a lamp on it.
      el("path", { d: "M-6 -36 H0 A8 8 0 0 1 0 -20 H-6 Z", fill: "none", stroke: "#e8eefc", "stroke-width": 1.6 }, g);
      el("path", { d: "M-13 -32 H-6 M-13 -24 H-6 M8 -28 H12", stroke: "#e8eefc", "stroke-width": 1.4 }, g);
      el("circle", { cx: 13.5, cy: -28, r: 2.4, fill: "#3ce68a", filter: `url(#${ctx.uid}glow)`, class: "ks-blink" }, g);
    },
    robot(g, o, ctx) {
      const A = ctx.col("accent");
      el("ellipse", { cx: 2, cy: 1, rx: 12, ry: 3.5, fill: "#000", "fill-opacity": 0.3 }, g);
      el("rect", { x: -9, y: -6, width: 6, height: 6, rx: 2, fill: "#5a6378" }, g);
      el("rect", { x: 3, y: -6, width: 6, height: 6, rx: 2, fill: "#5a6378" }, g);
      el("rect", { x: -10, y: -24, width: 20, height: 19, rx: 4, fill: "#8fa3c0" }, g);
      el("rect", { x: -5, y: -19, width: 10, height: 7, rx: 1.5, fill: "#2b3550" }, g);
      el("path", { d: "M-10 -20 L-15 -11 M10 -20 L15 -11", stroke: "#8fa3c0", "stroke-width": 3, "stroke-linecap": "round" }, g);
      el("rect", { x: -8, y: -39, width: 16, height: 13, rx: 4, fill: "#b5c4da" }, g);
      el("circle", { cx: -3.5, cy: -33, r: 2, fill: A, filter: `url(#${ctx.uid}glow)` }, g);
      el("circle", { cx: 3.5, cy: -33, r: 2, fill: A, filter: `url(#${ctx.uid}glow)` }, g);
      el("line", { x1: 0, y1: -39, x2: 0, y2: -45, stroke: "#8fa3c0", "stroke-width": 1.6 }, g);
      el("circle", { cx: 0, cy: -46.5, r: 2, fill: "#f2c14e", class: "ks-blink" }, g);
    },
    plant(g, o, ctx) {
      el("ellipse", { cx: 2, cy: 1, rx: 10, ry: 3, fill: "#000", "fill-opacity": 0.3 }, g);
      el("path", { d: "M-7 -12 H7 L5 0 H-5 Z", fill: "#b5653d" }, g);
      el("circle", { cx: -4, cy: -18, r: 6.5, fill: shade(ctx.col("leaf"), 0.9) }, g);
      el("circle", { cx: 4, cy: -19, r: 7, fill: ctx.col("leaf") }, g);
      el("circle", { cx: 0, cy: -25, r: 6, fill: shade(ctx.col("leaf"), 1.2) }, g);
    },
    chair(g, o) {
      el("ellipse", { cx: 0, cy: 0, rx: 9, ry: 2.8, fill: "#000", "fill-opacity": 0.3 }, g);
      el("path", { d: "M-8 -1 L0 -4 L8 -1 M0 -4 V-12", stroke: "#2a2f3b", "stroke-width": 2, fill: "none" }, g);
      el("rect", { x: -9, y: -15, width: 18, height: 4, rx: 2, fill: "#3b4a6b" }, g);
      el("rect", { x: -8, y: -31, width: 16, height: 15, rx: 4, fill: "#465a80" }, g);
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
      ".ks-blink{animation:ks-blink 1.6s steps(1) infinite}" +
      "@keyframes ks-blink{50%{opacity:.15}}" +
      ".ks-pin[aria-disabled=true]{cursor:not-allowed}" +
      ".ks-shake{animation:ks-shake .4s ease}" +
      "@keyframes ks-shake{20%{transform:translateX(-4px)}40%{transform:translateX(4px)}60%{transform:translateX(-3px)}80%{transform:translateX(2px)}}" +
      ".ks-bell{transform-box:fill-box;transform-origin:50% 0}" +
      ".ks-bell.ks-act{animation:ks-ring 2.6s cubic-bezier(.3,.6,.4,1)}" +
      "@keyframes ks-ring{12%{transform:rotate(16deg)}30%{transform:rotate(-12deg)}48%{transform:rotate(8deg)}66%{transform:rotate(-5deg)}84%{transform:rotate(2deg)}}" +
      ".ks-perch{transform-box:fill-box;transform-origin:50% 100%;animation:ks-perch 4.2s ease-in-out infinite}" +
      "@keyframes ks-perch{0%,62%,100%{transform:rotate(0)}68%{transform:rotate(-9deg)}76%{transform:rotate(6deg) translateY(-1.5px)}84%{transform:rotate(0)}}" +
      ".ks-bob{animation:ks-bob .45s ease-in-out infinite alternate}" +
      "@keyframes ks-bob{to{transform:translateY(-1px)}}" +
      ".ks-steam{animation:ks-steam 2.4s ease-in-out infinite}" +
      ".ks-flicker{transform-box:fill-box;transform-origin:50% 100%;animation:ks-flicker 1.1s ease-in-out infinite alternate}" +
      "@keyframes ks-flicker{0%{transform:scale(1,1);opacity:1}40%{transform:scale(.92,1.08);opacity:.85}100%{transform:scale(1.06,.94);opacity:.95}}" +
      "@keyframes ks-steam{0%{opacity:0;transform:translateY(2px)}40%{opacity:1}100%{opacity:0;transform:translateY(-4px)}}" +
      "@media (prefers-reduced-motion:reduce){.ks-pulse{animation:none;opacity:0}.ks-shake,.ks-blink,.ks-act,.ks-perch,.ks-bob,.ks-steam,.ks-flicker{animation:none}}";
    document.head.appendChild(st);
  }

  function render(container, id, opts) {
    const recipe = recipes[id];
    if (!recipe || !container) return { destroy() {} };
    opts = opts || {};
    const lang = opts.lang || "en";
    const uid = "ks" + (++uidCounter) + "-";
    // Day or night follows the app's sky (core/theme.js sets data-sky on
    // <html>), unless the caller says which. A recipe with a `day` part
    // gets its daylight colours, no stars, its lamps out and its `hide`
    // list left out; one without stays the night picture it was drawn
    // as. Added 2026-11-22: the night garden under a sunny sky was
    // "unrealistically dark".
    const day = (opts.time || document.documentElement.dataset.sky) === "day" && !!recipe.day;
    const view = day ? dayView(recipe) : recipe;
    const palette = view.palette || {};
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

    drawBackdrop(far, view, P, col, rand, uid);
    drawBlock(block, view, P, col, uid);

    // Objects, back to front. For billboards depth is x + y of the foot;
    // for a box it is the centre, which stops a sign standing in front
    // of a building's face from being painted over by it.
    const objectsG = el("g", null, block);
    const ctx = { uid, col, lights: [], actors: {}, day };
    // Sprites are drawn for a 12-unit block; spriteScale lets a recipe
    // exaggerate them the way a diorama does, so small things stay
    // legible on a phone.
    const k = (P.S / 36.57) * (recipe.spriteScale || 1);
    const items = [];
    // A recipe may set `depth` itself, for pieces built on top of one
    // another, like a belfry's posts round a bell: by footprint they
    // would all tie, and a tie paints the bell over the post in front.
    for (const o of view.objects || []) {
      if (o.depth != null) items.push({ depth: o.depth, o });
      else if (o.kind === "box") items.push({ depth: (o.x0 + o.x1) / 2 + (o.y0 + o.y1) / 2, o });
      // Something standing ON something (a monitor on a desk) sorts just
      // after what it stands on, which shares its spot on the floor.
      else items.push({ depth: o.at[0] + o.at[1] + (o.z ? 0.02 : 0), o });
    }
    items.sort((a, b) => a.depth - b.depth);
    for (const it of items) {
      const g = el("g", { "data-depth": it.depth }, objectsG);
      if (it.o.kind === "box") { drawBox(g, it.o, P, col, rand, uid); continue; }
      const p = P.iso(it.o.at[0], it.o.at[1], it.o.z || 0);
      // `scale` enlarges one piece past the rest, for the things a scene
      // is about: the start screen's growth stages are drawn bigger than
      // life so that a sprout can be told from a seedling on a phone.
      const s = k * (it.o.scale || 1);
      g.setAttribute("transform", `translate(${r1(p[0])},${r1(p[1])}) scale(${r1(s * 100) / 100})`);
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
      const p = recipe.pins[i];
      // Whatever this pin names to act, acts: the class restarts the
      // piece's own animation, which its sprite's CSS defines.
      (ctx.actors[p.act] || []).forEach(a => {
        a.classList.remove("ks-act");
        void a.getBoundingClientRect();
        a.classList.add("ks-act");
      });
      if (opts.onChapter) {
        // A pin names a topic (a one-unit course) or a whole unit.
        opts.onChapter({ index: i, n: p.n, topic: p.topic, unit: p.unit, label: textOf(p.label, lang),
          act: p.act || "", say: p.say ? textOf(p.say, lang) : "", icon: p.icon || "" });
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
          // Passing another pin's spot on the way is announced (onPass):
          // the start screen plays each stage's note as he goes by.
          if (opts.onPass && r.seg < r.path.length - 1) {
            const id = r.pathIds[r.seg], k = id ? (recipe.pins || []).findIndex(p => p.stand === id) : -1;
            if (k >= 0) opts.onPass({ index: k, n: recipe.pins[k].n });
          }
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

    // A tap on a pin is announced at once (onPick), before the runner has
    // gone anywhere, so the caller can answer the tap itself: the start
    // screen pins a small note about what was picked. `el` is the pin, to
    // place things next to.
    function pick(i) {
      if (opts.onPick && pins[i].state !== "locked") {
        const p = recipe.pins[i];
        opts.onPick({ index: i, n: p.n, label: textOf(p.label, lang), say: p.say ? textOf(p.say, lang) : "",
          icon: p.icon || "", act: p.act || "", el: pins[i].outer });
      }
      goTo(i);
    }
    pins.forEach((p, i) => {
      p.outer.addEventListener("click", () => pick(i));
      p.outer.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(i); }
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

  // The recipe as daylight sees it: its day colours over its night ones,
  // the stars it asks for (none unless it says), no pools of lamp light,
  // and none of the objects listed in day.hide (fireflies, say).
  function dayView(recipe) {
    const d = recipe.day, hide = new Set(d.hide || []);
    return Object.assign({}, recipe, {
      isDay: true,
      palette: Object.assign({}, recipe.palette, d.palette),
      backdrop: Object.assign({}, recipe.backdrop, { stars: d.stars || 0 }),
      surface: (recipe.surface || []).filter(s => s.kind !== "pool"),
      objects: (recipe.objects || []).filter(o => !hide.has(o.kind))
    });
  }

  function register(id, recipe) { recipes[id] = recipe; }
  function has(id) { return !!recipes[id]; }

  window.Dojo = window.Dojo || {};
  // How a window in a scene looks by day: the day sky ("sky", the
  // default), or stars whatever the hour ("stars"), a look a bug once
  // produced and that was liked (2026-11-22). Chosen in Custom, kept per
  // device in localStorage; WALL_ART.window reads it.
  const WINDOW_KEY = "knell.sceneWindow";
  function windowView() {
    try { return localStorage.getItem(WINDOW_KEY) === "stars" ? "stars" : "sky"; } catch (e) { return "sky"; }
  }
  function setWindowView(v) {
    try { localStorage.setItem(WINDOW_KEY, v === "stars" ? "stars" : "sky"); } catch (e) { /* private mode */ }
  }

  Dojo.Scenes = { register, render, has, windowView, setWindowView };
})();
