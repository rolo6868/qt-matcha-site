// Pre-rendered matcha pour (Blender fluid sim) for the first-visit intro on desktop.
// The video is "stacked alpha": top half = colour, bottom half = alpha mask. A tiny WebGL shader
// recombines them so the pour composites over the page with real transparency in every browser
// (no dependence on VP9-alpha or HEVC-alpha support). If the video can't load fast enough or
// WebGL is missing, intro.js falls back to the 2D canvas pour in pour.js.
// Exposes window.qtPourVideo = { supported(), start(canvas, { src, fullAt, onFull, onFail }) }.
(() => {
  const VS = `attribute vec2 p; varying vec2 v; void main(){ v = vec2(p.x*0.5+0.5, 0.5-p.y*0.5); gl_Position = vec4(p,0.,1.); }`;
  const FS = `precision mediump float; varying vec2 v; uniform sampler2D t; uniform vec2 fit; uniform vec2 off;
    void main(){
      vec2 uv = v * fit + off;                  // cover-fit into the viewport
      if (uv.x < 0. || uv.x > 1. || uv.y < 0. || uv.y > 1.) { gl_FragColor = vec4(0.); return; }
      vec3 c = texture2D(t, vec2(uv.x, uv.y * 0.5)).rgb;
      float a = texture2D(t, vec2(uv.x, 0.5 + uv.y * 0.5)).r;
      gl_FragColor = vec4(c * a, a);            // premultiplied for correct blending
    }`;

  function supported() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    if (Math.min(innerWidth, innerHeight) < 700 || innerWidth < 900) return false;   // phones/tablets keep the light canvas pour
    const c = navigator.connection; if (c && (c.saveData || /2g|3g/.test(c.effectiveType || ""))) return false;
    const gl = document.createElement("canvas").getContext("webgl"); if (!gl) return false;
    const v = document.createElement("video"); return !!v.canPlayType && v.canPlayType('video/mp4; codecs="avc1.42E01E"') !== "";
  }

  function start(canvas, { src, fullAt = 2.55, onFull, onFail, loadTimeout = 2600 } = {}) {
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) { onFail?.(); return () => {}; }
    const video = document.createElement("video");
    video.muted = true; video.playsInline = true; video.preload = "auto"; video.crossOrigin = "anonymous";
    video.setAttribute("muted", ""); video.setAttribute("playsinline", "");
    video.src = src;

    let running = true, raf = 0, full = false, failed = false, started = false;
    const fail = () => { if (failed || started) return; failed = true; running = false; clearTimeout(timer); video.src = ""; onFail?.(); };
    const timer = setTimeout(fail, loadTimeout);
    video.addEventListener("error", fail);

    // --- GL setup ---
    const sh = (type, s) => { const o = gl.createShader(type); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog); gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    const uFit = gl.getUniformLocation(prog, "fit"), uOff = gl.getUniformLocation(prog, "off");
    gl.clearColor(0, 0, 0, 0);

    const dpr = Math.min(2, devicePixelRatio || 1);
    function size() {
      const W = canvas.clientWidth, H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr; gl.viewport(0, 0, canvas.width, canvas.height);
      // cover-fit a 16:9 colour frame into W×H, anchored to the bottom (the level rising is the point)
      const vw = video.videoWidth || 16, vh = (video.videoHeight || 18) / 2;   // colour half only
      const s = Math.max(W / vw, H / vh), cw = vw * s, ch = vh * s;
      gl.uniform2f(uFit, W / cw, H / ch); gl.uniform2f(uOff, (1 - W / cw) / 2, 1 - H / ch);
    }
    addEventListener("resize", size);

    function frame() {
      if (!running) return;
      if (video.readyState >= 2) {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
        gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        if (!full && video.currentTime >= fullAt) { full = true; onFull?.(); }
      }
      raf = requestAnimationFrame(frame);
    }

    const go = () => {
      if (started || failed) return; started = true; clearTimeout(timer);
      size();
      video.play().then(() => { raf = requestAnimationFrame(frame); }).catch(fail);
    };
    video.addEventListener("canplaythrough", go, { once: true });
    video.addEventListener("loadeddata", () => { if (video.readyState >= 4) go(); }, { once: true });
    video.load();

    return () => { running = false; cancelAnimationFrame(raf); removeEventListener("resize", size); try { video.pause(); video.src = ""; } catch {} };
  }
  window.qtPourVideo = { supported, start };
})();
