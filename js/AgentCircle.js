(function () {
  'use strict';

  var NOOPPromise = new Promise(function (resolve) {resolve()});

  var SPIN_TIME = 250;

  function promise(t) {
    return new Promise(function (resolve) {
      setTimeout(resolve, t);
    });
  }

  function AgentCircle(draw, params) {
    this.cx = params.cx;
    this.cy = params.cy;
    this.color = params.color;

    this.SETTINGS = Object.assign({}, params.circle);
    this.length = this.SETTINGS.r * 2 * Math.PI;

    this.BORDER_ACTIVE_SETTINGS = {
      'stroke-width': this.SETTINGS.border * 2
    };
    this.BORDER_SETTINGS = {
      'stroke-width': this.SETTINGS.border
    };

    this.group = draw.group().move(this.cx, this.cy);

    this.bg = this.draw(this.SETTINGS.bg);

    this.fill = this.draw({
      stroke: this.color,
      'stroke-width': this.SETTINGS.r * 2,
      opacity: this.SETTINGS['fill-opacity'],
      r: 0.1,
    });

    this.border = this.draw({
      'stroke-width': this.SETTINGS.border,
      'stroke-dashoffset': 0,
      'stroke-dasharray': this.length + ' ' + this.length,
      r: this.SETTINGS.r,
      fill: 'transparent',
      stroke: this.color
    });
    this.border.rotate(-90);
  }

  AgentCircle.prototype.draw = function(params) {
    return this.group.circle().attr(params).center(0, 0);
  };

  AgentCircle.prototype._cicle = function(animated, value, params) {
    var t = 0, t1 = SPIN_TIME, d = 100;
    params = params || {};

    var _this = this;
    var activeAttr = {'stroke-width': this.SETTINGS.border * 2};
    return new Promise(function (resolve) {
      if (!animated) {
        _this.border.attr({'stroke-dashoffset': value});
        if (params.toActive) {
          _this.border.attr(activeAttr);
        }
        return resolve();
      } else {

        t += t1;
        var animation = _this.border.delay(d).animate(t1, 'circInOut');
        animation.attr({'stroke-dashoffset': value});

        if (params.active) {
          animation.attr(_this.BORDER_ACTIVE_SETTINGS);
        }

        return setTimeout(resolve, t + d);
      }
    });
  };

  AgentCircle.prototype.circleOut = function(animated) {
    return this._cicle(animated, this.length);
  };

  AgentCircle.prototype.circleIn = function(animated, params) {
    return this._cicle(animated, 0, params);
  };

  AgentCircle.prototype._activateBorder = function(animated, settings) {
    var t = 0, d = SPIN_TIME, t1 = 200;

    var obj = this.border;
    if (animated) {
      t += d + t1;
      obj = obj.delay(d).animate(t1, 'quadOut');
    }
    obj.attr(settings);

    return promise(t);
  };

  AgentCircle.prototype.deactivateBorder = function(animated) {
    return this._activateBorder(animated, this.BORDER_SETTINGS);
  };

  AgentCircle.prototype.activateBorder = function(animated) {
    return this._activateBorder(animated, this.BORDER_ACTIVE_SETTINGS);
  };

  AgentCircle.prototype.showFill = function(animated) {
    var t = 0, t1 = 300;
    var obj = this.fill;
    if (animated) {
      t += t1;
      obj = obj.animate(t1);
    }
    obj.opacity(this.SETTINGS['fill-opacity']);

    return promise(t);
  };

  AgentCircle.prototype.hideFill = function(animated) {
    var t = 0, t1 = 300;
    var obj = this.fill;
    if (animated) {
      t += t1;
      obj = obj.animate(t1);
    }
    obj.opacity(0);

    return promise(t);
  };

  AgentCircle.prototype.colorize = function(color, animated) {
    var t = 0, t1 = 200;
    var obj = this.border;
    if (animated) {
      t += t1;
      obj = obj.animate(t1, 'cubicIn');
    }
    obj.attr({'stroke': color});

    return promise(t);
  };

  window.AgentCircle = AgentCircle;
})();