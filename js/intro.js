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
    <div class="pour-stream" aria-hidden="true"></div>
    <div class="pour-liquid" aria-hidden="true"><div class="pour-wave"></div><div class="pour-wave two"></div>
      ${Array.from({length: 26}, (_, i) => { const sz = 5 + ((i * 7) % 12); const dur = 2.4 + ((i * 13) % 21) / 10; return `<span class="bubble" style="left:${3 + ((i * 37) % 94)}%;animation-delay:${((i * 0.29) % 2.6).toFixed(2)}s;animation-duration:${dur.toFixed(2)}s;width:${sz}px;height:${sz}px"></span>`; }).join("")}
    </div>
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
  function open() {
    el.hidden = false; lastFocus = document.activeElement;
    document.documentElement.style.overflow = "hidden";
    // Force a style/layout pass with the liquid at height 0 before the class flips, so the height
    // transition actually runs. Timers (not requestAnimationFrame) so this also works if the tab
    // was loaded in the background: rAF is frozen in hidden tabs, timers are not.
    void el.querySelector(".pour-liquid").offsetHeight;
    if (reduce) { el.classList.add("is-pouring", "is-full"); focusCard(); return; }
    setTimeout(() => {
      el.classList.add("is-pouring");
      setTimeout(() => { el.classList.add("is-full"); focusCard(); }, 2600);
    }, 60);
  }
  function focusCard() { setTimeout(() => el.querySelector("#intro-email")?.focus({ preventScroll: true }), 350); }
  function close() {
    try { localStorage.setItem(KEY, String(Date.now())); } catch {}
    el.classList.remove("is-full"); el.classList.add("is-draining");
    const done = () => { el.hidden = true; document.documentElement.style.overflow = ""; lastFocus?.focus?.(); el.remove(); };
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
