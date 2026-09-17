---
layout: page
title: Spatial and Body Velocity
permalink: /twists/
parent: Interactive Example
nav_order: 7
usemathjax: true
---

# Spatial and Body Velocity

This demo uses the one degree-of-freedom manipulator from Lecture 6 (Example 2.5 from MLS Chapter 2.4). Frame $A$ is fixed to the base, frame $B$ is attached to the end of the second link, and the robot rotates by $\theta$ about the vertical joint axis.

<div style="text-align:center;">
  <img src="{{ site.baseurl }}/assets/demo/one-dof-manipulator.png" alt="One degree-of-freedom manipulator" style="max-width: 480px; width: 100%;" />
</div>

The configuration of frame $B$ relative to frame $A$ is:

$$
g_{ab}(t) = \begin{bmatrix} R(t) & p(t) \\ 0 & 1 \end{bmatrix}
= \begin{bmatrix}
\cos\theta & -\sin\theta & -l_2 \sin\theta \\
\sin\theta & \cos\theta & l_1 + l_2 \cos\theta \\
0 & 0 & 1
\end{bmatrix}
$$

The spatial and body velocities are computed from $g$ and its time derivative:

$$
\hat{\xi}_s = \dot{g} g^{-1} \;\Rightarrow\;
\begin{Bmatrix} v_s \\ \omega_s \end{Bmatrix} =
\begin{Bmatrix} -\dot{R}R^{\top}p + \dot{p} \\ (\dot{R}R^{\top})^{\vee} \end{Bmatrix},
\qquad
\hat{\xi}_b = g^{-1} \dot{g} \;\Rightarrow\;
\begin{Bmatrix} v_b \\ \omega_b \end{Bmatrix} =
\begin{Bmatrix} R^{\top}\dot{p} \\ (R^{\top}\dot{R})^{\vee} \end{Bmatrix}
$$

## Interactive Demo

The robot is drawn from above, so $\hat{z}_A$ and $\hat{z}_B$ point out of the screen. Drag the $\theta$ slider to rotate the joint by hand, or press **Play** to rotate at a constant $\dot{\theta}$. The $l_1$ and $l_2$ sliders change the link lengths.

<style>
  #tw-demo { margin: 1rem 0 2rem; }
  #tw-canvas { width: 100%; border: 1px solid #ddd; border-radius: 6px; overflow: hidden; line-height: 0; }
  .tw-controls { display: flex; flex-wrap: wrap; gap: 0.75rem 1.5rem; align-items: center; margin: 0.75rem 0 0.25rem; }
  .tw-controls label { display: flex; align-items: center; gap: 0.5rem; }
  .tw-controls input[type=range] { width: 180px; max-width: 45vw; }
  .tw-controls .tw-val { font-family: monospace; min-width: 5.5em; }
  .tw-controls button { padding: 0.3rem 0.9rem; border: 1px solid #bbb; border-radius: 4px; background: #fff; cursor: pointer; font-size: 0.95rem; }
  .tw-controls button:hover { background: #f0f0f0; }
  #tw-mode { font-size: 0.85rem; color: #666; margin-bottom: 0.75rem; }
  #tw-readouts { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.75rem; }
  .tw-card { border: 1px solid #ddd; border-left-width: 5px; border-radius: 6px; padding: 0.5rem 0.75rem; background: #fff; }
  .tw-card .tw-title { margin: 0 0 0.35rem; font-weight: 600; }
  .tw-card.tw-s { border-left-color: rgb(217, 72, 15); }
  .tw-card.tw-b { border-left-color: rgb(28, 126, 214); }
  .tw-card.tw-p { border-left-color: #999; }
  .tw-row { display: flex; align-items: center; gap: 0.6rem; margin: 0.3rem 0; flex-wrap: wrap; }
  .tw-num { font-family: monospace; font-size: 1rem; text-align: right; min-width: 3.5em; display: inline-block; }
  .tw-vec { display: inline-flex; flex-direction: column; padding: 0 0.35rem; border-left: 2px solid #333; border-right: 2px solid #333; border-radius: 4px; }
  .tw-closed { color: #666; font-size: 0.85rem; }
</style>

<div id="tw-demo">
  <div id="tw-canvas"></div>

  <div class="tw-controls">
    <label>\(\theta\)
      <input id="tw-thetaSlider" type="range" min="-180" max="180" step="0.1" value="0">
      <span id="tw-thetaValue" class="tw-val">0.0°</span>
    </label>
    <button id="tw-playBtn" type="button">▶ Play</button>
    <button id="tw-resetBtn" type="button">Reset</button>
    <label>Play speed \(\dot{\theta}\)
      <input id="tw-speedSlider" type="range" min="-3" max="3" step="0.1" value="1">
      <span id="tw-speedValue" class="tw-val">1.0 rad/s</span>
    </label>
  </div>
  <div class="tw-controls">
    <label>\(l_1\)
      <input id="tw-l1Slider" type="range" min="0.3" max="1.5" step="0.05" value="1.0">
      <span id="tw-l1Value" class="tw-val">1.00 m</span>
    </label>
    <label>\(l_2\)
      <input id="tw-l2Slider" type="range" min="0.3" max="1.0" step="0.05" value="0.7">
      <span id="tw-l2Value" class="tw-val">0.70 m</span>
    </label>
  </div>
  <div id="tw-mode">
    <span id="tw-modeDrag">\(\dot{\theta}\) is estimated from how fast you drag the \(\theta\) slider</span>
    <span id="tw-modePlay" hidden>\(\dot{\theta}\) is held constant (preset trajectory)</span>
  </div>

  <div class="tw-row" style="margin-bottom: 0.75rem;">
    <strong>Current \(\dot{\theta}\):</strong> <span id="tw-thetaDot" class="tw-num" style="min-width: 7em; text-align: left;">0.00 rad/s</span>
  </div>

  <div id="tw-readouts">
    <div class="tw-card tw-s">
      <div class="tw-title">Spatial velocity</div>
      <div class="tw-row">
        \(\omega_s =\) <span id="tw-ws" class="tw-num">0.00</span>
        <span class="tw-closed">\(= \dot{\theta}\)</span>
      </div>
      <div class="tw-row">
        \(v_s =\) <span class="tw-vec"><span id="tw-vs0" class="tw-num">0.00</span><span id="tw-vs1" class="tw-num">0.00</span></span>
        <span class="tw-closed">\(= \begin{bmatrix} l_1 \dot{\theta} \\ 0 \end{bmatrix}\)</span>
      </div>
    </div>

    <div class="tw-card tw-b">
      <div class="tw-title">Body velocity</div>
      <div class="tw-row">
        \(\omega_b =\) <span id="tw-wb" class="tw-num">0.00</span>
        <span class="tw-closed">\(= \dot{\theta}\)</span>
      </div>
      <div class="tw-row">
        \(v_b =\) <span class="tw-vec"><span id="tw-vb0" class="tw-num">0.00</span><span id="tw-vb1" class="tw-num">0.00</span></span>
        <span class="tw-closed">\(= \begin{bmatrix} -l_2 \dot{\theta} \\ 0 \end{bmatrix}\)</span>
      </div>
    </div>

    <div class="tw-card tw-p">
      <div class="tw-title">For comparison: \(\dot{p}\)</div>
      <div class="tw-row">
        \(\dot{p} =\) <span class="tw-vec"><span id="tw-pd0" class="tw-num">0.00</span><span id="tw-pd1" class="tw-num">0.00</span></span>
        <span class="tw-closed">\(= \begin{bmatrix} -l_2 \cos\theta \, \dot{\theta} \\ -l_2 \sin\theta \, \dot{\theta} \end{bmatrix}\)</span>
      </div>
    </div>
  </div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.6.0/p5.min.js"></script>
<script src="{{ site.baseurl }}/assets/js/twists_example.js"></script>

## What to Notice

- **The velocities do not depend on $\theta$.** For a fixed $\dot{\theta}$, $v_s$, $\omega_s$, $v_b$ and $\omega_b$ stay the same as the robot rotates. Compare this with $\dot{p}$, the velocity of $B$'s origin written in $A$ coordinates, which changes direction as $\theta$ changes.
- **Spatial velocity** ($v_s$, orange): imagine the rigid body extended far enough to reach the origin of $A$. $v_s$ is the velocity of the body point that is passing through $A$'s origin, written in $A$ coordinates. That point moves on the orange dashed circle of radius $l_1$ around the joint, so $v_s = l_1 \dot{\theta}$ along $\hat{x}_A$.
- **Body velocity** ($v_b$, blue): the velocity of $B$'s origin, written in $B$ coordinates. $B$'s origin moves on the blue dashed circle of radius $l_2$, always in the $-\hat{x}_B$ direction, so $v_b = -l_2 \dot{\theta}$ along $\hat{x}_B$.
- **Angular velocity** is $\dot{\theta}$ about $\hat{z}$ in both frames, since $\hat{z}_A$ and $\hat{z}_B$ always point the same way for this robot.
