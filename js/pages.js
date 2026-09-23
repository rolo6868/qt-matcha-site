// Shared interactions for sub-pages (shop, faq, subscribe).
// Menu drawer + the first-batch signup dialog. Klaviyo posting lives in js/main.js (.news-form).
(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const names = { strawberry: "Strawberry", peach: "White Peach", yuzu: "Lemon Yuzu", taster: "The Taster", variety: "Variety Pack" };
  const packets = { strawberry: "7036c-480.webp", peach: "93690-480.webp", yuzu: "d1e3c-480.webp", taster: "12c63-480.webp", variety: "12c63-480.webp" };

  const menuToggle = $("#menu-toggle");
  const menu = $("#menu");
  if (menuToggle && menu) {
    menuToggle.addEventListener("click", () => { menu.showModal(); menuToggle.setAttribute("aria-expanded", "true"); });
    $("#menu-close")?.addEventListener("click", () => menu.close());
    menu.addEventListener("close", () => menuToggle.setAttribute("aria-expanded", "false"));
    $$("#menu a").forEach((a) => a.addEventListener("click", () => menu.close()));
  }
  $$("dialog").forEach((panel) => {
    panel.addEventListener("click", (e) => {
      const r = panel.getBoundingClientRect();
      if (e.target === panel && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) panel.close();
    });
  });

  const dialog = $("#bag-dialog");
  function openSignup(flavor, source) {
    if (!dialog) return;
    const key = names[flavor] ? flavor : "variety";
    if (!dialog.classList.contains("is-subscribed")) {
      $("#stock-flavor").textContent = names[flavor] ? "Your pick: " + names[key] : "";
      $("#stock-packet").src = "images/brand-core/" + packets[key];
      $(".stock-form").dataset.tags = "waitlist,first-batch," + (source || "page") + ",flavor:" + key;
    }
    dialog.showModal();
  }
  $$("[data-signup]").forEach((el) =>
    el.addEventListener("click", (e) => { e.preventDefault(); openSignup(el.dataset.signup, el.dataset.source || document.body.dataset.page); })
  );
  $("#bag-open")?.addEventListener("click", () => openSignup("", document.body.dataset.page));
  $("#bag-close")?.addEventListener("click", () => dialog.close());
  dialog?.addEventListener("click", (e) => { if (e.target.closest("[data-stock-dismiss]")) dialog.close(); });
  $(".stock-form")?.addEventListener("qt:subscribed", () => dialog.classList.add("is-subscribed"));
})();

// Contact form. Set FORM_ENDPOINT to a form backend (e.g. https://formspree.io/f/XXXX or a Web3Forms key URL)
// to post silently. Until then the form composes an email in the visitor's mail app with everything pre-filled.
(() => {
  const FORM_ENDPOINT = "";
  const form = document.getElementById("contact-form");
  if (!form) return;
  const status = form.querySelector(".form-status");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.classList.remove("error");
    if (!form.reportValidity()) { status.textContent = "Please fill in your name, email, and a message."; status.classList.add("error"); return; }
    const d = Object.fromEntries(new FormData(form).entries());
    if (FORM_ENDPOINT) {
      const btn = form.querySelector("button[type=submit]"); btn.disabled = true; status.textContent = "Sending…";
      try {
        const r = await fetch(FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(d) });
        if (!r.ok) throw new Error(String(r.status));
        form.replaceChildren(Object.assign(document.createElement("p"), { className: "signup-success", textContent: "Thanks, QT! Your note is on its way. We'll reply from sipqtmatcha@gmail.com.", tabIndex: -1 }));
        form.firstChild.focus();
      } catch { btn.disabled = false; status.textContent = "That didn't send. Please email us at sipqtmatcha@gmail.com."; status.classList.add("error"); }
      return;
    }
    const subject = encodeURIComponent(`[${d.topic}] from ${d.name}`);
    const body = encodeURIComponent(`${d.message}\n\n— ${d.name}\n${d.email}`);
    location.href = `mailto:sipqtmatcha@gmail.com?subject=${subject}&body=${body}`;
    status.textContent = "Opening your email app with your note filled in. If nothing opened, email sipqtmatcha@gmail.com directly.";
  });
})();
