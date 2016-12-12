function SnowMachine(){
  this.canvas = document.getElementById('snow'),
  this.ctx = canvas.getContext('2d'),
  this.width = ctx.canvas.width = document.body.offsetWidth,
  this.height = ctx.canvas.height = document.body.offsetHeight,
  this.animFrame = window.requestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.msRequestAnimationFrame,
  this.snowflakes = [];

  window.onresize = function() {
    width = ctx.canvas.width = document.body.offsetWidth,
      height = ctx.canvas.height = document.body.offsetHeight;
  }
}

SnowMachine.prototype.update = function() {
  for (var i = 0; i < this.snowflakes.length; i++) {
    this.snowflakes[i].update();
  }
};


SnowMachine.prototype.createSnow = function(count) {
  for (var i = 0; i < count; i++) {
    this.snowflakes[i] = new Snow();
  }
}

SnowMachine.prototype.draw = function() {
  this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  for (var i = 0; i < this.snowflakes.length; i++) {
    this.snowflakes[i].draw();
  }
}

SnowMachine.prototype.loop = function() {
  this.draw();
  this.update();
  this.animFrame(loop);
}

createSnow(150);
loop();

function Snow() {
  this.x      = this.random(0, width);
  this.y      = this.random(-height, 0);
  this.radius = this.random(0.5, 3.0);
  this.speed  = this.random(1, 3);
  this.wind   = this.random(-0.5, 3.0);
}

Snow.prototype.draw = function() {
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.closePath();
}

Snow.prototype.update = function() {
  this.y += this.speed;
  this.x += this.wind;

  if (this.y > ctx.canvas.height) {
    this.y = 0;
    this.x = this.random(0, width);
  }
}


Snow.prototype.random = function(min, max) {
  var rand = (min + Math.random() * (max - min)).toFixed(1);
  rand = Math.round(rand);
  return rand;
}