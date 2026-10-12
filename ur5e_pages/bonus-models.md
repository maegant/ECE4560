---
layout: page
title: Bonus - Build Your Own Model
permalink: /ur5e-bonus-models/
parent: UR5e Simulation
nav_order: 5
usemathjax: true
---

# Bonus: Building Your Own Robot Model

Optional. Start from the template:

```bash
cp models/custom_planar_robot/custom_planar_robot_template.xml \
   models/custom_planar_robot/my_robot.xml
python bonus/view_model.py custom_planar_robot/my_robot.xml
python bonus/view_model.py custom_planar_robot/my_robot.xml --freeze -0.785 -1.571
```

On macOS, use `mjpython` instead of `python`. `--freeze` holds the joints at the given angles (radians), which is useful for
checking your frames.

Each `<body>`'s `pos` and `quat` are relative to its parent, so the nesting of
bodies is the kinematic chain.

- [MJCF XML reference](https://mujoco.readthedocs.io/en/stable/XMLreference.html)
- [MuJoCo Menagerie](https://github.com/google-deepmind/mujoco_menagerie) (source of the UR5e model)
