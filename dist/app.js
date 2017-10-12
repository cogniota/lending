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
(function (window) {
  'use strict';

  var SPIN_TIME = 250;

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

    this.bg = this.draw(this.SETTINGS.bg).attr('t', 'bg');

    this.fill = this.draw({
      stroke: this.color,
      'stroke-width': this.SETTINGS.r * 2,
      opacity: this.SETTINGS['fill-opacity'],
      r: 0.1,
    }).attr('t', 'fill');

    this.border = this.draw({
      'stroke-width': this.SETTINGS.border,
      'stroke-dashoffset': 0,
      'stroke-dasharray': this.length + ' ' + this.length,
      r: this.SETTINGS.r,
      fill: 'transparent',
      stroke: this.color
    }).attr('t', 'border');
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

    return window.timePromise(t);
  };

  AgentCircle.prototype.deactivateBorder = function(animated) {
    this.circleOut(false);
    return this._activateBorder(animated, this.BORDER_SETTINGS);
  };

  AgentCircle.prototype.activateBorder = function(animated) {
    this.circleIn(false);
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

    return window.timePromise(t);
  };

  AgentCircle.prototype.showBG = function(animated) {
    var t = 0, t1 = 300;
    var obj = this.bg;
    if (animated) {
      t += t1;
      obj = obj.animate(t1);
    }
    obj.opacity(1);

    return window.timePromise(t);
  };

  AgentCircle.prototype.hideFill = function(animated) {
    var t = 0, t1 = 300;
    var obj = this.fill;
    if (animated) {
      t += t1;
      obj = obj.animate(t1);
    }
    obj.opacity(0);

    return window.timePromise(t);
  };

  AgentCircle.prototype.hideBG = function(animated) {
    var t = 0, t1 = 300;
    var obj = this.bg;
    if (animated) {
      t += t1;
      obj = obj.animate(t1);
    }
    obj.opacity(0);

    return window.timePromise(t);
  };

  AgentCircle.prototype.colorize = function(color, animated) {
    var t = 0, t1 = 200;
    var obj = this.border;
    if (animated) {
      t += t1;
      obj = obj.animate(t1, 'cubicIn');
    }
    obj.attr({'stroke': color});

    return window.timePromise(t);
  };

  AgentCircle.prototype.hide = function() {
    this.hideFill(false);
    this.circleOut(false);
    this.bg.opacity(0);
  };

  window.AgentCircle = AgentCircle;
})(window);
(function (window) {
  'use strict';

  function AgentImg(draw, params) {
    this.cx = params.cx;
    this.cy = params.cy;
    this.color = params.color;

    if (params.img == void 0) {
      return;
    }

    this.SETTINGS = Object.assign({}, params.img);

    this.group = draw.group().move(this.cx, this.cy);
    var _this = this;
    this.group.filter(function(add) {
      _this.blurFilter = add.gaussianBlur(0);
    });
    this.img = this.group.image(this.SETTINGS.src, this.SETTINGS.w, this.SETTINGS.w);
    this.img.center(0, 0);
  }

  AgentImg.prototype.blur = function(blurValue) {
    if (!this.group) return window.NOOPPromise;
    var t = 200;
    this.blurFilter.animate(t, '<').attr('stdDeviation', blurValue);
    return window.timePromise(t);
  };

  AgentImg.prototype.unblur = function(animated) {
    if (!this.group) return window.NOOPPromise;

    var t = 0, t1 = 200;
    var obj = this.blurFilter;

    if (animated) {
      t += t1;
      obj = obj.animate(t1, '>');
    }
    obj.attr('stdDeviation', '0 0');
    return window.timePromise(t);
  };

  AgentImg.prototype.go = function(cx, cy, t) {
    var cls = 'flipped';
    if (cx < this.cx) {
      this.img.addClass(cls);
    } else {
      this.img.removeClass(cls);
    }

    var obj = this.group;
    if (t) {
      obj = obj.animate(t);
    } else {
      this.img.removeClass(cls);
    }
    obj.move(cx, cy);

    this.cx = cx;
    this.cy = cy;
  };

  AgentImg.prototype.update = function(src) {
    this.img.load(src);
  };

  window.AgentImg = AgentImg;
})(window);
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
    this.line.plot(this.sx, this.sy, this.sx, this.sy);
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
    obj.attr(this.SETTINGS);

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
(function (window) {
  'use strict';

  var SPEED = 3000;

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
    }).style({'font-family': this.SETTINGS.family}).center(0, 0);
    return text;
  };


  AgentText.prototype.send = function(text, earlyStart) {
    this.text.plain(text || '?').center(0, 0);
    this.group.move(this.sx, this.sy);
    var _this = this;
    return new Promise(function (resolve) {
      _this.group.animate(SPEED).move(_this.ex, _this.ey).during(function (pos, morph) {
        var x = this.cx();
        var y = this.cy();

        // var dx = Math.abs(x - _this.sx), dy = Math.abs(y - _this.sy);
        // if (dx > _this.showR && dy > _this.showR) {
        // }
        var opacity = SVG.easing['expoOut'](pos * 2);
        this.opacity(opacity);

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

  AgentText.prototype.receive = function(text, cx, cy) {
    cx = cx || this.sx;
    cy = cy || this.sy;

    this.text.plain(text || '?').center(0, 0);
    this.group.move(this.ex, this.ey);
    this.group.opacity(1);

    var _this = this;
    this.group.animate(SPEED).move(cx, cy).during(function (pos) {
      var x = this.cx();
      var y = this.cy();

      if (Math.abs(x - cx) < _this.showR &&
          Math.abs(y - cy) < _this.showR) {
        var opacity = SVG.easing['expoIn'](pos / 2);
        this.opacity(opacity);
      }

    });

    return window.timePromise(SPEED);
  };

  AgentText.prototype.colorize = function(color) {
    this.circle.colorize(color);
  };

  window.AgentText = AgentText;

})(window);
(function (window) {
  'use strict';

  function CognIOTA(params) {
    this.root = params.root;

    this.mlx = params.mlx;
    this.mly = params.mly;

    this.vertexes = params.vertexes;

    this.method = this[params.method] || window.NOOP;
    this.preparationMethods = params.preparationMethods == void 0 ? [] : params.preparationMethods;
    this._init();
  };

  CognIOTA.prototype.stop = function() {
    if (this.stack) {
      this.stack.stop = true;
      this.stack = undefined;
    }
    this.out();
  };

  CognIOTA.prototype.play = function(end) {
    var beforePlayTime = 1000;
    var afterPlayTime = 1000;
    var _this = this;

    setTimeout(function () {
      _this.method(function () {
        setTimeout(end, afterPlayTime);
      });
    }, beforePlayTime);
  };

  CognIOTA.prototype.out = function(end) {
    var _this = this;
    _this.method(end || window.NOOP, {clear: true});
  };

  /////

  CognIOTA.prototype._init = function() {
    this.draw = this.root.group();
    this.graph = new Graph(this.draw, this.vertexes.array, this.vertexes.params);
    this.mlCloud = new MLCloud(this.draw, this.mlx, this.mly);

    this.init();

    this.initPrepare();
  };

  CognIOTA.prototype.initPrepare = function() {
    var _this = this;
    var stack = this.preparationMethods.map(function (methodName) {
      return function () {
        return new Promise(function (resolve) {
          return _this[methodName](resolve, {forced: true});
        });
      };
    });
    window.promisesStack(stack);
  };

  CognIOTA.prototype.init = function() {
    // for inheritance
  };

  ////

  CognIOTA.prototype.auction = function(agents, winner, packets, forced) {
    var t1 = 80;
    var _this = this;

    var stack = [];

    if (forced) {
      winner.activate(false);
      winner.colorize(this.shop.color);
      return stack;
    }

    stack.push(function () {
      return _this.writeConsole(packets.initial());
    });

    stack.push(function () {
      var promise;
      agents.forEach(function (agent) {
        var s = [];
        s.push(function () {
          return agent.text.receive('?');
        });

        s.push(function () {
          agent.circle.showFill(true);
          return agent.circle.circleIn(true).then(function () {
            return agent.circle.showBG(true);
          });
        });

        promise = window.promisesStack(s);
      });
      return promise;
    });

    stack.push(function () {
      return window.timePromise(300);
    });

    agents.forEach(function (agent, i) {

      stack.push(function () {
        return _this.writeConsole(packets.bet(agent));
      });

      stack.push(function () {
        agent.circle.hideBG(true);
        agent.circle.hideFill(true);
        agent.circle.circleOut(true);

        return agent.text.send(agent.bet ? agent.bet[0] : '!');
      });

    });


    agents.forEach(function (agent) {
      stack.push(function () {
        _this.writeConsole(packets.calculate(agent));
        return window.NOOPPromise;
      });

      stack.push(function () {
        return _this.mlCloud.colorShadow(agent.color, true);
      });

      stack.push(function () {
        return window.timePromise(t1);
      });
    });

    for (var i = 0; i < 4; i++) {
      stack.push(function () {
        return _this.mlCloud.colorShadow(_this.shop.color, true);
      });

      stack.push(function () {
        return window.timePromise(t1);
      });

      stack.push(function () {
        return _this.mlCloud.colorShadow(winner.color, true);
      });

      stack.push(function () {
        return window.timePromise(t1);
      });
    }

    stack.push(function () {
      return _this.mlCloud.ding();
    });

    stack.push(function () {
      _this.writeConsole(packets.ack(winner));
      _this.mlCloud.colorShadow(_this.shop.color, true);
      return winner.colorize(_this.shop.color, false, true);
    });

    stack.push(function () {
      winner.activate(true);
      return winner.text.receive('!');
    });

    return stack;
  };

  window.CognIOTA = CognIOTA;
})(window);
(function (window) {
  'use strict';

  var HEX_SETTINGS = {
    radius: 30,
    fill: '#00d6ff',
    edges: 8,
    stroke: '#00d6ff',
    'stroke-width': 0,
  };

  var SHADOW_SETTINGS = {
    edges: HEX_SETTINGS.edges,
    fill: HEX_SETTINGS.fill,
    radius: HEX_SETTINGS.radius * 1.3,
    opacity: 0.3,
  };

  var LOGO_SETTINGS = {
    width: 50,
    height: 50,
    url: 'dist/logo/l4.png',
  };

  function MLCloud (draw, cx, cy) {
    this.cx = cx;
    this.cy = cy;

    this.color = '#0060ff';
    this.ip = 'cogniOTA';

    this.group = draw.group();
    this.group.move(this.cx, this.cy);
    this.group.width(SHADOW_SETTINGS.radius * 2).height(SHADOW_SETTINGS.radius * 2);

    this.shadow = this.drawShadow();
    this.hex = this.drawHex();
    this.logo = this.drawLogo();

    this.group.opacity(0);
  }

  MLCloud.prototype.drawShadow = function() {
    var shadow = this.group.polygon().ngon(SHADOW_SETTINGS);
    shadow.opacity(0);

    setTimeout(function () {
      shadow.opacity(1).attr(SHADOW_SETTINGS).center(0, 0);
    }, 10);
    return shadow;
  };

  MLCloud.prototype.drawHex = function() {
    var hex = this.group.polygon().ngon(HEX_SETTINGS);
    hex.opacity(0);

    var _this = this;
    setTimeout(function () {
      _this.width = hex.node.getBBox().width;
      hex.opacity(1).attr(HEX_SETTINGS).center(0, 0);
    }, 10);
    return hex;
  };

  MLCloud.prototype.drawLogo = function() {
    var logo = this.group.image(
      LOGO_SETTINGS.url,
      LOGO_SETTINGS.width,
      LOGO_SETTINGS.height
    );
    logo.move(-LOGO_SETTINGS.width / 2, -LOGO_SETTINGS.height / 2);
    return logo;
  };

  MLCloud.prototype.show = function(animated) {
    if (!animated) {
      this.group.opacity(1);
      return window.NOOPPromise;
    } else {
      var t = 500;
      this.group.scale(0.01);
      this.group.opacity(1);

      var _this = this;
      this.group.animate(t, 'elastic').scale(0.8).during(function (pos, morph) {
        _this.shadow.rotate(pos * 360);
        _this.hex.rotate(pos * 360);
      });

      return window.timePromise(t);
    }
  };

  MLCloud.prototype.hide = function() {
    this.group.opacity(0);
  };

  MLCloud.prototype.fallInColor = function(color, animated) {
    var t = 0, t1 = 200, d1 = 350, t2 = 180, d2 = 100, t3 = 400;
    var k1 = 1, k2 = 1.08;
    this.hex.attr({'stroke': color});

    var hex, shadow;

    if (animated) {
      shadow = this.shadow.animate(t1);
      this.hex.delay(t1);
      t += t1;
    } else {
      shadow = this.shadow;
    }
    shadow.fill(color);

    if (animated) {
      hex = this.hex.delay(d1).animate(t2);
      this.shadow.delay(d1).animate(t2).scale(0.8);
      shadow = this.shadow.delay(d2).animate(t3, 'elastic');
      t += d1 + t2 + d2 + t3 - 300;
    } else {
      hex = this.hex;
      shadow = this.shadow;
    }
    hex.ngon({edges: HEX_SETTINGS.edges, radius: 0.1})
       .attr({'stroke-width': this.width * k1})
       .center(0, 0);
    shadow.scale(k2);

    return window.timePromise(t);
  };

  MLCloud.prototype.fallOutColor = function() {
    var t = 0, t1 = 300, t2 = 180, t3 = 400;

    this.hex.animate(t1, '>')
             .ngon({edges: HEX_SETTINGS.edges, radius: HEX_SETTINGS.radius})
             .attr({'stroke-width': 0})
             .center(0, 0);
    this.shadow.delay(t1).animate(t2).fill(this.color);
    this.shadow.animate(t3, 'elastic').scale(1);

    return window.timePromise(t);
  };

  MLCloud.prototype.toDefault = function () {
    this.hex.scale(1).ngon(HEX_SETTINGS).attr(HEX_SETTINGS).center(0, 0);
    this.shadow.scale(1).ngon(SHADOW_SETTINGS).attr(SHADOW_SETTINGS).center(0, 0);
  };

  MLCloud.prototype.ding = function(reversed) {
    var t = 300;
    this.group.animate(t, 'expoIn').rotate(140 * (reversed ? 1 : -1)).loop(2, true);

    return window.timePromise(t * 2);
  };

  MLCloud.prototype.colorShadow = function(color, animated) {
    var t = 0, t1 = 200;

    var obj = this.shadow;

    if (animated) {
      t += t1;
      obj = obj.animate(t1);
    }
    obj.fill(color);

    return window.timePromise(t);
  };

  MLCloud.fill = HEX_SETTINGS.fill;
  MLCloud.edges = HEX_SETTINGS.edges;
  MLCloud.r = SHADOW_SETTINGS.radius;

  window.MLCloud = MLCloud;

})(window);
(function (window) {
  'use strict';

  var HEX_SETTINGS = {
    fill: '#00d6ff',
    edges: 6,
    edgesStart: 3,
    radius: 15,
  };

  var SHADOW_SETTINGS = {
    fill: HEX_SETTINGS.fill,
    edges: HEX_SETTINGS.edges,
    radius: HEX_SETTINGS.radius * 1.3,
    opacity: 0.3,
  };

  var LINE_SETTINGS = {
    stroke: HEX_SETTINGS.fill,
    'stroke-width': 1.5,
    opacity: 0.7,
  };

  function MLHost(draw, vertex) {
    this.cx = vertex.pos[0];
    this.cy = vertex.pos[1];

    this.HIDE_PARAMS = {
      edges: HEX_SETTINGS.edgesStart,
      radius: TangleCognIOTA.GRAPH_SETTINGS.r / 2,
      fill: TangleCognIOTA.GRAPH_SETTINGS.stroke
    };

    this.group = draw.group().width(100);
    this.shadow = this.drawShadow();
    this.hex = this.drawHex(MLCloud.fill);
  }

  MLHost.prototype.drawShadow = function() {
    var shadow = this.group.polygon().ngon(SHADOW_SETTINGS).opacity(0);
    var _this = this;
    setTimeout(function () {
      shadow.center(_this.cx, _this.cy).attr(SHADOW_SETTINGS)
    }, 10);
    return shadow;
  };

  MLHost.prototype.drawHex = function() {
    var hex = this.group.polygon().ngon(HEX_SETTINGS).opacity(0);
    // it takes a little to change the path
    hex.attr(HEX_SETTINGS);
    var _this = this;
    setTimeout(function () {
      hex.center(_this.cx, _this.cy).opacity(1)
    }, 10);
    return hex;
  };

  MLHost.prototype.showHex = function() {
    var t1 = 70;

    this.hex.fill(this.HIDE_PARAMS.fill);

    var r = TangleCognIOTA.GRAPH_SETTINGS.r / 2,
        edges = HEX_SETTINGS.edgesStart;

    var steps = HEX_SETTINGS.edges - HEX_SETTINGS.edgesStart,
        rStep = (HEX_SETTINGS.radius - r) / steps,
        totalT = t1 * steps;

    for (; edges <= HEX_SETTINGS.edges; edges++, r+=rStep) {
      var hexAnimation = this.hex.animate(t1);
      hexAnimation.ngon({edges: edges, radius: r}).center(this.cx, this.cy);
      if (edges >= HEX_SETTINGS.edges - 1) {
        hexAnimation.fill(HEX_SETTINGS.fill);
      }
    }

    return window.timePromise(t1 * steps);
  };

  MLHost.prototype.showShadow = function() {
    var t = 300, d = 80;
    this.shadow.delay(100)
               .animate(300, 'backOut')
                .ngon({edges: SHADOW_SETTINGS.edges, radius: SHADOW_SETTINGS.radius})
                .center(this.cx, this.cy);

    return window.timePromise(t + d);
  };

  MLHost.prototype.hide = function() {
    this.hex.ngon(this.HIDE_PARAMS)
            .fill('transparent')
            .opacity(1).center(this.cx, this.cy);

    this.shadow.ngon({edges: SHADOW_SETTINGS.edges, radius: 0.1})
               .opacity(SHADOW_SETTINGS.opacity)
               .center(this.cx, this.cy);
  };

  MLHost.prototype.show = function(animated) {
    if (animated) {
      var _this = this;
      return new Promise(function (resolve) {
        _this.showHex(animated).then(function () {
          _this.showShadow(animated).then(resolve);
        });
      });
    } else {
      var params = {
        edges: HEX_SETTINGS.edgesStart,
        radius: TangleCognIOTA.GRAPH_SETTINGS.r / 2,
        fill: TangleCognIOTA.GRAPH_SETTINGS.fill
      };
      this.hex.ngon(HEX_SETTINGS).center(this.cx, this.cy).attr(HEX_SETTINGS).opacity(1);
      this.shadow.ngon(SHADOW_SETTINGS).attr(SHADOW_SETTINGS).center(this.cx, this.cy);
      return window.NOOPPromise;
    }
  };

  MLHost.prototype.connectTo = function(neightbors) {
    var _this = this;

    var t1 = 150, d1 = 25, t2 = 180, t3 = 200;
    var linesGroup = this.linesGroup = this.group.group();

    neightbors.forEach(function (n) {
      var pos = [_this.cx, _this.cy];
      var line = linesGroup.line(new SVG.PointArray([pos, pos]));
      line.attr(LINE_SETTINGS).opacity(0.3);

      var middle = [
        _this.cx - ((_this.cx - n.cx) / 2),
        _this.cy - ((_this.cy - n.cy) / 2)
      ];
      line.animate(t1, 'sineOut').plot(new SVG.PointArray([pos, middle]));

      line.delay(d1).animate(t2, 'sineOut').opacity(1);
      line.animate(t3, 'sineIn').opacity(LINE_SETTINGS.opacity);
    });

    return window.timePromise(t1 + d1 + t2 + t3);
  };

  MLHost.prototype.toCenter = function(cx, cy) {
    var t1 = 100, t2 = 250;
    var _this = this;

    this.linesGroup.animate(t1).opacity(0).once(1, function () {
      _this.deleteLines();
    });

    this.hex.animate(t2, 'backIn').center(cx, cy);
    this.shadow.animate(t2, 'backIn').center(cx, cy);

    return window.timePromise(t2);
  };

  MLHost.prototype.disappear = function(cx, cy, r, e) {
    var t1 = 300;
    function disappear (elem, params) {
      elem.animate(t1, '>').ngon({radius: r * 1.6, edges: e})
                           .center(cx, cy)
                           .opacity(0);
    }

    disappear(this.hex);
    disappear(this.shadow);

    return window.timePromise(t1);
  };

  MLHost.prototype.deleteLines = function() {
    this.linesGroup.remove();
  };

  window.MLHost = MLHost;
})(window);
(function (window) {
  'use strict';

  var TYPE_SPEED = 50;

  var VERTEXES = [
    {idx: 1, pos: [63, 35], neightbors: [2, 6]},
    {idx: 2, pos: [137, 17], neightbors: [3, 7]},
    {idx: 3, pos: [245, 18], neightbors: [4, 7]},
    {idx: 4, pos: [376, 27], neightbors: [7, 9]},

    {idx: 5, pos: [44, 118], neightbors: [6, 10, 11]},
    {idx: 6, pos: [125, 108], neightbors: [7, 11]},
    {idx: 7, pos: [286, 86], neightbors: []},
    {idx: 8, pos: [362, 102], neightbors: [9, 11, 12, 13]},
    {idx: 9, pos: [471, 101], neightbors: [13]},

    {idx: 10, pos: [23, 226], neightbors: [11, 14]},
    {idx: 11, pos: [113, 178], neightbors: [15]},
    {idx: 12, pos: [377, 195], neightbors: [16, 18]},
    {idx: 13, pos: [464, 155], neightbors: [18]},

    {idx: 14, pos: [42, 275], neightbors: [15]},
    {idx: 15, pos: [166, 276], neightbors: [16, 19]},
    {idx: 16, pos: [238, 259], neightbors: [17, 20, 21]},
    {idx: 17, pos: [343, 283], neightbors: [18, 21, 22]},
    {idx: 18, pos: [473, 275], neightbors: []},

    {idx: 19, pos: [27, 346], neightbors: [20]},
    {idx: 20, pos: [178, 342], neightbors: []},
    {idx: 21, pos: [301, 352], neightbors: [22]},
    {idx: 22, pos: [457, 332], neightbors: []},

    {idx: 23, pos: [120, 220], neightbors: []},

    {idx: 24, pos: [142, 249], neightbors: []},
  ];

  var GRAPH_SETTINGS = {
    'r': 3,
    'stroke-width': 6,
    'stroke': '#79909b',
  };

  var IMG_SRC = {
    bg: 'dist/env.png',
    whouse: 'dist/storage.png',
    shop: 'dist/shopping.png',
    carEmpty: 'dist/carEmpty.png',
    carFull: 'dist/car.png',
    tree: 'dist/tree.png',
  };

  var TREES = [
    {idx: 23},
  ];

  var WHOUSES = [
    {idx: 4, color: '#03a9f4', params: {bet: ['27', '750']}},
    {idx: 14, color: '#9e4f24', params: {bet: ['25', '500']}},
    {idx: 21, color: '#00838f', params: {bet: ['15', '680']}},
  ];

  var SHOPS = [
    {idx: 1, color: '#9575cd'},
    {idx: 12, color: '#5d4037'},
    {idx: 20, color: '#827717'},
    {idx: 22, color: '#3f51b5'},
    {idx: 11, color: '#e040fb'},
  ];

  var CARS = [
    {idx: 7, color: '#b71c1c', params: {bet:
      ['10', ['17', '100'], 'low']
    }},
    {idx: 9, color: '#ff6f00', params: {bet:
      ['8', ['31', '65'], 'low']
    }},
    {idx: 19, color: '#ff4081', params: {bet:
      ['3', ['12', '50'], 'average']
    }},
  ];

  var AGENT_IMG_SETTINGS = {
    w: 35,
    h: 35,
  };

  var AGENT_CIRCLE_SETTINGS = {
    r: AGENT_IMG_SETTINGS.w * 1.4 / 2,
    border: 1,

    bg: {
      fill: 'transparent',
    },

    'fill-opacity': 0.4,
  };


  var DELIVERY_PATH = {
    toWarehouse: [15, 16, 21],
    toTree: [16, 15, 24],
    toShop: [15, 14, 10, 5, 6, 1],
    toEnd: [2],
  };

  AGENT_CIRCLE_SETTINGS.bg.r = AGENT_CIRCLE_SETTINGS.r;

  var AGENT_LINE_SETTINGS = {
    'stroke-width': 2,
    'stroke-opacity': 0.2,
  };

  var AGENT_TEXT_SETTINGS = {
    r: 11,
    'stroke-width': 2,
    'fill-opacity': 0.3,
    'family': 'Times, serif',
    bg: {
      fill: '#63749b',
      'fill-opacity': 0.9,
    },
  };
  AGENT_TEXT_SETTINGS.fz = AGENT_TEXT_SETTINGS.r * 1.2;

  var AGENT_BRACKETS_SETTINGS = {
    'font-family': 'Rajdhani',
    // 'font-weight': '400',
    'font-size': '52px',
    'fill': '#0060ff',
    'stroke': '#0060ff',
    'stroke-width': '1px',
    'width': 40,
  };

  var HEADER_ACCENT_CLASS = 'secondPage-slideshow-item__header--accent';

  function generateIP() {
    var text = '';
    var possible = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "9", "9", "9", "9", "9", "9", "9", "9"];

    for (var i = 0; i < 5; i++) {
      text += Random.choice(possible);
    }

    return text;
  }

  function ProtocolCognIOTA (params, headerElement, consoleElement) {
    this.headerElement = headerElement;
    this.headerText = headerElement.getAttribute('header');
    this.consoleElement = consoleElement;

    params.vertexes = {
      array: VERTEXES,
      params: GRAPH_SETTINGS,
    };
    params.mlx = 500 / 2;
    params.mly = 385 / 2;

    CognIOTA.call(this, params);
  }

  // inherit ProtocolCognIOTA
  ProtocolCognIOTA.prototype = Object.create(CognIOTA.prototype);

  // correct the constructor pointer because it points to ProtocolCognIOTA
  ProtocolCognIOTA.prototype.constructor = ProtocolCognIOTA;

  ////////////

  ProtocolCognIOTA.prototype.init = function() {
    this.bg = this._addBG();
    this.trees = this._createElements(TREES, IMG_SRC.tree);
    this.tree = this.trees[0];
    this.tree.img.img.addClass('tree');
    this.whouses = this._createElements(WHOUSES, IMG_SRC.whouse);
    this.shops = this._createElements(SHOPS, IMG_SRC.shop);
    this.cars = this._createElements(CARS, IMG_SRC.carEmpty);

    this.agents = this.whouses.concat(this.shops).concat(this.cars);

    this.shop = this.shops[0];
    this.provider = this.whouses[this.whouses.length - 1];
    this.delivery = this.cars[this.cars.length - 1];


    this.shopBid = {
      price: '23',
      day: 'today',
      quantity: '678',
      speed: 'average',
    }
  };

  ProtocolCognIOTA.prototype._addBG = function() {
    var bg = this.draw.image(IMG_SRC.bg, 500, 420);
    bg.backward();


    var blurFilter, gridFilter;
    bg.filter(function(add) {
      blurFilter = add.gaussianBlur(0);
    });
    this.graph.group.filter(function (add) {
      gridFilter = add.gaussianBlur(0);
    });

    var _this = this;

    bg.blur = function (blurValue) {
      var t = 200;

      blurFilter.animate(t, '<').attr('stdDeviation', blurValue);
      gridFilter.animate(t, '<').attr('stdDeviation', blurValue);

      return window.timePromise(t);
    };
    bg.unblur = function () {
      var t = 200;

      blurFilter.animate(t, '>').attr('stdDeviation', '0 0');
      gridFilter.animate(t, '>').attr('stdDeviation', '0 0');

      return window.timePromise(t);
    };

    return bg;
  };

  ProtocolCognIOTA.prototype._createElements = function(settings, imgSrc) {
    var _this = this;
    var group = this.draw.group();
    this.mlCloud.group.forward();

    var img_settings = Object.assign({}, AGENT_IMG_SETTINGS);
    img_settings.src = imgSrc;

    var elements = settings.map(function (s) {
      var vertex = _this.graph.vertexes[s.idx];
      var agent = new Agent(group, {
        circle: AGENT_CIRCLE_SETTINGS,
        line: AGENT_LINE_SETTINGS,
        text: AGENT_TEXT_SETTINGS,
        img: img_settings,
        brackets: AGENT_BRACKETS_SETTINGS,

        color: s.color,
        cx: vertex.pos[0],
        cy: vertex.pos[1],
        mlx: _this.mlx,
        mly: _this.mly,
        mlw: 60,
      });

      agent.ip = generateIP(8) + '...';

      s.params = s.params || {};
      for (var name in s.params) {
        agent[name] = s.params[name];
      }

      agent.hide();

      return agent;
    });

    elements.blur = function (blurValue, animateBrackets) {
      var a;
      elements.forEach(function (agent) {
        a = agent.blur(blurValue, animateBrackets);
      });
      return a;
    };

    elements.unblur = function (animated) {
      var a;
      elements.forEach(function (agent) {
        a = agent.unblur(animated);
      });
      return a;
    };

    return elements;
  };
  //////
  ProtocolCognIOTA.prototype._writeHeader = function(text) {
    text = text || '';
    var _this = this;
    this.headerElement.stop = false;
    var badIdx = -1;
    var stack = (text + ' ').split('').reduce(function (bucket, l, i) {
      if (l == '<') {
        badIdx = text.indexOf('>', i);
      }

      if (i > badIdx) {
        bucket.push(function () {
          if (!_this.headerElement.stop) {
            _this.headerElement.innerHTML = text.slice(0, i);
            return window.timePromise(TYPE_SPEED);
          } else {
            stack.stop = true;
            return NOOPPromise;
          }
        });
      }
      return bucket;
    }, []);
    return window.promisesStack(stack);
  };

  ProtocolCognIOTA.prototype.writeHeader = function(forced) {
    if (forced) {
      this.headerElement.innerHTML = this.headerText;
      return window.NOOPPromise;
    }
    return this._writeHeader(this.headerText);
  };

  ProtocolCognIOTA.prototype.writeConsole = function(params) {
    var title = '<span style="color: ' +  params.author.color + '">' +
                   params.author.ip + '</span> ' +
                params.verb + ':'
    this.consoleElement.querySelector('[console-author]').innerHTML = title;

    var body = '';

    params.lines = params.lines || {};
    var maxL = Object.keys(params.lines).reduce(function (a, b) {
      return a.length > b.length ? a : b;
    }, '').length;

    if (params.type) {
      var name = 'TYPE';
      maxL = maxL || name.length;
      var d = '&nbsp;'.repeat(maxL - name.length);
      body += '<p>' + name + ' ' + d + ': <strong>' + params.type + '</strong></p>';
    }

    for (var name in params.lines) {
      var d = '&nbsp;'.repeat(maxL - name.length);
      body += '<p>' + name + ' ' + d + ': ' + params.lines[name] + '<p>';
    }
    this.consoleElement.querySelector('[console-body]').innerHTML = body;

    return window.NOOPPromise;
  };

  ProtocolCognIOTA.prototype.clearConsole = function() {
    this.consoleElement.querySelector('[console-author]').innerHTML = '';
    this.consoleElement.querySelector('[console-body]').innerHTML = '';
  }
  //////


  ProtocolCognIOTA.prototype.showDescription = function(end, params) {
    params = params || {};
    var _this = this;

    function clear() {
      _this._writeHeader();
      classie.remove(_this.headerElement, HEADER_ACCENT_CLASS);

      _this.trees.unblur();
      _this.bg.unblur();
      _this.shops.unblur();
      _this.whouses.unblur();
      _this.cars.unblur();

      return NOOPPromise;
    }

    if (params.clear) {
      clear();
      this.headerElement.innerHTML = ' ';
      return end();
    }

    else if (params.forced) {
      classie.add(this.headerElement, HEADER_ACCENT_CLASS);
      this.writeHeader(true);
      return end();
    }

    else {
      classie.add(this.headerElement, HEADER_ACCENT_CLASS);

      var t1 = 100, t2 = 300, t3 = 1000;
      var blurValue = '3 3';

      var stack = [];

      stack.push(function () {
        _this.trees.blur(blurValue);
        _this.bg.blur(blurValue);
        _this.shops.blur(blurValue);
        _this.whouses.blur(blurValue);
        return _this.cars.blur(blurValue);
      });

      [
        {title: 'Automatic Shops', elements: _this.shops},
        {title: 'Automatic Warehouses', elements: _this.whouses},
        {title: 'Self-Driving Cars', elements: _this.cars},
      ].forEach(function (params, i) {
        var title = params.title;
        var elements = params.elements;

        stack.push(function () {
          return window.timePromise(t1);
        });

        stack.push(function () {
          return _this._writeHeader(title);
        });

        stack.push(function () {
          return window.timePromise(t2);
        });

        stack.push(function () {
          return elements.unblur(true);
        });

        stack.push(function () {
          return window.timePromise(t3);
        });

        stack.push(function () {
          return elements.blur(blurValue, true);
        });
      });

      stack.push(function () {
        return timePromise(200);
      })

      stack.push(clear);


      stack.push(function () {
        return window.NOOPPromise.then(end);
      });
      this.stack = stack;
      return window.promisesStack(stack);
    }
  };

  ProtocolCognIOTA.prototype.showML = function(end, params) {
    params = params || {};

    if (params.clear) {
      this.mlCloud.hide();
      this.agents.forEach(function (agent) {
        agent.line.hide();
      });
      return end();
    }

    var _this = this;
    var animated = !params.forced;
    var stack = [];

    stack.push(function () {
      return _this.mlCloud.show(animated);
    });

    stack.push(function () {
      var promise;
      _this.agents.forEach(function (agent) {
        promise = agent.line.show(animated);
      });
      return promise;
    });

    if (params.forced) {
      classie.remove(this.headerElement, HEADER_ACCENT_CLASS);
      this._writeHeader('');
    }

    else {
      stack.push(function () {
        return window.timePromise(500);
      });
    }


    stack.push(function () {
      return window.NOOPPromise.then(end);
    });
    this.stack = stack;
    return window.promisesStack(stack);

  };

  ProtocolCognIOTA.prototype.initialRequest = function(end, params) {
    params = params || {};

    if (params.clear) {
      this._writeHeader('');
      this.shop.deactivate(false);
      this.shop.circle.circleOut(false);
      this.shop.circle.hideBG(false);
      this.mlCloud.toDefault();
      this.clearConsole();
      return end();
    }

    var stack = [];
    var _this = this;
    var animated = !params.forced;

    if (params.forced) {
      this.shop.activate(false);
      this.shop.circle.circleIn(false);
      // this.shop.circle.showBG(false);
    }

    else {
      stack.push(function () {
        return _this.writeHeader();
      });

      stack.push(function () {
        var spanColor = '<span style="color:' + _this.shop.color + '">';
        return _this.writeConsole({
          author: _this.shop,
          verb: 'requests',
          type: 'INITIAL',
          lines: {
            PRODUCT: 'milk',
            QUANTITY: spanColor + _this.shopBid.quantity + '</span>',
            MAX_PRICE: spanColor + _this.shopBid.price + '</span>',
            SPEED: spanColor + _this.shopBid.speed + '</span>'
          },
        });
      });

      stack.push(function () {
        return _this.shop.sendRequest();
        // .then(function () {
        //   return _this.shop.circle.showBG(true);
        // });
      });
    }

    stack.push(function () {
      return _this.mlCloud.fallInColor(_this.shop.color, animated);
    });

    stack.push(function () {
      return window.NOOPPromise.then(end);
    });
    this.stack = stack;
    return window.promisesStack(stack);

  };

  ProtocolCognIOTA.prototype.providersAuction = function(end, params) {
    params = params || {};
    if (params.clear) {
      this._writeHeader('');
      this.clearConsole();
      this.provider.colorize(this.provider.color);
      this.provider.deactivate();
      return end();
    }


    var _this = this;
    var stack = [];

    if (!params.forced) {
      stack.push(function () {
        return _this.writeHeader();
      });
      stack.push(function () {
        return _this.mlCloud.ding();
      });
    }


    var auctionPackets = {
      initial: function (agent) {
        var spanColor = '<span style="color:' + _this.shop.color + '">';
        return {
          author: _this.mlCloud,
          verb: 'broabcasts',
          type: 'AUCTION_BROADCAST',
          lines: {
            PRODUCT: 'milk',
            MAX_PRICE: spanColor + _this.shopBid.price + '</span>',
            QUANTITY: spanColor + _this.shopBid.quantity + '</span>',
          }
        };
      },
      bet: function (agent) {
        var spanColor = '<span style="color:' + agent.color + '">';
        return {
          author: agent,
          verb: 'answers',
          type: 'AUCTION_BID',
          lines: {
            PRODUCT: 'milk',
            PRICE: spanColor + agent.bet[0] + '</span>',
            QUANTITY: spanColor + agent.bet[1] + '</span>',
          }
        };
      },
      calculate: function (agent) {
        var agentSpanColor = '<span style="color:' + agent.color + '">';
        // var spanColor = '<span style="color:' + _this.shop.color + '">';
        return {
          author: _this.mlCloud,
          verb: 'calculates',
          type: '--',
          lines: {
            PRODUCT: 'milk',
            PRICE: agentSpanColor + agent.bet[0] + '</span>',
            QUANTITY: agentSpanColor + agent.bet[1] + '</span>',
          }
        };
      },
      ack: function (agent) {
        var spanColor = '<span style="color:' + agent.color + '">';
        return {
          author: _this.mlCloud,
          verb: 'answers',
          type: 'AUCTION_ACK',
          lines: {
            PRODUCT: 'milk',
            PRICE: spanColor + agent.bet[0] + '</span>',
            QUANTITY: spanColor + agent.bet[1] + '</span>',
          }
        };
      },
    };

    var auctionStack = this.auction(this.whouses, this.provider, auctionPackets, params.forced)
    stack = stack.concat(auctionStack);

    stack.push(function () {
      return window.NOOPPromise.then(end);
    });
    this.stack = stack;
    return window.promisesStack(stack);
  };

  ProtocolCognIOTA.prototype.deliveryAuction = function(end, params) {
    params = params || {};

    if (params.clear) {
      this._writeHeader('');
      this.clearConsole();
      this.delivery.colorize(this.provider.color);
      this.delivery.deactivate();
      return end();
    }

    var stack = [];


    if (!params.forced) {
      var _this = this;
      stack.push(function () {
        return _this.writeHeader();
      });
    }

    var auctionPackets = {
      initial: function (agent) {
        var spanColor = '<span style="color:' + _this.shop.color + '">';
        return {
          author: _this.mlCloud,
          verb: 'broabcasts',
          type: 'AUCTION_BROADCAST',
          // lines: {
          //   MAX_PRICE: spanColor + _this.shopBid.price + '</span>',
          //   QUANTITY: spanColor + _this.shopBid.quantity + '</span>',
          // }
        };
      },
      bet: function (agent) {
        var spanColor = '<span style="color:' + agent.color + '">';
        return {
          author: agent,
          verb: 'answers',
          type: 'AUCTION_BID',
          lines: {
            PRICE: spanColor + agent.bet[0] + '</span> / km',
            LAT: spanColor + agent.bet[1][0] + '</span>',
            LNT: spanColor + agent.bet[1][1] + '</span>',
          }
        };
      },
      calculate: function (agent) {
        var agentSpanColor = '<span style="color:' + agent.color + '">';
        // var spanColor = '<span style="color:' + _this.shop.color + '">';
        return {
          author: _this.mlCloud,
          verb: 'calculates',
          type: '--',
          lines: {
            PRICE: agentSpanColor + agent.bet[0] + '</span> / km',
            SPEED: agentSpanColor + agent.bet[2] + '</span>',
          }
        };
      },
      ack: function (agent) {
        var spanColor = '<span style="color:' + agent.color + '">';
        return {
          author: _this.mlCloud,
          verb: 'answers',
          type: 'AUCTION_ACK',
          lines: {
            WAREHOUS_POSITION: '[110, 80]',
            SHOP_POSITION: '[120, 100]',
            PRODUCT: 'milk',
          }
        };
      },
    };

    var auctionStack = this.auction(this.cars, this.delivery, auctionPackets, params.forced)
    stack = stack.concat(auctionStack);

    stack.push(function () {
      return window.NOOPPromise.then(end);
    });
    this.stack = stack;
    return window.promisesStack(stack);
  };

  ProtocolCognIOTA.prototype.deliveryProcess = function(end, params) {
    params = params || {};
    var _this = this;

    function toVertex(idx, animated) {
      var vertex = _this.graph.vertexes[idx];
      var cx = vertex.pos[0], cy = vertex.pos[1];
      return _this.delivery.go(cx, cy, animated);
    }

    if (params.clear) {
      this._writeHeader('');
      this.clearConsole();
      this.delivery.img.update(IMG_SRC.carEmpty);
      this.delivery.go(this.delivery.cx, this.delivery.cy, false);
      this.tree.img.img.removeClass('fallen-tree');
      return end();
    }

    else if (params.forced) {
      this.delivery.img.update(IMG_SRC.carEmpty);
      var lastIdx = DELIVERY_PATH.toEnd[DELIVERY_PATH.toEnd.length - 1];
      toVertex(lastIdx, false);
      this.tree.img.img.addClass('fallen-tree');
      return end();
    }

    else {
      var stack = [];

      stack.push(function () {
        return _this.writeHeader();
      });


      DELIVERY_PATH.toWarehouse.forEach(function (idx) {
        stack.push(function () {
          return toVertex(idx, true);
        });
      });

      stack.push(function () {
        _this.delivery.img.update(IMG_SRC.carFull);
        return window.timePromise(100);
      });

      stack.push(function () {
        return _this.mlCloud.ding();
      });

      DELIVERY_PATH.toTree.forEach(function (idx) {
        stack.push(function () {
          return toVertex(idx, true);
        });
      });

      stack.push(function () {
        _this.tree.img.img.addClass('fallen-tree');
        return window.timePromise(150);
      });

      DELIVERY_PATH.toShop.forEach(function (idx) {
        stack.push(function () {
          return toVertex(idx, true);
        });
      });

      stack.push(function () {
        _this.delivery.img.update(IMG_SRC.carEmpty);
        return window.timePromise(100);
      });

      stack.push(function () {
        return _this.mlCloud.ding();
      });

      DELIVERY_PATH.toEnd.forEach(function (idx) {
        stack.push(function () {
          return toVertex(idx, true);
        });
      });

      stack.push(function () {
        return window.NOOPPromise.then(end);
      });
      this.stack = stack;
      return window.promisesStack(stack);
    }
  };

  ProtocolCognIOTA.prototype.paymentProcess = function(end, params) {
    params = params || {};
    if (params.clear) {
      this._writeHeader('');
      this.clearConsole();
      this.mlCloud.fallInColor(this.shop.color, false);
      this.provider.activate(false);
      this.provider.colorize(this.shop.color);
      this.shop.activate(false);
      this.delivery.activate(false);
      this.delivery.colorize(this.shop.color);
      return end();
    }

    else if (params.forced) {
      return end();
    }

    else {
      var stack = [];
      var _this = this;
      stack.push(function () {
        return _this.writeHeader();
      });

      stack.push(function () {
        return _this.shop.sendRequest('I');
      });

      stack.push(function () {
        _this.shop.deactivate(true);
        return _this.mlCloud.ding();
      });

      stack.push(function () {
        _this.provider.text.receive('I');
        return _this.delivery.text.receive('I', _this.delivery.img.cx, _this.delivery.img.cy);
      });

      stack.push(function () {
        _this.provider.deactivate(true);
        _this.delivery.deactivate(true);
        return _this.mlCloud.fallOutColor();
      });

      stack.push(function () {
        return window.NOOPPromise.then(end);
      });
      this.stack = stack;
      return window.promisesStack(stack);
    }
  };

  window.ProtocolCognIOTA = ProtocolCognIOTA;
})(window);

(function (window) {
  'use strict';

  var slideOptions = {
    paths : {
      rect : 'M33,0h41c0,0,0,9.871,0,29.871C74,49.871,74,60,74,60H32.666h-0.125H6c0,0,0-10,0-30S6,0,6,0H33',
      right : 'M33,0h41c0,0,5,9.871,5,29.871C79,49.871,74,60,74,60H32.666h-0.125H6c0,0,5-10,5-30S6,0,6,0H33', 
      left : 'M33,0h41c0,0-5,9.871-5,29.871C69,49.871,74,60,74,60H32.666h-0.125H6c0,0-5-10-5-30S6,0,6,0H33'
    },
    speed : 500,
    w: 68,
    h: 60,
    fill: 'rgb(237, 236, 218)',
    minW: 530,
    maxW: 900,
  };
  slideOptions.minSx = slideOptions.minW / slideOptions.w;


  function ProtocolSlideshow(parent, nav) {
    this.parent = parent;
    this.nav = nav;
    this.isAnimating = false;

    this._init();
    // this._initBtns();

    // this.currentN = -1;
    // this.goNext();
  }

  ProtocolSlideshow.prototype._init = function() {
    var W = window.innerWidth, H = window.innerHeight;
    var elements = this.parent.querySelectorAll('li');
    var count = elements.length;
    this.step = 100 / count;

    this.parent.style.width = W * count + 'px';
    this.parent.style.height = H + 'px';

    var _this = this;
    this.items = [];
    this.methods = [];
    elements.forEach(function (elem, i) {
      elem.style.width = W + 'px';
      elem.style.height = H + 'px';

      var method = elem.getAttribute('method');
      var slide = _this.createSlide(elem, i, method);
      _this.items.push(slide);
      _this.methods.push(method);
    });
  };

  // ProtocolSlideshow.prototype._initBtns = function() {
  //   // body...
  // };

  ProtocolSlideshow.prototype.createBG = function(elem, i) {
    var W = Math.min(elem.offsetWidth, slideOptions.maxW), H = elem.offsetHeight;
    var sx = Math.max(W / slideOptions.w * 0.8, slideOptions.minSx),
        sy = H / slideOptions.h;

    var containerW = Math.max(slideOptions.w * sx, slideOptions.minW),
                     containerH = H;
    var cx = containerW / 2, cy = containerH / 2;

    var container = elem.querySelector('[container]');
    container.style.width = containerW + 'px';
    container.style.height = containerH + 'px';

    var svgParent = elem.querySelector('[bg-parent]');
    var svgId = 'secondPageSVGBG' + i;
    svgParent.setAttribute('id', svgId);
    var draw = SVG(svgId);
    var path = draw.path(slideOptions.paths.rect)
                   .fill(slideOptions.fill)
                   .center(cx, cy)
                   .scale(sx, sy);

    return {
      plot: function (d, s, e) {
        d = d || 'rect';
        path.stop();

        var obj = path;
        if (s) {
          obj = obj.animate(s, e);
        }
        obj.plot(slideOptions.paths[d]);
        obj.center(cx, cy);

        return s ? window.timePromise(s) : window.NOOPPromise;
      }
    };
  };

  ProtocolSlideshow.prototype.createAnimation = function(elem, i, method) {
    var svgParent = elem.querySelector('[svg-parent]');
    var svgId = 'secondPageSVG' + i;
    svgParent.setAttribute('id', svgId);

    var headerElement = elem.querySelector('[header]');
    var consoleElement = elem.querySelector('[console]');

    var draw = SVG(svgId);

    var protocol = new ProtocolCognIOTA({
      root: draw,
      method: method,
      preparationMethods : this.methods.slice(),
    }, headerElement, consoleElement);


    return protocol;
  };

  ProtocolSlideshow.prototype.createSlide = function(slide, i, method) {
    var bg = this.createBG(slide, i);
    var cogniota = this.createAnimation(slide, i, method);

    var _this = this;
    return {
      play: function () {
        return new Promise(function (resolve) {
          return cogniota.play(resolve);
        });
      },
      stop: function () {
        bg.plot();
        cogniota.headerElement.stop = true;
        cogniota.stop();
        // cogniota == undefined;
        // cogniota = _this.createAnimation(slide, i, method);
      },
      out: function (dir, speed) {
        return new Promise(function (resolve) {
          return bg.plot(dir, speed, '>').then(function () {
            return cogniota.out(resolve);
          });
        });
      },
      in: function (dir, speed) {
        return new Promise(function (resolve) {
          return bg.plot(dir).then(function () {
            return bg.plot('rect', speed, 'elastic').then(resolve);
          });
        });
      },
    }
  };

  ProtocolSlideshow.prototype.play = function() {
    this.inPlay = true;
    this.currentN = -1;
    // this.currentN = 0;
    // this.currentN = 1;
    // this.currentN = 2;
    // this.currentN = 3;
    // this.currentN = 4;
    // this.currentN = 5;
    this.goNext();
  };

  ProtocolSlideshow.prototype.stop = function() {
    this.inPlay = false;
    this.items[0].stop(); // to rect
    this._translate(0);
    this.isAnimating = false;
    this.currentN = -1;
  };

  ProtocolSlideshow.prototype.goNext = function() {
    var nextN = this.currentN + 1;
    if (nextN > (this.items.length - 1)) {
      nextN = 0;
      // return;
    }

    this._morph(nextN);
  };

  ProtocolSlideshow.prototype.goPrev = function() {
    var nextN = this.currentN - 1;
    if (nextN < 0) {
      nextN = this.count - 1;
    }
    this._morph(nextN);
  };

  ProtocolSlideshow.prototype._translate = function(nextN) {
    this.currentN = nextN;
    var translateVal = -1 * this.currentN * this.step;
    this.parent.style.WebkitTransform = 'translate3d(' + translateVal + '%,0,0)';
    this.parent.style.transform = 'translate3d(' + translateVal + '%,0,0)';

    return window.timePromise(500);
  };


  ProtocolSlideshow.prototype._morph = function(nextN) {
    if (this.isAnimating || !this.inPlay) return;

    this.isAnimating = true;
    var _this = this;

    var dir = nextN < this.currentN ? 'right' : 'left';
    var speed = slideOptions.speed,
        outSpeed = speed * 0.5,
        inSpeed = speed * 0.3;

    var nextItem = this.items[ nextN ];
    var currItem = this.items[ this.currentN ];

    var stack = [];
    // currItem == undefined if the first play
    if (currItem) {
      stack.push(function () {
        // morph svg path on exiting slide to "curved"
        return currItem.out(dir, outSpeed);
      });

      stack.push(function () {
        // move the parent to entering slide
        return _this._translate(nextN)
      });

      stack.push(function () {
        // change svg path on entering slide to "curved"
        // morph svg path on entering slide to "rectangle"
        nextItem.in(dir, speed);
        return NOOPPromise;
      });
    } else {
      stack.push(function () {
        // move the parent to entering slide
        return _this._translate(nextN)
      });
    }

    stack.push(function () {
      return nextItem.play();
    });


    window.promisesStack(stack).then(function () {
      _this.isAnimating = false;
      if (_this.inPlay) _this.goNext();
    });

  };

  window.ProtocolSlideshow = ProtocolSlideshow;
})(window);
(function (window) {
  'use strict';

  window.Random = {
    range: function range(min, max) {
      return Math.round(Math.random() * (max - min) + min);
    },
    choice: function choice(arr) {
      var max = arr.length;
      if (max === void 0) {
        arr = Object.keys(arr);
        max = arr.length;
      }
      var n = this.range(0, max - 1);
      return arr[n];
    },
    shuffle: function shuffle(_a) {
      var a = _a.slice();
      var j, x, i;
      for (i = a.length; i; i--) {
          j = Math.floor(Math.random() * i);
          x = a[i - 1];
          a[i - 1] = a[j];
          a[j] = x;
      }
      return a;
    },
    deviate: function deviate(i, d) {
      var a = this.range(d * -1, d);
      return i + a;
    }
  };

})(window);
(function (window) {
  'use strict';

  var VERTEXES = [
    {idx: 1, neightbors: [2, 6, 7], pos: [25, 25]},
    {idx: 2, neightbors: [3, 6], pos: [137, 25]},
    {idx: 3, neightbors: [4, 7, 8], pos: [255, 25]},
    {idx: 4, neightbors: [5, 8], pos: [361, 25]},
    {idx: 5, neightbors: [9, 10], pos: [475, 25]},

    {idx: 6, neightbors: [11, 12], pos: [25, 108]},
    {idx: 7, neightbors: [13], pos: [137, 108]},
    {idx: 8, neightbors: [9, 13], pos: [255, 108]},
    {idx: 9, neightbors: [14, 20], pos: [361, 108]},
    {idx: 10, neightbors: [15], pos: [475, 108]},

    {idx: 11, neightbors: [12, 18], pos: [25, 192]},
    {idx: 12, neightbors: [13, 17, 18], pos: [97, 192]},
    {idx: 13, neightbors: [14, 19], pos: [170, 192]},
    {idx: 14, neightbors: [15], pos: [292, 192]},
    {idx: 15, neightbors: [16], pos: [413, 192]},
    {idx: 16, neightbors: [20, 21], pos: [475, 192]},

    {idx: 17, neightbors: [18], pos: [25, 275]},
    {idx: 18, neightbors: [19], pos: [137, 275]},
    {idx: 19, neightbors: [20], pos: [255, 275]},
    {idx: 20, neightbors: [21], pos: [361, 275]},
    {idx: 21, neightbors: [], pos: [475, 275]},
  ];

  var GRAPH_SETTINGS = {
    'r': 6,
    'stroke-width': 1,
    'stroke': '#2bd46c',
  };

  var MLHOSTS_IDXS = [2, 4, 6, 9, 18, 21];
  var AGENTS_IDXS = [2, 4, 9, 12, 18, 21];

  var COLORS = [
    '#ff80ab', // pink
    '#f57c00',  // orange
    '#1de9b6', // blue
    '#b2ff59', // yellow
    // 'rgb(75, 255, 0)',  // green
    '#6a1b9a', // purple
    '#d50000',  // red
  ];

  var AGENT_CIRCLE_SETTINGS = {
    r: GRAPH_SETTINGS.r * 1.7,
    border: 1,

    bg: {
      r: GRAPH_SETTINGS.r,
      fill: GRAPH_SETTINGS.stroke,
    },

    'fill-opacity': 0.4,
  };

  var AGENT_LINE_SETTINGS = {
    'stroke-width': 2,
  };

  var AGENT_TEXT_SETTINGS = {
    r: AGENT_CIRCLE_SETTINGS.r * 0.8,
    'stroke-width': 1,
    'fill-opacity': 0.5,
    bg: {
      fill: '#63749b',
      opacity: 0.7,
    },
    fz: AGENT_CIRCLE_SETTINGS.r * 0.8 * 1.8
  };

  function TangleCognIOTA (params) {
    params.vertexes = {
      array: VERTEXES,
      params: GRAPH_SETTINGS,
    };
    params.mlx = 500 / 2;
    params.mly = 300 / 2;
    CognIOTA.call(this, params);

  }
  // inherit TangleCognIOTA
  TangleCognIOTA.prototype = Object.create(CognIOTA.prototype);

  // correct the constructor pointer because it points to TangleCognIOTA
  TangleCognIOTA.prototype.constructor = TangleCognIOTA;


  TangleCognIOTA.prototype.init = function() {
    this.agents = this._createShops();

    this._createMLNodes();

    var _this = this;
    this.shop = this.agents[0];
    this.providers = [1, 2, 4].map(function (i) {return _this.agents[i];});
    this.provider = this.providers[this.providers.length - 1];
  };
  //////

  TangleCognIOTA.prototype._createShops = function() {
    var _this = this;
    var group = this.draw.group();
    this.mlCloud.group.forward();

    return AGENTS_IDXS.map(function (idx, i) {
      var vertex = _this.graph.vertexes[idx];
      var agent = new Agent(group, {
        circle: AGENT_CIRCLE_SETTINGS,
        line: AGENT_LINE_SETTINGS,
        text: AGENT_TEXT_SETTINGS,

        color: COLORS[i],
        cx: vertex.pos[0],
        cy: vertex.pos[1],
        mlx: _this.mlx,
        mly: _this.mly,
        mlw: 60,
      });
      agent.circle.hideFill(false);
      agent.hide();
      return agent;
    });
  };

  TangleCognIOTA.prototype._createMLNodes = function() {
    var _this = this;
    var group = this.draw.group();

    this.mlhosts = MLHOSTS_IDXS.map(function (idx) {
      var vertex = _this.graph.vertexes[idx];
      var mlhost = new MLHost(group, vertex);
      mlhost.hide();
      return mlhost;
    });
  };

  TangleCognIOTA.prototype._hideMLHosts = function() {
    this.mlhosts.forEach(function (mlhost) {
      mlhost.hide();
    });
  };

  // params :
  //    forced: prepare all things for another stage
  //    clear: remove all after yourself to be able to play again

  TangleCognIOTA.prototype.createTangle = function(end, params) {
    params = params || {};
    if (params.forced) {
      return end();
    }

    // just show the graph for some time
    return setTimeout(end, 800);
  };

  TangleCognIOTA.prototype.createMLNodes = function(end, params) {
    params = params || {};
    var _this = this;

    if (params.clear) {
      return this._hideMLHosts();
    }

    var d = 250;
    if (params.forced) {
      d = 0;
    }
    var t = -d;
    return Random.shuffle(this.mlhosts).forEach(function (mlhost, i) {
      t += d;
      return setTimeout(function () {
        var promise = mlhost.show(!params.forced);

        if (i == _this.mlhosts.length - 1) {
          return promise.then(end);
        }
      }, t);

    });
  };

  TangleCognIOTA.prototype.createMLCloud = function(end, params) {
    params = params || {};

    if (params.forced) {
      this.mlCloud.show();
      this._hideMLHosts();
      return end();
    } else if (params.clear) {
      this.mlCloud.hide();
      return this.mlhosts.forEach(function (mlhost) {
        mlhost.deleteLines();
        return mlhost.show();
      });
    }

    var _this = this;

    var a;
    this.mlhosts.forEach(function (mlhost) {
      a = mlhost.connectTo(_this.mlhosts);
    });

    return a.then(function () {
      var b;
      _this.mlhosts.forEach(function (mlhost) {
        b = mlhost.toCenter(_this.mlx, _this.mly);
      });

      return b.then(function () {
        var c;
        setTimeout(function () {
          _this.mlCloud.show();
        }, 100);

        _this.mlhosts.forEach(function (mlhost) {
          c = mlhost.disappear(_this.mlx, _this.mly, MLCloud.r, MLCloud.edges);
        });

        return c.then(end);
      });
    });
  };

  TangleCognIOTA.prototype.shopRequests = function(end, params) {
    params = params || {};
    var _this = this;

    if (params.clear) {
      this.agents.forEach(function (agent) {
        agent.hide();
      });
      this.shop.deactivate();
      return end();
    }

    var promise, animated = !params.forced;
    this.agents.forEach(function (agent) {
      promise = agent.show(animated);
    });

    return promise.then(function () {
      if (params.forced) {
        return _this.shop.activate(false).then(end);
      }

      return setTimeout(function () {
        _this.shop.sendRequest().then(end);
      }, 1000);
    });
  };

  TangleCognIOTA.prototype.mlSendsResponse = function(end, params) {
    params = params || {};
    if (params.clear) {
      return this.mlCloud.toDefault();
    }

    var promise = this.mlCloud.fallInColor(this.shop.color, !params.forced);
    if (params.forced) {
      return promise.then(end);
    }

    var _this = this;
    return promise.then(function () {
      return _this.mlCloud.ding().then(function () {
        return _this.shop.receiveResponse().then(end);
      });
    });
  };

  TangleCognIOTA.prototype.mlAuction = function(end, params) {
    params = params || {};

    if (params.clear) {
      this.provider.deactivate(false);
      this.mlCloud.colorShadow(this.shop.color, false);
      return end();
    }

    else if (params.forced) {
      this.provider.activate(false);
      this.mlCloud.colorShadow(this.provider.color, false);
      return end();
    }

    else {
      var stack = [];
      var _this = this;
      var t1 = 200, t2 = 100;

      this.providers.forEach(function (agent) {
        stack.push(function () {
          agent.activate(true, false);
          return _this.mlCloud.colorShadow(agent.color, true);
        });

        stack.push(function () {
          return window.timePromise(t1);
        });

        if (agent.idx == _this.provider.idx) {
          stack.push(function () {
            return _this.mlCloud.ding();
          });
        } else {
          stack.push(function () {
            return agent.deactivate(true, false);
          });

          stack.push(function () {
            return window.timePromise(t2);
          });
        }
      });

      stack.push(function () {
        return window.NOOPPromise.then(end);
      });

      return window.promisesStack(stack);
    }

  };

  TangleCognIOTA.prototype.mlChooseProvider = function(end, params) {
    params = params || {};

    if (params.clear) {
      this.mlCloud.colorShadow(this.provider.color, false);
      return this.provider.colorize(this.provider.color, false, false);
    }

    else if (params.forced) {
      return end();
    }

    else {
      var _this = this;

      this.mlCloud.colorShadow(this.shop.color, true);
      this.mlCloud.ding();
      this.provider.colorize(this.shop.color);

      return this.provider.receiveRequest().then(function () {
        return _this.provider.sendResponse().then(function () {
          _this.shop.receiveResponse().then(end);
        });
      });
    }
  };


  TangleCognIOTA.GRAPH_SETTINGS = GRAPH_SETTINGS;

  window.TangleCognIOTA = TangleCognIOTA;
})(window);
(function (window) {
  'use strict';

  var SLIDESHOW_CLASSES = {
    description: 'firstPage-main-slideshow-item--description'
  };

  var N = 6;

  function TangleSlideshow(parent) {
    this.parent = parent;
    this.states = ['description', 'svg'];

    this.descriptionTime = 2000;

    this.items = [];
    this.methods = [];
    var slides = this.parent.querySelectorAll('li');

    var count = slides.length;
    this.parent.style.width = 100 * count + '%';
    this.step = 100 / count;
    var _this = this;
    slides.forEach(function (elem, i) {
      // if (i > N) return
      var method = elem.getAttribute('method');
      var item = _this.createSlide(elem, i, method);
      _this.items.push(item);
      _this.methods.push(method);
    });

    this.currentN = -1;
    this.currState = this.states.length;
    // this.currState = 0;
    // this.currentN = N;

    setTimeout(function () {
      _this.goNext();
    }, 400);
  }

  TangleSlideshow.prototype.createSlide = function(elem, i, method) {
    var descriptionSlide = this.createDescriptionSlide(elem, i);
    var svgSlide = this.createSVGSlide(elem, i, method);
    var _this = this;
    return {
      play: function () {
        if (_this.states[_this.currState] == 'description') {
          return descriptionSlide.play();
        } else {
          return svgSlide.play();
        }
      },
      out: function () {
        return svgSlide.out();
      },
    };
  };

  TangleSlideshow.prototype.createDescriptionSlide = function(elem, i) {

    var _this = this;
    return {
      play: function () {
        return new Promise(function (resolve) {
          classie.add(elem, SLIDESHOW_CLASSES.description);

          setTimeout(resolve, _this.descriptionTime);
        });
      }
    };
  };

  TangleSlideshow.prototype.createSVGSlide = function(elem, i, method) {
    var svgParent = elem.querySelector('[svg-parent]');
    var svgId = 'fisrtPageSVG' + i;
    svgParent.setAttribute('id', svgId);

    var cogniota = new TangleCognIOTA({
      root: SVG(svgId),
      method: method,
      preparationMethods : this.methods.slice(),
    });

    var _this = this;
    return {
      play: function () {
        return new Promise(function (resolve, reject) {
          classie.remove(elem, SLIDESHOW_CLASSES.description);

          cogniota.play(resolve);
        });
      },
      out: function () {
        cogniota.out();
      }
    };
  };

  /////////////////////

  TangleSlideshow.prototype.goNext = function() {
    var _this = this;

    this.currState += 1;

    var state = this.states[this.currState];
    var slide = this.items[this.currentN];
    if (!state) {
      if (slide) slide.out();
      this.currState = 0;

      this.currentN += 1;
      if (this.currentN > this.items.length - 1) {
        this.currentN = 0;
      }
      slide = this.items[this.currentN];
    }

    var translateVal = -1 * this.currentN * this.step;
    this.parent.style.WebkitTransform = 'translate3d(' + translateVal + '%,0,0)';
    this.parent.style.transform = 'translate3d(' + translateVal + '%,0,0)';

    slide.play().then(function () {
      _this.goNext();
    });
  };


  window.TangleSlideshow = TangleSlideshow;
})(window);
/*!
 * classie v1.0.1
 * class helper functions
 * from bonzo https://github.com/ded/bonzo
 * MIT license
 * 
 * classie.has( elem, 'my-class' ) -> true/false
 * classie.add( elem, 'my-new-class' )
 * classie.remove( elem, 'my-unwanted-class' )
 * classie.toggle( elem, 'my-class' )
 */

/*jshint browser: true, strict: true, undef: true, unused: true */
/*global define: false, module: false */

( function( window ) {

'use strict';

// class helper functions from bonzo https://github.com/ded/bonzo

function classReg( className ) {
  return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
}

// classList support for class management
// altho to be fair, the api sucks because it won't accept multiple classes at once
var hasClass, addClass, removeClass;

if ( 'classList' in document.documentElement ) {
  hasClass = function( elem, c ) {
    return elem.classList.contains( c );
  };
  addClass = function( elem, c ) {
    elem.classList.add( c );
  };
  removeClass = function( elem, c ) {
    elem.classList.remove( c );
  };
}
else {
  hasClass = function( elem, c ) {
    return classReg( c ).test( elem.className );
  };
  addClass = function( elem, c ) {
    if ( !hasClass( elem, c ) ) {
      elem.className = elem.className + ' ' + c;
    }
  };
  removeClass = function( elem, c ) {
    elem.className = elem.className.replace( classReg( c ), ' ' );
  };
}

function toggleClass( elem, c ) {
  var fn = hasClass( elem, c ) ? removeClass : addClass;
  fn( elem, c );
}

var classie = {
  // full names
  hasClass: hasClass,
  addClass: addClass,
  removeClass: removeClass,
  toggleClass: toggleClass,
  // short names
  has: hasClass,
  add: addClass,
  remove: removeClass,
  toggle: toggleClass
};

// transport
if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( classie );
} else if ( typeof exports === 'object' ) {
  // CommonJS
  module.exports = classie;
} else {
  // browser global
  window.classie = classie;
}

})( window );
(function (window) {
  'use strict';

  function Graph(draw, vertexes, params) {
    this.vertexes = vertexes.reduce(function (bucket, vertex) {
      bucket[vertex.idx] = Object.assign({}, vertex);
      return bucket;
    }, {});

    this.group = draw.group();
    this.edgeGroup = this.group.group();
    this.vertexesGroup = this.group.group();

    for (var idx in this.vertexes) {
      var vertex = this.vertexes[idx];
      this.createVertex(vertex, params);
    }
  }

  Graph.prototype.createVertex = function(vertex, params) {
    var _this = this;
    var gridNode = this.vertexesGroup.circle();
    gridNode.attr({fill: params.stroke, r: params.r});
    // gridNode.center(vertex.pos[0], vertex.pos[1]);
    // gridNode.fill('red')
    // this.vertexesGroup.text(vertex.idx + '').center(vertex.pos[0] + 5, vertex.pos[1] + 20);
    gridNode.style({cx: vertex.pos[0], cy: vertex.pos[1]});

    // // HARDCORE!
    if (vertex.idx == 23 || vertex.idx == 24) {
      gridNode.opacity(0);
    }

    vertex.neightbors.forEach(function (neightborId) {
      var neightbor = _this.vertexes[neightborId];
      neightbor.neightbors.push(vertex.idx);
      _this.edgeGroup.line(new SVG.PointArray([vertex.pos, neightbor.pos]))
                     .attr(params);
    });
  };


  window.Graph = Graph;
})(window);
(function (window) {
  'use strict';

  window.NOOP = Function.prototype;
  window.NOOPPromise = new Promise(function (resolve) {resolve()});
  window.timePromise = function (t) {
    return new Promise(function (resolve) {
      setTimeout(resolve, t);
    });
  };
  window.promisesStack = function (stack) {
    return new Promise(function (end) {
      function process(i) {
        var p = stack[i];
        if (!p || stack.stop) return end();

        return new Promise(function (resolve) {
          if (stack.stop) {
            end();
            resolve();
          }
          return p().then(resolve);
        }).then(function () {
          if (!stack.stop) {
            process(i + 1);
          }
        });
      }

      return process(0);
    });
  };
})(window);