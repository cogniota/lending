function AgentLine(draw, cx, cy, vertex, color, circle) {
  this.color = color;
  this.speed = 60;
  this.defParams = {
    'stroke-linecap': "round",
    'stroke-dasharray': '5 5',
    'stroke-width': 2,
    'stroke-dashoffset': 0,
    'opacity': 0.8,
    'stroke': this.color,
  };
  this.activeParams = {
    'stroke-width': 4,
    'opacity': 1,
  };

  this.sx = vertex.pos[0];
  this.sy = vertex.pos[1];
  this.ex = cx;
  this.ey = cy;

  this.elem = this.draw(draw);
}

AgentLine.prototype.array = function() {
  return [this.sx, this.sy, this.ex, this.ey];
};

AgentLine.prototype.draw = function(draw) {
  var line = draw.line(this.sx, this.sy, this.sx, this.sy);
  line.attr(this.defParams);
  return line;
};

AgentLine.prototype.show = function(event) {
  var d = 500, t = 300;
  this.elem.delay(d)
           .animate(t, 'cubicIn').plot(this.sx, this.sy, this.ex, this.ey);
  var _this = this;
  setTimeout(function () {
    _this.toCenter();
    event && event();
  }, d + t);
};

AgentLine.prototype.opacity = function(opacity) {
  this.elem.animate().opacity(opacity);
};

AgentLine.prototype.toCenter = function(attr, i) {
  // this.lastDirection = 'toCenter';
  var s = this.elem.attr('stroke-dasharray').split(' ');
  var d = s.reduce(function(a, b) {return a + parseInt(b);}, 0);

  this.elem.finish().attr({'stroke-dashoffset': 0});

  if (attr) {
    this.elem.animate(100).attr(attr);
  }
  // this.elem.animate(d * this.speed).attr({'stroke-dashoffset': d * (i || -1)}).loop();
};

AgentLine.prototype.fromCenter = function(attr) {
  // this.lastDirection = 'fromCenter';
  this.toCenter(attr, 1);
};

AgentLine.prototype.activate = function() {
  this.toCenter(this.activeParams);
};

AgentLine.prototype.deactivate = function() {
  this.toCenter(this.defParams);
};

AgentLine.prototype.colorize = function(color) {
  this.toCenter({'stroke': color});
};