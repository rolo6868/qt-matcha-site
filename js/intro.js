// First-visit "pour" intro. Plays once per browser; never on the waitlist/packaging/legal pages;
// respects prefers-reduced-motion (jumps straight to the card); Escape / "No thanks" / ✕ drain it away.
(() => {
  const KEY = "qt_intro_seen";
  const page = (location.pathname.split("/").pop() || "index.html").replace(/\.html$/, "") || "index";
  if (["waitlist", "packaging", "privacy", "terms", "accessibility", "404", "contact"].includes(page)) return;
  const force = /[?&]intro=1/.test(location.search);
  try { if (!force && localStorage.getItem(KEY)) return; } catch { /* storage blocked: show once this load */ }
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const el = document.createElement("div");
  el.className = "qt-intro"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-labelledby", "intro-title"); el.hidden = true;
  el.innerHTML = `
    <canvas class="pour-canvas" aria-hidden="true"></canvas>
    <div class="intro-card">
      <button class="close-button" type="button" aria-label="Close" data-intro-close>×</button>
      <img src="images/brand-core/7036c-480.webp" alt="" width="150" height="118" />
      <p class="eyebrow">FIRST TIME HERE? WE POURED YOU ONE.</p>
      <h2 id="intro-title">Get first dibs<br />on the first batch.</h2>
      <p>Fruit-forward matcha with iron, vitamin C, and collagen. Hear the moment it's in stock, plus 15% off your first order.</p>
      <form class="news-form intro-form" data-tags="waitlist,first-batch,intro" data-success="You're in, QT. Watch your inbox for the first pour.">
        <label for="intro-email">Email address</label>
        <input id="intro-email" name="email" type="email" placeholder="Your email address" autocomplete="email" required />
        <button class="btn" type="submit">Pour me in →</button>
      </form>
      <p class="intro-fine">By signing up you agree to receive QT Matcha emails. Unsubscribe anytime.</p>
      <button class="intro-skip plain" type="button" data-intro-close>No thanks, just browsing</button>
    </div>`;

  // Append now (hidden) so main.js, which runs after this script, binds the Klaviyo handler to the form.
  document.body.appendChild(el);
  let lastFocus = null;
  let stopPour = null;
  // Scroll lock that also holds on iOS Safari (overflow:hidden alone doesn't): pin the body at the current offset.
  let lockY = 0;
  function lock() {
    lockY = window.scrollY || 0;
    document.documentElement.style.overflow = "hidden";
    Object.assign(document.body.style, { position: "fixed", top: `-${lockY}px`, left: "0", right: "0", width: "100%" });
  }
  function unlock() {
    document.documentElement.style.overflow = "";
    Object.assign(document.body.style, { position: "", top: "", left: "", right: "", width: "" });
    window.scrollTo(0, lockY);
  }
  function open() {
    el.hidden = false; lastFocus = document.activeElement;
    lock();
    const canvas = el.querySelector(".pour-canvas");
    const finish = () => { el.classList.add("is-full"); focusCard(); };
    if (reduce || !window.qtPour) { el.classList.add("is-pouring"); finish(); return; }
    const canvasPour = () => { stopPour = window.qtPour.start(canvas, { duration: 2700, onFull: finish }); };
    setTimeout(() => {
      el.classList.add("is-pouring");
      // Desktop: pre-rendered fluid-sim pour (video + WebGL). Falls back to the 2D canvas pour if it
      // can't load within a couple of seconds, or on phones / slow connections / reduced motion.
      if (window.qtPourVideo?.supported()) {
        let fellBack = false;
        const stopVideo = window.qtPourVideo.start(canvas, {
          src: "video/pour-stacked.mp4", fullAt: 2.55, onFull: finish,
          onFail: () => { if (fellBack) return; fellBack = true; const c2 = canvas.cloneNode(); canvas.replaceWith(c2); stopPour = window.qtPour.start(c2, { duration: 2700, onFull: finish }); }
        });
        if (!fellBack) stopPour = stopVideo;
      } else canvasPour();
    }, 60);
  }
  // Touch devices: focus the dialog itself, not the input — auto-focusing an input pops the keyboard,
  // which shrinks the viewport and shoves the card off-centre / behind the keyboard on iOS.
  const touch = matchMedia("(hover: none) and (pointer: coarse)").matches;
  el.tabIndex = -1;
  function focusCard() { setTimeout(() => (touch ? el : el.querySelector("#intro-email"))?.focus({ preventScroll: true }), 350); }
  function close() {
    try { localStorage.setItem(KEY, String(Date.now())); } catch {}
    el.classList.remove("is-full"); el.classList.add("is-draining");
    const done = () => { stopPour?.(); el.hidden = true; unlock(); lastFocus?.focus?.(); el.remove(); };
    reduce ? done() : setTimeout(done, 950);
  }
  el.addEventListener("click", (e) => { if (e.target.closest("[data-intro-close]")) close(); });
  el.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { e.preventDefault(); close(); }
    if (e.key === "Tab") { // keep focus inside the card
      const f = [...el.querySelectorAll("button, input, a[href]")].filter((n) => !n.disabled);
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });
  // main.js posts the form to Klaviyo and fires qt:subscribed on success → mark seen and drain after a beat.
  el.querySelector(".intro-form").addEventListener("qt:subscribed", () => { try { localStorage.setItem(KEY, "subscribed"); } catch {} setTimeout(close, 2200); });

  // Only pour while the visitor is actually looking: if the page loaded in a background tab, wait
  // for it to become visible, then run the full sequence from the top.
  let started = false;
  const start = () => {
    if (started) return;
    if (document.visibilityState === "hidden") { document.addEventListener("visibilitychange", start, { once: true }); return; }
    started = true; setTimeout(open, 700);
  };
  if (document.readyState !== "loading") start(); else document.addEventListener("DOMContentLoaded", start, { once: true });
})();
