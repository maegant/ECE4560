---
layout: page
title: Product of Lie Groups
permalink: /fk-demo1/
parent: Interactive Example
nav_order: 2
usemathjax: true
---

# Forward Kinematics: Product of Lie Groups

The **Product of Lie Groups** method computes the forward kinematics of the end-effector relative to the world frame by multiplying relative frame transformations:

$$
g_{we} = g_{w1} \, g_{12} \, g_{23} \, \cdots \, g_{ne}
$$

Each of these transformations is computed using the displacement and rotation from the last frame to the next frame (with each subsequent frame attached to the link immediately after the joint). These transformations are in _homogeneous form_: 

$$
g_{ij} = \begin{bmatrix} R_{ij} & p_{ij} \\ 0 & 1 \end{bmatrix}
$$

For all of the demos, we will consider the [planar 3-DOF manipulator]({{ site.baseurl}}/planar-manipulator/). This manipulator has the individual transformations defined as follows:

$$
\begin{align*}
g_{w1} &= \begin{bmatrix} R_z(\theta_1) & \begin{bmatrix} 0 \\ 0 \\ 0 \end{bmatrix} \\ 0 & 1 \end{bmatrix}, \quad
g_{12} = \begin{bmatrix} R_z(\theta_2) & \begin{bmatrix} L_1 \\ 0 \\ 0 \end{bmatrix} \\ 0 & 1 \end{bmatrix}, \quad
g_{23} = \begin{bmatrix} R_z(\theta_3) & \begin{bmatrix} L_2 \\ 0 \\ 0 \end{bmatrix} \\ 0 & 1 \end{bmatrix}, \quad 
g_{3E} = \begin{bmatrix} I & \begin{bmatrix} L_3 \\ 0 \\ 0 \end{bmatrix} \\ 0 & 1 \end{bmatrix}.
\end{align*}
$$ 

Typically we use these only to compute the end-effector transformation \( g_{we} \) as:

$$ 
g_{we} = g_{w1} \, g_{12} \, g_{23} \, g_{3E}
$$

However, we can also compute the transformation of each intermediate frame relative to the world frame as:

$$ 
g_{w2} = g_{w1} \, g_{12}, \quad
g_{w3} = g_{w2} \, g_{23}, \quad
g_{wE} = g_{w3} \, g_{3E}
$$

The following interactive GUI demonstrates these calculations being computed in real time. 

---

<div style="display: flex; flex-direction: row; align-items: flex-start;">
    <div id="fk-lie-demo-container" style="position: relative; width: 500px; height: 400px; margin-right: 24px;">
        <div id="fk-lie-demo-canvas"></div>
        <div id="fk-lie-demo-sliders"></div>
    </div>
    <div id="fk-lie-demo-output" style="width: 350px; height: auto; margin-top: 0;">
        <h3>Individual Frame Transformations:</h3>
    </div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.12.0/math.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.6.0/p5.min.js"></script>


<script>
  const L1 = 120, L2 = 80, L3 = 20;
</script>
<script src="{{ site.baseurl }}/assets/js/robot_helpers.js"></script>
<script src="{{ site.baseurl }}/assets/js/planar_example_lieGroups.js"></script>

