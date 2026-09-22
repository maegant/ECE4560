// Rodrigues' formula run for real in 3D, with the picture kept in 2D.
//
// The angular velocity is held along the z axis, omega = ||omega|| * [0 0 1].
// Every calculation is the full 3D one - a 3x3 skew matrix W, its square, and
// the 3x3 rotation R = I + sin(theta) W + (1 - cos(theta)) W^2 - but because
// the axis is z, nothing ever leaves the xy-plane. So the drawing can be a
// plain 2D picture and still be exactly right, with no schematic sphere and no
// hidden dimension.
//
// The link between the two is the top-left 2x2 block of R: with the axis along
// z, R is that planar rotation bordered by a row and column of the identity.
//
//   W = [z]_x = [0 -1 0; 1 0 0; 0 0 0]        W^2 = diag(-1, -1, 0)
//   R = I + sin(t) W + (1 - cos(t)) W^2 = [cos t, -sin t, 0; sin t, cos t, 0; 0 0 1]
//
// Note W^2 is NOT -I here: its bottom-right entry is 0, because points on the
// axis do not move. Only in the genuinely planar case (2x2) does J^2 = -I.
let so2_rodrigues = function (p) {
  const CANVAS_H = 380;
  const CANVAS_H_STACKED = 660;
  const STACK_WIDTH = 520;

  const COL_X = [214, 39, 40];
  const COL_Y = [44, 160, 44];
  const COL_Z = [31, 119, 180];
  const COL_W = [217, 100, 15];
  const COL_R = [20, 90, 200];
  const GHOST = 75;
  const GRID = [150, 165, 185];

  const AXIS = [0, 0, 1];   // the demo pins the axis to z, so the motion is planar

  let speed = 1.0;
  let theta = 1.6;
  let tau = 1.6;
  let mode = 'angle';
  let playing = false;
  let progress = 0;

  let omega = [0, 0, 0];
  let W = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  let W2 = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  let Rfinal = idMat();

  let container = null, el = {}, layout = {};

  // ---------- 3x3 ----------
  function idMat() { return [[1, 0, 0], [0, 1, 0], [0, 0, 1]]; }
  function mm(A, B) {
    const C = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        C[i][j] = A[i][0] * B[0][j] + A[i][1] * B[1][j] + A[i][2] * B[2][j];
    return C;
  }
  function skew(w) {
    return [[0, -w[2], w[1]], [w[2], 0, -w[0]], [-w[1], w[0], 0]];
  }
  // Rodrigues, in full, on the 3x3 matrices
  function expSO3(axis, th) {
    if (Math.abs(th) < 1e-12) return idMat();
    const K = skew(axis), K2 = mm(K, K);
    const s = Math.sin(th), c = 1 - Math.cos(th);
    const M = idMat();
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) M[i][j] += s * K[i][j] + c * K2[i][j];
    return M;
  }
  function orthoError(A) {
    let e = 0;
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) {
        let s = 0;
        for (let k = 0; k < 3; k++) s += A[k][i] * A[k][j];
        e = Math.max(e, Math.abs(s - (i === j ? 1 : 0)));
      }
    return e;
  }
  const effTheta = () => theta;

  // ---------- 2D drawing ----------
  const sx = (o, x) => o.cx + o.s * x;
  const sy = (o, y) => o.cy - o.s * y;

  function arrow(o, x0, y0, x1, y1, colr, w, head, alpha) {
    const a = alpha === undefined ? 255 : alpha;
    const X0 = sx(o, x0), Y0 = sy(o, y0), X1 = sx(o, x1), Y1 = sy(o, y1);
    const dx = X1 - X0, dy = Y1 - Y0, len = Math.hypot(dx, dy);
    if (len < 1.5) return;
    const ux = dx / len, uy = dy / len;
    p.stroke(colr[0], colr[1], colr[2], a); p.strokeWeight(w);
    p.line(X0, Y0, X1 - ux * head * 0.7, Y1 - uy * head * 0.7);
    p.noStroke(); p.fill(colr[0], colr[1], colr[2], a);
    p.triangle(X1, Y1,
      X1 - ux * head - uy * head * 0.45, Y1 - uy * head + ux * head * 0.45,
      X1 - ux * head + uy * head * 0.45, Y1 - uy * head - ux * head * 0.45);
  }

  // ---------- left: the body, seen down the z axis ----------
  function drawBody(o) {
    const t = effTheta() * progress;
    p.textSize(12);
    p.noStroke(); p.fill(90); p.textAlign(p.CENTER, p.TOP);
    p.text('the body, looking down ẑ', o.cx, o.top);
    p.textAlign(p.LEFT, p.CENTER);

    p.noFill(); p.stroke(GRID[0], GRID[1], GRID[2], 85); p.strokeWeight(1);
    p.circle(o.cx, o.cy, 2 * o.s);
    p.stroke(GRID[0], GRID[1], GRID[2], 65);
    p.line(sx(o, -1.25), o.cy, sx(o, 1.25), o.cy);
    p.line(o.cx, sy(o, -1.25), o.cx, sy(o, 1.25));

    // the zero pose, always shown light
    arrow(o, 0, 0, 1, 0, COL_X, 2, 8, GHOST);
    arrow(o, 0, 0, 0, 1, COL_Y, 2, 8, GHOST);

    // the swept angle
    if (Math.abs(t) > 1e-3) {
      p.noFill(); p.stroke(COL_W[0], COL_W[1], COL_W[2], 130); p.strokeWeight(1.5);
      p.arc(o.cx, o.cy, o.s * 0.62, o.s * 0.62, t > 0 ? -t : 0, t > 0 ? 0 : -t);
    }

    // the body frame: the top-left 2x2 block of R(t) acting in the plane
    const c = Math.cos(t), s = Math.sin(t);
    if (progress > 1e-6) {
      arrow(o, 0, 0, c, s, COL_X, 3.5, 11);
      arrow(o, 0, 0, -s, c, COL_Y, 3.5, 11);
      p.noStroke(); p.fill(COL_X);
      p.text('x_b', sx(o, c * 1.15), sy(o, s * 1.15));
      p.fill(COL_Y);
      p.text('y_b', sx(o, -s * 1.15), sy(o, c * 1.15));
    }

    // the axis itself, pointing out of the page and fixed by the rotation
    p.noStroke(); p.fill(255); p.stroke(COL_Z); p.strokeWeight(1.6);
    p.circle(o.cx, o.cy, 12);
    p.noStroke(); p.fill(COL_Z); p.circle(o.cx, o.cy, 4.5);
    p.textAlign(p.LEFT, p.CENTER); p.textSize(11);
    p.text('ẑ out of page', o.cx + 10, o.cy + 11);
    p.textSize(12);

    p.noStroke(); p.fill(130); p.textSize(11);
    p.textAlign(p.CENTER, p.BOTTOM);
    p.text(progress < 1e-6 ? 'at the zero pose — press Play'
      : (playing ? 'turning about ẑ …' : 'light frame: where it started'),
      o.cx, o.top + o.h - 8);
    p.textAlign(p.LEFT, p.CENTER);
  }

  // ---------- right: SO(2), the circle the rotation lives on ----------
  function drawGroup(o) {
    const full = effTheta(), t = full * progress;
    p.textSize(12);
    p.noStroke(); p.fill(90); p.textAlign(p.CENTER, p.TOP);
    p.text('SO(2): where the rotation itself sits', o.cx, o.top);
    p.textAlign(p.LEFT, p.CENTER);

    const r = o.s, IX = sx(o, 1), IY = sy(o, 0);

    p.noFill(); p.stroke(110, 130, 155, 150); p.strokeWeight(1.6);
    p.circle(o.cx, o.cy, 2 * r);

    // so(2): the tangent line at the identity
    const top = o.top + 16, bot = o.top + o.h - 28;
    p.stroke(COL_W[0], COL_W[1], COL_W[2], 100); p.strokeWeight(1.4);
    p.line(IX, top, IX, bot);
    p.noStroke(); p.fill(COL_W[0], COL_W[1], COL_W[2], 190);
    p.textSize(10); p.textAlign(p.LEFT, p.TOP);
    p.text('so(2)', IX + 7, top + 2);
    p.textSize(12); p.textAlign(p.LEFT, p.CENTER);

    // the tangent vector: whole thing faint, swept part solid. Its pixel length
    // is r*theta, the same as the arc it maps to.
    const clamp = (v) => Math.max(top - IY, Math.min(bot - IY, v));
    const tipFull = clamp(-full * r), tipNow = clamp(-t * r);
    p.stroke(COL_W[0], COL_W[1], COL_W[2], 90); p.strokeWeight(2);
    p.line(IX, IY, IX, IY + tipFull);
    if (Math.abs(t) > 1e-3) {
      p.stroke(COL_W[0], COL_W[1], COL_W[2]); p.strokeWeight(3.5);
      p.line(IX, IY, IX, IY + tipNow);
    }
    p.noStroke(); p.fill(COL_W[0], COL_W[1], COL_W[2]);
    p.textAlign(p.LEFT, p.CENTER);
    p.text('ωτ', IX + 9, IY + tipFull * 0.55);

    // the arc from I to R, the image of that tangent vector
    if (Math.abs(full) > 1e-3) {
      p.noFill(); p.stroke(COL_R[0], COL_R[1], COL_R[2], 80); p.strokeWeight(2);
      arcPath(o, full);
    }
    if (Math.abs(t) > 1e-3) {
      p.noFill(); p.stroke(COL_R[0], COL_R[1], COL_R[2], 235); p.strokeWeight(3);
      arcPath(o, t);
    }

    // the identity, and where the rotation has got to
    p.noStroke(); p.fill(20);
    p.circle(IX, IY, 8);
    p.textAlign(p.RIGHT, p.TOP);
    p.text('I', IX - 7, IY + 4);
    p.textAlign(p.LEFT, p.CENTER);

    if (progress < 0.999 && Math.abs(full) > 1e-3) {
      p.noFill(); p.stroke(COL_R[0], COL_R[1], COL_R[2], 140); p.strokeWeight(1.5);
      p.circle(sx(o, Math.cos(full)), sy(o, Math.sin(full)), 13);
    }
    p.noStroke(); p.fill(COL_R);
    const RX = sx(o, Math.cos(t)), RY = sy(o, Math.sin(t));
    p.circle(RX, RY, 13);
    p.text('R', RX + 11, RY);

    p.noStroke(); p.fill(130); p.textSize(11);
    p.textAlign(p.CENTER, p.BOTTOM);
    p.text('tangent length = arc length = θ', o.cx, o.top + o.h - 8);
    p.textAlign(p.LEFT, p.CENTER); p.textSize(12);
  }

  function arcPath(o, ang) {
    const steps = Math.max(8, Math.ceil(Math.abs(ang) * 40));
    p.beginShape();
    for (let i = 0; i <= steps; i++) {
      const a = (ang * i) / steps;
      p.vertex(sx(o, Math.cos(a)), sy(o, Math.sin(a)));
    }
    p.endShape();
  }

  // ---------- controls ----------
  // The three numbers on screen are tied together by theta = ||omega|| * tau, so
  // only two of them are ever free. The mode says which one is the derived one:
  //   'angle' - you set theta (and the speed you want it run at), tau follows
  //   'time'  - you set ||omega|| and tau, and the angle theta follows
  // The derived slider still moves; it is just read-only.
  const THETA_MAX = 2 * Math.PI, TAU_MAX = 8, SPEED_MIN = 0.25, SPEED_MAX = 4;
  const clampTo = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const derivedVar = () => (mode === 'angle' ? 'tau' : 'theta');

  // Recompute the derived quantity. If it would run off the end of its slider we
  // hold it at the end and give way on the free slider the user is *not* holding,
  // so what is drawn always satisfies the identity. (The ranges are chosen so
  // that give is always available.)
  function reconcile(moved) {
    if (derivedVar() === 'tau') {
      tau = speed > 1e-9 ? theta / speed : 0;
      if (tau > TAU_MAX) { tau = TAU_MAX; speed = clampTo(theta / TAU_MAX, SPEED_MIN, SPEED_MAX); }
    } else {
      theta = speed * tau;
      if (theta > THETA_MAX) {
        theta = THETA_MAX;
        if (moved === 'speed') tau = clampTo(THETA_MAX / speed, 0, TAU_MAX);
        else speed = clampTo(tau > 1e-9 ? THETA_MAX / tau : SPEED_MAX, SPEED_MIN, SPEED_MAX);
      }
    }
  }

  function setMode(next) {
    if (next === mode) return;
    mode = next;
    reconcile();          // the three already agree, but the ranges may not
    rewindAll();
  }

  // a slider moved: re-solve, rewind the animation, and push every value back
  // out, since a clamp may have moved a slider the user was not touching
  function onSlider(which, value) {
    if (which === 'theta') theta = clampTo(value, 0, THETA_MAX);
    else if (which === 'speed') speed = clampTo(value, SPEED_MIN, SPEED_MAX);
    else tau = clampTo(value, 0, TAU_MAX);
    reconcile(which);
    rewindAll();
  }

  // rewind, and push the current values into the sliders
  function rewindAll() { playing = false; progress = 0; sync(); syncSliders(); }

  function sync() {
    const derived = derivedVar();
    const marks = {
      theta: [el.thetaWrap, el.theta, el.thetaTag, '= ‖ω‖ τ'],
      speed: [el.speedWrap, el.speed, el.speedTag, ''],
      tau: [el.tauWrap, el.tau, el.tauTag, '= θ / ‖ω‖']
    };
    for (const k in marks) {
      const [wrap, input, tag, text] = marks[k];
      const isDerived = k === derived;
      if (wrap) wrap.className = isDerived ? 'so3-ctl so3-derived' : 'so3-ctl';
      if (input) input.disabled = isDerived;
      if (tag) tag.textContent = isDerived ? text : '';
    }
    if (el.modeAngle) el.modeAngle.className = mode === 'angle' ? 'so3-seg so3-on' : 'so3-seg';
    if (el.modeTime) el.modeTime.className = mode === 'angle' ? 'so3-seg' : 'so3-seg so3-on';
    if (el.play) el.play.textContent = playing ? '❚❚ Stop' : '▶ Play';
  }

  function syncSliders() {
    if (el.theta) el.theta.value = String(theta);
    if (el.tau) el.tau.value = String(tau);
    if (el.speed) el.speed.value = String(speed);
  }

  function startPlay() {
    if (playing) playing = false;
    else { playing = true; progress = 0; }
    sync();
  }

  // ---------- setup / draw ----------
  function computeLayout() {
    const w = p.width, H = p.height;
    if (w < STACK_WIDTH) {
      const h = H / 2;
      layout = {
        left: { cx: w * 0.5, cy: h * 0.55, s: Math.min(w * 0.27, h * 0.30), top: 4, h: h },
        right: { cx: w * 0.42, cy: h + h * 0.55, s: Math.min(w * 0.22, h * 0.26), top: h + 4, h: h }
      };
    } else {
      layout = {
        left: { cx: w * 0.25, cy: H * 0.54, s: Math.min(w * 0.11, H * 0.30), top: 6, h: H },
        right: { cx: w * 0.67, cy: H * 0.54, s: Math.min(w * 0.095, H * 0.26), top: 6, h: H }
      };
    }
  }

  p.setup = function () {
    container = document.getElementById('so2r-canvas');
    if (!container) return;
    const h = container.offsetWidth < STACK_WIDTH ? CANVAS_H_STACKED : CANVAS_H;
    const canvas = p.createCanvas(container.offsetWidth, h);
    canvas.parent(container);
    canvas.style('display', 'block');
    computeLayout();

    const g = (id) => document.getElementById(id);
    el = {
      speed: g('so2r-speed'), speedVal: g('so2r-speedVal'), speedWrap: g('so2r-speedWrap'), speedTag: g('so2r-speedTag'),
      theta: g('so2r-theta'), thetaVal: g('so2r-thetaVal'), thetaWrap: g('so2r-thetaWrap'), thetaTag: g('so2r-thetaTag'),
      tau: g('so2r-tau'), tauVal: g('so2r-tauVal'), tauWrap: g('so2r-tauWrap'), tauTag: g('so2r-tauTag'),
      modeAngle: g('so2r-modeAngle'), modeTime: g('so2r-modeTime'),
      play: g('so2r-play'), swept: g('so2r-swept'), target: g('so2r-target'),
      w: [0, 1, 2].map((i) => g('so2r-w' + i)),
      wnorm: g('so2r-wnorm'), tauOut: g('so2r-tauOut'),
      elapsed: g('so2r-elapsed'), tauPlay: g('so2r-tauPlay'),
      thA: g('so2r-thA'), tauB: g('so2r-tauB'), idA: g('so2r-idA'),
      a: [0, 1, 2].map((i) => g('so2r-a' + i)),
      b: [0, 1, 2].map((i) => g('so2r-b' + i)),
      Km: [], K2m: [], Rm: [], ortho: g('so2r-ortho')
    };
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) {
        el.Km.push(g('so2r-k' + i + j));
        el.K2m.push(g('so2r-q' + i + j));
        el.Rm.push(g('so2r-r' + i + j));
      }

    if (el.speed) el.speed.addEventListener('input', () => onSlider('speed', parseFloat(el.speed.value)));
    if (el.theta) el.theta.addEventListener('input', () => onSlider('theta', parseFloat(el.theta.value)));
    if (el.tau) el.tau.addEventListener('input', () => onSlider('tau', parseFloat(el.tau.value)));
    if (el.modeAngle) el.modeAngle.addEventListener('click', () => setMode('angle'));
    if (el.modeTime) el.modeTime.addEventListener('click', () => setMode('time'));
    if (el.play) el.play.addEventListener('click', startPlay);
    reconcile();
    rewindAll();
  };

  p.windowResized = function () {
    if (!container) return;
    const h = container.offsetWidth < STACK_WIDTH ? CANVAS_H_STACKED : CANVAS_H;
    p.resizeCanvas(container.offsetWidth, h);
    computeLayout();
  };

  p.draw = function () {
    if (!container) return;
    const dt = Math.min(p.deltaTime / 1000, 0.05);

    omega = [AXIS[0] * speed, AXIS[1] * speed, AXIS[2] * speed];
    W = skew(AXIS);
    W2 = mm(W, W);
    Rfinal = expSO3(AXIS, theta);

    if (playing) {
      const dur = Math.max(tau, 0.15);   // play it out over the duration asked for
      progress += dt / dur;
      if (progress >= 1) { progress = 1; playing = false; sync(); }
    }

    p.background(255);
    drawBody(layout.left);
    drawGroup(layout.right);
    p.stroke(230); p.strokeWeight(1);
    if (p.width >= STACK_WIDTH) p.line(p.width * 0.45, 10, p.width * 0.45, p.height - 10);
    else p.line(10, p.height / 2, p.width - 10, p.height / 2);

    readouts();
  };

  function readouts() {
    for (let i = 0; i < 3; i++) if (el.w[i]) el.w[i].textContent = fmt(omega[i]);

    // The same element of so(3) reached two ways: a unit axis times an angle,
    // and an angular velocity times a duration. They agree entry by entry
    // because the sliders are held to theta = ||omega|| * tau.
    for (let i = 0; i < 3; i++) {
      if (el.a[i]) el.a[i].textContent = fmt(AXIS[i] * theta);
      if (el.b[i]) el.b[i].textContent = fmt(omega[i] * tau);
    }
    if (el.thA) el.thA.textContent = theta.toFixed(2);
    if (el.tauB) el.tauB.textContent = tau.toFixed(2);
    if (el.idA) el.idA.textContent = theta.toFixed(2);
    if (el.wnorm) el.wnorm.textContent = speed.toFixed(2);
    if (el.tauOut) el.tauOut.textContent = tau.toFixed(2);
    if (el.speedVal) el.speedVal.textContent = speed.toFixed(2) + ' rad/s';
    if (el.thetaVal) el.thetaVal.textContent = theta.toFixed(2) + ' rad';
    if (el.tauVal) el.tauVal.textContent = tau.toFixed(2) + ' s';
    if (el.swept) el.swept.textContent = (theta * progress).toFixed(2);
    if (el.target) el.target.textContent = theta.toFixed(2);
    if (el.elapsed) el.elapsed.textContent = (tau * progress).toFixed(2);
    if (el.tauPlay) el.tauPlay.textContent = tau.toFixed(2);
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) {
        const k = el.Km[3 * i + j]; if (k) k.textContent = fmt(W[i][j]);
        const q = el.K2m[3 * i + j]; if (q) q.textContent = fmt(W2[i][j]);
        const r = el.Rm[3 * i + j]; if (r) r.textContent = fmt(Rfinal[i][j]);
      }
    if (el.ortho) el.ortho.textContent = orthoError(Rfinal).toExponential(1);
  }

  function fmt(v) {
    const s = Math.abs(v) < 5e-3 ? 0 : v;
    return (s >= 0 ? ' ' : '') + s.toFixed(2);
  }
};

new p5(so2_rodrigues);
