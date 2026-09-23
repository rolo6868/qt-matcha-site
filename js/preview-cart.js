/* Local prototype only. Replace this provider with native Shopify cart calls on migration.
   No product pricing, inventory, discount, or order logic belongs in this adapter. */
(() => {
  const storageKey = "qt-preview-bag-v1";
  const allowed = new Set(["strawberry", "peach", "yuzu", "variety"]);
  let items = [];
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey) || "[]");
    if (Array.isArray(saved))
      items = saved
        .filter(
          (item) =>
            item &&
            allowed.has(item.flavor) &&
            ["one-time", "subscribe"].includes(item.routine) &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0 &&
            item.quantity <= 99,
        )
        .slice(0, 8);
  } catch {
    /* Preview works even when storage is unavailable. */
  }
  function save() {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(items));
    } catch {}
  }
  window.QTPreviewCart = {
    read: () => items.map((item) => ({ ...item })),
    add({ flavor, routine, quantity }) {
      if (!allowed.has(flavor) || !["one-time", "subscribe"].includes(routine))
        return;
      const count = Math.max(
        1,
        Math.min(99, Math.floor(Number(quantity)) || 1),
      );
      const existing = items.find(
        (item) => item.flavor === flavor && item.routine === routine,
      );
      if (existing) existing.quantity = Math.min(99, existing.quantity + count);
      else items.push({ flavor, routine, quantity: count });
      save();
    },
    remove(index) {
      items.splice(index, 1);
      save();
    },
  };
})();
