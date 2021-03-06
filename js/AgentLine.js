(function (window) {
  'use strict';

  var ACTIVE_SETTINGS = {'opacity': 1, 'stroke-width': 4, 'stroke-opacity': 1};

  function AgentLine(draw, params) {
    this.sx = params.cx;
    this.sy = params.cy;
    this.ex = params.mlx;
    this.ey = params.mly;
    this.color = params.color;

    this.SETTINGS = Object.assign({}, params.line);
    this.SETTINGS.stroke = this.color;
    this.SETTINGS['stroke-linecap'] = "round";
    this.SETTINGS['stroke-dasharray'] = '5 5';
    this.SETTINGS.a = Random.range(10, 1000)

    this.group = draw.group();

    this.line = this.draw();
  }

  AgentLine.prototype.draw = function() {
    return this.group.line(this.sx, this.sy, this.ex, this.ey).attr(this.SETTINGS);
  };

  AgentLine.prototype.hide = function() {
    this.line.plot(this.sx, this.sy, this.sx, this.sy).opacity(0);
  };

  AgentLine.prototype.go = function(cx, cy, t) {
    var obj = this.line;
    if (t) {
      obj = obj.animate(t);
    }
    obj.plot(cx, cy, this.ex, this.ey);
  };

  AgentLine.prototype.show = function(animated) {
    var t = 0, t1 = 350, t2 = 500;

    var obj = this.line;
    if (animated) {
      t += t1;
      obj = this.line.animate(t1, 'cubicOut');
    }
    obj.plot(this.sx, this.sy, this.ex, this.ey)
    if (animated) {
      t += t2;
      obj.attr(ACTIVE_SETTINGS);
      obj = obj.animate(t2, 'quadOut');
    }
    obj.attr(this.SETTINGS).opacity(1);

    return window.timePromise(t);
  };

  AgentLine.prototype.activate = function(animated) {
    var t = 0, t1 = 350;

    var obj = this.line;
    if (animated) {
      t += t1;
      obj = this.line.animate(t1, 'cubicOut');
    }
    obj.attr(ACTIVE_SETTINGS);

    return window.timePromise(t);
  };

  AgentLine.prototype.deactivate = function(animated) {
    var t = 0, t1 = 350;

    var obj = this.line;
    if (animated) {
      t += t1;
      obj = this.line.animate(t1, 'cubicIn');
    }
    obj.attr(this.SETTINGS);

    return window.timePromise(t);
  };

  AgentLine.prototype.colorize = function(color, animated) {
    var t = 0, t1 = 400;
    var obj = this.line;
    if (animated) {
      t += t1;
      obj = obj.animate(t, 'cubicIn');
    }
    obj.attr({stroke: color});
    return window.timePromise(t);
  };

  window.AgentLine = AgentLine;

})(window);