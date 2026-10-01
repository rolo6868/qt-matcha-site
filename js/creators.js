// /creators: qt creator crew application. Step-through "app" inside a phone.
// Posts to Klaviyo's client API as a "Creator Application" event (no marketing consent implied).
// Only if the applicant ticks the optional box do we also subscribe them to the waitlist list.
(() => {
  const KLAVIYO = { companyId: "TULcea", waitlistListId: "U5ccR9", revision: "2024-10-15" };
  const form = document.getElementById("crew-form");
  if (!form) return;

  const screens = [...form.querySelectorAll(".screen")];
  const LAST_INPUT_STEP = 4;
  const DONE_STEP = 5;
  const nextBtn = document.getElementById("crew-next");
  const backBtn = document.querySelector("[data-back]");
  const stepLabel = document.getElementById("app-step");
  const fill = document.getElementById("app-progress-fill");
  const submitErr = document.getElementById("crew-submit-err");
  const labels = { 0: "Let's go", 1: "Next", 2: "Next", 3: "Next", 4: "Send application" };
  let step = 0;
  let busy = false;
  let started = false;
  const stage = document.querySelector(".crew-stage");
  const phone = document.querySelector(".phone");

  function start() {
    if (step === 0) show(1);
    const r = phone.getBoundingClientRect();
    if (r.top < 0 || r.bottom > innerHeight) {
      phone.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    }
    document.getElementById("crew-name").focus({ preventScroll: true });
  }
  document.querySelectorAll("[data-start]").forEach((b) => b.addEventListener("click", start));
  form.querySelector('.screen[data-step="0"]').addEventListener("click", () => { if (step === 0) start(); });

  function show(n, dir = 1) {
    screens.forEach((s) => {
      const on = Number(s.dataset.step) === n;
      s.hidden = !on;
      if (on) {
        s.classList.toggle("back-in", dir < 0);
        s.style.animation = "none"; void s.offsetWidth; s.style.animation = "";
        s.scrollTop = 0;
      }
    });
    step = n;
    backBtn.hidden = n === 0 || n === DONE_STEP;
    stepLabel.textContent = n >= 1 && n <= LAST_INPUT_STEP ? `${n}/${LAST_INPUT_STEP}` : "";
    fill.style.width = `${(Math.min(n, LAST_INPUT_STEP) / LAST_INPUT_STEP) * 100}%`;
    nextBtn.innerHTML = `${labels[n] || "Next"} <span aria-hidden="true">→</span>`;
    form.classList.toggle("is-done", n === DONE_STEP);
    stage.classList.toggle("started", n > 0);
    if (started && matchMedia("(max-width: 640px)").matches) {
      document.querySelector(".phone").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    }
    started = true;
  }

  // ---------- validation ----------
  const normUrl = (v) => {
    v = v.trim();
    if (!v) return "";
    if (!/^https?:\/\//i.test(v)) v = "https://" + v;
    try { const u = new URL(v); return /\./.test(u.hostname) ? u.href : null; } catch { return null; }
  };
  const errFor = (el) => document.getElementById(`${el.id}-err`);
  function setErr(el, msg, errEl) {
    const target = errEl || errFor(el);
    if (el) el.setAttribute("aria-invalid", msg ? "true" : "false");
    if (target) target.textContent = msg || "";
    if (el && target) {
      const ids = new Set((el.getAttribute("aria-describedby") || "").split(" ").filter(Boolean));
      ids.add(target.id);
      el.setAttribute("aria-describedby", [...ids].join(" "));
    }
  }

  function validate(n) {
    const scr = screens.find((s) => Number(s.dataset.step) === n);
    const bad = [];
    scr.querySelectorAll('input[type="text"], input[type="email"], select, textarea').forEach((el) => {
      if (el.closest(".hp")) return;
      let msg = "";
      const v = el.value.trim();
      if (el.required && !v) msg = "This one's needed.";
      else if (el.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = "That email doesn't look quite right.";
      else if (el.name === "zip" && v && !/^\d{5}(-?\d{4})?$/.test(v)) msg = "Use a 5-digit US ZIP.";
      else if (el.hasAttribute("data-url") && v && !normUrl(v)) msg = "Paste the full link to the post.";
      setErr(el, msg);
      if (msg) bad.push(el);
    });
    // radio groups
    scr.querySelectorAll('fieldset').forEach((fs) => {
      const radios = fs.querySelectorAll('input[type="radio"]');
      const err = fs.querySelector(".f-err");
      if (radios.length && radios[0].required) {
        const ok = [...radios].some((r) => r.checked);
        err.textContent = ok ? "" : "Pick one.";
        if (!ok) bad.push(radios[0]);
      }
    });
    // required checkboxes (fine print)
    const reqChecks = [...scr.querySelectorAll('.checks input[type="checkbox"][required]')];
    if (reqChecks.length) {
      const missing = reqChecks.filter((c) => !c.checked);
      reqChecks.forEach((c) => c.closest(".check").toggleAttribute("data-invalid", !c.checked));
      document.getElementById("crew-checks-err").textContent = missing.length ? "Tick each of the four boxes above to send." : "";
      if (missing.length) bad.push(missing[0]);
    }
    if (bad.length) { bad[0].focus({ preventScroll: false }); return false; }
    return true;
  }

  // clear an error as soon as it's fixed
  form.addEventListener("input", (e) => {
    const el = e.target;
    if (el.getAttribute("aria-invalid") === "true") setErr(el, "");
    if (el.type === "radio") { const err = el.closest("fieldset")?.querySelector(".f-err"); if (err) err.textContent = ""; }
    if (el.closest(".check")) el.closest(".check").removeAttribute("data-invalid");
    if (el.id === "crew-why") document.getElementById("crew-why-count").textContent = `${280 - el.value.length} left`;
    if (el.id === "crew-handle" && el.value.startsWith("@")) el.value = el.value.replace(/^@+/, "");
  });

  // ---------- Klaviyo ----------
  async function post(path, body) {
    const res = await fetch(`https://a.klaviyo.com/client/${path}/?company_id=${encodeURIComponent(KLAVIYO.companyId)}`, {
      method: "POST",
      signal: AbortSignal.timeout ? AbortSignal.timeout(15000) : undefined,
      headers: { "Content-Type": "application/json", revision: KLAVIYO.revision },
      body: JSON.stringify(body),
    });
    return res.ok;
  }

  function collect() {
    const fd = new FormData(form);
    const g = (k) => (fd.get(k) || "").toString().trim();
    return {
      name: g("name"),
      email: g("email").toLowerCase(),
      zip: g("zip"),
      platform: g("platform"),
      handle: g("handle").replace(/^@+/, ""),
      followers: g("followers"),
      best_post: normUrl(g("best_post")) || "",
      qt_post: normUrl(g("qt_post")) || "",
      styles: fd.getAll("style"),
      flavor: g("flavor"),
      why: g("why"),
      newsletter: fd.get("newsletter") === "on",
      honeypot: g("company"),
    };
  }

  async function submit() {
    const d = collect();
    if (d.honeypot) { show(DONE_STEP); return; } // quietly drop bots
    const [first, ...rest] = d.name.split(/\s+/);
    const agreed = new Date().toISOString();
    const props = {
      platform: d.platform, handle: d.handle, followers: d.followers,
      best_post_url: d.best_post, qt_post_url: d.qt_post || null, has_qt_post: !!d.qt_post,
      content_styles: d.styles, flavor: d.flavor, why_qt: d.why,
      confirmed_18_us: true, agreed_disclosure: true, agreed_no_health_claims: true,
      agreed_at: agreed, page: location.href,
    };
    const ok = await post("events", {
      data: {
        type: "event",
        attributes: {
          properties: props,
          metric: { data: { type: "metric", attributes: { name: "Creator Application" } } },
          profile: {
            data: {
              type: "profile",
              attributes: {
                email: d.email,
                first_name: first || undefined,
                last_name: rest.join(" ") || undefined,
                location: { zip: d.zip, country: "United States" },
                properties: {
                  creator_applicant: true,
                  creator_status: "applied",
                  creator_platform: d.platform,
                  creator_handle: d.handle,
                  creator_followers: d.followers,
                  creator_best_post: d.best_post,
                  creator_qt_post: d.qt_post || null,
                  creator_flavor: d.flavor,
                  creator_applied_at: agreed,
                },
              },
            },
          },
        },
      },
    }).catch(() => false);

    if (!ok) return false;

    if (d.newsletter) {
      // best effort; the application already landed
      post("subscriptions", {
        data: {
          type: "subscription",
          attributes: { profile: { data: { type: "profile", attributes: { email: d.email, properties: { source: "creators" } } } } },
          relationships: { list: { data: { type: "list", id: KLAVIYO.waitlistListId } } },
        },
      }).catch(() => {});
    }
    return true;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (busy) return;
    if (step === 0) { start(); return; }
    if (!validate(step)) return;
    if (step < LAST_INPUT_STEP) {
      show(step + 1);
      const first = screens[step].querySelector("input:not([type=hidden]):not([tabindex='-1']), select, textarea");
      if (first) first.focus({ preventScroll: true });
      return;
    }
    busy = true;
    submitErr.textContent = "";
    nextBtn.setAttribute("aria-busy", "true");
    nextBtn.innerHTML = "Sending…";
    const ok = await submit();
    busy = false;
    nextBtn.removeAttribute("aria-busy");
    if (ok) {
      show(DONE_STEP);
      screens[DONE_STEP].focus();
    } else {
      nextBtn.innerHTML = `Try again <span aria-hidden="true">→</span>`;
      submitErr.innerHTML = 'Something hiccuped on our end. Try again, or email <a href="mailto:sipqtmatcha@gmail.com?subject=qt%20creator%20crew">sipqtmatcha@gmail.com</a>.';
    }
  });

  backBtn.addEventListener("click", () => {
    if (step > 0 && step !== DONE_STEP) show(step - 1, -1);
    nextBtn.focus({ preventScroll: true });
  });

  show(0);
})();
