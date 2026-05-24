import { React, run } from "uebersicht";
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
              font-size:11px; line-height:1; cursor:grab; opacity:0.22;
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
               font-size:11px; line-height:1; cursor:nwse-resize; opacity:0.22;
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

export const className = card("dark", 320, 320, ...LAYOUT.apod) + `
  padding: 0;
  .bg      { position:absolute; inset:0; width:100%; height:100%;
             object-fit:cover; cursor:pointer; }
  .cosmic  { position:absolute; inset:0;
             background:
               radial-gradient(240px at 30% 35%, rgba(124,77,196,0.85), transparent),
               radial-gradient(200px at 70% 55%, rgba(196,77,150,0.55), transparent),
               #0a0a14; }
  .star    { position:absolute; border-radius:50%; background:#fff; }
  .hero    { position:absolute; border-radius:50%; background:#fff;
             box-shadow: 0 0 10px 3px rgba(255,255,255,0.85),
                         0 0 24px 8px rgba(168,97,222,0.45); }
  .playbadge { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
               width:56px; height:56px; border-radius:50%; cursor:pointer;
               display:flex; align-items:center; justify-content:center;
               font-size:20px; color:#fff; padding-left:4px;
               background:rgba(20,20,28,0.55); backdrop-filter:blur(6px);
               box-shadow:0 4px 14px rgba(0,0,0,0.5); }
  .date    { position:absolute; top:12px; right:12px; ${caption("rgba(255,255,255,0.7)")}
             font-size:9px; padding:6px; cursor:pointer; }
  .overlay { position:absolute; left:0; right:0; bottom:0; height:180px;
             background:linear-gradient(to bottom, transparent, rgba(0,0,0,0.7)); }
  .copy    { position:absolute; left:16px; right:16px; bottom:16px; cursor:pointer; }
  .title   { font-family:${serif}; font-style:italic; font-size:26px;
             letter-spacing:-0.5px; line-height:1.05; }
  .caption { font-family:${sans}; font-size:11px; color:rgba(255,255,255,0.6);
             margin-top:6px; display:-webkit-box; -webkit-line-clamp:2;
             -webkit-box-orient:vertical; overflow:hidden; }
  .credit  { ${caption("rgba(255,255,255,0.4)")} font-size:8px; margin-top:8px; }
  .expand  { position:absolute; inset:0; z-index:6; cursor:pointer;
             background:rgba(8,8,14,0.92); backdrop-filter:blur(8px);
             padding:22px; overflow-y:auto; }
  .etitle  { font-family:${serif}; font-style:italic; font-size:20px;
             color:${T.onDark}; line-height:1.1; }
  .etext   { font-family:${sans}; font-size:12px; line-height:1.5;
             color:rgba(255,255,255,0.78); margin-top:12px; }
  .ecredit { ${caption("rgba(255,255,255,0.45)")} font-size:8px; margin-top:14px; }
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

// Full-explanation overlay is toggled via localStorage; run("true") forces a
// re-render so the panel shows or hides on click.
const EXPAND_KEY = "ws:apod:expand";
const isExpanded = () => { try { return localStorage.getItem(EXPAND_KEY) === "1"; } catch (e) { return false; } };
const toggleExpand = (e) => {
  if (e && e.stopPropagation) e.stopPropagation();
  try { localStorage.setItem(EXPAND_KEY, isExpanded() ? "0" : "1"); } catch (err) {}
  run("true");
};

export const render = (props) => {
  const { data: m, loading, staleTs } = resolve("apod", props, parse, MOCK);
  if (loading) return <Skel tint={T.tintPurple} />;
  const expanded = isExpanded();

  return (
    <div aria-label={`Astronomy picture of the day: ${m.title}`}>
      <DragHandle k="apod" />
      <ResizeHandle k="apod" />
      {m.isMp4
        ? <video className="bg" src={m.url} autoPlay loop muted playsInline
                 onClick={() => m.link && run(`open "${m.link}"`)} />
        : m.url
          ? <img className="bg" src={m.url} onClick={() => m.link && run(`open "${m.link}"`)} />
          : (
            <div className="cosmic">
              {STARS.map((s, i) => (
                <div key={i} className="star" style={{
                  left: `${s.x}%`, top: `${s.y}%`,
                  width: `${s.r}px`, height: `${s.r}px`, opacity: s.o,
                }} />
              ))}
              <div className="hero" style={{
                left: `${HERO.x}%`, top: `${HERO.y}%`,
                width: `${HERO.r * 2}px`, height: `${HERO.r * 2}px`,
              }} />
            </div>
          )}
      {m.mediaType === "video" && !m.isMp4 && m.url &&
        <div className="playbadge" onClick={() => m.link && run(`open "${m.link}"`)}>&#x25B6;</div>}
      <div className="date" onClick={() => run(`open "${apodPage(m.iso)}"`)}>{m.date}</div>
      <div className="overlay" />
      <div className="copy" title="Click for full description" onClick={toggleExpand}>
        <div className="title">{m.title}</div>
        <div className="caption">{m.caption}</div>
        {m.credit && <div className="credit">{m.credit}</div>}
      </div>
      {expanded && (
        <div className="expand" onClick={toggleExpand}>
          <div className="etitle">{m.title}</div>
          <div className="etext">{m.caption}</div>
          {m.credit && <div className="ecredit">{m.credit}</div>}
        </div>
      )}
      {staleTs && <Stale ts={staleTs} />}
    </div>
  );
};
