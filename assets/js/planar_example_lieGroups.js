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
  let container = document.getElementById("fk-lie-demo-canvas");
  container.style.position = "relative";

  p.setup = function() {
    let canvas = p.createCanvas(500,400);
    canvas.parent(container);
    canvas.style('display', 'block'); // avoid inline spacing issues

    const sliderContainer = document.getElementById("fk-lie-demo-sliders");
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

  function computeFK_Lie(theta1, theta2, theta3) {
    let R01 = RZ(theta1);
    let d01 = [[0],[0],[0]];

    let R12 = RZ(theta2);
    let d12 = [[L1],[0],[0]];

    let R23 = RZ(theta3);
    let d23 = [[L2],[0],[0]];

    let R3E = [[1,0,0],[0,1,0],[0,0,1]];
    let d3E = [[L3],[0],[0]];

    let g_w1 = getTransformationMatrix(R01,d01);
    let g_12 = getTransformationMatrix(R12,d12);
    let g_23 = getTransformationMatrix(R23,d23);
    let g_3E = getTransformationMatrix(R3E,d3E);

    let g_w2 = math.multiply(g_w1,g_12);
    let g_w3 = math.multiply(g_w2,g_23);
    let g_wE = math.multiply(g_w3,g_3E);

    // Compute poses
    let p1 = compute_pose_from_transformation(g_w1);
    let p2 = compute_pose_from_transformation(g_w2);
    let p3 = compute_pose_from_transformation(g_w3);
    let pE = compute_pose_from_transformation(g_wE);

    return {
      points: [p1, p2, p3, pE],
      transforms: {
        g_w1: g_w1,
        g_w2: g_w2,
        g_w3: g_w3,
        g_wE: g_wE
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
    p.scale(1, -1); // Flip y-axis for conventional coordinate system

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

    let result = computeFK_Lie(theta1, theta2, theta3);
    let points = result.points
    let gw1 = result.transforms.g_w1;
    let gw2 = result.transforms.g_w2;
    let gw3 = result.transforms.g_w3;
    let gwE = result.transforms.g_wE;

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
      drawFrame(p, gw1);
      drawFrame(p, gw2);
      drawFrame(p, gw3);
      drawFrame(p, gwE);

    }

    // Draw joints
    p.fill("blue");
    p.stroke("blue");
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

    if (window.eeLabel) window.eeLabel.remove();
    let container = document.getElementById('fk-lie-demo-container');
    let div = document.createElement('div');
    div.style.position = 'relative';
    div.style.left = `${canvasX + 10}px`;
    div.style.top = `${canvasY - 30}px`;
    div.style.background = 'rgba(255,255,255,0.8)';
    div.style.fontSize = '16px';
    div.style.pointerEvents = 'none';
    div.className = 'latex-label';
    container.appendChild(div);
    window.eeLabel = div;

    // if (window.MathJax && window.MathJax.typesetPromise) {
    //   div.innerHTML = label;
    //   MathJax.typesetPromise([div]);
    // } else {
    //   div.textContent = label;
    // }

    // Remove previous labels if they exist
    if (window.thetaLabels) {
      window.thetaLabels.forEach(el => el.remove());
    }
    window.thetaLabels = [];

    function createMathJaxLabel(latex, x, y) {
      let container = document.getElementById('fk-lie-demo-container');
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

    // Place the labels near the top-left corner of the canvas itself
    createMathJaxLabel(`\\(\\theta_1 = ${slider1.value()}^\\circ\\)`, 12, 18);
    createMathJaxLabel(`\\(\\theta_2 = ${slider2.value()}^\\circ\\)`, 12, 42);
    createMathJaxLabel(`\\(\\theta_3 = ${slider3.value()}^\\circ\\)`, 12, 66);

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
    showMatrixLabel(gw1, 'g_{w1}', 'fk-lie-demo-output', '12px', '0px', 'g01Label');
    showMatrixLabel(gw2, 'g_{w2}', 'fk-lie-demo-output', '12px', '0px', 'gw2Label');
    showMatrixLabel(gw3, 'g_{w3}', 'fk-lie-demo-output', '12px', '0px', 'gw3Label');
    showMatrixLabel(gwE, 'g_{wE}', 'fk-lie-demo-output', '12px', '0px', 'gwELabel');
  }
}

new p5(planar_example);
