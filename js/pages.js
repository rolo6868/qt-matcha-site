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
