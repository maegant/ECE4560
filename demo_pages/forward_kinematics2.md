---
layout: page
title: Forward Kinematics 2
permalink: /fk-demo2/
parent: Interactive Example
nav_order: 3
usemathjax: true
---

# Forward Kinematics: Product of Exponentials

The **Product of Exponentials** method also computes the forward kinematics of the end-effector relative to the world frame. However this method instead uses the concept of twists and exponential coordinates to compute the contribution of each joint to the overall transformation. The full forward kinematics expression is computed as:

$$
g_{we} = e^{\hat{\xi_1}\theta_1} e^{\hat{\xi_2}\theta_2} \cdots e^{\hat{\xi_n}\theta_n} \, g_0
$$

Here, each $\exp(\hat{\xi_i}\theta_i)$ term represents the exponential map of the twist associated with joint $$i$$ scaled by the joint variable $$\theta_i$$. Mathematically, this is computed using the matrix exponential, but we can also use our formulas for the exponential map. The final term $$g_0$$ is the home configuration (also called the reference configuration) of the end-effector when all joint variables are zero. 

For reference, the twist is defined in homogeneous form as:
$$
\hat{\xi} = \begin{bmatrix} [\omega]_\times & v \\ 0 & 0 \end{bmatrix}
$$,  
or in vector form as 
$$
\xi = \begin{bmatrix} v \\ \omega \end{bmatrix}
$$ with $$v$$ representing the linear velocity component and $$\omega$$ representing the angular velocity component of the twist.

For our planar example, the reference configuration is:

$$ 
g_0 = \begin{bmatrix} I & \begin{bmatrix} L_1 + L_2 + L_3 \\ 0 \\ 0 \end{bmatrix} \\ 0 & 1 \end{bmatrix}
$$

The individual twists for each joint are then calculated at the zero configuration using the formula:

$$
\xi_i = \begin{cases}
\begin{bmatrix} -\omega_i \times q_i \\ \omega_i \end{bmatrix} & \text{if revolute joint} \\

\begin{bmatrix} v_i \\ 0 \end{bmatrix} & \text{if prismatic joint}
\end{cases}
$$



The following interactive GUI demonstrates these calculations being computed in real time. 

---

<div style="display: flex; flex-direction: row; align-items: flex-start;">
    <div id="fk-exponential-container" style="position: relative; width: 500px; height: 400px; margin-right: 24px;">
        <div id="fk-exponential-canvas"></div>
        <div id="fk-exponential-sliders"></div>
    </div>
    <div id="fk-exponential-output" style="width: 350px; height: auto; margin-top: 0;">
        <h3>Individual Exponential Maps:</h3>
    </div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.12.0/math.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.6.0/p5.min.js"></script>
<script src="{{ site.baseurl }}/assets/js/planar_example_exponentials.js"></script>

