// Canvas liquid for the first-visit intro. Draws a matcha pour: a wobbling stream, a rising body with a
// two-harmonic surface, a foam line, an impact ripple where the stream lands, and bubbles. Pure 2D canvas,
// no libraries. Exposes window.qtPour = { start(canvas, opts), stop() }. Honors prefers-reduced-motion by
// jumping to the filled state.
(() => {
  let raf = null, running = false;
  function start(canvas, { duration = 2700, onFull } = {}) {
    const ctx = canvas.getContext("2d", { alpha: true });
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 0, H = 0;
    const size = () => { W = canvas.clientWidth; H = canvas.clientHeight; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); window.addEventListener("resize", size);

    const bubbles = Array.from({ length: 34 }, (_, i) => ({
      x: Math.random(), y: 1 + Math.random() * 0.4, r: 2 + Math.random() * 6, v: 0.10 + Math.random() * 0.16, w: Math.random() * Math.PI * 2, s: 0.6 + Math.random() * 0.8
    }));
    const t0 = performance.now();
    let full = false, fullAt = 0;
    running = true;

    const ease = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // in-out quad

    function frame(now) {
      if (!running) return;
      const t = now - t0;
      const p = reduce ? 1 : Math.min(1, t / duration);
      const level = ease(p);                    // 0 → 1 fill
      const surfY = H - level * (H + 40);       // surface y; ends slightly above the top edge
      const time = t / 1000;

      ctx.clearRect(0, 0, W, H);

      // --- body of liquid ---
      const amp1 = (1 - level * 0.6) * 14 + 6, amp2 = 6;
      const k1 = (2 * Math.PI) / Math.max(420, W * 0.55), k2 = (2 * Math.PI) / Math.max(200, W * 0.23);
      const sy = (x) => surfY + Math.sin(x * k1 + time * 2.1) * amp1 + Math.sin(x * k2 - time * 3.3) * amp2;
      // impact ripple near the stream landing point while pouring
      const cx = W / 2;
      const ripple = (x) => (p < 1 ? Math.exp(-Math.pow((x - cx) / (60 + level * 40), 2)) * Math.sin(time * 18 - Math.abs(x - cx) / 9) * (10 - level * 6) : 0);

      const grad = ctx.createLinearGradient(0, Math.max(0, surfY), 0, H);
      grad.addColorStop(0, "#a8d34a"); grad.addColorStop(0.25, "#7fb23a"); grad.addColorStop(0.7, "#5a922e"); grad.addColorStop(1, "#3f7a25");
      ctx.beginPath(); ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 6) ctx.lineTo(x, sy(x) + ripple(x));
      ctx.lineTo(W, H); ctx.closePath(); ctx.fillStyle = grad; ctx.fill();

      // translucent lighter band just under the surface (depth)
      ctx.save(); ctx.clip();
      const band = ctx.createLinearGradient(0, surfY - 30, 0, surfY + 90);
      band.addColorStop(0, "rgba(232,246,170,0.55)"); band.addColorStop(1, "rgba(232,246,170,0)");
      ctx.fillStyle = band; ctx.fillRect(0, surfY - 40, W, 140);

      // bubbles (only inside the liquid)
      for (const b of bubbles) {
        if (p > 0.05) b.y -= (b.v * 0.016) * (0.7 + level * 0.6);
        if (b.y < -0.05) { b.y = 1.05; b.x = Math.random(); }
        const bx = b.x * W + Math.sin(time * b.s + b.w) * 8, by = b.y * H;
        if (by < surfY) continue;
        ctx.beginPath(); ctx.arc(bx, by, b.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(240,250,205,0.55)"; ctx.fill();
        ctx.beginPath(); ctx.arc(bx - b.r * 0.35, by - b.r * 0.35, b.r * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.75)"; ctx.fill();
      }
      ctx.restore();

      // foam line along the surface
      ctx.beginPath();
      for (let x = 0; x <= W; x += 6) { const y = sy(x) + ripple(x); x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.lineWidth = 5; ctx.strokeStyle = "rgba(236,249,190,0.85)"; ctx.stroke();
      ctx.lineWidth = 12; ctx.strokeStyle = "rgba(236,249,190,0.22)"; ctx.stroke();

      // --- the stream ---
      if (p < 1 && !reduce) {
        const wob = Math.sin(time * 9) * 4 + Math.sin(time * 23) * 2;
        const top = -20, bottom = sy(cx) + ripple(cx) + 6;
        const wS = Math.max(14, Math.min(34, W * 0.022));
        const sg = ctx.createLinearGradient(cx - wS, 0, cx + wS, 0);
        sg.addColorStop(0, "#6fa233"); sg.addColorStop(0.35, "#bfe36a"); sg.addColorStop(0.6, "#9ccb45"); sg.addColorStop(1, "#5f8f2f");
        ctx.beginPath();
        ctx.moveTo(cx - wS * 0.55, top);
        ctx.bezierCurveTo(cx - wS * 0.5 + wob, bottom * 0.4, cx - wS * 0.9 + wob, bottom * 0.8, cx - wS * 0.7, bottom);
        ctx.lineTo(cx + wS * 0.7, bottom);
        ctx.bezierCurveTo(cx + wS * 0.9 + wob, bottom * 0.8, cx + wS * 0.5 + wob, bottom * 0.4, cx + wS * 0.55, top);
        ctx.closePath(); ctx.fillStyle = sg; ctx.fill();
        // splash droplets at impact
        for (let i = 0; i < 7; i++) {
          const a = (i / 7) * Math.PI + Math.sin(time * 7 + i) * 0.3, r = 18 + (Math.sin(time * 11 + i * 1.7) + 1) * 14;
          const dx = cx + Math.cos(a) * r * 1.6, dy = bottom - Math.abs(Math.sin(a)) * r;
          ctx.beginPath(); ctx.arc(dx, dy, 2.5 + (i % 3), 0, Math.PI * 2); ctx.fillStyle = "rgba(226,244,160,0.8)"; ctx.fill();
        }
      }

      // --- vignette to give the glass some depth ---
      const vg = ctx.createRadialGradient(W / 2, H * 0.55, Math.min(W, H) * 0.35, W / 2, H * 0.55, Math.max(W, H) * 0.8);
      vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(20,50,10,0.28)");
      ctx.save(); ctx.beginPath(); ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 6) ctx.lineTo(x, sy(x) + ripple(x)); ctx.lineTo(W, H); ctx.closePath(); ctx.clip();
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H); ctx.restore();

      if (p >= 1 && !full) { full = true; fullAt = now; onFull?.(); }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    if (reduce) { full = true; onFull?.(); }
    return () => { running = false; cancelAnimationFrame(raf); window.removeEventListener("resize", size); };
  }
  window.qtPour = { start };
})();
