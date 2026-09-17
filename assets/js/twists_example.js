// Spatial and body velocity of the 1-DOF manipulator from Lecture 6
// (Example 2.5, MLS Chapter 2.4).
//
// The robot is drawn from above, matching the lecture figure:
//   y_A points right, x_A points down, z_A points out of the screen.
let twists_example = function(p) {
  // Link lengths (m), set by sliders; the view is sized for the largest values
  let L1 = 1.0;
  let L2 = 0.7;
  const L1_MAX = 1.5;
  const L2_MAX = 1.0;

  const CANVAS_H = 480;
  const COLOR_S = [217, 72, 15];   // spatial quantities
  const COLOR_B = [28, 126, 214];  // body quantities
  const VEL_SCALE = 0.4;           // arrow length (in units of S) per m/s
  const MAX_ARROW = 1.1;           // cap on arrow length (in units of S)

  let theta = 0;       // rad
  let thetaDot = 0;    // rad/s
  let prevTheta = 0;
  let playing = false;

  const READOUT_PERIOD = 0.1;  // s between numeric readout updates
  let readoutTimer = READOUT_PERIOD;

  // Screen mapping: world (x, y) -> screen (ox + S*y, oy + S*x)
  let S = 150, ox = 0, oy = 0;

  let el = {};

  // ---------- 2x2 linear algebra ----------
  const T = (A) => [[A[0][0], A[1][0]], [A[0][1], A[1][1]]];
  const mm = (A, B) => [
    [A[0][0]*B[0][0] + A[0][1]*B[1][0], A[0][0]*B[0][1] + A[0][1]*B[1][1]],
    [A[1][0]*B[0][0] + A[1][1]*B[1][0], A[1][0]*B[0][1] + A[1][1]*B[1][1]]
  ];
  const mv = (A, v) => [A[0][0]*v[0] + A[0][1]*v[1], A[1][0]*v[0] + A[1][1]*v[1]];
  const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

  // Compute spatial and body velocities directly from g(t) and its derivative
  function computeVelocities(th, thd) {
    const c = Math.cos(th), s = Math.sin(th);
    const R    = [[c, -s], [s, c]];
    const Rdot = [[-s*thd, -c*thd], [c*thd, -s*thd]];
    const pos  = [-L2*s, L1 + L2*c];
    const pdot = [-L2*c*thd, -L2*s*thd];

    // Spatial: xi_s^ = gdot g^-1
    const RdRT = mm(Rdot, T(R));
    const RdRTp = mv(RdRT, pos);
    const v_s = [-RdRTp[0] + pdot[0], -RdRTp[1] + pdot[1]];
    const w_s = RdRT[1][0];

    // Body: xi_b^ = g^-1 gdot
    const RTRd = mm(T(R), Rdot);
    const v_b = mv(T(R), pdot);
    const w_b = RTRd[1][0];

    return { R, pos, pdot, v_s, w_s, v_b, w_b };
  }

  // ---------- drawing helpers ----------
  const toScreen = (x, y) => [ox + S*y, oy + S*x];
  const dirScreen = (vx, vy) => [vy, vx];

  function arrow(x0, y0, dx, dy, col, weight = 3, head = 10) {
    const len = Math.hypot(dx, dy);
    if (len < 1) return;
    const ux = dx/len, uy = dy/len;
    const x1 = x0 + dx, y1 = y0 + dy;
    p.stroke(col); p.strokeWeight(weight);
    p.line(x0, y0, x1 - ux*head*0.6, y1 - uy*head*0.6);
    p.noStroke(); p.fill(col);
    p.triangle(x1, y1,
               x1 - ux*head - uy*head*0.5, y1 - uy*head + ux*head*0.5,
               x1 - ux*head + uy*head*0.5, y1 - uy*head - ux*head*0.5);
  }

  // Arrow of a world-frame velocity (m/s) drawn from world point (x, y)
  function velocityArrow(x, y, vx, vy, col) {
    const [sx, sy] = toScreen(x, y);
    let [dx, dy] = dirScreen(vx, vy);
    let len = Math.hypot(dx, dy) * VEL_SCALE;
    if (len < 1e-6) return null;
    const scale = Math.min(len, MAX_ARROW) / Math.hypot(dx, dy);
    dx *= scale * S; dy *= scale * S;
    arrow(sx, sy, dx, dy, col, 3.5, 12);
    const n = Math.hypot(dx, dy);
    return [sx + dx, sy + dy, dx/n, dy/n];
  }

  // Label like "v" with subscript "s"
  function label(main, sub, x, y, col, size = 16) {
    p.noStroke(); p.fill(col);
    p.textStyle(p.ITALIC); p.textSize(size);
    p.textAlign(p.LEFT, p.CENTER);
    p.text(main, x, y);
    const w = p.textWidth(main);
    p.textStyle(p.NORMAL); p.textSize(size*0.7);
    p.text(sub, x + w + 1, y + size*0.3);
  }

  // Coordinate frame: x and y axes given as world unit vectors, z out of screen
  function frame(x, y, ex, ey, name, col) {
    const [sx, sy] = toScreen(x, y);
    const len = 0.28 * S;
    const [xdx, xdy] = dirScreen(ex[0], ex[1]);
    const [ydx, ydy] = dirScreen(ey[0], ey[1]);
    arrow(sx, sy, xdx*len, xdy*len, col, 2, 8);
    arrow(sx, sy, ydx*len, ydy*len, col, 2, 8);
    // labels sit just past the axis tip, nudged to one side of the axis
    label("x", name, sx + xdx*(len + 8) - xdy*12 - 5, sy + xdy*(len + 8) + xdx*12, col, 14);
    label("y", name, sx + ydx*(len + 8) - ydy*12 - 5, sy + ydy*(len + 8) + ydx*12, col, 14);
    // z out of screen
    p.stroke(col); p.strokeWeight(1.5); p.fill(255);
    p.circle(sx, sy, 10);
    p.noStroke(); p.fill(col); p.circle(sx, sy, 3);
  }

  // Curved arrow showing a rotation rate about z at world point (x, y).
  // The arc is centered opposite `awayAngle` so it does not cover the velocity arrow.
  function omegaArc(x, y, w, radius, awayAngle, col, sub) {
    if (Math.abs(w) < 1e-3) return;
    const sweep = Math.sign(w) * Math.min(Math.abs(w) * 1.2, 1.2*Math.PI);
    const start = awayAngle + Math.PI - sweep/2;
    const n = 40;
    p.noFill(); p.stroke(col); p.strokeWeight(2.5);
    p.beginShape();
    for (let i = 0; i <= n; i++) {
      const a = start + sweep * i/n;
      const [px, py] = toScreen(x + radius*Math.cos(a), y + radius*Math.sin(a));
      p.vertex(px, py);
    }
    p.endShape();
    // arrow head tangent to the arc
    const a = start + sweep;
    const [hx, hy] = toScreen(x + radius*Math.cos(a), y + radius*Math.sin(a));
    const t = dirScreen(-Math.sin(a)*Math.sign(w), Math.cos(a)*Math.sign(w));
    arrow(hx - t[0]*2, hy - t[1]*2, t[0]*2, t[1]*2, col, 2.5, 9);
    label("ω", sub, hx + 8, hy - 10, col, 15);
  }

  function dashedCircle(x, y, r, col) {
    const [sx, sy] = toScreen(x, y);
    p.noFill(); p.stroke(col); p.strokeWeight(1);
    p.drawingContext.setLineDash([5, 5]);
    p.circle(sx, sy, 2*r*S);
    p.drawingContext.setLineDash([]);
  }

  function link(x0, y0, x1, y1, width) {
    const [a, b] = toScreen(x0, y0);
    const [c, d] = toScreen(x1, y1);
    p.stroke(60); p.strokeWeight(width + 3); p.line(a, b, c, d);
    p.stroke(225); p.strokeWeight(width); p.line(a, b, c, d);
  }

  // ---------- UI ----------
  function setTheta(th) {
    theta = th;
    el.thetaSlider.value = (theta * 180/Math.PI).toFixed(1);
    el.thetaValue.textContent = `${(theta * 180/Math.PI).toFixed(1)}°`;
  }

  function setPlaying(on) {
    playing = on;
    el.playBtn.textContent = on ? "❚❚ Pause" : "▶ Play";
    el.modePlay.hidden = !on;
    el.modeDrag.hidden = on;
  }

  function layout() {
    const W = p.width, H = p.height;
    // world y spans [-0.35, L1_MAX + L2_MAX + 0.35]; world x spans +/-(L2_MAX + 0.45)
    const ySpan = L1_MAX + L2_MAX + 0.7;
    const xSpan = 2*(L2_MAX + 0.45);
    S = Math.min((W - 20)/ySpan, (H - 20)/xSpan);
    ox = W/2 - S*(L1_MAX + L2_MAX)/2;
    oy = H/2;
  }

  p.windowResized = function() {
    const container = document.getElementById("tw-canvas");
    p.resizeCanvas(container.offsetWidth, CANVAS_H);
    layout();
  };

  p.setup = function() {
    const container = document.getElementById("tw-canvas");
    const canvas = p.createCanvas(container.offsetWidth, CANVAS_H);
    canvas.parent(container);
    layout();

    for (const id of ["thetaSlider", "thetaValue", "speedSlider", "speedValue",
                      "l1Slider", "l1Value", "l2Slider", "l2Value",
                      "playBtn", "resetBtn", "modePlay", "modeDrag", "thetaDot",
                      "ws", "vs0", "vs1", "wb", "vb0", "vb1", "pd0", "pd1"]) {
      el[id] = document.getElementById("tw-" + id);
    }

    el.thetaSlider.addEventListener("input", () => {
      if (playing) setPlaying(false);
      theta = parseFloat(el.thetaSlider.value) * Math.PI/180;
      el.thetaValue.textContent = `${parseFloat(el.thetaSlider.value).toFixed(1)}°`;
    });
    el.l1Slider.addEventListener("input", () => {
      L1 = parseFloat(el.l1Slider.value);
      el.l1Value.textContent = `${L1.toFixed(2)} m`;
    });
    el.l2Slider.addEventListener("input", () => {
      L2 = parseFloat(el.l2Slider.value);
      el.l2Value.textContent = `${L2.toFixed(2)} m`;
    });
    el.speedSlider.addEventListener("input", () => {
      el.speedValue.textContent = `${parseFloat(el.speedSlider.value).toFixed(1)} rad/s`;
    });
    el.playBtn.addEventListener("click", () => setPlaying(!playing));
    el.resetBtn.addEventListener("click", () => {
      setPlaying(false);
      setTheta(0);
      prevTheta = 0;
      thetaDot = 0;
    });

    // pick up slider positions the browser may have restored on reload
    el.l1Slider.dispatchEvent(new Event("input"));
    el.l2Slider.dispatchEvent(new Event("input"));
    el.speedSlider.dispatchEvent(new Event("input"));

    setTheta(0);
    setPlaying(false);
  };

  p.draw = function() {
    const dt = Math.min(p.deltaTime / 1000, 0.1);

    // Update theta and theta-dot
    if (playing) {
      thetaDot = parseFloat(el.speedSlider.value);
      setTheta(wrap(theta + thetaDot * dt));
    } else if (dt > 0) {
      // low-pass filtered finite difference of the slider motion
      const raw = wrap(theta - prevTheta) / dt;
      const alpha = 1 - Math.exp(-dt / 0.08);
      thetaDot += alpha * (raw - thetaDot);
      if (Math.abs(thetaDot) < 1e-3) thetaDot = 0;
    }
    prevTheta = theta;

    const k = computeVelocities(theta, thetaDot);
    const jx = 0, jy = L1;              // joint location
    const bx = k.pos[0], by = k.pos[1]; // body frame origin

    // ---- scene ----
    p.background(248);

    // grid (0.25 m spacing)
    p.stroke(228); p.strokeWeight(1);
    const g = 0.25 * S;
    for (let x = ox % g; x < p.width; x += g) p.line(x, 0, x, p.height);
    for (let y = oy % g; y < p.height; y += g) p.line(0, y, p.width, y);

    // paths: tip of link 2, and the body point passing through A's origin
    dashedCircle(jx, jy, L2, p.color(...COLOR_B, 120));
    dashedCircle(jx, jy, L1, p.color(...COLOR_S, 120));

    // robot
    link(0, 0, jx, jy, 12);
    link(jx, jy, bx, by, 10);
    let [sx, sy] = toScreen(0, 0);
    p.stroke(60); p.strokeWeight(2); p.fill(205); p.circle(sx, sy, 0.3*S);
    [sx, sy] = toScreen(jx, jy);
    p.fill(205); p.circle(sx, sy, 0.24*S);
    [sx, sy] = toScreen(bx, by);
    p.fill(205); p.circle(sx, sy, 0.2*S);

    // frames
    frame(0, 0, [1, 0], [0, 1], "A", p.color(40));
    frame(bx, by, [k.R[0][0], k.R[1][0]], [k.R[0][1], k.R[1][1]], "B", p.color(40));

    // joint axis label
    [sx, sy] = toScreen(jx, jy);
    p.noStroke(); p.fill(40); p.textStyle(p.ITALIC); p.textSize(16);
    p.textAlign(p.LEFT, p.CENTER);
    p.text("θ", sx + 0.16*S, sy + 0.16*S);

    // angular velocities
    const ang = (v) => Math.atan2(v[1], v[0]);
    omegaArc(0, 0, k.w_s, 0.45, ang(k.v_s), p.color(...COLOR_S), "s");
    omegaArc(bx, by, k.w_b, 0.4, ang(mv(k.R, k.v_b)), p.color(...COLOR_B), "b");

    // v_s: velocity of the body point currently at the origin of A (in A coords)
    let tipS = velocityArrow(0, 0, k.v_s[0], k.v_s[1], p.color(...COLOR_S));
    if (tipS) label("v", "s", tipS[0] + tipS[2]*10 + tipS[3]*14 - 5, tipS[1] + tipS[3]*10 - tipS[2]*14, p.color(...COLOR_S));

    // v_b: velocity of B's origin expressed in B coords, drawn along B's axes
    const vbWorld = mv(k.R, k.v_b);
    let tipB = velocityArrow(bx, by, vbWorld[0], vbWorld[1], p.color(...COLOR_B));
    if (tipB) label("v", "b", tipB[0] + tipB[2]*10 + tipB[3]*14 - 5, tipB[1] + tipB[3]*10 - tipB[2]*14, p.color(...COLOR_B));

    // ---- readouts (refreshed every READOUT_PERIOD seconds) ----
    readoutTimer += dt;
    if (readoutTimer < READOUT_PERIOD) return;
    readoutTimer = 0;
    const f = (x) => (Math.abs(x) < 5e-3 ? 0 : x).toFixed(2);
    el.thetaDot.textContent = `${f(thetaDot)} rad/s`;
    el.ws.textContent = f(k.w_s);
    el.vs0.textContent = f(k.v_s[0]);
    el.vs1.textContent = f(k.v_s[1]);
    el.wb.textContent = f(k.w_b);
    el.vb0.textContent = f(k.v_b[0]);
    el.vb1.textContent = f(k.v_b[1]);
    el.pd0.textContent = f(k.pdot[0]);
    el.pd1.textContent = f(k.pdot[1]);
  };
};

new p5(twists_example);
