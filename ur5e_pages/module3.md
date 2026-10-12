---
layout: page
title: 3 - Trajectories, Cubic Splines
permalink: /ur5e-module3/
parent: UR5e Simulation
nav_order: 3
usemathjax: true
---

# Module 3: Trajectory Design with Cubic Splines

Move each joint from \\( q_{\text{start}} \\) to \\( q_{\text{end}} \\) over time
\\( T \\) with

$$
q(t) = a_0 + a_1 t + a_2 t^2 + a_3 t^3,
$$

subject to \\( q(0) = q_{\text{start}} \\), \\( q(T) = q_{\text{end}} \\),
\\( \dot{q}(0) = \dot{q}(T) = 0 \\).

## What to write

In `trajectories.py`:

- `cubic_coefficients`: \\( a_0, \dots, a_3 \\) for each joint.
- `evaluate_cubic`: \\( q(t) \\) and \\( \dot{q}(t) \\).

## Running

```bash
python module3.py
python bonus/plot_trajectory.py
```

{: .warning}
> **macOS:** use `mjpython` instead of `python` to run any script that opens the
> viewer, e.g. `mjpython module3.py`.

The arm moves from the blue sphere to the green sphere along your spline. If
your code is correct, the wrist ends up in the green sphere:

![Expected result for Module 3]({{ site.baseurl }}/assets/ur5e/module3.png)

`module3.py` saves `simulation_data.csv`, which `plot_trajectory.py` plots. Set
`USE_SPLINE = False` in `module3.py` to command the final configuration directly
instead.

## What to submit

1. Your derivation of \\( a_0, \dots, a_3 \\).
2. Tracking plots with `USE_SPLINE = True` and `False`, with a comparison.
3. An explanation of the error remaining at the end of the motion.
