
// Three-body simulation with simple Euler integration

let ctx;
const dt = 0.0001;
const g = 9.81;
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
    this.mass = 200;
    this.centerX = this.x + this.width/2;
    this.centerY = this.y + this.height/2;
    this.dist2Center = euclideanDistance(centerX, centerY, this.x + this.width, this.y + this.height);
    this.leftRocketF = 0;
    this.rightRocketF = 0;
    this.F_total = this.leftRocketF+this.rightRocketF;
    this.ax = (this.F_total / this.mass) * Math.sin(this.theta);  // sideways motion
    this.ay = (this.F_total / this.mass) * -Math.cos(this.theta) - g;  // vertical motion
  }

  controller(){

  }

  drawRocket(){
    ctx.save();
    ctx.translate(rocket.x+rocket.width/2, rocket.y+rocket.height/2);
    ctx.rotate(rocket.theta);
    ctx.drawImage(rocket.rocketBody, -rocket.width/2, -rocket.height/2, rocket.width, rocket.height);
    ctx.restore();
  }

  timeStep(){
    
  }
}

function euclideanDistance(x1, y1, x2, y2){
    return Math.sqrt((x2-x1)**2 + (y2-y1)**2);
}


function animate(){

  for (let i = 0; i < stepsPerFrame; i++) {
    xDot = rocket.timeStep();
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
    initRocket();
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

  resetStates();
  console.log('rewrote canvas');
  cnt = 0;
  multiplier = 1;
  document.getElementById("time-display").textContent = "Month: 1";
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