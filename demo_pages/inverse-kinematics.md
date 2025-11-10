---
layout: page
title: Inverse Kinematics
permalink: /inverse-kinematics/
parent: Interactive Example
nav_order: 4
usemathjax: true
---

# Inverse Kinematics with Geometric Approach

The geometric approach to inverse kinematics uses trigonometry to solve for the joint angles required to achieve a desired position. In particular, the approach leverages the law of cosines for the following triangle: 

<div style="text-align:center;">
  <img src="{{ site.baseurl }}/assets/demo/law-of-cosines.png" alt="Law of Cosines Diagram" />
</div>

where the law of cosines gives us the equations:

$$
A = \cos^{-1}\left(\frac{b^2 + c^2 - a^2}{2bc}\right), \quad B = \cos^{-1}\left(\frac{a^2 + c^2 - b^2}{2ac}\right) 
$$

For our planar manipulator, we can obtain these side lengths using the desired end-effector position $$(x_d, y_d)$$ and the link lengths $$(L_1, L_2, L_3)$$. Note that we will assume a fixed wrist angle of zero for simplicity:

$$\begin{eqnarray} 
a &=& L_1     \nonumber \\
b &=& L_2 + L_3 \nonumber \\
c &=& \sqrt{x_d^2 + y_d^2} \nonumber \\
\end{eqnarray}$$

Assuming that our zero configuration is with the robot along the x-axis, our diagrams corresponding to the "elbow-up" or "elbow-down" configurations are illustrated as follows:

<div style="display:flex; justify-content:center; gap:24px; align-items:flex-start; flex-wrap:wrap;">
  <figure style="max-width:45%; margin:0; text-align:center;">
    <img src="{{ site.baseurl }}/assets/demo/elbow-up.png" alt="Law of Cosines Diagram (left)" style="width:100%; height:auto;">
    <figcaption style="margin-top:8px;">Elbow Up (Lefty)</figcaption>
  </figure>
  <figure style="max-width:45%; margin:0; text-align:center;">
    <img src="{{ site.baseurl }}/assets/demo/elbow-down.png" alt="Law of Cosines Diagram (right)" style="width:100%; height:auto;">
    <figcaption style="margin-top:8px;">Elbow Down (Righty)</figcaption>
  </figure>
</div>

For any configuration, we can compute the angle $$\gamma$$ using the two-input arctangent function:

$$
\gamma = \mathrm{atan2}(y_d,x_d)
$$

Finally, based on the selected configuration, our joint angles are solved for as follows:

**Elbow-Up Configuration:**

$$\begin{eqnarray} 
\theta_1 &=& B + \gamma \nonumber \\
\theta_2 &=& C - \pi \nonumber 
\end{eqnarray}$$

**Elbow-Down Configuration:**

$$\begin{eqnarray} 
\theta_1 &=& \gamma - B \\
\theta_2 &=& \pi - C
\end{eqnarray}$$

A demonstration of this approach is shown below for the "elbow-up" configuration:

---
<div id="trajectory-container" style="position: relative; width: 100%; max-width: 100%; height: 400px; margin-right: 0;">
  <div style="display:flex; flex-direction:column; align-items:center;">
    <div id="trajectory-canvas"></div>
  </div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.12.0/math.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.6.0/p5.min.js"></script>

<script>
  const L1 = 120, L2 = 80, L3 = 20;
</script>
<script src="{{ site.baseurl }}/assets/js/robot_helpers.js"></script>
<script src="{{ site.baseurl }}/assets/js/planar_example_inversekinematics.js"></script>

