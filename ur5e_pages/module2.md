---
layout: page
title: 2 - Inverse Kinematics
permalink: /ur5e-module2/
parent: UR5e Simulation
nav_order: 2
usemathjax: true
published: false
---

# Module 2: Inverse Kinematics

Solve for the joint angles that reach a desired pose using Newton–Raphson.

## 2a: Spatial Jacobian

$$
J^s = \begin{bmatrix} \xi'_1 & \cdots & \xi'_6 \end{bmatrix},
\qquad
\xi'_i = \mathrm{Ad}_{\,e^{\hat{\xi}_1 \theta_1} \cdots e^{\hat{\xi}_{i-1} \theta_{i-1}}} \, \xi_i
$$

In `spatial_jacobian` (`kinematics.py`), replace the marked line using
`adjoint`. The product of exponentials is already accumulated in `product`.

## 2b: Error twist

$$
\hat{\xi} = \log\left( g_{\text{desired}} \, g_{\text{current}}^{-1} \right)
$$

Fill in `error_twist` in `inverse_kinematics.py` using `logm`.

## 2c: Newton–Raphson step

$$
\theta \leftarrow \theta + (J^s)^{\dagger} \, \xi
$$

Fill in the update in `inverse_kinematics_newton`. Use `np.linalg.pinv`.

## Running

```bash
python module2.py
```

{: .warning}
> **macOS:** use `mjpython` instead of `python` to run any script that opens the
> viewer, e.g. `mjpython module2.py`.

The script solves for the joint angles that reach a target pose, prints the
solution and its position error, and moves the arm there. If your code is
correct, the wrist ends up inside the red sphere:

![Expected result for Module 2]({{ site.baseurl }}/assets/ur5e/module2.png)

To try the provided optimization-based solver instead, swap the commented
`inverse_kinematics_optimization` line in `module2.py`.

## What to submit

1. Your Jacobian derivation, showing the adjoint for at least one column.
2. Why \\( \log(g_{\text{desired}} g_{\text{current}}^{-1}) \\) is a better error
   than separate position and orientation differences.
3. The printed output for both solvers, with a comparison.
4. When you would use each solver on a real robot.
