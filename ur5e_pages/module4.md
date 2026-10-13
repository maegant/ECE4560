---
layout: page
title: 4 - Trajectories, Straight-Line Paths
permalink: /ur5e-module4/
parent: UR5e Simulation
nav_order: 4
usemathjax: true
published: false
---

# Module 4: Trajectory Design with Straight-Line Paths

Move the tool along a straight line in the world, \\( g(s(t)) \\) with
\\( s \in [0, 1] \\).

## 4a: Time scaling

`time_scaling`: the Module 3 cubic with \\( s(0) = 0 \\), \\( s(T) = 1 \\),
\\( \dot{s}(0) = \dot{s}(T) = 0 \\).

## 4b–c: Path

`straight_line_path`:

$$
p(s) = p_{\text{start}} + s \, (p_{\text{end}} - p_{\text{start}}),
\qquad
R(s) = R_{\text{start}} \exp\left( \log\left( R_{\text{start}}^{\mathsf{T}} R_{\text{end}} \right) s \right)
$$

Wrap `logm` in `np.real`.

## 4d: Twist between waypoints

`path_twist`:

$$
\hat{\xi} = \frac{1}{\Delta t} \log\left( g_{\text{next}} \, g_{\text{last}}^{-1} \right)
$$

Module 4 also uses your Module 2 Jacobian.

## Running

```bash
python module4.py
```

{: .warning}
> **macOS:** use `mjpython` instead of `python` to run any script that opens the
> viewer, e.g. `mjpython module4.py`.

Green spheres are the waypoints; blue dots are where the tool actually was. The
script also prints the worst waypoint error. Change `METHOD` and `N` at the top
of `module4.py` to switch methods and the number of waypoints.

If your code is correct, with `METHOD = "ik"` the blue dots stay inside the
green spheres:

![Expected result for Module 4 with IK]({{ site.baseurl }}/assets/ur5e/module4.png)

With `METHOD = "resolved-rate"` they drift off the line:

![Expected result for Module 4 with resolved rate]({{ site.baseurl }}/assets/ur5e/module4-rr.png)

## What to submit

1. Why a rotation matrix cannot be interpolated entry by entry, and what the
   formula for \\( R(s) \\) does instead.
2. Waypoint errors for both methods at two or three values of `N`, with an
   explanation.
3. Screenshots of both methods.
