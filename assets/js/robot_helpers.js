
  
  
  function inverse_kinematics(x, y, elbowMode="elbowup") {
    // Placeholder inverse kinematics function
    // For simplicity, we assume a planar 3R arm and return some dummy values
    let gamma = Math.atan2(y, x);
    let b = L2 + L3;
    let c = Math.sqrt(x*x + y*y);
    let alpha = Math.acos((L1*L1 + c*c - b*b) / (2 * L1 * c));
    let beta = Math.acos((L1*L1 + b*b - c*c) / (2 * L1 * b));

    
    let theta1;
    let theta2;
    if (elbowMode === "elbowdown") {
      theta1 = gamma - alpha;
      theta2 = Math.PI - beta;
    }
    else {
      theta1 = alpha + gamma;
      theta2 = beta - Math.PI;
    }
    let theta3 = 0;
    return [theta1, theta2, theta3];
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

  function compute_pose_from_transformation(g){
    theta_i = Math.atan2(g[1][0], g[0][0]);
    return {x: g[0][3], y: g[1][3], theta: theta_i}
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

  function forward_kinematics(theta1, theta2, theta3) {
    let g1 = [
      [Math.cos(theta1), -Math.sin(theta1), 0, 0],
      [Math.sin(theta1),  Math.cos(theta1), 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ];
    let g2 = [
      [Math.cos(theta2), -Math.sin(theta2), 0, L1],
      [Math.sin(theta2),  Math.cos(theta2), 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ];
    let g3 = [
      [Math.cos(theta3), -Math.sin(theta3), 0, L2],
      [Math.sin(theta3),  Math.cos(theta3), 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ];
    let gE = [
      [1, 0, 0, L3],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ];

    let g_w2 = math.multiply(g1, g2);
    let g_w3 = math.multiply(g_w2, g3); 
    let g_wE = math.multiply(g_w3, gE);
    let pE = compute_pose_from_transformation(g_wE);
    return pE;
  }