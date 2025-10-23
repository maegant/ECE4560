let planar_example = function(p) {
  // Link lengths
  let L1 = 120;
  let L2 = 80;
  let L3 = 20;
  let clawLength = 20;
  let clawAngle = Math.PI / 6;

  // Joint angles (radians)
  let theta1 = 0;
  let theta2 = 0;
  let theta3 = 0;
  let slider1, slider2, slider3;

  let showFramesCheckbox;
  let showLabelsCheckbox;
  let container = document.getElementById("fk-exponential-canvas");
  container.style.position = "relative";

  p.setup = function() {
    let canvas = p.createCanvas(500,400);
    canvas.parent(container);
    canvas.style('display', 'block'); // avoid inline spacing issues
    
    const sliderContainer = document.getElementById("fk-exponential-sliders");
    sliderContainer.style.display = "flex";
    sliderContainer.style.flexDirection = "column";
    sliderContainer.style.alignItems = "center";
    sliderContainer.style.gap = "8px";

    function addSliderWithLabel(labelText, defaultValue=0) {
    let wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.alignItems = "center";
    wrapper.style.marginBottom = "4px";

    // Create slider
    let slider = p.createSlider(-180, 180, defaultValue);
      slider.parent(wrapper);

      // Create label
      let label = document.createElement("div");
      label.innerHTML = `\\(${labelText}\\)`;
      label.style.fontSize = "14px";
      label.style.marginTop = "2px";
      wrapper.appendChild(label);

      // Append to container
      sliderContainer.appendChild(wrapper);

      // Render with MathJax
      if (window.MathJax && window.MathJax.typesetPromise) {
        MathJax.typesetPromise([label]);
      }

      return slider;
    }

    // Create sliders + labels
    slider1 = addSliderWithLabel("\\theta_1");
    slider2 = addSliderWithLabel("\\theta_2");
    slider3 = addSliderWithLabel("\\theta_3");
    
    // New checkbox
    showFramesCheckbox = p.createCheckbox('Show frames', true); // default checked
    showFramesCheckbox.style('position', 'absolute');
    showFramesCheckbox.style('top', '10px');
    showFramesCheckbox.style('right', '10px');
    showFramesCheckbox.style('background', 'rgba(255,255,255,0.8)');
    showFramesCheckbox.style('padding', '4px');
    showFramesCheckbox.parent(container);

    // New checkbox for "Show labels"
    showLabelsCheckbox = p.createCheckbox('Show labels', true); // default checked
    showLabelsCheckbox.style('position', 'absolute');
    showLabelsCheckbox.style('top', '50px');
    showLabelsCheckbox.style('right', '18px');
    showLabelsCheckbox.style('background', 'rgba(255,255,255,0.8)');
    showLabelsCheckbox.style('padding', '4px');
    showLabelsCheckbox.parent(container);
  }

  let RZ = function(theta) {
    return [
      [Math.cos(theta), -Math.sin(theta), 0],
      [Math.sin(theta),  Math.cos(theta), 0],
      [0,                0,               1]
    ];
  }

  function getTransformationMatrix(R, d) {
    return [
      [R[0][0], R[0][1], R[0][2], d[0][0]],
      [R[1][0], R[1][1], R[1][2], d[1][0]],
      [R[2][0], R[2][1], R[2][2], d[2][0]],
      [0, 0, 0, 1]
    ];
  }

  function getExpMat(xi, theta) {
    let xihat = hatTwist(xi);
    let A = math.multiply(xihat, theta);
    let expA = math.expm(A);
    return expA.toArray();
  }

  function getTwist(omega, q) {
    let omegaArr = omega.slice(0,3);
    let negomegaArr = math.multiply(-1, omegaArr);
    let qArr = q.slice(0,3);
    let negOmegaCrossQ = math.cross(negomegaArr, qArr);      // -ω × q
    return [ negOmegaCrossQ[0], negOmegaCrossQ[1], negOmegaCrossQ[2], omegaArr[0], omegaArr[1], omegaArr[2] ];
  }

  function hatTwist(xi) {
    let v1 = xi[0];
    let v2 = xi[1];
    let v3 = xi[2];
    let w1 = xi[3];
    let w2 = xi[4];
    let w3 = xi[5];
    return [[0, -w3, w2, v1],
            [w3, 0, -w1, v2],
            [-w2, w1, 0, v3],
            [0, 0, 0, 0]];
  }

  function computeFK_Exp(theta1, theta2, theta3) {
    let omega1 = [0, 0, 1];
    let omega2 = [0, 0, 1];
    let omega3 = [0, 0, 1];
    let q1 = [0, 0, 0];
    let q2 = [L1, 0, 0];
    let q3 = [L1 + L2, 0, 0];
    let g0 = [
      [1, 0, 0, L1 + L2 + L3],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ];

    // intermediate reference configurations for visualization purposes only
    let g0_1 = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ];
    let g0_2 = [
      [1, 0, 0, L1],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ];
    let g0_3 = [
      [1, 0, 0, L1 + L2],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ];

    let xi1 = getTwist(omega1, q1);
    let xi2 = getTwist(omega2, q2);
    let xi3 = getTwist(omega3, q3);

    let exp1 = getExpMat(xi1, theta1);
    let exp2 = getExpMat(xi2, theta2);
    let exp3 = getExpMat(xi3, theta3);

    let exp12 = math.multiply(exp1, exp2);
    let exp123 = math.multiply(exp12, exp3);

    let g_w1 = math.multiply(exp1, g0_1);
    let g_w2 = math.multiply(math.multiply(exp1, exp2), g0_2);
    let g_w3 = math.multiply(math.multiply(math.multiply(exp1, exp2), exp3), g0_3);
    let g_wE = math.multiply(math.multiply(math.multiply(exp1, exp2), exp3), g0);

    // "Unit" manipulators for each individual joint in the zero configuration
    let g_indiv1 = math.multiply(exp1, g0);
    let g_indiv2 = math.multiply(exp12, g0);
    let g_indiv3 = math.multiply(exp123, g0);

    // Compute poses
    let p1 = compute_pose_from_transformation(g_w1);
    let p2 = compute_pose_from_transformation(g_w2);
    let p3 = compute_pose_from_transformation(g_w3);
    let pE = compute_pose_from_transformation(g_wE);

    return {
      points: [p1, p2, p3, pE],
      exponentials: {
        exp1: exp1,
        exp2: exp2,
        exp3: exp3
      },
      transforms: {
        g_w1: g_w1,
        g_w2: g_w2,
        g_w3: g_w3,
        g_wE: g_wE
      },
      twists: {
        xi1: xi1,
        xi2: xi2,
        xi3: xi3
      },
      ghosts: {
        origins: [exp1, exp12, exp123],
        ends: [g_indiv1, g_indiv2, g_indiv3]
      }
    };
  }

  function compute_pose_from_transformation(g){
    theta_i = Math.atan2(g[1][0], g[0][0]);
    return {x: g[0][3], y: g[1][3], theta: theta_i}
  }

  function drawFrame(p, g, axisLength = 30) {
    // Extract position
    let x0 = g[0][3];
    let y0 = g[1][3];

    // Extract rotation (assuming planar rotation about Z)
    // 2D rotation part: first column is X-axis, second column is Y-axis
    let xAxisX = g[0][0];
    let xAxisY = g[1][0];
    let yAxisX = g[0][1];
    let yAxisY = g[1][1];

    // Compute end points of axes
    let xEnd = x0 + axisLength * xAxisX;
    let yEnd = y0 + axisLength * xAxisY;

    let xEndY = x0 + axisLength * yAxisX;
    let yEndY = y0 + axisLength * yAxisY;

    // Draw X-axis (red)
    p.stroke("red");
    p.strokeWeight(2);
    p.line(x0, y0, xEnd, yEnd);

    // Draw Y-axis (green)
    p.stroke("green");
    p.strokeWeight(2);
    p.line(x0, y0, xEndY, yEndY);
  }

  p.draw = function() {
    p.background(240);
    p.translate(p.width/2, p.height/2);
    p.scale(0.8, -0.8); // Flip y-axis for conventional coordinate system

    // Draw grid
    p.stroke(200);
    p.strokeWeight(1);
    let gridSpacing = 40;
    let xMin = -p.width / 2;
    let xMax = p.width / 2;
    let yMin = -p.height / 2;
    let yMax = p.height / 2;
    // Vertical lines
    for (let x = Math.ceil(xMin / gridSpacing) * gridSpacing; x <= xMax; x += gridSpacing) {
      p.line(x, yMin, x, yMax);
    }
    // Horizontal lines
    for (let y = Math.ceil(yMin / gridSpacing) * gridSpacing; y <= yMax; y += gridSpacing) {
      p.line(xMin, y, xMax, y);
    }
    p.pop();


    // Update joint angles from sliders
    theta1 = p.radians(slider1.value());
    theta2 = p.radians(slider2.value());
    theta3 = p.radians(slider3.value());

    let result = computeFK_Exp(theta1, theta2, theta3);
    let points = result.points
    let twists = result.twists;
    let exps = result.exponentials;
    let transforms = result.transforms;

    // Draw Ghost Manipulators (so on the bottom)
    let ghosts = result.ghosts;
    p.stroke("rgba(255,0,0,0.5)");
    p.strokeWeight(2);
    let origin1 = compute_pose_from_transformation(ghosts.origins[0]);
    let end1 = compute_pose_from_transformation(ghosts.ends[0]);
    p.line(origin1.x, origin1.y, end1.x, end1.y);

    p.stroke("rgba(128,0,128,0.5)"); // purple, 50% transparent
    let origin2 = compute_pose_from_transformation(ghosts.origins[1]);
    let end2 = compute_pose_from_transformation(ghosts.ends[1]);
    p.line(origin2.x, origin2.y, end2.x, end2.y);

    p.stroke("rgba(255,165,0,0.5)"); // orange, 50% transparent
    let origin3 = compute_pose_from_transformation(ghosts.origins[2]);
    let end3 = compute_pose_from_transformation(ghosts.ends[2]);
    p.line(origin3.x, origin3.y, end3.x, end3.y);

    // Draw links
    p.push()
    p.stroke(0);
    p.strokeWeight(4);
    p.line(points[0].x, points[0].y, points[1].x, points[1].y);
    p.line(points[1].x, points[1].y, points[2].x, points[2].y);
    p.line(points[2].x, points[2].y, points[3].x, points[3].y);

    // Draw gripper
    p.line(points[3].x, points[3].y, points[3].x + clawLength * Math.cos(points[3].theta + clawAngle), points[3].y + clawLength * Math.sin(points[3].theta + clawAngle));
    p.line(points[3].x, points[3].y, points[3].x + clawLength * Math.cos(points[3].theta -clawAngle), points[3].y + clawLength * Math.sin(points[3].theta -clawAngle));
    p.pop();

    if (showFramesCheckbox.checked()) {

      gworld = [[1,0,0,0],[0, 1,0,0],[0,0,1,0],[0,0,0,1]];
      drawFrame(p, gworld);

      // Draw frames for the actual robot
      drawFrame(p, ghosts.origins[0]);
      drawFrame(p, ghosts.origins[1]);
      drawFrame(p, ghosts.origins[2]);

      // Draw frames for ghost manipulators
      drawFrame(p, transforms.g_w1);
      drawFrame(p, transforms.g_w2);
      drawFrame(p, transforms.g_w3);
      drawFrame(p, transforms.g_wE);
    }

    // Draw joints
    p.fill("blue");
    p.stroke("blue");
    p.noStroke();
    for (let i = 0; i < points.length - 1; i++) {
      let pt = points[i];
      p.ellipse(pt.x, pt.y, 12, 12);
    }

    // Display angles
    p.push();
    p.scale(1, -1); // flip back for text
    p.noStroke();
    p.fill(0);
    p.textSize(14);

    // Put coordinates at end-effector frame
    let endEffector = points[3];
    // Convert end-effector position to canvas coordinates
    let canvasX = p.width / 2 + endEffector.x;
    let canvasY = p.height / 2 - endEffector.y; // flip y back for DOM
    let thetaDeg = (endEffector.theta * 180 / Math.PI).toFixed(1);
    let label = `\\((x, y, \\theta) = (${endEffector.x.toFixed(1)},\\ ${endEffector.y.toFixed(1)},\\ ${thetaDeg}^\\circ)\\)`;

    // Remove previous labels if they exist
    if (window.thetaLabels) {
      window.thetaLabels.forEach(el => el.remove());
    }
    window.thetaLabels = [];

    function createMathJaxLabel(latex, x, y) {
      let container = document.getElementById('fk-exponential-container');
      let div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.left = `${x}px`; // relative to container
      div.style.top = `${y}px`;
      div.style.background = 'rgba(255,255,255,0.8)';
      div.style.fontSize = '16px';
      div.style.pointerEvents = 'none';
      div.className = 'latex-label';
      container.appendChild(div);
      window.thetaLabels.push(div);

      // Render with MathJax if available, else fallback to plain text
      if (window.MathJax && window.MathJax.typesetPromise) {
        div.innerHTML = latex;
        MathJax.typesetPromise([div]);
      } else {
        div.textContent = latex;
      }
    }

    function plotLabelonCanvas(label, point) {
      createMathJaxLabel(`\\(${label}\\)`, p.width / 2 + point.x, p.height / 2 - point.y); // flip y back for DOM
    }

    // Place the labels near the top-left corner of the canvas itself
    createMathJaxLabel(`\\(\\theta_1 = ${slider1.value()}^\\circ\\)`, 12, 18);
    createMathJaxLabel(`\\(\\theta_2 = ${slider2.value()}^\\circ\\)`, 12, 42);
    createMathJaxLabel(`\\(\\theta_3 = ${slider3.value()}^\\circ\\)`, 12, 66);

    if (showLabelsCheckbox.checked()) {
      // Place the labels near the top-left corner of the canvas itself
      plotLabelonCanvas('e^{\\hat{\\xi}_1 \\theta_1}', origin1);
      plotLabelonCanvas('e^{\\hat{\\xi}_1 \\theta_1}e^{\\hat{\\xi}_2 \\theta_2}', origin2);
      plotLabelonCanvas('e^{\\hat{\\xi}_1 \\theta_1}e^{\\hat{\\xi}_2 \\theta_2}e^{\\hat{\\xi}_3 \\theta_3}', origin3);
    }

    function showTwistLabel(twist, label, containerId, left, top, windowLabelName) {
      // Remove previous label if exists
      if (window[windowLabelName]) window[windowLabelName].remove();

      let container = document.getElementById(containerId);
      let div = document.createElement('div');
      div.style.position = 'relative';
      div.style.left = left;
      div.style.top = top;
      div.style.background = 'rgba(255,255,255,0.8)';
      div.style.fontSize = '14px';
      div.style.pointerEvents = 'none';
      div.className = 'latex-label';
      container.appendChild(div);
      window[windowLabelName] = div;

      // Ensure twist is a flat array
      let values = Array.isArray(twist) ? twist.flat() : [];
      
      // Build LaTeX string for a 6x1 column vector
      let latex = `\\(${label} = \\begin{bmatrix}` +
                  values.map(n => n.toFixed(3)).join('\\\\') +
                  '\\end{bmatrix}\\)';

      if (window.MathJax && window.MathJax.typesetPromise) {
        div.innerHTML = latex;
        MathJax.typesetPromise([div]);
      } else {
        div.textContent = latex;
      }
    }

    function showMatrixLabel(matrix, label, containerId, left, top, windowLabelName) {
      // Remove previous label if exists
      if (window[windowLabelName]) window[windowLabelName].remove();
      let container = document.getElementById(containerId);
      let div = document.createElement('div');
      div.style.position = 'relative';
      div.style.left = left;
      div.style.top = top;
      div.style.background = 'rgba(255,255,255,0.8)';
      div.style.fontSize = '14px';
      div.style.pointerEvents = 'none';
      div.className = 'latex-label';
      container.appendChild(div);
      window[windowLabelName] = div;

      let latex = `\\(${label} = \\begin{bmatrix}` +
      matrix[0].map(n => n.toFixed(3)).join('&') + '\\\\' +
      matrix[1].map(n => n.toFixed(3)).join('&') + '\\\\' +
      matrix[2].map(n => n.toFixed(3)).join('&') + '\\\\' +
      matrix[3].map(n => n.toFixed(3)).join('&') +
      '\\end{bmatrix}\\)';
      if (window.MathJax && window.MathJax.typesetPromise) {
      div.innerHTML = latex;
      MathJax.typesetPromise([div]);
      } else {
      div.textContent = latex;
      }
    }
    

    // Example usage for gw1:
    // showTwistLabel(twists.xi1, '\\xi_1', 'fk-exponential-output', '12px', '0px', 'xi1Label');
    // showTwistLabel(twists.xi2, '\\xi_2', 'fk-exponential-output', '12px', '0px', 'xi2Label');
    // showTwistLabel(twists.xi3, '\\xi_3', 'fk-exponential-output', '12px', '0px', 'xi3Label');

    showMatrixLabel(exps.exp1, 'e^{\\hat{\\xi}_1 \\theta_1}', 'fk-exponential-output', '12px', '0px', 'xi1Label');
    showMatrixLabel(exps.exp2, 'e^{\\hat{\\xi}_2 \\theta_2}', 'fk-exponential-output', '12px', '0px', 'fk-exponential-output2');
    showMatrixLabel(exps.exp3, 'e^{\\hat{\\xi}_3 \\theta_3}', 'fk-exponential-output', '12px', '0px', 'fk-exponential-output3');
    showMatrixLabel(transforms.g_wE, 'e^{\\hat{\\xi}_1 \\theta_1}e^{\\hat{\\xi}_2 \\theta_2}e^{\\hat{\\xi}_3 \\theta_3}g_0', 'fk-exponential-output', '12px', '0px', 'fk-exponential-output4');
  }
}

new p5(planar_example);
