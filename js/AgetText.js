(function () {
  'use strict';

  var SPEED = 3000;

  function promise(t) {
    return new Promise(function (resolve) {
      setTimeout(resolve, t);
    });
  }

  function AgentText(draw, params) {
    this.sx = params.cx;
    this.sy = params.cy;
    this.ex = params.mlx;
    this.ey = params.mly;
    this.color = params.color;

    this.SETTINGS = Object.assign({}, params.text);
    this.SETTINGS.fill = this.color;
    this.SETTINGS.stroke = this.color;
    this.mlR = {
      x1: this.ex - params.mlw,
      y1: this.ey - params.mlw,
      x2: this.ex + params.mlw,
      y2: this.ey + params.mlw,
    };
    this.showR = params.circle.r * 0.2;


    this.group = draw.group();
    this.circle = this.drawCircle();
    this.text = this.drawText();

    this.group.opacity(0);
  }

  AgentText.prototype.drawCircle = function() {
    var group = this.group.group();
    var bg = group.circle(this.SETTINGS.r * 2).attr(this.SETTINGS.bg).center(0, 0);
    var circle = group.circle().attr(this.SETTINGS).center(0, 0);

    group.colorize = function (color) {
      circle.attr({stroke: color, fill: color});
    };

    return group;
  };

  AgentText.prototype.drawText = function() {
    var text = this.group.plain('?');
    text.font({
      fill: '#fff',
      size: this.SETTINGS.fz,
    }).center(0, 0);
    return text;
  };


  AgentText.prototype.send = function(text, earlyStart) {
    this.text.plot(text || '?').center(0, 0);
    this.group.move(this.sx, this.sy);
    var _this = this;
    return new Promise(function (resolve) {
      _this.group.animate(SPEED).move(_this.ex, _this.ey).during(function (pos, morph) {
        var x = this.cx();
        var y = this.cy();

        var dx = Math.abs(x - _this.sx), dy = Math.abs(y - _this.sy);
        if (dx > _this.showR && dy > _this.showR) {
          var opacity = SVG.easing['expoOut'](pos * 2);
          this.opacity(opacity);
        }

        var inML = x > _this.mlR.x1 && x < _this.mlR.x2 &&
                   y > _this.mlR.y1 && y < _this.mlR.y2;
        if (inML && earlyStart) {
          resolve();
        } else if (pos > 0.99) {
          resolve();
        }
      });
    });
  };

  AgentText.prototype.receive = function(text) {
    this.text.plot(text || '?').center(0, 0);
    this.group.move(this.ex, this.ey);
    this.group.opacity(1);

    var _this = this;
    this.group.animate(SPEED).move(this.sx, this.sy).during(function (pos) {
      var x = this.cx();
      var y = this.cy();

      if (Math.abs(x - _this.sx) < _this.showR &&
          Math.abs(y - _this.sy) < _this.showR) {
        var opacity = SVG.easing['expoIn'](pos / 2);
        this.opacity(opacity);
      }
    });

    return promise(SPEED);
  };

  AgentText.prototype.colorize = function(color) {
    this.circle.colorize(color);
  };

  window.AgentText = AgentText;

})();