---
layout: page
title: Exponential Map for Rotations
permalink: /so3-exp-map/
parent: Interactive Example
nav_order: 8
usemathjax: true
---

# Exponential Map for Rotations

This demo goes with Lecture 7. It demonstrates a visual example of Rodrigues' formula for $SO(2)$. These concepts extend to $SO(3)$ but everything is harder to visualize. To emphasize the full extension, the math is written for $SO(3)$ with all rotations being restricted to +z, but the visualizations are limited to $SO(2)$. 

<style>
  #so2-demo { margin: 1.2rem 0 2rem; }

  .so3-stage { border: 1px solid #d8d8d8; border-radius: 8px; margin: 0 0 1.1rem; overflow: hidden; background: #fff; }
  .so3-head { background: #f4f5f7; border-bottom: 1px solid #e2e2e2; padding: 0.55rem 0.9rem; font-weight: 600; font-size: 1.02rem; display: flex; align-items: center; gap: 0.6rem; }
  .so3-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 1.6em; height: 1.6em; padding: 0 0.4em; border-radius: 0.8em; background: #003057; color: #fff; font-size: 0.85em; font-weight: 700; flex: none; }
  .so3-body { padding: 0.75rem 0.9rem 0.9rem; }
  .so3-sub { font-size: 0.85rem; color: #666; margin: 0.7rem 0 0.2rem; }
  .so3-sub:first-child { margin-top: 0; }
  .so3-hr { border: 0; border-top: 1px dashed #e0e0e0; margin: 0.85rem 0 0; }

  .so3-row { display: flex; flex-wrap: wrap; gap: 0.5rem 1.5rem; align-items: center; margin: 0.35rem 0; }
  .so3-row label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.95rem; }
  .so3-row input[type=range] { width: 180px; max-width: 45vw; }
  .so3-val { font-family: monospace; min-width: 4em; font-size: 0.9rem; }

  .so3-sliders { margin: 0.5rem 0 0.2rem; }
  /* one grid per row, all with the same track sizes, so the three sliders line up */
  .so3-ctl { display: grid; grid-template-columns: 3.6em minmax(80px, 210px) 6.6em auto; align-items: center; gap: 0.55rem; margin: 0.32rem 0; }
  .so3-ctl input[type=range] { width: 100%; }
  .so3-nm { font-size: 0.95rem; }
  .so3-tag { font-size: 0.82rem; color: #888; font-style: italic; }
  .so3-twin { display: flex; flex-wrap: wrap; gap: 0.8rem 1.8rem; margin: 0.35rem 0 0; }
  .so3-half { flex: 1 1 0; min-width: 250px; }
  /* the two calculations run small, so each fits its half without wrapping */
  .so3-twin .so3-out { font-size: 0.82rem; gap: 0.3rem 0.8rem; }
  .so3-twin .so3-vec { font-size: 0.76rem; padding: 0 0.3rem; }
  .so3-twin .so3-num { font-size: 0.8rem; }
  .so3-cap { font-size: 0.78rem; color: #888; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 0.3rem; }
  .so3-ctl.so3-derived { opacity: 0.62; }
  .so3-ctl.so3-derived input[type=range] { cursor: not-allowed; }

  .so3-seg { padding: 0.3rem 0.9rem; border: 1px solid #bbb; background: #fff; cursor: pointer; font-size: 0.95rem; }
  .so3-seg:first-of-type { border-radius: 4px 0 0 4px; }
  .so3-seg:last-of-type { border-radius: 0 4px 4px 0; border-left: none; }
  .so3-seg.so3-on { background: rgb(217, 100, 15); border-color: rgb(217, 100, 15); color: #fff; font-weight: 600; }

  .so3-play { padding: 0.45rem 1.5rem; border: 1px solid #003057; border-radius: 4px; background: #003057; color: #fff; cursor: pointer; font-size: 1rem; font-weight: 600; }
  .so3-play:hover { background: #00243f; }

  .so3-out { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 1.4rem; font-size: 0.95rem; }
  .so3-num { font-family: monospace; }
  .so3-vec { display: inline-flex; flex-direction: column; padding: 0 0.35rem; border-left: 2px solid #333; border-right: 2px solid #333; border-radius: 4px; font-family: monospace; text-align: right; font-size: 0.9rem; }
  .so3-mat { display: inline-grid; grid-template-columns: repeat(3, 3.7em); padding: 0.15rem 0.35rem; border-left: 2px solid #333; border-right: 2px solid #333; border-radius: 4px; font-family: monospace; font-size: 0.9rem; text-align: right; }
  .so3-mat2 { display: inline-grid; grid-template-columns: repeat(2, 3.7em); padding: 0.15rem 0.35rem; border-left: 2px solid #333; border-right: 2px solid #333; border-radius: 4px; font-family: monospace; font-size: 0.9rem; text-align: right; }
  .so3-note { font-size: 0.85rem; color: #666; }
  .so3-eq { overflow-x: auto; }

  .so2-split { display: flex; flex-wrap: wrap; gap: 0.9rem; align-items: flex-start; }
  .so2-split > .so2-cv { flex: 1 1 400px; min-width: 300px; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden; line-height: 0; }
  #so2-canvas { cursor: grab; }
  #so2-canvas:active { cursor: grabbing; }
  .so2-side { flex: 0 1 215px; min-width: 200px; font-size: 0.88rem; }
  .so2-side .so2-lbl { font-size: 0.82rem; color: #666; margin: 0.55rem 0 0.15rem; }
  .so2-side .so2-lbl:first-child { margin-top: 0; }
  .so2-btn { margin-top: 0.7rem; padding: 0.3rem 0.85rem; border: 1px solid #bbb; border-radius: 4px; background: #fff; cursor: pointer; font-size: 0.9rem; }
  .so2-btn:hover { background: #f0f0f0; }
</style>

<div id="so2-demo">

  <!-- ============ 1 ============ -->
  <div class="so3-stage">
    <div class="so3-head"><span class="so3-badge">1</span> Visualizing SO(2)</div>
    <div class="so3-body">
      <div class="so3-sub">
        A rotation about $\hat z$ keeps everything in the plane, so we can draw the whole thing. The unit circle on the left is the Lie group \(SO(2)\), with every possible element $R \in SO(2)$ represented as a point on the unit circle. The straight line on the right, tangent to $SO(2)$ at $I$ is the Lie algebra $\mathfrak{so}(2)$, with the element $[\omega]_\times \in \mathfrak{so}(2)$ (equivalently, $[\omega]_\times = [\hat\omega]_\times \theta$). These tangent elements map velocities onto $SO(2)$ using the exponential map. You can see this by <strong>dragging the frame</strong>. Note that the tangent vector and the arc always have the same length, because that is what \(\exp\) does.
      </div>

      <div id="so2-canvas" class="so2-cv"></div>

      <div class="so3-out" style="margin-top:0.7rem;">
        <span>\([\omega]_\times=[\hat\omega]_\times\theta =\)
          <span class="so3-mat">
            <span id="so2-k00">0.00</span><span id="so2-k01">0.00</span><span id="so2-k02">0.00</span>
            <span id="so2-k10">0.00</span><span id="so2-k11">0.00</span><span id="so2-k12">0.00</span>
            <span id="so2-k20">0.00</span><span id="so2-k21">0.00</span><span id="so2-k22">0.00</span>
          </span></span>
        <span>\(R =\)
          <span class="so3-mat">
            <span id="so2-r00">1.00</span><span id="so2-r01">0.00</span><span id="so2-r02">0.00</span>
            <span id="so2-r10">0.00</span><span id="so2-r11">1.00</span><span id="so2-r12">0.00</span>
            <span id="so2-r20">0.00</span><span id="so2-r21">0.00</span><span id="so2-r22">1.00</span>
          </span></span>
      </div>

      <div class="so3-row">
        <span class="so3-note">\(\theta =\) <span id="so2-rad" class="so3-num">0.90</span> rad = <span id="so2-deg" class="so3-num">52</span>°</span>
        <button id="so2-reset" class="so2-btn" style="margin-top:0;" type="button">Reset to \(I\)</button>
      </div>

      <div class="so3-note" style="margin-top:0.7rem;">
        Both matrices have a third row and column that never change, because \(\hat z\) does not move. Keep dragging past a full turn: \(\theta\) keeps growing but the point comes back round, so \(\theta\) and \(\theta + 2\pi\) give the same \(R\).
      </div>
    </div>
  </div>

  <!-- ============ 2 ============ -->
  <div class="so3-stage">
    <div class="so3-head"><span class="so3-badge">2</span> Using Rodrigues' Equation</div>
    <div class="so3-body">
    <div class="so3-sub">The general form of Rodrigues' equation is given by the formula:
      <div class="so3-eq">
        $$ R = e^{[\hat{\omega}]_{\times}\theta} = I + \sin(\theta)\,[\hat\omega]_\times + (1-\cos(\theta))\,[\hat\omega]_\times^2 $$
      </div>
      This formula explicitly maps elements on the Lie algebra $\mathfrak{so(2)}$ to the Lie group $SO(2)$. This formula is equivalent to the matrix exponential but can be computed easily by hand.
      </div>
      <div class="so3-sub">
      The formula can also be interpreted as having the input of time (duration $\tau$), which is mathematically equivalent to the previous formula. This formula is:
      <div class="so3-eq">
        $$ R = e^{[\omega]_{\times}\tau} = I + \sin(\|\omega\|\tau)\,\frac{[\hat\omega]_\times}{\|\omega\|} + (1-\cos(\|\omega\|\tau))\,\frac{[\hat\omega]_\times^2}{\|\omega\|} $$
      </div>
      </div>
      <hr class="so3-hr">
      <div class="so3-sub">You can demonstrate this mapping for yourself below by specifying either an angle or a speed and duration and then simulating the resulting motion:
      <div class="so3-row">
        <span><button id="so2r-modeAngle" class="so3-seg so3-on" type="button">specify angle</button><button id="so2r-modeTime" class="so3-seg" type="button">specify duration</button></span>
      </div>
      <div class="so3-sliders">
        <div class="so3-ctl" id="so2r-thetaWrap">
          <span class="so3-nm">\(\theta\)</span>
          <input id="so2r-theta" type="range" min="0" max="6.2832" step="any" value="1.60">
          <span id="so2r-thetaVal" class="so3-val">1.60 rad</span>
          <span id="so2r-thetaTag" class="so3-tag"></span>
        </div>
        <div class="so3-ctl" id="so2r-speedWrap">
          <span class="so3-nm">\(\|\omega\|\)</span>
          <input id="so2r-speed" type="range" min="0.25" max="4" step="any" value="1">
          <span id="so2r-speedVal" class="so3-val">1.00 rad/s</span>
          <span id="so2r-speedTag" class="so3-tag"></span>
        </div>
        <div class="so3-ctl" id="so2r-tauWrap">
          <span class="so3-nm">\(\tau\)</span>
          <input id="so2r-tau" type="range" min="0" max="8" step="any" value="1.60">
          <span id="so2r-tauVal" class="so3-val">1.60 s</span>
          <span id="so2r-tauTag" class="so3-tag"></span>
        </div>
      </div>
      <div class="so3-twin">
        <div class="so3-half">
          <div class="so3-cap">from direction and angle</div>
          <div class="so3-out">
            <span>\(\hat\omega\,\theta =\)</span>
            <span class="so3-vec"><span>0.00</span><span>0.00</span><span>1.00</span></span>
            <span>\(\cdot\) <span id="so2r-thA" class="so3-num">1.60</span> \(=\)</span>
            <span class="so3-vec"><span id="so2r-a0">0.00</span><span id="so2r-a1">0.00</span><span id="so2r-a2">1.60</span></span>
          </div>
        </div>
        <div class="so3-half">
          <div class="so3-cap">from speed and duration</div>
          <div class="so3-out">
            <span>\(\omega\,\tau = \|\omega\|\hat\omega\,\tau =\)</span>
            <span class="so3-vec"><span id="so2r-w0">0.00</span><span id="so2r-w1">0.00</span><span id="so2r-w2">1.00</span></span>
            <span>\(\cdot\) <span id="so2r-tauB" class="so3-num">1.60</span> \(=\)</span>
            <span class="so3-vec"><span id="so2r-b0">0.00</span><span id="so2r-b1">0.00</span><span id="so2r-b2">1.60</span></span>
          </div>
        </div>
      </div>
    </div>

    <div class="so3-body">
      <div class="so3-row">
        <button id="so2r-play" class="so3-play" type="button">▶ Play</button>
        <span class="so3-note">swept so far: <span id="so2r-swept" class="so3-num">0.00</span> rad of <span id="so2r-target" class="so3-num">1.60</span>,&nbsp; elapsed: <span id="so2r-elapsed" class="so3-num">0.00</span> s of <span id="so2r-tauPlay" class="so3-num">1.60</span> s</span>
      </div>

      <div id="so2r-canvas" class="so2-cv" style="margin-top:0.6rem;"></div>

      <div class="so3-note" style="margin-top:0.6rem;">
        The rotation \(R\) shown here is computed with Rodrigues' equation.
      </div>

    </div>
  </div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.6.0/p5.min.js"></script>
<script src="{{ site.baseurl }}/assets/js/so2_exp_map.js"></script>
<script src="{{ site.baseurl }}/assets/js/so2_rodrigues.js"></script>
