let planar_example = function(p) {
  // Link lengths
  let clawLength = 20;
  let clawAngle = Math.PI / 6;

  // Joint angles (radians)
  let theta1 = 0, theta2 = 0, theta3 = 0;
  let slider1, slider2, slider3;

  let interpPoints = [];  // to store (x, y) pairs from linearInterp

  // Trajectory playback
  let playing = false;
  let startTime = 0;
  let duration = 3;
  let startDelay = 1; // seconds
  const jointColors = ["purple", "orange", "teal"];

  // Plotting
  let plotData = [];
  let eeTrace = [];  // stores {x, y} of the end-effector

  // Trajectory mode buttons
  let modeButtons = {};
  let trajectoryMode = "cubic"; // default

  let container = document.getElementById("trajectory-canvas");
  container.style.position = "relative";


  p.setup = function() {
    let canvas = p.createCanvas(500,400);
    canvas.parent(container);
    canvas.style('display', 'block');

    const sliderContainer = document.getElementById("trajectory-sliders");
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

      let slider = p.createSlider(-180, 180, defaultValue);
      slider.parent(wrapper);

      let label = document.createElement("div");
      label.innerHTML = `\\(${labelText}\\)`;
      label.style.fontSize = "14px";
      label.style.marginTop = "2px";
      wrapper.appendChild(label);

      // sliderContainer.appendChild(wrapper);
      if (window.MathJax && window.MathJax.typesetPromise)
        MathJax.typesetPromise([label]);
      return slider;
    }

    slider1 = addSliderWithLabel("\\theta_1");
    slider2 = addSliderWithLabel("\\theta_2");
    slider3 = addSliderWithLabel("\\theta_3");

    // --- Trajectory mode buttons container ---
    const trajModeContainer = document.createElement("div");
    trajModeContainer.style.display = "flex";
    trajModeContainer.style.flexDirection = "row";
    trajModeContainer.style.alignItems = "center";
    trajModeContainer.style.gap = "4px";
    trajModeContainer.style.marginBottom = "6px";

    // Insert above the Play Trajectory button
    const playBtn = document.getElementById("playTrajectoryBtn");
    playBtn.parentNode.insertBefore(trajModeContainer, playBtn);

    function createModeButton(name,label){
      let btn = p.createButton(label);
      btn.parent(trajModeContainer);
      btn.mousePressed(()=>{
        trajectoryMode = name;
        Object.keys(modeButtons).forEach(k=>{
          modeButtons[k].style('background', k===name ? '#aaf' : '');
        });
      });
      return btn;
    }

    modeButtons.linear = createModeButton("linear","No Time-Scaling");
    modeButtons.time_scaling = createModeButton("time_scaling","Time-Scaling");
    modeButtons.linear.style.background="#aaf"; // default active

    // Play trajectory button
    document.getElementById("playTrajectoryBtn").onclick = () => {
      startPos = [
        parseFloat(document.getElementById("start1").value),
        parseFloat(document.getElementById("start2").value)
      ];
      startAngles = inverse_kinematics(startPos[0], startPos[1]);
      endPos = [
        parseFloat(document.getElementById("end1").value),
        parseFloat(document.getElementById("end2").value)
      ];
      duration = parseFloat(document.getElementById("duration").value);
      startTime = p.millis() / 1000;

      // Reset simulation state
      startTime = p.millis() / 1000;
      plotData = [];           // Clear previous trajectory
      eeTrace = [];          // Clear end-effector trace
      lastAngles = [...startAngles]; // Reset velocity calculation
      lastVel = [0, 0, 0];     // Reset acceleration calculation
      
      // Start playback
      playing = true;
    };
  };

  // --- Helper functions ---
  let RZ = theta => [
    [Math.cos(theta), -Math.sin(theta), 0],
    [Math.sin(theta),  Math.cos(theta), 0],
    [0, 0, 1]
  ];

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

    function poseFromG(g){
      return {x: g[0][3], y: g[1][3], theta: Math.atan2(g[1][0], g[0][0])};
    }
    return {
      points: [poseFromG(g_w1), poseFromG(g_w2), poseFromG(g_w3), poseFromG(g_wE)],
      transforms: { g_w1, g_w2, g_w3, g_wE }
    };
  }

  function drawFrame(p, g, axisLength = 30) {
    let x0 = g[0][3], y0 = g[1][3];
    let xAxis = [g[0][0], g[1][0]];
    let yAxis = [g[0][1], g[1][1]];
    p.strokeWeight(2);
    p.stroke("red"); p.line(x0, y0, x0 + axisLength*xAxis[0], y0 + axisLength*xAxis[1]);
    p.stroke("green"); p.line(x0, y0, x0 + axisLength*yAxis[0], y0 + axisLength*yAxis[1]);
  }

  function drawPlots() {
    function plotSeriesInDiv(divId, accessor, label, length) {
      const container = document.getElementById(divId);

      // Create a canvas inside the div if it doesn't exist
      let canvas = container.querySelector("canvas");
      if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.width = container.clientWidth || 200;
        canvas.height = container.clientHeight || 150;
        container.appendChild(canvas);
      }

      const ctx = canvas.getContext("2d");
      const w = canvas.width;
      const h = canvas.height;
      const padding = 20;

      ctx.clearRect(0, 0, w, h);

      // Draw axes
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.beginPath();
      // y-axis
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, h - padding);
      // x-axis
      ctx.moveTo(padding, h - padding);
      ctx.lineTo(w - padding, h - padding);
      ctx.stroke();

      // Axis labels
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#000";
      ctx.fillText("Time (s)", w / 2, h - 10);
      ctx.save();
      ctx.translate(10, h / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.restore();

      // Draw title
      ctx.fillText(label, padding + 5, padding - 5);

      if (!plotData || plotData.length === 0) return;

      // Time scaling
      const tMax = duration+(2*startDelay)|| (plotData[plotData.length - 1].t || 1);
      
      // Y-axis scaling based on data
      let yMin = Infinity, yMax = -Infinity;
      plotData.forEach(d => {
        const vals = accessor(d);
        vals.forEach(v => {
          if (v < yMin) yMin = v;
          if (v > yMax) yMax = v;
        });
      });
      if (yMin === yMax) { yMin -= 1; yMax += 1; }
      const yRange = yMax - yMin;

      for (let j = 0; j < length; j++) {
        ctx.beginPath();
        ctx.strokeStyle = jointColors[j];
        ctx.lineWidth = 2;
        for (let i = 0; i < plotData.length; i++) {
          const t = (plotData[i].t / tMax) * (w - 2*padding) + padding;
          const val = accessor(plotData[i])[j];
          const y = h - padding - ((val - yMin) / yRange) * (h - 2*padding);
          if (i === 0) ctx.moveTo(t, y); else ctx.lineTo(t, y);
        }
        ctx.stroke();
      }
    }
    plotSeriesInDiv("plot-t",   d => d.s, "s(t)", 1);
    plotSeriesInDiv("plot-p",   d => d.pos, "p(t)", 3);
  }

  // --- Main draw loop ---
  p.draw = function() {
    p.background(240);
    p.translate(p.width/2, p.height/2);
    p.scale(0.6, -0.6);

    // Grid
    p.stroke(220);
    let gridSpacing = 40;
    for (let x=-p.width/2; x<p.width/2; x+=gridSpacing) p.line(x,-p.height/2,x,p.height/2);
    for (let y=-p.height/2; y<p.height/2; y+=gridSpacing) p.line(-p.width/2,y,p.width/2,y);

    // === Trajectory logic ===
    if (playing) {
      let tNow = p.millis() / 1000;
      let t = tNow - startTime;
      let tEffective = tNow - startTime - startDelay;
      let tau = Math.max(0, Math.min(duration, tEffective)); 
      let [startAngle1, startAngle2, startAngle3] = inverse_kinematics(startPos[0], startPos[1]); 
      let startAngles = [startAngle1, startAngle2, startAngle3];
      let [endAngle1, endAngle2, endAngle3] = inverse_kinematics(endPos[0], endPos[1]);
      let endAngles = [endAngle1, endAngle2, endAngle3];
      [theta1, theta2, theta3] = [0,1,2].map(i => startAngles[i])
      let lastAngles = startAngles;
      let lastVel = [0, 0, 0];
      let s, v, a;
      
      function time_scalingInterp(tau) {
        // // cubic time scaling
        let a0 = 0;
        let a1 = 0;
        let a2 = 3 / (duration * duration);
        let a3 = -2 / (duration * duration * duration);

        s = (a2 * (tau * tau)) + (a3 * (tau * tau * tau));

        // // interpolate Cartesian position
        let x = ((1 - s) * startPos[0]) + (s * endPos[0]);
        let y = ((1 - s) * startPos[1]) + (s * endPos[1]);

        interpPoints.push({ x, y });

        // inverse kinematics
        [theta1, theta2, theta3] = inverse_kinematics(x, y);

        // // approximate joint velocity/accel from time-scaling
        curAngles = [theta1, theta2, theta3];
        let vel = [0,0,0];
        let acc = [0,0,0];

        return [theta1, theta2, theta3, vel, acc]; 
      }

      function linearInterp(tau) {
          s = tau/duration;
          let x = ((1-s)*startPos[0]) + (s * endPos[0]);
          let y = ((1-s)*startPos[1]) + (s * endPos[1]);
          interpPoints.push({ x, y });

          [theta1, theta2, theta3] = inverse_kinematics(x, y);
          curAngles = [theta1, theta2, theta3];
          let vel = [0,0,0];
          let acc = [0,0,0];

          return [theta1, theta2, theta3, vel, acc]; 
      }

      // Choose the interpolation function based on mode
      let interpFunc;
      if (trajectoryMode === "linear") interpFunc = linearInterp;
      else if (trajectoryMode === "time_scaling") interpFunc = time_scalingInterp;
      [theta1, theta2, theta3, v, a] = interpFunc(tau);

      plotData.push({ t, pos:[theta1,theta2,theta3], s:[s]});

      slider1.value(p.degrees(theta1));
      slider2.value(p.degrees(theta2));
      slider3.value(p.degrees(theta3));

      if (t >= duration + (2*startDelay)) playing = false;
    } else {
      theta1 = p.radians(slider1.value());
      theta2 = p.radians(slider2.value());
      theta3 = p.radians(slider3.value());
    }

    let result = computeFK_Lie(theta1, theta2, theta3);
    let pts = result.points;

    // Add current end-effector position to the trace
    eeTrace.push({ x: pts[3].x, y: pts[3].y });

    // Optionally limit trace length to avoid too many points
    const maxTraceLength = 500;
    if (eeTrace.length > maxTraceLength) eeTrace.shift();

    function createMathJaxLabel(latex, x, y) {
    const container = document.getElementById('trajectory-canvas');
    container.style.position = 'relative'; // ensure absolute positioning works inside

    const div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.left = `${x}px`;
      div.style.top = `${y}px`;
      div.style.background = 'rgba(255,255,255,0.8)';
      div.style.fontSize = '14px';
      div.style.padding = '2px 6px';
      div.style.borderRadius = '4px';
      div.style.pointerEvents = 'none';
      div.className = 'latex-label';
      container.appendChild(div);

      if (!window.thetaLabels) window.thetaLabels = [];
      window.thetaLabels.push(div);

      // Render LaTeX
      if (window.MathJax && window.MathJax.typesetPromise) {
        div.innerHTML = latex;
        MathJax.typesetPromise([div]);
      } else {
        div.textContent = latex;
      }
    }

    // First, remove old ones
    if (window.thetaLabels) {
      window.thetaLabels.forEach(lbl => lbl.remove());
      window.thetaLabels = [];
    }

    // Then add new labels near the top-left of the canvas
    createMathJaxLabel(`\\(\\theta_1 = ${slider1.value()}^\\circ\\)`, 10, 10);
    createMathJaxLabel(`\\(\\theta_2 = ${slider2.value()}^\\circ\\)`, 10, 32);
    createMathJaxLabel(`\\(\\theta_3 = ${slider3.value()}^\\circ\\)`, 10, 54);

    // Links
    p.stroke(0); p.strokeWeight(4);
    p.line(0,0,pts[0].x,pts[0].y);
    p.line(pts[0].x,pts[0].y,pts[1].x,pts[1].y);
    p.line(pts[1].x,pts[1].y,pts[2].x,pts[2].y);
    p.line(pts[2].x,pts[2].y,pts[3].x,pts[3].y);

    // Draw joints
    const jointColors = ["purple", "orange", "teal"];
    [pts[0], pts[1], pts[2]].forEach((pt, i) => {
      p.fill(jointColors[i]);
      p.stroke(jointColors[i]);
      p.ellipse(pt.x, pt.y, 12, 12);
    });

    // Draw end-effector trace
    p.stroke("gray");
    p.strokeWeight(2);
    p.drawingContext.setLineDash([5, 5]); // dotted line
    p.noFill();

    p.beginShape();
    for (let pt of eeTrace) {
      p.vertex(pt.x, pt.y);
    }
    p.endShape();

    p.drawingContext.setLineDash([]); // reset to solid for other drawings

    // Draw target point for debugging
    // p.fill(255,0,0);
    // p.noStroke();
    // let target = computeFK_Lie(startAngles);
    // p.ellipse(target.x, target.y, 10, 10);

    // Draw plots
    drawPlots();
  };
};

new p5(planar_example);
