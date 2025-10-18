---
layout: page
title: Biped
permalink: /assignment7-biped/
parent: 7 - Inverse Kinematics
---

Read through the [Resolved Rate Inverse Kinematics Module](https://pvela.gatech.edu/classes/doku.php?id=ece4560:biped:04rrinvkin). This module uses a different form of inverse kinematics that we will learn once we cover manipulator Jacobians. Since we haven't covered this material yet, try creating a similar module for the Biped class that uses a optimization-based approach to solve for a joint configuration based on a desired swing-foot position. I recommend the following structure for your optimization problem:
```markdown
$$
\begin{align*}
    \theta^* = \underset{\theta \in [\theta_{\min}, \theta_{\max}]}{\arg\min} \quad & \left\| \mathrm{COM}_x(\theta) \right\|^2 \\
    \text{s.t.} \quad & p_{nsf}(\theta) = p_{\mathrm{desired}}
\end{align*}
$$
```

This will render the optimization problem using MathJax for better readability in markdown.
            \begin{align*}
                \theta^* = \underset{\theta \in [\theta_{\textrm{min}}, \theta_{\textrm{max}}]}{\textrm{argmin}} \quad & \norm{\textrm{COM}_x(\theta)}^2 \\
                \text{s.t.} \quad & p_{nsf}(\theta) = p_{\textrm{desired}} \\
            \end{align*}
            where $COM_{x(\theta)}$ is the forward position of the center of mass (you should have this function from Assignment 6) relative to the center of the stance foot, and $p_{nsf}(\theta)$ is the (x,y) position of the non-stance (swing) foot relative to the stance foot.
            This optimization-based approach could use either `fmincon' in MATLAB or `scipy.optimize.minimize' in Python.

            Once you've written your optimization problem, use it in a for loop to generate a ``trajectory'' of desired joint setpoints. Notice that the resulting trajectory (when you animate it) may be discontinuous or have sharp changes in joint angles. Hopefully this will later motivate the need for a smoother trajectory generation method.


            \item Robot Arm: Conduct the \href{https://pvela.gatech.edu/classes/doku.php?id=manipulator:adventures}{inverse kinematics} module for either the Piktul or Lynx6 manipulator arm. 
            \item Mobile Robot: I'd like for the turtlebot group to also have hands-on experience with inverse kinematics. To do so, please also complete the \href{https://pvela.gatech.edu/classes/doku.php?id=manipulator:adventures}{inverse kinematics} module for either the Piktul or Lynx6 manipulator arm. However, you may stick to simulation for this module if you'd like and create a visualization of the manipulator.
            \item Biped Project: 