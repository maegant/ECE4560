// The exponential map for planar rotations: so(2) -> SO(2).
//
// This is the one case where the textbook picture is literally true rather than
// a cartoon. SO(2) is 1-dimensional, so it draws as a circle; so(2) is
// 1-dimensional, so its tangent space at the identity draws as a straight line
// touching that circle. Both fit in the plane with a dimension to spare, so the
// wrapping is visible: exp rolls the tangent line onto the circle without
// stretching it, and a tangent vector of length theta lands an arc of length
// theta away.
//
// The matrices shown are the 3x3 ones, for a rotation about z:
//   [w]_x theta = [0 -theta 0; theta 0 0; 0 0 0]
//   R           = [cos -sin 0; sin cos 0; 0 0 1]
// The third row and column never move, which is why the drawing can be planar.
//
// Drag the frame on the left. Theta accumulates, so it can pass a full turn and
// keep going - the tangent line is infinite while the circle is not, and that
// mismatch is exactly why rotations repeat.
let so2_exp_map = function (p) {
  const CANVAS_H = 400;
  const CANVAS_H_STACKED = 680;
  const STACK_WIDTH = 520;

  const COL_X = [214, 39, 40];
  const COL_Y = [44, 160, 44];
  const COL_W = [217, 100, 15];   // the tangent side: omega, so(2)
  const COL_R = [20, 90, 200];    // the group side: R, SO(2)
  const GHOST = 75;
  const GRID = [150, 165, 185];

  let theta = 0.9;        // radians, accumulates past a full turn
  let dragging = false;
  let lastAng = 0;

  let container = null, el = {}, layout = {};

  // ---------- 2x2 helpers ----------
  const Rof = (t) => [[Math.cos(t), -Math.sin(t)], [Math.sin(t), Math.cos(t)]];

  // world (x, y) -> screen, y up
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

  // ---------- left: the body frame in the plane ----------
  function drawFrame(o) {
    p.textSize(12);
    p.noStroke(); p.fill(90); p.textAlign(p.CENTER, p.TOP);
    p.text('a frame in the plane — drag to turn it', o.cx, o.top);
    p.textAlign(p.LEFT, p.CENTER);

    // unit circle and axes
    p.noFill(); p.stroke(GRID[0], GRID[1], GRID[2], 90); p.strokeWeight(1);
    p.circle(o.cx, o.cy, 2 * o.s);
    p.stroke(GRID[0], GRID[1], GRID[2], 70);
    p.line(sx(o, -1.25), o.cy, sx(o, 1.25), o.cy);
    p.line(o.cx, sy(o, -1.25), o.cx, sy(o, 1.25));

    // the identity frame it turned from
    arrow(o, 0, 0, 1, 0, COL_X, 2, 8, GHOST);
    arrow(o, 0, 0, 0, 1, COL_Y, 2, 8, GHOST);

    // the swept angle, as a wedge from the x axis
    const st = Math.max(-8 * Math.PI, Math.min(8 * Math.PI, theta));
    p.noFill(); p.stroke(COL_W[0], COL_W[1], COL_W[2], 120); p.strokeWeight(1.5);
    p.arc(o.cx, o.cy, o.s * 0.66, o.s * 0.66, st > 0 ? -st : 0, st > 0 ? 0 : -st);

    // the frame itself: the columns of R(theta)
    const R = Rof(theta);
    arrow(o, 0, 0, R[0][0], R[1][0], COL_X, 3.5, 11);
    arrow(o, 0, 0, R[0][1], R[1][1], COL_Y, 3.5, 11);
    p.noStroke(); p.fill(COL_X);
    p.text('x_b', sx(o, R[0][0] * 1.14), sy(o, R[1][0] * 1.14));
    p.fill(COL_Y);
    p.text('y_b', sx(o, R[0][1] * 1.14), sy(o, R[1][1] * 1.14));
    p.fill(COL_W[0], COL_W[1], COL_W[2]);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('θ', sx(o, 0.46 * Math.cos(theta / 2)), sy(o, 0.46 * Math.sin(theta / 2)));
    p.textAlign(p.LEFT, p.CENTER);

    p.noStroke(); p.fill(130); p.textSize(11);
    p.textAlign(p.CENTER, p.BOTTOM);
    p.text(dragging ? 'turning …' : 'drag anywhere in this panel', o.cx, o.top + o.h - 8);
    p.textAlign(p.LEFT, p.CENTER);
  }

  // ---------- right: so(2) as a tangent line, SO(2) as the circle ----------
  function drawGroup(o) {
    p.textSize(12);
    p.noStroke(); p.fill(90); p.textAlign(p.CENTER, p.TOP);
    p.text('SO(2) is the circle;  so(2) is the tangent line at I', o.cx, o.top);
    p.textAlign(p.LEFT, p.CENTER);

    const r = o.s;                     // circle radius, in pixels
    const IX = sx(o, 1), IY = sy(o, 0); // the identity, at angle 0

    // the circle: this is the whole group, every point of it
    p.noFill(); p.stroke(110, 130, 155, 150); p.strokeWeight(1.6);
    p.circle(o.cx, o.cy, 2 * r);
    // ticks every quarter turn
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2;
      p.stroke(GRID[0], GRID[1], GRID[2], 120); p.strokeWeight(1);
      p.line(sx(o, 0.94 * Math.cos(a)), sy(o, 0.94 * Math.sin(a)),
        sx(o, 1.06 * Math.cos(a)), sy(o, 1.06 * Math.sin(a)));
    }

    // the tangent line at the identity: vertical, because the circle runs
    // horizontally there. This IS so(2), drawn to scale.
    const top = o.top + 16, bot = o.top + o.h - 30;
    p.stroke(COL_W[0], COL_W[1], COL_W[2], 110); p.strokeWeight(1.5);
    p.line(IX, top, IX, bot);
    // ticks on the tangent line at the same spacing as the arc ticks
    p.textSize(9); p.textAlign(p.LEFT, p.CENTER);
    for (let k = -6; k <= 6; k++) {
      if (k === 0) continue;
      const yy = IY - (k * Math.PI / 2) * r;
      if (yy < top || yy > bot) continue;
      p.stroke(COL_W[0], COL_W[1], COL_W[2], 110); p.strokeWeight(1);
      p.line(IX - 4, yy, IX + 4, yy);
    }
    p.noStroke(); p.fill(COL_W[0], COL_W[1], COL_W[2], 200);
    p.textAlign(p.LEFT, p.TOP);
    p.text('so(2)', IX + 7, top + 2);
    p.textAlign(p.LEFT, p.CENTER);
    p.textSize(12);

    // the tangent vector omega*tau, of length theta. Its pixel length is r*theta,
    // the same as the arc it maps to: exp does not stretch the line.
    const wantLen = theta * r;
    const room = theta >= 0 ? (IY - top) : (bot - IY);
    const drawn = Math.min(Math.abs(wantLen), room);
    const sgn = theta < 0 ? -1 : 1;
    if (Math.abs(theta) > 1e-3) {
      const tipY = IY - sgn * drawn;
      p.stroke(COL_W[0], COL_W[1], COL_W[2]); p.strokeWeight(3.5);
      p.line(IX, IY, IX, tipY);
      p.noStroke(); p.fill(COL_W[0], COL_W[1], COL_W[2]);
      const hy = tipY + sgn * 9;
      p.triangle(IX, tipY, IX - 5, hy, IX + 5, hy);
      p.textAlign(p.LEFT, p.CENTER);
      p.text('ω', IX + 9, (IY + tipY) / 2);
      // if it ran off the panel, say so rather than quietly clipping
      if (Math.abs(wantLen) > room + 0.5) {
        p.textSize(9); p.fill(COL_W[0], COL_W[1], COL_W[2], 180);
        p.text('(continues)', IX + 9, tipY + sgn * 14);
        p.textSize(12);
      }
    }

    // the arc from I round to R: same length as the tangent vector
    if (Math.abs(theta) > 1e-3) {
      p.noFill(); p.stroke(COL_R[0], COL_R[1], COL_R[2], 230); p.strokeWeight(3);
      const steps = Math.max(8, Math.ceil(Math.abs(theta) * 40));
      p.beginShape();
      for (let i = 0; i <= steps; i++) {
        const a = (theta * i) / steps;
        p.vertex(sx(o, Math.cos(a)), sy(o, Math.sin(a)));
      }
      p.endShape();
    }

    // the identity and the rotation
    p.noStroke(); p.fill(20);
    p.circle(IX, IY, 8);
    p.textAlign(p.RIGHT, p.TOP);
    p.text('I', IX - 7, IY + 4);
    p.textAlign(p.LEFT, p.CENTER);

    const RX = sx(o, Math.cos(theta)), RY = sy(o, Math.sin(theta));
    p.noStroke(); p.fill(COL_R);
    p.circle(RX, RY, 13);
    p.fill(COL_R);
    p.text('R', RX + 11, RY);

    p.noStroke(); p.fill(130); p.textSize(11);
    p.textAlign(p.CENTER, p.BOTTOM);
    p.text('exp rolls the line onto the circle: both lengths are θ', o.cx, o.top + o.h - 8);
    p.textAlign(p.LEFT, p.CENTER);
    p.textSize(12);
  }

  // ---------- dragging ----------
  function inLeft() {
    return p.mouseX >= 0 && p.mouseX <= p.width * (p.width < STACK_WIDTH ? 1 : 0.5) &&
      p.mouseY >= (p.width < STACK_WIDTH ? 0 : 0) &&
      p.mouseY <= (p.width < STACK_WIDTH ? p.height / 2 : p.height);
  }

  const mouseAngle = (o) => Math.atan2(o.cy - p.mouseY, p.mouseX - o.cx);

  p.mousePressed = function () {
    if (!layout.left || !inLeft()) return;
    dragging = true;
    lastAng = mouseAngle(layout.left);
  };

  p.mouseDragged = function () {
    // p5 binds this to the window and calls preventDefault() whenever it returns
    // false, so returning false here when the canvas is NOT being dragged would
    // cancel every other drag on the page - sliders included. Return undefined
    // to let those through, and only suppress the default once we own the drag.
    if (!dragging) return;
    const a = mouseAngle(layout.left);
    // unwrap, so dragging round and round keeps accumulating instead of jumping
    let d = a - lastAng;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    theta += d;
    lastAng = a;
    return false;
  };

  p.mouseReleased = function () { dragging = false; };
  p.touchStarted = function () { p.mousePressed(); };
  p.touchMoved = function () {
    if (!dragging) return;              // let the page scroll / other controls work
    p.mouseDragged();
    return false;                       // only block scrolling while turning the frame
  };
  p.touchEnded = function () { p.mouseReleased(); };

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
    container = document.getElementById('so2-canvas');
    if (!container) return;
    const h = container.offsetWidth < STACK_WIDTH ? CANVAS_H_STACKED : CANVAS_H;
    const canvas = p.createCanvas(container.offsetWidth, h);
    canvas.parent(container);
    canvas.style('display', 'block');
    canvas.style('touch-action', 'none');
    computeLayout();

    const g = (id) => document.getElementById(id);
    el = {
      Rm: [], Km: [],
      rad: g('so2-rad'), deg: g('so2-deg'), reset: g('so2-reset')
    };
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) {
        el.Rm.push(g('so2-r' + i + j));
        el.Km.push(g('so2-k' + i + j));
      }
    if (el.reset) el.reset.addEventListener('click', () => { theta = 0; });
  };

  p.windowResized = function () {
    if (!container) return;
    const h = container.offsetWidth < STACK_WIDTH ? CANVAS_H_STACKED : CANVAS_H;
    p.resizeCanvas(container.offsetWidth, h);
    computeLayout();
  };

  p.draw = function () {
    if (!container) return;
    p.background(255);
    drawFrame(layout.left);
    drawGroup(layout.right);
    p.stroke(230); p.strokeWeight(1);
    if (p.width >= STACK_WIDTH) p.line(p.width * 0.45, 10, p.width * 0.45, p.height - 10);
    else p.line(10, p.height / 2, p.width - 10, p.height / 2);
    updateReadouts();
  };

  function updateReadouts() {
    const c = Math.cos(theta), s = Math.sin(theta);
    const R = [[c, -s, 0], [s, c, 0], [0, 0, 1]];
    const K = [[0, -theta, 0], [theta, 0, 0], [0, 0, 0]];
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) {
        const r = el.Rm[3 * i + j]; if (r) r.textContent = fmt(R[i][j]);
        const k = el.Km[3 * i + j]; if (k) k.textContent = fmt(K[i][j]);
      }
    if (el.rad) el.rad.textContent = theta.toFixed(2);
    if (el.deg) el.deg.textContent = (theta * 180 / Math.PI).toFixed(0);
  }

  function fmt(v) {
    const s = Math.abs(v) < 5e-3 ? 0 : v;
    return (s >= 0 ? ' ' : '') + s.toFixed(2);
  }
};

new p5(so2_exp_map);
