let planar_example = function(p) {
  // Link lengths

  // Joint angles (radians)
  let theta1 = 0, theta2 = 0, theta3 = 0;
  // Elbow configuration: true = elbow-up, false = elbow-down

  let modeButtons = {};
  let elbowMode = "elbowdown";
  
  // Array to store click animations
  let clicks = [];
  let lastClick = null;

  const container = document.getElementById("trajectory-canvas");
  container.style.position = "relative";

  p.setup = function() {
    let canvas = p.createCanvas(500, 400);
    canvas.parent(container);
    canvas.style('display', 'block');

    // --- Create Button Container ---
    const modeContainer = document.createElement("div");
    modeContainer.id = "elbow-toggle";
    modeContainer.style.position = "absolute";
    modeContainer.style.top = "10px";
    modeContainer.style.right = "10px";
    modeContainer.style.display = "flex";
    modeContainer.style.flexDirection = "row";
    modeContainer.style.gap = "6px";
    modeContainer.style.zIndex = "10";
    container.appendChild(modeContainer);

    // --- Helper to Create Buttons ---
    function createModeButton(name, label) {
      let btn = p.createButton(label);
      btn.parent(modeContainer);
      btn.mousePressed(() => {
        elbowMode = name;
        Object.keys(modeButtons).forEach(k => {
          modeButtons[k].style('background', k === name ? '#aaf' : '');
        });

        // If a point was last clicked, recompute IK immediately
        if (lastClick) {
          let { x, y } = lastClick;
          [theta1, theta2, theta3] = inverse_kinematics(x, y, elbowMode);
        }
      });
      return btn;
    }

    // --- Create Buttons ---
    modeButtons.elbowup = createModeButton("elbowup", "Elbow-Up");
    modeButtons.elbowdown = createModeButton("elbowdown", "Elbow-Down");
    modeButtons.elbowdown.style('background', '#aaf'); // Default active (down)

    // Handle mouse clicks on canvas
    canvas.mousePressed(() => {
      // Convert click to world coordinates
      let x = (p.mouseX - p.width/2) / 0.6;
      let y = (p.height/2 - p.mouseY) / 0.6;
      
      // Add a new click animation
      clicks.push({
        x: x,
        y: y,
        radius: 20
      });
      lastClick = { x, y };

      // Compute IK
      [theta1, theta2, theta3] = inverse_kinematics(x, y, elbowMode);
    });

  };

  p.draw = function() {
    p.background(240);
    p.translate(p.width / 2, p.height / 2);
    p.scale(0.6, -0.6);

    // Draw grid
    p.stroke(220);
    for (let x = -p.width / 2; x < p.width / 2; x += 40) p.line(x, -p.height / 2, x, p.height / 2);
    for (let y = -p.height / 2; y < p.height / 2; y += 40) p.line(-p.width / 2, y, p.width / 2, y);

    let results = computeFK_Lie(theta1, theta2, theta3);
    let pts = results.points;

    // Draw manipulator
    p.stroke(0);
    p.strokeWeight(4);
    for (let i = 0; i < 3; i++) {
      p.line(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y);
    }

    // Draw joints
    const jointColors = ["purple", "orange", "teal"];
    for (let i = 0; i < 3; i++) {
      p.fill(jointColors[i]);
      p.stroke(jointColors[i]);
      p.ellipse(pts[i].x, pts[i].y, 12, 12);
    }


    // Draw a clicked point if it exists as a shrinking circle
    for(let i=clicks.length-1; i>=0; i--){
      let c = clicks[i];
      p.noFill();
      p.stroke(255,0,0);
      p.strokeWeight(2);
      p.ellipse(c.x, c.y, c.radius*2, c.radius*2);
      c.radius *= 0.9; // shrink factor
      if(c.radius < 1) clicks.splice(i,1); // remove when too small
    }

    // Remove previous labels if they exist
    if (window.thetaLabels) {
      window.thetaLabels.forEach(el => el.remove());
    }
    window.thetaLabels = [];

    function createMathJaxLabel(latex, x, y) {
      let container = document.getElementById('trajectory-container');
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
    // Option A: show radians with 2 decimal places
    createMathJaxLabel(`\\(\\theta_1 = ${p.degrees(theta1).toFixed(1)}^\\circ\\)`, 12, 18);
    createMathJaxLabel(`\\(\\theta_2 = ${p.degrees(theta2).toFixed(1)}^\\circ\\)`, 12, 42);
    createMathJaxLabel(`\\(\\theta_3 = ${p.degrees(theta3).toFixed(1)}^\\circ\\)`, 12, 66);

    // Option B: convert to degrees and show 2 decimal places (uncomment if you want degrees)
     // createMathJaxLabel(`\\(\\theta_1 = ${(theta1 * 180 / Math.PI).toFixed(2)}^\\circ\\)`, 12, 18);
     // createMathJaxLabel(`\\(\\theta_2 = ${(theta2 * 180 / Math.PI).toFixed(2)}^\\circ\\)`, 12, 42);
     // createMathJaxLabel(`\\(\\theta_3 = ${(theta3 * 180 / Math.PI).toFixed(2)}^\\circ\\)`, 12, 66);

  }
}

new p5(planar_example);
