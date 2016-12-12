function SnowMachine(){
  this.canvas    = document.getElementById('snow'),
  this.ctx       = this.canvas.getContext('2d'),
  this.width     = this.ctx.canvas.width = document.body.offsetWidth,
  this.height    = this.ctx.canvas.height = document.body.offsetHeight,
  this.animFrame = window.requestAnimationFrame ||
                   window.mozRequestAnimationFrame ||
                   window.webkitRequestAnimationFrame ||
                   window.msRequestAnimationFrame,
  this.snowflakes = [];
}

SnowMachine.prototype.update = function() {
  for (var i = 0; i < this.snowflakes.length; i++) {
    this.snowflakes[i].update();
  }
};


SnowMachine.prototype.createSnow = function(count) {
  for (var i = 0; i < count; i++) {
    this.snowflakes[i] = new Snow(this);
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
  this.animFrame.call(window, $.proxy(this.loop, this));
}

function Snow(snowMachine) {
  this.snowMachine = snowMachine;
  this.x           = this.random(0, this.snowMachine.width);
  this.y           = this.random(-this.snowMachine.height, 0);
  this.radius      = this.random(0.5, 3.0);
  this.speed       = this.random(1, 3);
  this.wind        = this.random(-0.5, 3.0);
}

Snow.prototype.draw = function() {
  this.snowMachine.ctx.beginPath();
  this.snowMachine.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
  this.snowMachine.ctx.fillStyle = '#fff';
  this.snowMachine.ctx.fill();
  this.snowMachine.ctx.closePath();
}

Snow.prototype.update = function() {
  this.y += this.speed;
  this.x += this.wind;

  if (this.y > this.snowMachine.ctx.canvas.height) {
    this.y = 0;
    this.x = this.random(0, this.snowMachine.width);
  }
}


Snow.prototype.random = function(min, max) {
  var rand = (min + Math.random() * (max - min)).toFixed(1);
  rand = Math.round(rand);
  return rand;
}