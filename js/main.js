// qt matcha — shared interactions

// mobile nav
const burger = document.querySelector('.hamburger');
const links = document.querySelector('.nav-links');
if (burger && links) {
  burger.addEventListener('click', () => links.classList.toggle('show'));
}

// FAQ accordion
document.querySelectorAll('.faq-q').forEach((btn) => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const ans = item.querySelector('.faq-a');
    const isOpen = item.classList.contains('open');
    // close others
    document.querySelectorAll('.faq-item.open').forEach((o) => {
      o.classList.remove('open');
      o.querySelector('.faq-a').style.maxHeight = null;
    });
    if (!isOpen) {
      item.classList.add('open');
      ans.style.maxHeight = ans.scrollHeight + 'px';
    }
  });
});

// newsletter + discount popup → email capture (waitlist)
// Capture posts to a dedicated email tool (Klaviyo or Mailchimp), NOT Shopify —
// the old /contact form_type=customer path is structurally rejected by stores on
// Shopify's "New customer accounts" (HTTP 400), so it was removed. See EMAIL-CAPTURE.md
// for the 10-minute setup; until CAPTURE is configured, forms show an honest
// "not live yet" message instead of a fake confirmation.
(() => {
  // ---- capture backend config — fill in ONE provider (see EMAIL-CAPTURE.md) ----
  const CAPTURE = {
    provider: 'klaviyo',     // 'klaviyo' or 'mailchimp'  ('' = signups not live yet)
    // Klaviyo: Settings → API keys → "Public API Key / Site ID" (6 chars)…
    klaviyoCompanyId: 'TULcea',
    // …and the List ID of the waitlist list (Lists & Segments → the list → Settings)
    klaviyoListId: 'U5ccR9',
    // Mailchimp: Audience → Signup forms → Embedded form → copy the <form action="…"> URL
    // (looks like https://xxxx.usX.list-manage.com/subscribe/post?u=…&id=…)
    mailchimpFormAction: ''
  };

  const configured =
    (CAPTURE.provider === 'klaviyo' && CAPTURE.klaviyoCompanyId && CAPTURE.klaviyoListId) ||
    (CAPTURE.provider === 'mailchimp' && CAPTURE.mailchimpFormAction);

  // Real cross-origin subscribe with a REAL success/failure answer.
  // Resolves true only when the provider accepted the email.
  function subscribe(email, source) {
    if (!configured) return Promise.resolve(false);
    if (CAPTURE.provider === 'klaviyo') {
      // Klaviyo client API — built for browser posts from any site (CORS-enabled).
      return fetch('https://a.klaviyo.com/client/subscriptions/?company_id=' +
        encodeURIComponent(CAPTURE.klaviyoCompanyId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'revision': '2024-10-15' },
        body: JSON.stringify({
          data: {
            type: 'subscription',
            attributes: {
              profile: { data: { type: 'profile', attributes: {
                email: email, properties: { source: source || 'website' }
              } } }
            },
            relationships: { list: { data: { type: 'list', id: CAPTURE.klaviyoListId } } }
          }
        })
      }).then((res) => res.ok).catch(() => false);
    }
    if (CAPTURE.provider === 'mailchimp') {
      // Mailchimp JSONP endpoint — same-origin-proof and returns a real result object.
      return new Promise((resolve) => {
        const cb = 'qtMcCb' + Date.now();
        const timer = setTimeout(() => { cleanup(); resolve(false); }, 10000);
        function cleanup() { clearTimeout(timer); delete window[cb]; script.remove(); }
        window[cb] = (data) => {
          const ok = data && (data.result === 'success' ||
            // "already subscribed" counts as success for the visitor
            (data.msg || '').toLowerCase().indexOf('already') !== -1);
          cleanup(); resolve(ok);
        };
        const script = document.createElement('script');
        script.src = CAPTURE.mailchimpFormAction.replace('/subscribe/post?', '/subscribe/post-json?') +
          '&EMAIL=' + encodeURIComponent(email) + '&c=' + cb;
        script.onerror = () => { cleanup(); resolve(false); };
        document.head.appendChild(script);
      });
    }
    return Promise.resolve(false);
  }

  // ---- discount popup (skip subscribe.html, which already has a waitlist form) ----
  // Klaviyo capture configured + verified (202 from the client API on 2026-07-17).
  const POPUP_ENABLED = true;
  const onSubscribePage = !!document.getElementById('waitlist-form');
  if (POPUP_ENABLED && !onSubscribePage) buildPopup();

  function buildPopup() {
    const style = document.createElement('style');
    style.textContent = `
      .qt-pop-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;
        background:rgba(35,79,32,.55);backdrop-filter:blur(3px);padding:20px;
        opacity:0;visibility:hidden;transition:opacity .3s ease,visibility .3s ease;}
      .qt-pop-overlay.open{opacity:1;visibility:visible;}
      .qt-pop-card{position:relative;width:min(440px,100%);background:var(--cream);border-radius:var(--radius-lg,32px);
        padding:0 0 30px;box-shadow:0 24px 60px rgba(35,79,32,.28);text-align:center;
        transform:translateY(16px) scale(.97);transition:transform .3s cubic-bezier(.2,.8,.2,1);
        border:3px solid var(--pink-pale);overflow:hidden;}
      .qt-pop-img{display:block;width:100%;max-height:180px;object-fit:cover;object-position:center 62%;}
      .qt-pop-body{padding:20px 34px 0;}
      @media (max-height:700px){.qt-pop-img{max-height:120px;}}
      .qt-pop-overlay.open .qt-pop-card{transform:translateY(0) scale(1);}
      .qt-pop-close{position:absolute;top:12px;right:12px;z-index:2;background:rgba(255,255,255,.88);border:none;cursor:pointer;
        font-size:1.35rem;line-height:1;color:var(--green-dark);opacity:.85;width:32px;height:32px;border-radius:50%;
        display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(35,79,32,.18);}
      .qt-pop-close:hover{opacity:1;}
      .qt-pop-tag{display:inline-block;font-family:var(--font-display);font-weight:700;font-size:.8rem;
        color:var(--pink-hot);letter-spacing:.04em;text-transform:lowercase;margin-bottom:8px;}
      .qt-pop-card h3{font-family:var(--font-display);font-weight:800;color:var(--green-dark);
        font-size:1.7rem;line-height:1.05;margin:0 0 10px;}
      .qt-pop-card h3 .hl{color:var(--pink-hot);}
      .qt-pop-sub{font-family:var(--font-body);font-weight:600;color:var(--green-deep);font-size:.98rem;
        margin:0 0 20px;opacity:.9;}
      .qt-pop-form{display:flex;flex-direction:column;gap:10px;}
      .qt-pop-form input[type=email]{width:100%;padding:14px 18px;border-radius:var(--radius-pill,999px);
        border:2px solid var(--pink-pale);font-family:var(--font-body);font-weight:600;font-size:1rem;
        background:#fff;color:var(--green-dark);}
      .qt-pop-form input[type=email]:focus{outline:3px solid var(--pink-hot);border-color:var(--pink-hot);}
      .qt-pop-form button{padding:14px 18px;border-radius:var(--radius-pill,999px);border:none;cursor:pointer;
        background:var(--pink-hot);color:#fff;font-family:var(--font-display);font-weight:700;font-size:1.05rem;
        transition:transform .15s ease,background .15s ease;}
      .qt-pop-form button:hover{transform:translateY(-1px);background:#e85a99;}
      .qt-pop-fine{font-family:var(--font-body);font-size:.72rem;color:var(--green-deep);opacity:.65;margin:12px 0 0;}
      .qt-pop-dismiss{background:none;border:none;cursor:pointer;font-family:var(--font-body);font-weight:600;
        font-size:.8rem;color:var(--green-deep);opacity:.55;margin-top:12px;text-decoration:underline;}
      .qt-pop-dismiss:hover{opacity:.85;}
    `;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.className = 'qt-pop-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Join the qt club for 15% off');
    overlay.innerHTML = `
      <div class="qt-pop-card">
        <button class="qt-pop-close" aria-label="Close">&times;</button>
        <img class="qt-pop-img" src="images/flavor-flight.jpg" alt="qt matcha — vanilla, strawberry and coconut boxes">
        <div class="qt-pop-body">
          <span class="qt-pop-tag">🌸 the qt club</span>
          <h3><span class="hl">15% off</span> your first order</h3>
          <p class="qt-pop-sub">We're almost ready to pour. Join the list and we'll email your 15%-off code the day we launch — plus first dibs on flavors &amp; iron-friendly recipes.</p>
          <form class="news-form qt-pop-form" data-tags="newsletter,waitlist,popup" data-success="you're in — your 15% code lands in your inbox at launch 🍵">
            <input type="email" placeholder="your email, qt" required aria-label="Email address">
            <button type="submit">save my 15% →</button>
          </form>
          <p class="qt-pop-fine">One email at launch. No spam, skip anytime.</p>
          <button class="qt-pop-dismiss" type="button">no thanks, I'll pay full price</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    const close = () => { overlay.classList.remove('open'); };
    overlay.querySelector('.qt-pop-close').addEventListener('click', close);
    overlay.querySelector('.qt-pop-dismiss').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    // closes after a VERIFIED signup via the qt:subscribed event (fired below)
    overlay.querySelector('.qt-pop-form').addEventListener('qt:subscribed', () => {
      setTimeout(close, 2800);
    });

    // show once per visitor, ~10s after load
    try {
      if (!localStorage.getItem('qt_popup_seen')) {
        setTimeout(() => {
          overlay.classList.add('open');
          try { localStorage.setItem('qt_popup_seen', '1'); } catch (e) {}
        }, 10000);
      }
    } catch (e) {
      // localStorage blocked (private mode) — show once this session anyway
      setTimeout(() => overlay.classList.add('open'), 10000);
    }
  }

  // ---- wire every .news-form (page forms + popup) to the capture backend ----
  document.querySelectorAll('.news-form').forEach((form) => {
    const emailInput = form.querySelector('input[type="email"]');
    if (!emailInput) return;
    const source = form.dataset.tags || 'newsletter,waitlist';
    const success = form.dataset.success || "you’re on the list — welcome to the qt club! 🍵";

    let note = null;
    function showNote(msg) {
      if (!note) {
        note = document.createElement('p');
        note.style.cssText = 'font-family:var(--font-body);font-weight:600;font-size:.85rem;color:var(--pink-hot);margin:8px 0 0;';
        form.appendChild(note);
      }
      note.textContent = msg;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      if (!email) return;
      const btn = form.querySelector('button[type="submit"], button:not([type])');
      const btnLabel = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'adding you…'; }

      subscribe(email, source).then((ok) => {
        if (ok) {
          // confirmation ONLY on a verified accept from the provider
          form.dispatchEvent(new Event('qt:subscribed'));
          form.innerHTML = '<p style="font-family:var(--font-display);font-weight:700;font-size:1.2rem;color:var(--green-dark);">' + success + '</p>';
        } else {
          if (btn) { btn.disabled = false; btn.textContent = btnLabel; }
          showNote(configured
            ? 'hmm — that didn’t go through. mind trying again in a minute?'
            : 'signups aren’t live just yet — check back soon 🍵');
        }
      });
    });
  });
})();
