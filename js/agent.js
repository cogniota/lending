(function (window) {
  'use strict';

  function Agent(draw, params) {
    this.cx = params.cx;
    this.cy = params.cy;
    this.color = params.color;

    this.group = draw.group();
    this.idx = this.group.id();

    params.cx = this.cx;
    params.cy = this.cy;

    this.line = new AgentLine(this.group, params);
    this.text = new AgentText(this.group, params);
    this.circle = new AgentCircle(this.group, params);
    this.img = new AgentImg(this.group, params);
    this.brackets = new AgentBrackets(this.group, params);
  }

  Agent.prototype.hide = function(animated) {
    this.line.hide();
    this.circle.circleOut(animated);
    this.circle.hideBG(animated);
    this.circle.hideFill(animated);
    // this.group.opacity(0);
  };

  Agent.prototype.show = function(animated) {
    this.group.opacity(1);
    this.circle.showFill(true);
    this.circle.showBG(true);

    var _this = this;
    return new Promise(function (resolve) {
      return _this.circle.circleIn(animated, {earlyStart: true, active: true}).then(function () {
        _this.circle.deactivateBorder(true);
        return _this.line.show(animated).then(resolve);
      });
    });
  };

  Agent.prototype.activate = function(animated, circleIn) {
    var _this = this;
    return new Promise(function (resolve) {
      var circlePromise;
      if (circleIn) {
        circlePromise = _this._circleOutPromise({active: true});
      } else {
        circlePromise = window.NOOPPromise.then(function () {
          _this.circle.activateBorder();
        });
      }
      return circlePromise.then(function () {
        _this.circle.activateBorder(animated);
        _this.circle.showFill(animated);
        return _this.line.activate(animated).then(resolve);
      });
    });
  };

  Agent.prototype._send = function(t, circleIn) {
    var _this = this;
    return new Promise(function (resolve) {
      return _this.activate(true, circleIn).then(function () {
        return _this.text.send(t).then(resolve);
      });
    });
  };

  Agent.prototype.sendRequest = function(t) {
    return this._send(t || '?', true);
  };

  Agent.prototype.sendResponse = function(t) {
    return this._send(t || '!', false);
  };

  Agent.prototype._circleOutPromise = function(params) {
    params = params || {};
    var _this = this;
    return new Promise(function (resolve) {
      _this.circle.hideFill(true);
      return _this.circle.circleOut(true).then(function () {
        if (params.deactivate) {
          _this.circle.deactivateBorder(true);
        } else {
          _this.circle.showFill(true);
        }
        return _this.circle.circleIn(true, {active: params.active}).then(resolve);
      });
    });
  };

  Agent.prototype.deactivate = function(animated, circleIn) {
    var _this = this;
    return new Promise(function (resolve) {
      _this.line.deactivate(animated);
      _this.circle.deactivateBorder(animated);
      _this.circle.hideFill(animated);

      var circlePromise;
      if (circleIn) {
        circlePromise = _this._circleOutPromise({deactivate: true});
      } else {
        circlePromise = window.NOOPPromise.then(function () {
          _this.circle.hideFill(animated);
          _this.circle.deactivateBorder();
        });
      }
      return circlePromise.then(resolve);
    });
  };

  Agent.prototype._receive = function(t) {
    var _this = this;
    return new Promise(function (resolve) {
      return _this.text.receive(t).then(function () {
        return _this._circleOutPromise().then(resolve);
      });
    });
  };

  Agent.prototype.receiveResponse = function() {
    return this._receive('!');
  };

  Agent.prototype.receiveRequest = function() {
    return this._receive('?');
  };

  Agent.prototype.colorize = function(color, reversed, animated) {
    this.text.colorize(color);
    var _this = this;

    if (animated) {
      return new Promise(function (resolve) {
        var first = _this.line, second = _this.circle;
        if (reversed) {
          first = _this.circle, second = _this.line;
        }
        return first.colorize(color).then(function () {
          return second.colorize(color).then(resolve);
        });
      });
    } else {
      this.line.colorize(color, false);
      this.circle.colorize(color, false);
      return window.NOOPPromise;
    }

  };

  Agent.prototype.blur = function(blurValue, animateBrackets) {
    var _this = this;
    return new Promise(function (resolve) {
      return _this.brackets.hide(animateBrackets).then(function () {
        return _this.img.blur(blurValue).then(resolve);
      });
    });
  };

  Agent.prototype.unblur = function(animated) {
    var _this = this;
    var a = window.NOOPPromise;
    if (animated) {
      a = this.brackets.show();
    }
    return new Promise(function (resolve) {
      return a.then(function () {
        return _this.img.unblur(animated).then(resolve);
      });
    });
  };

  Agent.prototype.go = function(cx, cy, animated) {
    var t = animated ? 1000 : null;
    var circle = this.circle.group;
    if (animated) {
      circle = circle.animate(t);
    }
    circle.move(cx, cy);

    this.img.go(cx, cy, t);
    this.line.go(cx, cy, t);

    return window.timePromise(t);
  };

  window.Agent = Agent;

})(window);