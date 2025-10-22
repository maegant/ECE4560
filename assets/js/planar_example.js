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


  p.setup = function() {
    let canvas = p.createCanvas(500,400);
    canvas.parent("fk-lie-demo-canvas");

    slider1 = p.createSlider(-180,180,0);
    slider1.parent("fk-lie-demo-sliders");

    slider2 = p.createSlider(-180,180,0);
    slider2.parent("fk-lie-demo-sliders");

    slider3 = p.createSlider(-180,180,0);
    slider3.parent("fk-lie-demo-sliders");
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

  p.draw = function() {
    p.background(240);
    p.translate(p.width/2, p.height/2);
    p.scale(1, -1); // Flip y-axis for conventional coordinate system

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
    
    // Draw links
    p.stroke(0);
    p.strokeWeight(4);
    p.line(points[0].x, points[0].y, points[1].x, points[1].y);
    p.line(points[1].x, points[1].y, points[2].x, points[2].y);
    p.line(points[2].x, points[2].y, points[3].x, points[3].y);

    // Draw gripper
    p.line(points[3].x, points[3].y, points[3].x + clawLength * Math.cos(points[3].theta + clawAngle), points[3].y + clawLength * Math.sin(points[3].theta + clawAngle));
    p.line(points[3].x, points[3].y, points[3].x + clawLength * Math.cos(points[3].theta -clawAngle), points[3].y + clawLength * Math.sin(points[3].theta -clawAngle));
    p.pop();

    // Draw joints
    p.fill("blue");
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
  }
}

new p5(planar_example);
