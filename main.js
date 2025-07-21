
// Three-body simulation with simple Euler integration

let ctx;
const dt = 0.0001;
const g = 0.5//9.81;
let frameCount = 0;
let simulationTime = 0;
let animationId = null;
let running = false;
let width;
let height;
let isDragging = false;
let bodies = [];
let cnt = 0;
let centerX;
let centerY;
let maxTrailLength = 900;
let stepsPerFrame = 2500;
let defaultSteps = 2500;
let multiplier = 1;
let landX;
let landY;
let rocket;
let background;

class Rocket{
  constructor(x,y){
    this.x = x;
    this.y = y;
    this.xVelocity = 0;
    this.yVelocity = 0;
    this.theta = (Math.random() - 0.5) * (Math.PI / 2);
    this.omega = 0 //angular velocity
    this.rocketBody = new Image();
    this.rocketBody.src = "images/topRocket.png";
    this.fire = new Image();
    this.fire.src = "images/fire.png";
    this.height = 175;
    this.width = 110;
    this.fireWidth = 45;
    this.fireHeight = 45;
    this.leftRocketX = this.x + 3;
    this.leftRocketY = this.y + this.height - 3;
    this.rightRocketX = this.x + this.width - 3;
    this.rightRocketY = this.y + this.height - 3;
    this.mass = 200;
    this.centerX = this.x + this.width/2;
    this.centerY = this.y + this.height/2;
    this.dist2Center = euclideanDistance(this.centerX, this.centerY, this.x + this.width, this.y + this.height);
    this.leftRocketF = 0;
    this.rightRocketF = 0;
    this.F_total = this.leftRocketF+this.rightRocketF;
    this.ax = (this.F_total / this.mass) * Math.sin(this.theta);  // sideways motion
    this.ay = (this.F_total / this.mass) * -Math.cos(this.theta) - g;  // vertical motion
    this.I = this.mass * this.height * this.height / 12;  // crude box approximation
    if(this.theta > 0){
      this.side = 'right';
    }
    else{this.side='left'}
  }

  controller(){
    // Decide which thruster to fire
    if (this.theta < 0) { // Tilted left → fire left thruster to rotate right
      this.leftRocketF = 20;
      this.rightRocketF = 0;
    } else if (this.theta > 0) { // Tilted right → fire right thruster to rotate left
      this.leftRocketF = 0;
      this.rightRocketF = 20;
    } else {
      this.leftRocketF = 0;
      this.rightRocketF = 0;
    }

    // Force vectors
    let F_left = this.leftRocketF;
    let F_right = this.rightRocketF;
    let totalF = F_left + F_right;

    // === Linear acceleration ===
    let Fx = totalF * Math.sin(this.theta);
    let Fy = -totalF * Math.cos(this.theta);
    this.ax = Fx / this.mass;
    this.ay = Fy / this.mass - g;

    // === Angular acceleration ===
    // Assuming moment of inertia for vertical box:
    this.I = (this.mass * this.height * this.height) / 12;

    // Net torque: Left thrust pushes CW, right thrust pushes CCW
    let torque = this.dist2Center * (F_left - F_right);

    // Angular dynamics
    this.alpha = torque / this.I;
    this.omega += this.alpha * dt;
    this.theta += this.omega * dt;
  }

  drawRocket(){
    ctx.save();
    ctx.translate(rocket.x+rocket.width/2, rocket.y+rocket.height/2);
    ctx.rotate(rocket.theta);
    ctx.drawImage(rocket.rocketBody, -rocket.width/2, -rocket.height/2, rocket.width, rocket.height);
    ctx.restore();
    this.drawFire();
  }

  drawFire() {
  const side = this.side;
  ctx.save();

  // Rotate around the center of the rocket
  ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
  ctx.rotate(this.theta);

  // Offset for fire relative to center
  let offsetX, offsetY;
  if (side === "left") {
    offsetX = -this.width / 2 + 8;
    offsetY = this.height / 2 - 8;
  } else if (side === "right") {
    offsetX = this.width / 2 - this.fireWidth - 8;
    offsetY = this.height / 2 - 8;
  }

  ctx.drawImage(
    this.fire,
    offsetX,
    offsetY,
    this.fireWidth,
    this.fireHeight
  );

  ctx.restore();
}



  timeStep(){
  // Recalculate center
  this.centerX = this.x + this.width / 2;
  this.centerY = this.y + this.height / 2;

  // Recalculate forces
  this.F_total = this.leftRocketF + this.rightRocketF;

  // Acceleration from thrust
  this.ax = (this.F_total / this.mass) * Math.sin(this.theta);
  this.ay = (this.F_total / this.mass) * -Math.cos(this.theta) + g; // gravity acts downward

  // Update velocity (Euler integration)
  this.xVelocity += this.ax * dt;
  this.yVelocity += this.ay * dt;

  // Update position
  this.x += this.xVelocity * dt;
  this.y += this.yVelocity * dt;

  // Optional: update rotation with angular velocity (if I decide to use torque)
  this.theta += this.omega * dt;
  //console.log("x,y: ", this.x, ", ", this.y);
  this.leftRocketX = this.x + 3;
  this.leftRocketY = this.y + this.height - 3;
  this.rightRocketX = this.x + this.width - 3;
  this.rightRocketY = this.y + this.height - 3;
  if(this.theta > 0){
    this.side = "right";
  }
  else if(this.theta < 0){
    this.side = "left";
  }
  }
}

function euclideanDistance(x1, y1, x2, y2){
    return Math.sqrt((x2-x1)**2 + (y2-y1)**2);
}


function animate(){

  for (let i = 0; i < stepsPerFrame; i++) {
    xDot = rocket.timeStep();
    rocket.controller();
    if (rocket.y > landY - rocket.height){
    rocket.y = landY - rocket.height;
  }
  }
  ctx.clearRect(0,0, width, height);

  drawPlanet();
  rocket.drawRocket();

  //console.log("running......");
  animationId = requestAnimationFrame(animate);
}

function initRocket(){

  rocket = new Rocket(width/2 + Math.random()*(30 -(-30)) + -30, height*.15 + Math.random()*(30 -(-30)) + -30, 0);
  rocket.rocketBody.onload = function () {
    ctx.save();
    ctx.translate(rocket.x+rocket.width/2, rocket.y+rocket.height/2);
    ctx.rotate(rocket.theta);
    ctx.drawImage(rocket.rocketBody, -rocket.width/2, -rocket.height/2, rocket.width, rocket.height);
    ctx.restore();
    };
  /*rocket.fire.onload = function (){
    ctx.drawImage(rocket.fire, rocket.x, rocket.y + rocket.height, rocket.fireWidth, rocket.fireHeight);
    ctx.drawImage(rocket.fire, rocket.x + rocket.width - rocket.fireWidth, rocket.y + rocket.height, rocket.fireHeight, rocket.fireWidth);
    }*/
  }

  function drawPlanet(){
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(background, 0, 0, width, height);
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.moveTo(landX, landY);
    ctx.arc(landX, landY, 35, 0, 2*Math.PI, false);
    ctx.fill();
  }

function startSimulation() {
  animate();
}


function resetStates(){
  clocks = [];
  //drawStructure(true);
}

function resetSimulation() {
  running = false;
  if (animationId !== null){
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  simulationTime = 0;
  frameCount = 0;
  stepsPerFrame = defaultSteps;
  const speedSlider = document.getElementById("speed-slider");
  const speedValue = document.getElementById("speed-value");
  speedSlider.value = Math.floor(defaultSteps/500);
  speedValue.textContent = speedSlider.value;
  drawPlanet();
  initRocket();
  console.log('rewrote canvas');
  cnt = 0;
  multiplier = 1;
  //document.getElementById("time-display").textContent = "Month: 1";
  document.getElementById("start-simulation").textContent = "Click to Start Simulation";
}


document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("simCanvas");
  ctx = canvas.getContext("2d");
  height = ctx.canvas.height;
  width = ctx.canvas.width;
  centerX = width/2;
  centerY = height/2
  landX = width/2;
  landY = height*0.85;
  background = new Image();
  background.src = "images/mars.png";
  background.onload = function () {
    drawPlanet();
    initRocket();
    };

    document.getElementById("start-simulation").addEventListener("click", () => {
      const btn = document.getElementById("start-simulation");
      if (!running) {
        running = true;
        btn.textContent = "Pause";
        startSimulation();
      } else {
        running = false;
        cancelAnimationFrame(animationId);
        btn.textContent = "Resume";
      }
    });


  const speedSlider = document.getElementById("speed-slider");
  const speedValue = document.getElementById("speed-value");
  stepsPerFrame = Math.floor(parseInt(speedSlider.value))*500

  speedSlider.addEventListener("input", () => {
    stepsPerFrame = Math.floor(parseInt(speedSlider.value)*500);
    speedValue.textContent = Math.floor(stepsPerFrame/500);
  });

  document.getElementById("reset").addEventListener("click", () => {
    resetSimulation();
  });
});