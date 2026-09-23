// Shopify wiring for qtmatcha.com.
// Shopify (Starter plan) is checkout-only: there is no hosted cart page, so "Add to bag" = a cart permalink
// that lands the visitor directly in Shopify checkout with the chosen variant and quantity.
//
// CHECKOUT_ENABLED = false  →  every Add-to-bag / Notify-me button keeps opening the first-batch email dialog.
// CHECKOUT_ENABLED = true   →  the same buttons send the visitor to Shopify checkout. Flip this ONE line at launch.
(() => {
  const CHECKOUT_ENABLED = false;
  const SHOP = "https://jpx1pk-fk.myshopify.com";
  // Variant IDs verified against the store on 2026-09-23. Prices are informational (Shopify is the source of truth).
  const VARIANTS = {
    strawberry: { id: 67375154594096, price: 24.79, label: "Strawberry · 10 packets" },
    peach:      { id: 67375158100272, price: 24.79, label: "White Peach · 10 packets" },
    yuzu:       { id: 67375152431408, price: 24.79, label: "Lemon Yuzu · 10 packets" },
    taster:     { id: 67835222327600, price: 7.99,  label: "The Taster · 3 packets" },
    variety:    { id: 67375159247152, price: 59.00, label: "Variety Pack · 30 packets" },
  };
  const checkoutUrl = (key, qty) => `${SHOP}/cart/${VARIANTS[key].id}:${Math.max(1, qty | 0)}`;

  window.qtCommerce = { CHECKOUT_ENABLED, VARIANTS, checkoutUrl };
  document.documentElement.dataset.checkout = CHECKOUT_ENABLED ? "on" : "off";

  // Homepage buy box: live price for the selected flavor (runs whether or not checkout is on).
  const PACKS = { strawberry: 10, peach: 10, yuzu: 10, taster: 3, variety: 30 };
  const money = (n) => "$" + (Number.isInteger(n) ? n.toFixed(0) : n.toFixed(2));
  const priceEl = document.getElementById("buy-price");
  const perEl = document.getElementById("buy-per");
  function renderPrice() {
    const key = document.querySelector("input[name=flavor]:checked")?.value;
    const v = VARIANTS[key]; if (!v || !priceEl) return;
    const qty = Math.max(1, Number(document.getElementById("quantity")?.value || 1));
    priceEl.textContent = money(v.price * qty);
    if (perEl) perEl.textContent = `${PACKS[key]} packets · $${(v.price / PACKS[key]).toFixed(2)} each` + (qty > 1 ? ` · ×${qty}` : "");
  }
  if (priceEl) {
    document.querySelectorAll("input[name=flavor]").forEach((i) => i.addEventListener("change", renderPrice));
    document.getElementById("quantity")?.addEventListener("input", renderPrice);
    ["quantity-minus", "quantity-plus"].forEach((id) => document.getElementById(id)?.addEventListener("click", () => setTimeout(renderPrice, 0)));
    renderPrice();
  }
  if (!CHECKOUT_ENABLED) return;

  // Homepage buy box: flavor radios + quantity stepper.
  const homeBtn = document.getElementById("add-to-bag");
  if (homeBtn) {
    homeBtn.addEventListener("click", (e) => {
      const key = document.querySelector("input[name=flavor]:checked")?.value || "strawberry";
      const qty = Number(document.getElementById("quantity")?.value || 1);
      if (!VARIANTS[key]) return;
      e.stopImmediatePropagation(); e.preventDefault();
      location.href = checkoutUrl(key, qty);
    }, true);
  }
  // Sub-pages: any [data-signup="<key>"] button becomes a checkout link.
  document.querySelectorAll("[data-signup]").forEach((btn) => {
    const key = btn.dataset.signup;
    if (!VARIANTS[key]) return;
    btn.addEventListener("click", (e) => {
      e.stopImmediatePropagation(); e.preventDefault();
      location.href = checkoutUrl(key, 1);
    }, true);
  });
})();
