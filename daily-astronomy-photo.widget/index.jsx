import { React } from "uebersicht";
// --- Inlined design system (self-contained; formerly theme.js) ---
// Shared design system for the widget set: color tokens, fonts, layout, the
// common card shell, drag/resize handles, a last-known-good cache, and the
// standard data-resolution helper. Imported by every widget so they stay
// visually and behaviorally consistent.
const T = {
  // Accent tints
  tintBlue: "#296BE0",
  tintPink: "#E86E87",
  tintGreen: "#59A875",
  tintOrange: "#D9946B",
  tintPurple: "#A861DE",

  // Cards
  cardLight: "rgba(255,255,255,0.74)",
  cardDark: "rgba(33,36,43,0.88)",

  // Ink (text on light)
  ink: "#1F2129",
  inkDim: "#616670",
  inkMute: "#8C919C",

  // Text on dark
  onDark: "#F7F7FA",
  onDarkDim: "#BDBFC7",
  onDarkMute: "#8F949E",

  // Walls (desktop stand-in backgrounds)
  wall1: "#F0F2F7",
  wall2: "#DBE3ED",
  wall3: "#BFC7DB",

  // GitHub ramp
  ghEmpty: "rgba(255,255,255,0.10)",
  ghGreen1: "#9CE8A8",
  ghGreen2: "#40C463",
  ghGreen3: "#30A14F",
  ghGreen4: "#216E38",

  // Scene colors
  nightSky: "#14141A",
  cosmicBase: "#0A051A",
  cosmicViolet: "#8C338C",
  cosmicMagenta: "#D9598C",
  cosmicIndigo: "#331A66",
  shaderPurple: "#402673",
  shaderTeal: "#268C8C",
  duskBase: "#4D408C",
  duskAmber: "#D9A666",
  duskPurple: "#8C4DA6",
  duskGlow: "#F28073",
  cardCream: "#F2F0E6",
  paperGrain: "#9E8052",

  archivePalette: [
    "#D98C4D", "#A64D33", "#733326", "#E0B359",
    "#8C6640", "#B88CCC", "#594D80", "#8C73BF",
    "#8CBF8C", "#4D8059", "#598CD9", "#334D8C",
  ],

  // Layout
  radius: "24px",
  captionTracking: "1.5px",
};

// Fonts. Install Instrument Serif, Geist, and Geist Mono for the intended look;
// each stack falls back to a system font if the family is missing.
const serif = "'Instrument Serif', Georgia, serif";
const sans = "'Geist', -apple-system, BlinkMacSystemFont, sans-serif";
const mono = "'Geist Mono', 'SF Mono', ui-monospace, monospace";

// Default desktop placement [x, y] per widget. Each widget calls
// card(variant, w, h, ...LAYOUT.<key>) so widgets lay out at distinct positions
// rather than stacking at the origin. These are overridden by any saved
// position from the drag handle.
const LAYOUT = {
  nowSpinning:  [380, 40],
  musicArchive: [40, 40],
  spatial:      [380, 200],
  mosaic:       [1120, 40],
  stack:        [1120, 486],
  drop:         [1120, 708],
  swap:         [380, 672],
  aiDailyPull:  [40, 368],
  apod:         [40, 576],
  atlas:        [1280, 224],
  tarot:        [1120, 224],
};

// Shared card shell. variant is "dark" or "light"; x/y set the on-desktop
// position. The common loading/empty/stale state styles are appended so every
// widget can render those states without repeating CSS.
const card = (variant, w, h, x = 0, y = 0) => `
  position: absolute;
  left: ${x}px; top: ${y}px;
  width: ${w}px;
  height: ${h}px;
  border-radius: ${T.radius};
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0,0,0,0.35);
  background: ${variant === "dark" ? T.cardDark : T.cardLight};
  backdrop-filter: blur(20px);
  color: ${variant === "dark" ? T.onDark : T.ink};
  font-family: ${sans};
  box-sizing: border-box;
  transform-origin: top left;

  /* Promote each card to its own GPU layer so a sibling widget's frequent
     refresh cannot trigger a backdrop-filter recomposite, which otherwise made
     the blur flicker on and off. */
  will-change: transform;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;

  .ws-stale { position:absolute; top:8px; right:10px; z-index:5;
              font-family:${mono}; font-size:8px; letter-spacing:1px;
              text-transform:uppercase; opacity:0.72;
              color:${variant === "dark" ? T.onDarkMute : T.inkMute}; }
  .ws-empty { position:absolute; inset:0; display:flex; align-items:center;
              justify-content:center; padding:24px; text-align:center;
              font-family:${serif}; font-style:italic; font-size:18px;
              opacity:0.6; color:${variant === "dark" ? T.onDarkDim : T.inkDim}; }
  .ws-skel  { position:absolute; inset:14px; border-radius:14px; opacity:0.18;
              animation: ws-pulse 1.6s ease-in-out infinite; }
  @keyframes ws-pulse { 0%,100% { opacity:0.10; } 50% { opacity:0.24; } }
  @media (prefers-reduced-motion: reduce) {
    .ws-skel { animation:none; opacity:0.16; }
  }

  .ws-drag  { position:absolute; top:6px; left:6px; z-index:30;
              width:18px; height:18px; border-radius:6px;
              display:flex; align-items:center; justify-content:center;
              font-size:11px; line-height:1; cursor:grab; opacity:0.42;
              transition:opacity .15s ease; user-select:none;
              -webkit-user-select:none;
              color:${variant === "dark" ? T.onDarkMute : T.inkMute};
              background:${variant === "dark"
                ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}; }
  .ws-drag:hover  { opacity:0.95; }
  .ws-drag:active { cursor:grabbing; }

  .ws-resize { position:absolute; bottom:5px; right:5px; z-index:30;
               width:16px; height:16px; border-radius:5px;
               display:flex; align-items:center; justify-content:center;
               font-size:11px; line-height:1; cursor:nwse-resize; opacity:0.42;
               transition:opacity .15s ease; user-select:none;
               -webkit-user-select:none;
               color:${variant === "dark" ? T.onDarkMute : T.inkMute};
               background:${variant === "dark"
                 ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}; }
  .ws-resize:hover { opacity:0.95; }
`;

// Small uppercase monospace caption used for metadata labels.
const caption = (color) => `
  font-family: ${mono};
  text-transform: uppercase;
  letter-spacing: ${T.captionTracking};
  color: ${color};
`;

// State helpers, returned as React elements (this is plain JS, not JSX).
const h = React.createElement;

// Loading: an accent-tinted skeleton block.
const Skel = ({ tint = T.tintBlue }) =>
  h("div", { className: "ws-skel", style: { background: tint } });

// Empty: a single quiet line of text.
const Empty = ({ text }) => h("div", { className: "ws-empty" }, text);

// Stale: a small marker showing the time of the last successful refresh.
const Stale = ({ ts }) =>
  h("div", { className: "ws-stale" }, `stale · ${clockStamp(ts)}`);

// Drag and resize support.
//
// Übersicht renders each widget into its own absolutely-positioned `.widget`
// node, all inside a shared `#uebersicht` container. The wrapper to move is the
// nearest `.widget` ancestor of a handle — not the topmost absolute element,
// which is the shared container.
//
// DragHandle updates the wrapper's left/top. ResizeHandle scales it uniformly
// via a top-left-anchored CSS transform, keeping these fixed-layout cards crisp
// instead of clipping. Both persist to localStorage, so position and size
// survive refreshes and reboots.
const posKey = (k) => `ws:pos:${k}`;
const scaleKey = (k) => `ws:scale:${k}`;
const MIN_SCALE = 0.4, MAX_SCALE = 3;

const findWrapper = (node) => node && node.closest(".widget");

// Apply any saved position and scale. Runs on every mount, since the wrapper
// may have been recreated on refresh.
const applySaved = (wrapper, key) => {
  try {
    const pos = JSON.parse(localStorage.getItem(posKey(key)) || "null");
    if (pos && typeof pos.x === "number") {
      wrapper.style.left = pos.x + "px";
      wrapper.style.top = pos.y + "px";
    }
  } catch (e) { /* storage unavailable */ }
  try {
    const scale = parseFloat(localStorage.getItem(scaleKey(key)));
    if (scale > 0) wrapper.style.transform = `scale(${scale})`;
  } catch (e) { /* storage unavailable */ }
};

const initDrag = (node, key) => {
  if (!node) return;
  const wrapper = findWrapper(node);
  if (!wrapper) return;
  applySaved(wrapper, key);

  if (node.__wsDragWired) return; // attach listeners once per node
  node.__wsDragWired = true;

  // Keep grip clicks from reaching the card's own onClick handler.
  node.addEventListener("click", (e) => e.stopPropagation());

  node.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const cs = getComputedStyle(wrapper);
    const origX = parseFloat(wrapper.style.left || cs.left) || 0;
    const origY = parseFloat(wrapper.style.top || cs.top) || 0;
    const onMove = (ev) => {
      wrapper.style.left = origX + (ev.clientX - startX) + "px";
      wrapper.style.top = origY + (ev.clientY - startY) + "px";
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      try {
        localStorage.setItem(posKey(key), JSON.stringify({
          x: parseFloat(wrapper.style.left) || 0,
          y: parseFloat(wrapper.style.top) || 0,
        }));
      } catch (e) { /* storage unavailable */ }
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });

  // Double-click the grip to snap back to the card's default LAYOUT slot.
  node.addEventListener("dblclick", (e) => {
    e.preventDefault();
    e.stopPropagation();
    try { localStorage.removeItem(posKey(key)); } catch (e) { /* ignore */ }
    wrapper.style.left = "";
    wrapper.style.top = "";
  });
};

const initResize = (node, key) => {
  if (!node) return;
  const wrapper = findWrapper(node);
  if (!wrapper) return;
  applySaved(wrapper, key);

  if (node.__wsResizeWired) return;
  node.__wsResizeWired = true;

  node.addEventListener("click", (e) => e.stopPropagation());

  node.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const cs = getComputedStyle(wrapper);
    // Layout width/height are unaffected by transform, so they stay constant.
    const baseW = parseFloat(cs.width) || 1;
    const baseH = parseFloat(cs.height) || 1;
    const m = /scale\(([^)]+)\)/.exec(wrapper.style.transform || "");
    const origScale = m ? parseFloat(m[1]) || 1 : 1;
    const onMove = (ev) => {
      const delta = (ev.clientX - startX + (ev.clientY - startY)) / (baseW + baseH);
      const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, origScale + delta));
      wrapper.style.transform = `scale(${next})`;
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      const m2 = /scale\(([^)]+)\)/.exec(wrapper.style.transform || "");
      try { localStorage.setItem(scaleKey(key), String(m2 ? m2[1] : 1)); }
      catch (e) { /* storage unavailable */ }
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });

  // Double-click the corner to restore the card's default size.
  node.addEventListener("dblclick", (e) => {
    e.preventDefault();
    e.stopPropagation();
    try { localStorage.removeItem(scaleKey(key)); } catch (e) { /* ignore */ }
    wrapper.style.transform = "";
  });
};

// Each handle takes the widget's LAYOUT key so position and scale are stored
// per widget. DragHandle renders top-left, ResizeHandle bottom-right.
const DragHandle = ({ k }) =>
  h("div", { className: "ws-drag", title: "Drag to move · double-click to reset",
             ref: (n) => initDrag(n, k) }, "☰");

const ResizeHandle = ({ k }) =>
  h("div", { className: "ws-resize", title: "Drag to resize · double-click to reset",
             ref: (n) => initResize(n, k) }, "⤡");

// Last-known-good cache, persisted in localStorage with a timestamp.
const remember = (key, data) => {
  try { localStorage.setItem(`ws:${key}`, JSON.stringify({ data, ts: Date.now() })); }
  catch (e) { /* storage unavailable; skip */ }
};

const recall = (key) => {
  try { return JSON.parse(localStorage.getItem(`ws:${key}`)); }
  catch (e) { return null; }
};

const clockStamp = (ms) =>
  new Date(ms).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

// True before the command has produced any output (the initial load tick).
const isLoading = ({ output, error }) =>
  output === undefined && !error;

// Standard data flow for command-backed widgets. parse(output) must return a
// falsy value when there is nothing usable.
//   loading -> { loading: true }            render <Skel/>
//   success -> { data }                     cached as last-known-good
//   failure -> { data, staleTs }            last-known-good + time, render <Stale/>
//   cold    -> { data, mock: true }         mock data, nothing cached yet
const resolve = (key, props, parse, mock) => {
  if (isLoading(props)) return { loading: true };
  let data = null;
  try { data = parse(props.output); } catch (e) { data = null; }
  if (data) { remember(key, data); return { data }; }
  const cached = recall(key);
  if (cached && cached.data) return { data: cached.data, staleTs: cached.ts };
  return { data: mock, mock: true };
};
// --- End inlined design system ---
// NASA Astronomy Picture of the Day, shown full-bleed on a dark card.
//
// Image days render the photo; video days render an inline <video> when NASA
// supplies a direct .mp4, otherwise the supplied thumbnail with a play badge
// that opens the source. Clicking the caption expands the full explanation.
// When the fetch fails, a seeded starfield is drawn instead.
//
// To edit: set API_KEY below to a free key from https://api.nasa.gov for higher
// rate limits (DEMO_KEY works but is heavily throttled).
const API_KEY = "DEMO_KEY";

export const command =
  `curl -s "https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&thumbs=true"`;

export const refreshFrequency = 1000 * 60 * 60 * 6;
const FONTS = "daily-astronomy-photo.widget/fonts";
// A 1958 Philco Predicta: the picture tube is a khaki rounded shell on a
// brass stalk over a blond-wood cabinet with a cream control panel, two
// brass knobs, and a backlit channel window. Tonight's broadcast is NASA's
// picture of the day, behind curved glass with faint scanlines. Click the
// screen to open the full image, the panel text to read the explanation as
// a teletext page, the channel window to open the APOD page.
export const className = card("dark", 330, 352, ...LAYOUT.apod) + `
  @font-face { font-family: "Michroma"; src: url("${FONTS}/Michroma-400.woff2") format("woff2"); }
  @font-face { font-family: "Inter"; src: url("${FONTS}/Inter-500.woff2") format("woff2"); font-weight: 500; }
  @font-face { font-family: "Inter"; src: url("${FONTS}/Inter-600.woff2") format("woff2"); font-weight: 600; }
  @font-face { font-family: "VT323"; src: url("${FONTS}/VT323-400.woff2") format("woff2"); }
  --ui: "Inter", -apple-system, sans-serif; --khaki: #6B6B57; --khaki2: #4E4F40; --brass: #C9A55A; --panel: #F1EBDB;
  background: transparent; box-shadow: none; backdrop-filter: none; padding: 0; overflow: visible; user-select:none; -webkit-user-select:none;
  .ws-drag { top: 12px; left: 40px; color: rgba(255,255,255,0.7); background: rgba(0,0,0,0.3); } .ws-resize { bottom: 8px; right: 12px; color: #5b4322; background: rgba(0,0,0,0.08); }
  .tube { position:absolute; left: 24px; right: 24px; top: 4px; height: 214px; border-radius: 34px 34px 26px 26px / 30px 30px 22px 22px;
          background: linear-gradient(180deg, #7A7A64 0%, var(--khaki) 40%, var(--khaki2) 100%);
          box-shadow: 0 22px 34px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 0 0 1px #2E2F27, inset 0 -3px 6px rgba(0,0,0,0.4); }
  .bezel { position:absolute; inset: 10px 12px 20px; border-radius: 26px 26px 20px 20px / 24px 24px 18px 18px; background: #1E1F1A;
           box-shadow: inset 0 0 0 2px var(--brass), inset 0 0 0 3px #3B3A2E, 0 0 0 1px #2E2F27; }
  .screen { position:absolute; inset: 7px 8px 8px; border-radius: 22px 22px 16px 16px / 20px 20px 14px 14px; overflow:hidden; background:#07080A; cursor:pointer; }
  .screen .bg { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; filter: saturate(0.9) contrast(1.06); }
  .cosmic { position:absolute; inset:0; background: radial-gradient(240px at 30% 35%, rgba(124,77,196,0.85), transparent), radial-gradient(200px at 70% 55%, rgba(196,77,150,0.55), transparent), #0a0a14; }
  .star { position:absolute; border-radius:50%; background:#fff; } .hero { position:absolute; border-radius:50%; background:#fff; box-shadow: 0 0 10px 3px rgba(255,255,255,0.85), 0 0 24px 8px rgba(168,97,222,0.45); }
  .glass { position:absolute; inset:0; pointer-events:none; border-radius: inherit;
           background: radial-gradient(ellipse 60% 40% at 28% 18%, rgba(255,255,255,0.16), rgba(255,255,255,0) 60%), repeating-linear-gradient(0deg, rgba(0,0,0,0.13) 0 1px, rgba(0,0,0,0) 1px 3px);
           box-shadow: inset 0 0 50px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(0,0,0,0.6); }
  .playbadge { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:48px; height:48px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:16px; color:#fff; padding-left:4px; background:rgba(20,20,28,0.55); box-shadow:0 4px 14px rgba(0,0,0,0.5); }
  .teletext { position:absolute; inset:0; z-index:6; cursor:pointer; display:none; background: #06080B; color: #86F79E; padding: 16px 18px; font: 14px/1.25 "VT323", monospace; overflow:hidden; text-shadow: 0 0 6px rgba(134,247,158,0.5); }
  .teletext b { display:block; font-weight: 400; color: #F2F075; margin-bottom: 6px; }
  .apod-expanded .teletext { display:block; }
  .badge { position:absolute; left: 50%; bottom: 9px; transform: translateX(-50%); font: 400 6px/1 "Michroma", sans-serif; letter-spacing: 2.5px; color: var(--brass); text-shadow: 0 -1px 0 rgba(0,0,0,0.8); white-space: nowrap; }
  .stalk { position:absolute; left: 50%; top: 218px; width: 26px; height: 28px; margin-left: -13px; background: linear-gradient(90deg, #8C6E38, #E2C27C 45%, #8C6E38); box-shadow: 0 6px 8px rgba(0,0,0,0.4); }
  .stalk::before { content:""; position:absolute; left: -18px; top: -3px; width: 62px; height: 12px; border-radius: 6px; background: linear-gradient(180deg, #E2C27C, #9A7A40); box-shadow: 0 3px 5px rgba(0,0,0,0.4); }
  .cabinet { position:absolute; left: 0; right: 0; bottom: 0; height: 110px; border-radius: 5px;
             background: linear-gradient(90deg, #E4C797 0%, #D2B07A 30%, #E0C28F 60%, #CDA96F 100%);
             box-shadow: 0 30px 50px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -2px 0 rgba(0,0,0,0.2), 0 0 0 1px #9C7E4E; }
  .cabinet::before { content:""; position:absolute; inset:0; border-radius: inherit; pointer-events:none; opacity: 0.45; mix-blend-mode: multiply; background: repeating-linear-gradient(0deg, rgba(90,50,0,0.10) 0 1px, rgba(0,0,0,0) 1px 7px), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.12'/%3E%3C/svg%3E"); }
  .panel { position:absolute; left: 12px; right: 12px; top: 12px; bottom: 12px; border-radius: 3px; background: linear-gradient(180deg, #F5F0E1, var(--panel)); box-shadow: inset 0 0 0 1px #C6BBA0, inset 0 1px 0 #fff; }
  .title { position:absolute; left: 14px; right: 96px; top: 12px; font: 600 11px/1.25 var(--ui); color:#2B2622; letter-spacing: -0.1px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; cursor:pointer; }
  .credit { position:absolute; left: 14px; right: 96px; bottom: 12px; font: 500 8.5px/1.2 var(--ui); color:#7A7266; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .window { position:absolute; right: 52px; top: 14px; width: 34px; height: 52px; border-radius: 3px; cursor:pointer; background: radial-gradient(circle at 50% 30%, #FFF3C8, #E8CD86 70%); box-shadow: inset 0 0 0 1px #8C6E38, inset 0 0 8px rgba(120,80,0,0.4), 0 0 8px rgba(255,220,140,0.5); display:flex; flex-direction:column; align-items:center; justify-content:center; gap: 3px; }
  .window b { font: 400 6px/1 "Michroma", sans-serif; letter-spacing: 1px; color:#5A3F10; } .window i { font: 500 8px/1.15 var(--ui); font-style: normal; color:#3A2A0A; letter-spacing: 0.5px; text-align:center; white-space: pre-line; }
  .knob { position:absolute; width: 20px; height: 20px; border-radius: 50%; background: radial-gradient(circle at 40% 35%, #F0D89A, #9A7A40 70%); box-shadow: 0 2px 3px rgba(0,0,0,0.4), inset 0 0 0 1px #6E5222; }
  .knob::after { content:""; position:absolute; left: 50%; top: 3px; width: 2px; height: 6px; margin-left: -1px; background: #3A2A0A; }
  .knob.a { right: 20px; top: 14px; } .knob.b { right: 20px; top: 46px; transform: rotate(80deg); }
`;
// Deterministic starfield (plus one bright hero star) for the fallback backdrop.
const STARS = (() => {
  let s = 9;
  const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  return Array.from({ length: 64 }, () => ({
    x: rnd() * 100, y: rnd() * 100, r: 0.4 + rnd() * 1.2, o: 0.25 + rnd() * 0.6,
  }));
})();
const HERO = { x: 68, y: 28, r: 2.6 };

const MOCK = {
  title: "Nebula in Carina, Re-processed",
  caption: "A young open cluster carves through clouds of hydrogen 7,500 light-years away.",
  iso: "2026-05-21", date: "21 MAY 2026", credit: "NASA / Hubble",
  mediaType: "image", isMp4: false, url: null, link: null,
};

const fmtDate = (iso) => {
  if (!iso) return "";
  return new Date(iso + "T00:00:00Z")
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })
    .toUpperCase();
};

// Normalize the API response. Image days use the photo; video days use a direct
// .mp4 when present, otherwise the thumbnail. Credit is included only if given.
const parse = (output) => {
  const j = JSON.parse(output);
  if (!j || !j.title) return null;
  const isImg = j.media_type === "image";
  const isMp4 = !isImg && /\.mp4(\?|$)/i.test(j.url || "");
  return {
    title: j.title,
    caption: j.explanation || "",
    iso: j.date,
    date: fmtDate(j.date),
    credit: j.copyright ? j.copyright.trim() : null,
    mediaType: j.media_type,
    isMp4,
    url: isImg ? (j.hdurl || j.url) : (isMp4 ? j.url : (j.thumbnail_url || null)),
    link: isImg ? (j.hdurl || j.url) : (j.url || null),
  };
};

const apodPage = (iso) =>
  iso ? `https://apod.nasa.gov/apod/ap${iso.slice(2).replace(/-/g, "")}.html`
      : "https://apod.nasa.gov/apod/";

// Full-explanation overlay is toggled by adding/removing a class on the root
// node. Übersicht's render() only re-runs when command output changes, so we
// drive this directly via the DOM rather than React state — the panel is
// always in the tree and revealed by CSS when .apod-expanded is set.
const toggleExpand = (e) => {
  if (!e) return;
  e.stopPropagation();
  const root = e.currentTarget.closest("[data-apod-root]");
  if (root) root.classList.toggle("apod-expanded");
};

export const render = (props) => {
  const { data: m, loading, staleTs } = resolve("apod", props, parse, MOCK);
  if (loading) return <Skel tint={T.tintPurple} />;
  return (
    <div data-apod-root aria-label={`Astronomy picture of the day: ${m.title}`}>
      <div className="tube">
        <div className="bezel">
          <div className="screen" onClick={() => m.link && run(`open "${m.link}"`)}>
            {m.isMp4 ? <video className="bg" src={m.url} autoPlay loop muted playsInline /> : m.url ? <img className="bg" src={m.url} />
              : (<div className="cosmic">{STARS.map((s, i) => <div key={i} className="star" style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.r}px`, height: `${s.r}px`, opacity: s.o }} />)}<div className="hero" style={{ left: `${HERO.x}%`, top: `${HERO.y}%`, width: `${HERO.r * 2}px`, height: `${HERO.r * 2}px` }} /></div>)}
            {m.mediaType === "video" && !m.isMp4 && m.url && <div className="playbadge">&#x25B6;</div>}
            <div className="glass" />
            <div className="teletext" onClick={toggleExpand}><b>{m.title}</b>{m.caption.slice(0, 520)}{m.caption.length > 520 ? "…" : ""}</div>
          </div>
        </div>
        <div className="badge">PICTURE OF THE DAY</div>
      </div>
      <div className="stalk" />
      <div className="cabinet">
        <div className="panel">
          <div className="title" title="Read the explanation" onClick={toggleExpand}>{m.title}</div>
          <div className="credit">{m.credit ? `© ${m.credit}` : "NASA · Astronomy Picture of the Day"}</div>
          <div className="window" title="Open the APOD page" onClick={() => run(`open "${apodPage(m.iso)}"`)}><b>APOD</b><i>{(m.date || "").replace(/ /g, "\n")}</i></div>
          <span className="knob a" /><span className="knob b" />
        </div>
      </div>
      <DragHandle k="apod" />
      <ResizeHandle k="apod" />
      {staleTs && <Stale ts={staleTs} />}
    </div>
  );
};
