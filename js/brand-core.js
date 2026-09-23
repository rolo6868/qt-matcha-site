/* QT Brand Core — native browser interactions, no build dependencies. */
(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const media = "images/brand-core/";
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const flavors = {
    strawberry: {
      name: "Strawberry",
      packet: "7036c-960.webp",
      lifestyle: "f2a01-960.webp",
    },
    peach: {
      name: "White Peach",
      packet: "93690-960.webp",
      lifestyle: "0af84-960.webp",
    },
    yuzu: {
      name: "Lemon Yuzu",
      packet: "d1e3c-960.webp",
      lifestyle: "32119-960.webp",
    },
    variety: {
      name: "Variety Pack",
      packet: "12c63-960.webp",
      lifestyle: "12c63-960.webp",
    },
  };
  const approvedPhotos = { strawberry: [30, 6, 9, 15, 18, 33], peach: [17, 2, 11, 13, 29, 34], yuzu: [14, 4, 8, 16, 32], variety: [30, 17, 14, 9, 13, 32] };
  const photoDescriptions = {"2": "White Peach QT with an iced matcha at home", "4": "Lemon Yuzu QT and iced matcha in the sunshine", "6": "Strawberry QT beside an open ice-filled bottle", "8": "Lemon Yuzu QT tucked into an everyday routine", "9": "Strawberry QT and an iced matcha moment", "11": "White Peach QT after a workout", "13": "White Peach QT packet held beside a refreshing drink", "14": "Lemon Yuzu QT with a green matcha water bottle", "15": "Strawberry QT and iced matcha during a cozy pause", "16": "Lemon Yuzu QT and a daily matcha break", "17": "White Peach QT beside a bottle ready to mix", "18": "Strawberry QT on the go", "29": "White Peach QT and iced matcha on the road", "30": "Iced matcha and a Strawberry QT packet in the sunshine", "32": "Lemon Yuzu QT and an iced drink at home", "33": "Strawberry QT during a sunny afternoon break", "34": "White Peach QT and a refreshing little pause"};
  const photoPath = (n, width = 960) => `images/lifestyle/qt-lifestyle-${String(n).padStart(2, "0")}-${width}.webp`;
  const galleryKeys = () => ["packet", "variety", "lifestyle", ...approvedPhotos[selected].map(n => "photo:" + n)];
  let selected = "strawberry";
  let galleryView = "lifestyle";
  const menuToggle = $("#menu-toggle");
  const menu = $("#menu");
  function closeMenu() {
    menu.close();
  }
  menuToggle.addEventListener("click", () => {
    menu.showModal();
    menuToggle.setAttribute("aria-expanded", "true");
  });
  $("#menu-close").addEventListener("click", closeMenu);
  menu.addEventListener("close", () =>
    menuToggle.setAttribute("aria-expanded", "false"),
  );
  $$("#menu a").forEach((a) => a.addEventListener("click", closeMenu));
  $$("dialog").forEach((panel) => {
    panel.addEventListener("click", (e) => {
      const rect = panel.getBoundingClientRect();
      if (
        e.target === panel &&
        (e.clientX < rect.left ||
          e.clientX > rect.right ||
          e.clientY < rect.top ||
          e.clientY > rect.bottom)
      )
        panel.close();
    });
  });

  const tabs = $$("[role=tab]");
  function selectTab(tab) {
    tabs.forEach((t) => {
      const active = t === tab;
      t.setAttribute("aria-selected", String(active));
      t.tabIndex = active ? 0 : -1;
      t.classList.toggle("outline", !active);
      document.getElementById(t.getAttribute("aria-controls")).hidden = !active;
    });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", (e) => {
      let next;
      if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (e.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
      if (e.key === "Home") next = 0;
      if (e.key === "End") next = tabs.length - 1;
      if (next !== undefined) {
        e.preventDefault();
        selectTab(tabs[next]);
        tabs[next].focus();
      }
    });
  });

  function setImage(image, filename) {
    image.src = media + filename;
    image.srcset = `${media + filename.replace("-960.", "-480.")} 480w, ${media + filename} 960w`;
  }
  function updateGallery(view = galleryView) {
    galleryView = view;
    const flavor = flavors[selected];
    const isPhoto = view.startsWith("photo:");
    const number = isPhoto ? Number(view.split(":")[1]) : null;
    if (isPhoto) {
      $("#product-image").src = photoPath(number);
      $("#product-image").srcset = `${photoPath(number,480)} 480w, ${photoPath(number)} 960w`;
      $("#product-image").alt = photoDescriptions[number];
    } else {
      setImage($("#product-image"), view === "variety" ? flavors.variety.packet : flavor[view]);
      $("#product-image").alt = view === "variety" ? "All three QT Matcha flavors" : flavor.name + " QT Matcha " + (view === "packet" ? "packet" : "with fresh fruit");
    }
    $("#product-image").classList.toggle("contain", !isPhoto && (view !== "lifestyle" || selected === "variety"));
    $("#product-image").classList.toggle("approved-photo", isPhoto);
    const keys = galleryKeys();
    $("#gallery-position").textContent = `Photo ${keys.indexOf(view)+1} of ${keys.length}`;
    $$("[data-gallery]").forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.gallery === view),
      ),
    );
  }
  function selectFlavor(key) {
    if (!flavors[key]) return;
    selected = key;
    const f = flavors[key];
    $(`input[name=flavor][value=${key}]`).checked = true;
    $("#selected-flavor").textContent = f.name;
    $("#gallery-caption").textContent =
      f.name.toUpperCase() + " / YOUR DAILY QT";
    setImage($("#packet-thumbnail"), f.packet);
    setImage($("#lifestyle-thumbnail"), f.lifestyle);
    renderPhotoThumbnails();
    updateGallery("lifestyle");
  }
  $$("[data-select-flavor]").forEach((a) =>
    a.addEventListener("click", () => selectFlavor(a.dataset.selectFlavor)),
  );
  $$("input[name=flavor]").forEach((input) =>
    input.addEventListener("change", () => selectFlavor(input.value)),
  );
  function renderPhotoThumbnails() {
    $$(".thumbnails [data-approved-photo]").forEach(el => el.remove());
    approvedPhotos[selected].forEach(number => {
      const button = document.createElement("button");
      button.type = "button"; button.dataset.gallery = "photo:" + number;
      button.dataset.approvedPhoto = "true";
      button.setAttribute("aria-label", "View " + photoDescriptions[number]);
      button.setAttribute("aria-pressed", "false");
      const image = document.createElement("img");
      image.src = photoPath(number, 240); image.alt = ""; image.width = 90; image.height = 100;
      image.loading = "lazy"; image.decoding = "async";
      button.append(image); $(".thumbnails").append(button);
    });
    $(".thumbnails").scrollLeft = 0;
  }
  $(".thumbnails").addEventListener("click", event => {
    const button = event.target.closest("[data-gallery]");
    if (button) updateGallery(button.dataset.gallery);
  });
  function moveGallery(direction) {
    const keys = galleryKeys(); updateGallery(keys[(keys.indexOf(galleryView) + direction + keys.length) % keys.length]);
    const thumb = $(`[data-gallery="${galleryView}"]`);
    const strip = $(".thumbnails");
    strip.scrollTo({left: thumb.offsetLeft - strip.offsetLeft - (strip.clientWidth - thumb.clientWidth)/2, behavior: reducedMotion.matches ? "instant" : "smooth"});
  }
  $("#gallery-prev").addEventListener("click", () => moveGallery(-1));
  $("#gallery-next").addEventListener("click", () => moveGallery(1));
  $(".gallery-main").addEventListener("keydown", event => {
    if (["ArrowLeft", "ArrowRight"].includes(event.key)) { event.preventDefault(); moveGallery(event.key === "ArrowRight" ? 1 : -1); }
  });
  let touchStart = null;
  $(".gallery-main").addEventListener("touchstart", event => { const t=event.changedTouches[0]; touchStart={x:t.clientX,y:t.clientY}; }, {passive:true});
  $(".gallery-main").addEventListener("touchend", event => { if (!touchStart) return; const t=event.changedTouches[0], dx=t.clientX-touchStart.x, dy=t.clientY-touchStart.y; if(Math.abs(dx)>45 && Math.abs(dx)>Math.abs(dy)*1.5) moveGallery(dx<0?1:-1); touchStart=null; }, {passive:true});
  renderPhotoThumbnails(); updateGallery("lifestyle");
  const quantity = $("#quantity");
  function setQuantity(n) {
    quantity.value = Math.max(1, Math.min(99, Math.floor(Number(n)) || 1));
    $("#quantity-minus").disabled = Number(quantity.value) <= 1;
    $("#quantity-plus").disabled = Number(quantity.value) >= 99;
  }
  quantity.addEventListener("change", () => setQuantity(quantity.value));
  $("#quantity-minus").addEventListener("click", () =>
    setQuantity(Number(quantity.value) - 1),
  );
  $("#quantity-plus").addEventListener("click", () =>
    setQuantity(Number(quantity.value) + 1),
  );

  // Prelaunch: purchase intent joins the existing Klaviyo waitlist, never a mock cart.
  const dialog = $("#bag-dialog");
  function openStockSignup(withFlavor = false) {
    if (!dialog.classList.contains("is-subscribed")) {
      const key = withFlavor ? selected : "variety";
      dialog.dataset.flavor = key;
      setImage($("#stock-packet"), flavors[key].packet);
    }
    $("#stock-flavor").textContent = withFlavor ? "Your pick: " + flavors[selected].name : "";
    $(".stock-form").dataset.tags = "waitlist,first-batch,brand-core" +
      (withFlavor ? ",flavor:" + selected : "");
    dialog.showModal();
  }
  $("#add-to-bag").addEventListener("click", () => openStockSignup(true));
  $("#bag-open").addEventListener("click", () => openStockSignup());
  $("#bag-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target.closest("[data-stock-dismiss]")) dialog.close();
  });
  $(".stock-form").addEventListener("qt:subscribed", () => {
    dialog.classList.add("is-subscribed");
    $("#bag-title").textContent = "Good things are coming, QT.";
    $("#stock-description").textContent = "Thanks for joining our first-batch list.";
  });
  $$('a[href="#nutrition"]').forEach((a) =>
    a.addEventListener("click", () => {
      $$("#nutrition details")[1].open = true;
    }),
  );
  $("#year").textContent = new Date().getFullYear();

  // Continuous carousel, with pointer drag, keyboard, explicit pause, and reduced-motion support.
  const carousel = $(".carousel");
  const track = $(".carousel-track");
  [...track.children].forEach((figure) => {
    const clone = figure.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.append(clone);
  });
  let frame = null;
  let paused =
      reducedMotion.matches ||
      matchMedia("(pointer: coarse)").matches ||
      innerWidth <= 760,
    hovering = false,
    focused = false,
    dragging = false,
    visible = false,
    lastTime = 0,
    startX = 0,
    startScroll = 0;
  function updatePause() {
    $("#carousel-pause").textContent = paused ? "▶ Play" : "Ⅱ Pause";
    $("#carousel-pause").setAttribute("aria-pressed", String(paused));
    if (!paused) startCarousel();
  }
  updatePause();
  $("#carousel-pause").addEventListener("click", () => {
    paused = !paused;
    updatePause();
  });
  reducedMotion.addEventListener("change", () => {
    paused = reducedMotion.matches;
    updatePause();
  });
  carousel.addEventListener("pointerenter", () => {
    hovering = true;
  });
  carousel.addEventListener("pointerleave", () => {
    hovering = false;
  });
  carousel.addEventListener("focusin", () => {
    focused = true;
  });
  carousel.addEventListener("focusout", () => {
    focused = false;
  });
  carousel.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "touch") return;
    dragging = true;
    startX = e.clientX;
    startScroll = carousel.scrollLeft;
    carousel.setPointerCapture(e.pointerId);
  });
  carousel.addEventListener("pointermove", (e) => {
    if (dragging) carousel.scrollLeft = startScroll + startX - e.clientX;
  });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((event) =>
    carousel.addEventListener(event, () => {
      dragging = false;
    }),
  );
  carousel.addEventListener(
    "touchstart",
    () => {
      paused = true;
      updatePause();
    },
    { passive: true },
  );
  carousel.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      moveCarousel(e.key === "ArrowRight" ? 1 : -1);
    }
  });
  function loopWidth() {
    return track.children[5].offsetLeft - track.children[0].offsetLeft;
  }
  function moveCarousel(direction) {
    paused = true;
    updatePause();
    if (direction < 0 && carousel.scrollLeft < 1)
      carousel.scrollLeft = loopWidth();
    carousel.scrollBy({
      left:
        direction *
        (track.children[1].offsetLeft - track.children[0].offsetLeft),
      behavior: reducedMotion.matches ? "instant" : "smooth",
    });
  }
  $("#carousel-prev").addEventListener("click", () => moveCarousel(-1));
  $("#carousel-next").addEventListener("click", () => moveCarousel(1));
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible) startCarousel();
  }).observe(carousel);
  let scrollRemainder = 0;
  function tick(time) {
    frame = null;
    const elapsed = Math.min(time - lastTime, 50);
    lastTime = time;
    if (
      visible &&
      !paused &&
      !hovering &&
      !focused &&
      !dragging &&
      !document.hidden
    ) {
      // Keep subpixel time between frames; scrollLeft can round to integer pixels.
      scrollRemainder += elapsed * 0.028;
      const distance = Math.floor(scrollRemainder);
      scrollRemainder -= distance;
      carousel.scrollLeft += distance;
      const width = loopWidth();
      if (carousel.scrollLeft >= width) carousel.scrollLeft -= width;
    }
    if (visible && !paused && !document.hidden)
      frame = requestAnimationFrame(tick);
  }
  function startCarousel() {
    if (frame === null && visible && !paused && !document.hidden) {
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    }
  }
  document.addEventListener("visibilitychange", startCarousel);
  startCarousel();

  // Keep the purchase path in reach on phones, without covering the buy box or forms.
  const quickShop = $(".mobile-shop-bar");
  const mobileQuery = matchMedia("(max-width: 760px)");
  let heroVisible = true,
    purchaseVisible = false,
    footerVisible = false;
  function updateQuickShop() {
    quickShop.hidden =
      !mobileQuery.matches || heroVisible || purchaseVisible || footerVisible;
  }
  const quickShopObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.target.matches(".hero")) heroVisible = entry.isIntersecting;
      if (entry.target.matches(".buy-box"))
        purchaseVisible = entry.isIntersecting;
      if (entry.target.matches(".footer")) footerVisible = entry.isIntersecting;
    });
    updateQuickShop();
  });
  [$(".hero"), $(".buy-box"), $(".footer")].forEach((el) =>
    quickShopObserver.observe(el),
  );
  mobileQuery.addEventListener("change", updateQuickShop);
  updateQuickShop();
})();
