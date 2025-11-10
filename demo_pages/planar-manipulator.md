---
layout: page
title: Planar Manipulator
permalink: /planar-manipulator/
parent: Interactive Example
nav_order: 1
usemathjax: true
---

# Planar Manipulator

For all of the demos, we will consider the following planar 3-DOF manipulator:
<div id="fk-lie-demo-container" style="position: relative; width: 100%; max-width: 100%; height: 400px; margin-right: 0;">
    <div id="fk-lie-demo-canvas"></div>
    <div id="fk-lie-demo-sliders"></div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.12.0/math.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.6.0/p5.min.js"></script>

<script>
  const L1 = 120, L2 = 80, L3 = 20;
</script>
<script src="{{ site.baseurl }}/assets/js/robot_helpers.js"></script>
<script src="{{ site.baseurl }}/assets/js/planar_example.js"></script>
