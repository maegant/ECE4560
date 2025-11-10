---
layout: page
title: Straight-Line Path
permalink: /straight-line/
parent: Interactive Example
nav_order: 6
usemathjax: true
---

# Straight-Line Path in Task Space

If we want to command a manipulator to move from one task-space configuration to another while following a straightline path (with the straight line being in task space), we will also need to use a cubic spline interpolation to create a smooth trajectory between two points. However, this cubic spline will now be applied to a time-scaling function that parameterizes the straight-line path.

This time-scaling function is also defined by a cubic polynomial:

$$ 
s(t) = a_0 + a_1 t + a_2 t^2 + a_3 t^3
$$

where the coefficients $$(a_0, a_1, a_2, a_3)$$ are now determined by the boundary conditions: 

$$
a_0 = 0, \quad
a_1 = 0, \quad
a_2 = \frac{3}{T^2}, \quad
a_3 = -\frac{2}{T^3}
$$

where $$ T $$ is the duration of the trajectory.

A simulation of the straight-line path with and without time-scaling is shown below:

---
<div id="trajectory-container" style="display:flex; gap:20px; align-items:flex-start;">
  <div style="display:flex; flex-direction:column; align-items:center;">
    <div id="trajectory-canvas"></div>
    <div id="trajectory-sliders"></div>
    <div id="trajectory-plots" style="margin-top: 12px; display: flex; flex-direction: row; gap: 16px;">
        <div id="plot-t" style="flex: 1; height: 200px; border: 1px solid #ccc;"></div>
        <div id="plot-p" style="flex: 1; height: 200px; border: 1px solid #ccc;"></div>
    </div>
  </div>

  <div id="trajectory-controls"
       style="display:flex; flex-direction:column; gap:8px; background:rgba(255,255,255,0.9);
              padding:10px; border-radius:8px; max-width:180px; font-family:sans-serif;">
    <h4 style="margin:0 0 8px 0;">Trajectory Settings</h4>

    <label>Start EE Pos</label>
    <div style="display:flex; gap:4px;">
      <input id="start1" type="number" value="200" style="width:50px;">
      <input id="start2" type="number" value="0" style="width:50px;">
    </div>

    <label>End EE Pos</label>
    <div style="display:flex; gap:4px;">
      <input id="end1" type="number" value="0" style="width:50px;">
      <input id="end2" type="number" value="200" style="width:50px;">
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

<script>
  const L1 = 120, L2 = 80, L3 = 20;
</script>
<script src="{{ site.baseurl }}/assets/js/robot_helpers.js"></script>
<script src="{{ site.baseurl }}/assets/js/planar_example_straightline.js"></script>

