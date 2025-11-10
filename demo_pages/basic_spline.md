---
layout: page
title: Basic Cubic Splines
permalink: /cubic-spline/
parent: Interactive Example
nav_order: 5
usemathjax: true
---

# Cubic Splines in Joint Space

Cubic spline interpolation creates a smooth trajectory between two points by using a cubic polynomial to interpolate the position. This results in smooth position and velocity profiles. Note that if we also wanted a smooth acceleration profile, we would need to use a quintic spline. But a cubic spline is sufficient for smooth profiles. The cubic polynomial is defined as:

$$ 
p(t) = a_0 + a_1 t + a_2 t^2 + a_3 t^3
$$

If we start with the boundary conditions:

$$
p(0) = \theta_0, \quad
p(T) = \theta_f, \quad
\dot{p}(0) = 0, \quad
\dot{p}(T) = 0
$$

then we can solve for the coefficients $$(a_0, a_1, a_2, a_3)$$ as follows:

$$
a_0 = \theta_0, \quad
a_1 = 0, \quad
a_2 = \frac{3(\theta_f - \theta_0)}{T^2}, \quad
a_3 = -\frac{2(\theta_f - \theta_0)}{T^3}
$$

A demonstration of this cubic spline interpolation is shown below. For comparison purposes, a discrete change in desired joint position (called a step input) as well as a linear interpolation between the start and end positions are also shown. You should be able to see that the cubic spline results in smooth position, velocity, and acceleration profiles compared to the other two methods.

---
<div id="trajectory-container" style="display:flex; gap:20px; align-items:flex-start;">
  <div style="display:flex; flex-direction:column; align-items:center;">
    <div id="trajectory-canvas"></div>
    <div id="trajectory-sliders"></div>
    <div id="trajectory-plots" style="margin-top: 12px; display: flex; flex-direction: row; gap: 16px;">
        <div id="plot-p" style="flex: 1; height: 200px; border: 1px solid #ccc;"></div>
        <div id="plot-pdot" style="flex: 1; height: 200px; border: 1px solid #ccc;"></div>
        <div id="plot-pddot" style="flex: 1; height: 200px; border: 1px solid #ccc;"></div>
    </div>
  </div>

  <div id="trajectory-controls"
       style="display:flex; flex-direction:column; gap:8px; background:rgba(255,255,255,0.9);
              padding:10px; border-radius:8px; max-width:180px; font-family:sans-serif;">
    <h4 style="margin:0 0 8px 0;">Trajectory Settings</h4>

    <label>Start (°)</label>
    <div style="display:flex; gap:4px;">
      <input id="start1" type="number" value="0" style="width:50px;">
      <input id="start2" type="number" value="0" style="width:50px;">
      <input id="start3" type="number" value="0" style="width:50px;">
    </div>

    <label>End (°)</label>
    <div style="display:flex; gap:4px;">
      <input id="end1" type="number" value="90" style="width:50px;">
      <input id="end2" type="number" value="45" style="width:50px;">
      <input id="end3" type="number" value="30" style="width:50px;">
    </div>

    <label>Duration (s)</label>
    <input id="duration" type="number" value="3" style="width:80px;">

    <button id="playTrajectoryBtn"
            style="margin-top:8px; padding:4px; cursor:pointer; background:#007bff;
                   color:white; border:none; border-radius:4px;">
      ▶ Play Trajectory
    </button>
  </div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.12.0/math.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.6.0/p5.min.js"></script>
<script src="{{ site.baseurl }}/assets/js/planar_example_cubicspline.js"></script>

