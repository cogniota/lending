function AgentCircle(draw, vertex, color) {
  this.color = color;

  this.r = 21;
  this.length = this.r * 2 * 3.14;

  this.defParams = {
    'stroke-dasharray': this.length + ' ' + this.length,
    'stroke-dashoffset': 0,
    'fill': this.color,
    'fill-opacity': 0,
    'stroke': this.color,
    'stroke-width': 1,
  };
  this.activeParams = {
    'scale': 1.1,
    'fill-opacity': 0.3,
    'stroke-width': 2,
  };

  this.cx = vertex.pos[0];
  this.cy = vertex.pos[1];

  this.elem = this.draw(draw);
}

AgentCircle.prototype.draw = function(draw) {
  var plot = getCirclePath(this.r);
  var circle = draw.path(plot).attr(this.defParams).center(this.cx, this.cy);
  circle.attr({
    'stroke-dashoffset': this.length + 'px',
  });
  return circle;
};


AgentCircle.prototype.show = function() {
  this.elem.animate(1500, 'circOut').attr(this.defParams);
};

AgentCircle.prototype.activate = function(callback) {
  this.elem.animate(200, 'backIn').scale(this.activeParams.scale).attr(this.activeParams);
};

AgentCircle.prototype.deactivate = function() {
  this.elem.animate(100, '<').scale(1).attr(this.defParams);
};

AgentCircle.prototype.colorize = function(color) {
  this.elem.animate(200).attr({'stroke': color, 'fill': color});
};

AgentCircle.prototype.spinAround = function(callback, toActive) {
  var t1 = 250, d = 200;
  var params = toActive ? this.activeParams : {};
  this.elem.animate(t1, '>').attr({'stroke-dashoffset': this.length * -1 + 'px'})
           .delay(d)
           .animate(t1, '>').attr({'stroke-dashoffset': 0}).attr(params)
           .once(1, function () {
              callback && callback();
           });
};