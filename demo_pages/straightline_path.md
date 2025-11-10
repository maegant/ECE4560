---
layout: page
title: Straight-Line Paths
permalink: /straight-line-paths/
parent: Interactive Example
nav_order: 6
usemathjax: true
---

# Straight-Line Paths

If we want to command a manipulator to move in a straight line (either in Joint Space or in Task Space), we will no longer be able to use a cubic spline directly on the joint angles. However, to maintain smooth profiles, we will still use a cubic spline but apply it to a time-scaling function instead. 

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

Using this time-scaling function, we can then directly command a straight line path either in Joint Space or Task Space as follows:

**Joint Space Straight-Line Path:**

We don't really _need_ to ever command a straight line in joint space since the cubic spline in joint space is typically sufficient, but if we wanted to, we could do so using:

$$
\theta(t) = (1-s)\theta_0 + s(t) \theta_f
$$

with the corresponding velocity profiles then given by:

$$
\dot{\theta}(t) = \dot{s}(t)(\theta_f - \theta_0)
$$

**Task Space Straight-Line Path:**

Straight-line paths are more commonly commanded in task space. In this case, we can define the end-effector position at time $$t$$ as:

$$
p(t) = (1-s(t))p_0 + s(t) p_f
$$

if we want to also obtain the straight-line path for orientation, in order to respect motion on the Lie group, we can compute the transition between orientations using the matrix logarithm and exponential as follows:

$$
R(t) = R_0 \exp\left( \ln(R_0^T R_f) \, s(t) \right)
$$

Together this gives us the Lie group trajectory:

$$
g(t) = \begin{bmatrix} R(t) & p(t) \\ 0 & 1 \end{bmatrix}
$$

Then, to get the corresponding joint angles, we can use inverse kinematics at each time step.

If we want to compute the corresponding velocity profiles, we must first start with the task-level velocity which we can respresent as the twist:

$$
\xi_s(t) = \dot{g}(t) g(t)^{-1}, \quad 
\xi_b(t) = g(t)^{-1} \dot{g}(t)
$$

where $$\dot{g}(t)$$ is the time derivative of $$g(t)$$. If you do not have access to the time-derivative, then we will need to use waypoints and then compute the twist between each waypoint as $$\xi_b = \ln(g_1^{-1} g_2) / \Delta t$$.


A simulation of the straight-line path in task space with and without time-scaling is shown below. Note that you can see that without time-scaling, the velocity profile would have discontinuities at the start and end of the trajectory.

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

