---
layout: page
title: UR5e Simulation
permalink: /ur5e/
nav_order: 3
has_children: true
has_toc: false
usemathjax: true
---

# UR5e Simulation

In these modules you implement the course material for a simulated
[UR5e](https://www.universal-robots.com/products/ur5-robot/) arm in
[MuJoCo](https://mujoco.readthedocs.io/). Each module gives you the code to copy,
the functions to fill in, and a script that runs the simulation using your code.

1. [Forward Kinematics]({{ site.baseurl }}/ur5e-module1/)
2. [Inverse Kinematics]({{ site.baseurl }}/ur5e-module2/)
3. [Trajectories: Cubic Splines]({{ site.baseurl }}/ur5e-module3/)
4. [Trajectories: Straight-Line Paths]({{ site.baseurl }}/ur5e-module4/)

Optional: [Build Your Own Model]({{ site.baseurl }}/ur5e-bonus-models/)

## Setting up

1. Install the dependencies:

   ```bash
   pip install mujoco numpy scipy matplotlib
   ```

2. Make a folder for your code (e.g. `ur5e/`). Download
   [ur5e_model.zip]({{ site.baseurl }}/assets/ur5e/ur5e_model.zip) and unzip it
   into that folder.
3. Check that MuJoCo works by running `python -m mujoco.viewer`. An empty window should open.

Keep every file from every module in this one folder, and run all scripts from it:

```
ur5e/
  ur5e_model/       (unzipped model)
  transforms.py     (Module 1)
  kinematics.py     (Module 1)
  module1.py        (Module 1)
  ...
```

{: .warning}
> **macOS:** use `mjpython` instead of `python` for any script that opens the
> viewer.

If MuJoCo will not run on your computer, use the
[PACE ICE cluster](https://ondemand-ice.pace.gatech.edu/pun/sys/dashboard)
(requires the GT VPN).

The UR5e model is from [MuJoCo Menagerie](https://github.com/google-deepmind/mujoco_menagerie)
and is used under the license included in the zip.
