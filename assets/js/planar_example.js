let planar_example = function(p) {
  // Claw parameters
  let clawLength = 20;
  let clawAngle = Math.PI / 6;

  // Joint angles (radians)
  let theta1 = 0;
  let theta2 = 0;
  let theta3 = 0;
  let slider1, slider2, slider3;


  p.windowResized = function() {
    let container = document.getElementById("fk-lie-demo-canvas");
    let containerWidth = container.offsetWidth;
    p.resizeCanvas(containerWidth, 400);
  };

  p.setup = function() {
    let container = document.getElementById("fk-lie-demo-canvas");
    let containerWidth = container.offsetWidth;  // actual width of your Jekyll content div
    let canvas = p.createCanvas(containerWidth, 400);
    canvas.parent(container);
    p.pixelDensity(1);

    const sliderContainer = document.getElementById("fk-lie-demo-sliders");
    sliderContainer.style.display = "flex";
    sliderContainer.style.flexDirection = "row";
    sliderContainer.style.alignItems = "center";
    sliderContainer.style.justifyContent = "center"; 
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
