(function (window) {
  'use strict';

  function AgentBrackets(draw, params) {
    this.cx = params.cx;
    this.cy = params.cy;
    this.color = params.color;

    if (params.brackets == void 0) {
      return;
    }

    this.SETTINGS = Object.assign({}, params.brackets);
    this.x = -this.SETTINGS.width / 2;
    this.x2 = this.SETTINGS.width / 2;

    this.group = draw.group().move(this.cx, this.cy);

    this.left = this.draw('[');
    this.right = this.draw(']');
  }

  AgentBrackets.prototype.draw = function(t) {
    return this.group.plain(t).style(this.SETTINGS)
                              .opacity(0)
                              .center(this.x, 0);
  };

  AgentBrackets.prototype.show = function() {
    if (!this.group) return window.NOOPPromise;
    var t = 200;
    this.left.animate(t, '>').opacity(1);
    this.right.animate(t, '>').cx(this.x2).during(function (pos) {
      var opacity = SVG.easing['expoOut'](pos);
      this.opacity(opacity);
    });

    return window.timePromise(t);
  };

  AgentBrackets.prototype.hide = function(animated) {
    if (!this.group) return window.NOOPPromise;

    if (!animated) {
      this.left.opacity(0);
      this.right.opacity(0).x(this.x);
      return window.NOOPPromise;
    }

    var t = 200;

    this.left.animate(t, '<').opacity(0);
    this.right.animate(t, '<').cx(this.x).during(function (pos) {
      var opacity = SVG.easing['expoOut'](1 - pos);
      this.opacity(opacity);
    });

    return window.timePromise(t);
  };

  window.AgentBrackets = AgentBrackets;
})(window);