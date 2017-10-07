(function () {
  'use strict';

  var NOOPPromise = new Promise(function (resolve) {resolve()});

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
  }

  Agent.prototype.hide = function(animated) {
    this.circle.circleOut(animated);
    this.line.hide();
    this.group.opacity(0);
  };

  Agent.prototype.show = function(animated) {
    this.group.opacity(1);

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
        circlePromise = NOOPPromise.then(function () {
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
        return _this.text.send('?').then(resolve);
      });
    });
  };

  Agent.prototype.sendRequest = function() {
    return this._send('?', true);
  };

  Agent.prototype.sendResponse = function() {
    return this._send('!', false);
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
        circlePromise = NOOPPromise.then(function () {
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

  Agent.prototype.receiveRequest = function(first_argument) {
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
      return NOOPPromise;
    }

  };

  window.Agent = Agent;

})();
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
(function () {
  'use strict';

  function promise(t) {
    return new Promise(function (resolve) {
      setTimeout(resolve, t);
    });
  }

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
      obj.attr({'opacity': 1, 'stroke-width': 4});
      obj = obj.animate(t2, 'quadOut');
    }
    obj.attr(this.SETTINGS);

    return promise(t);
  };

  AgentLine.prototype.activate = function(animated) {
    var t = 0, t1 = 350;

    var obj = this.line;
    if (animated) {
      t += t1;
      obj = this.line.animate(t1, 'cubicOut');
    }
    obj.attr({'opacity': 1, 'stroke-width': 4});

    return promise(t);
  };

  AgentLine.prototype.deactivate = function(animated) {
    var t = 0, t1 = 350;

    var obj = this.line;
    if (animated) {
      t += t1;
      obj = this.line.animate(t1, 'cubicIn');
    }
    obj.attr(this.SETTINGS);

    return promise(t);
  };

  AgentLine.prototype.colorize = function(color, animated) {
    var t = 0, t1 = 400;
    var obj = this.line;
    if (animated) {
      t += t1;
      obj = obj.animate(t, 'cubicIn');
    }
    obj.attr({stroke: color});
    return promise(t);
  };

  window.AgentLine = AgentLine;

})();
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
(function () {
  'use strict';

  var NOOP = Function.prototype;
  var NOOPPromise = new Promise(function (resolve) {resolve()});

  function CognIOTA(params) {
    this.root = params.root;

    this.mlx = params.mlx;
    this.mly = params.mly;

    this.vertexes = params.vertexes;

    this.method = this[params.method] || NOOP;
    this.preparationMethods = params.preparationMethods == void 0 ? [] : params.preparationMethods;

    this._init();
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

  CognIOTA.prototype.out = function() {
    var _this = this;
    _this.method(NOOP, {clear: true});
    // setTimeout(function () {
    // }, 100);
  };

  /////

  CognIOTA.prototype._init = function() {
    this.draw = this.root.group();
    this.graph = new Graph(this.draw, this.vertexes.array, this.vertexes.params);
    this.mlCloud = new MLCloud(this.draw, this.mlx, this.mly);

    this.init();

    var _this = this;
    function promisesStack(i, promise) {
      var methodName = _this.preparationMethods[i];
      if (!methodName) return;

      return new Promise(function (resolve) {
        return _this[methodName](resolve, {forced: true});
      }).then(function () {
        promisesStack(i + 1);
      });
    }
    promisesStack(0, NOOPPromise);
  };

  CognIOTA.prototype.init = function() {
    // pass
  };

  window.CognIOTA = CognIOTA;
})();
(function () {
  'use strict';

  function promise(t) {
    return new Promise(function (resolve) {
      setTimeout(resolve, t);
    });
  }

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
    // this.color = '#0060ff';
    // this.ip = 'cogniOTA';

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

  MLCloud.prototype.show = function() {
    this.group.opacity(1);
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

    return promise(t);
  };

  MLCloud.prototype.toDefault = function () {
    this.hex.scale(1).ngon(HEX_SETTINGS).attr(HEX_SETTINGS).center(0, 0);
    this.shadow.scale(1).ngon(SHADOW_SETTINGS).attr(SHADOW_SETTINGS).center(0, 0);
  };

  MLCloud.prototype.ding = function(reversed) {
    var t = 300;
    this.group.animate(t, 'expoIn').rotate(140 * (reversed ? 1 : -1)).loop(2, true);

    return promise(t * 2);
  };

  MLCloud.prototype.colorShadow = function(color, animated) {
    var t = 0, t1 = 200;

    var obj = this.shadow;

    if (animated) {
      t += t1;
      obj = obj.animate(t1);
    }
    obj.fill(color);

    return promise(t);
  };

  MLCloud.fill = HEX_SETTINGS.fill;
  MLCloud.edges = HEX_SETTINGS.edges;
  MLCloud.r = SHADOW_SETTINGS.radius;

  window.MLCloud = MLCloud;

})();
(function () {
  'use strict';

  var NOOPPromise = new Promise(function (resolve) {resolve()});

  function promise(t) {
    return new Promise(function (resolve) {
      setTimeout(resolve, t);
    });
  }

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

    return promise(t1 * steps);
  };

  MLHost.prototype.showShadow = function() {
    var t = 300, d = 80;
    this.shadow.delay(100)
               .animate(300, 'backOut')
                .ngon({edges: SHADOW_SETTINGS.edges, radius: SHADOW_SETTINGS.radius})
                .center(this.cx, this.cy);

    return promise(t + d);
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
      return NOOPPromise;
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

    return promise(t1 + d1 + t2 + t3);
  };

  MLHost.prototype.toCenter = function(cx, cy) {
    var t1 = 100, t2 = 250;
    var _this = this;

    this.linesGroup.animate(t1).opacity(0).once(1, function () {
      _this.deleteLines();
    });

    this.hex.animate(t2, 'backIn').center(cx, cy);
    this.shadow.animate(t2, 'backIn').center(cx, cy);

    return promise(t2);
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

    return promise(t1);
  };

  MLHost.prototype.deleteLines = function() {
    this.linesGroup.remove();
  };

  window.MLHost = MLHost;
})();
(function () {
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

})();
(function () {
  // 'use strict';

  var NOOPPromise = new Promise(function (resolve) {resolve()});

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
    this._createShops();
    this._createMLNodes();
  };
  //////

  TangleCognIOTA.prototype._createShops = function() {
    var _this = this;
    var group = this.draw.group();
    this.mlCloud.group.forward();

    this.agents = AGENTS_IDXS.map(function (idx, i) {
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
      return this.shop.deactivate();
    }

    var promise, animated = !params.forced;
    this.agents.forEach(function (agent) {
      promise = agent.show(animated);
    });

    return promise.then(function () {
      _this.shop = _this.agents[0];
      _this.providers = [1, 2, 4].map(function (i) {return _this.agents[i];});
      _this.provider = _this.providers[_this.providers.length - 1];

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
      return this.mlCloud.colorShadow(this.shop.color, false);
    }

    var _this = this;
    // var agents = [this.agents[1], this.agents[2], this.agents[4]];
    // this.provider = agents[2];

    if (params.forced) {
      _this.provider.activate(false);
      _this.mlCloud.colorShadow(_this.provider.color, false);
      return end();
    } else {
      var t1 = 200, t2 = 100;

      function promisesStack(i, promise) {
        var agent = _this.providers[i];
        if (!agent) return end();

        return new Promise(function (resolve) {
          agent.activate(true, false);
          return _this.mlCloud.colorShadow(agent.color, true).then(function () {
            setTimeout(function () {
              if (agent.idx == _this.provider.idx) {
                _this.mlCloud.ding().then(resolve);
              } else {
                return agent.deactivate(true, false).then(function () {
                  return setTimeout(resolve, t2);
                });
              }
            }, t1);
          });
        }).then(function () {
          promisesStack(i + 1);
        });
      }

      return promisesStack(0, NOOPPromise);
    }

  };

  TangleCognIOTA.prototype.mlChooseProvider = function(end, params) {
    params = params || {};
    if (params.clear) {
      this.mlCloud.colorShadow(this.provider.color, false);
      return this.provider.colorize(this.provider.color, false, false);
    }
    if (params.forced) {
      return;
    }
    var _this = this;

    this.mlCloud.colorShadow(this.shop.color, true);
    this.mlCloud.ding();
    this.provider.colorize(this.shop.color);

    return this.provider.receiveRequest().then(function () {
      return _this.provider.sendResponse().then(function () {
        _this.shop.receiveResponse().then(end);
      });
    });
  };


  TangleCognIOTA.GRAPH_SETTINGS = GRAPH_SETTINGS;

  window.TangleCognIOTA = TangleCognIOTA;
})();
(function () {
  'use strict';

  var NOOP = Function.prototype;
  var NOOPPromise = new Promise(function (resolve) {resolve()});

  var SLIDESHOW_CLASSES = {
    description: 'firstPage-main-slideshow-item--description'
  };

  var N = 6;

  function TangleSlideshow(parent) {
    this.parent = parent;
    this.states = ['description', 'svg'];

    this.descriptionTime = 2000;

    var _this = this;
    this.items = [];
    this.methods = [];
    var slides = this.parent.querySelectorAll('li');

    var count = slides.length;
    this.parent.style.width = 100 * count + '%';
    this.step = 100 / count;
    slides.forEach(function (elem, i) {
      // if (i > N) return
      var method = elem.getAttribute('method');
      var item =  _this.createSlide(elem, i, method);
      _this.items.push(item);
      _this.methods.push(method);

    });

    this.currentN = -1;
    this.currState = this.states.length;
    // this.currState = 0;
    // this.currentN = N;


    _this.goNext();
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

  TangleSlideshow.prototype.goPrev = NOOP;



  window.TangleSlideshow = TangleSlideshow;
})();
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
(function () {
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

    // var path = Helpers.getCirclePath(params.r);
    // var gridNode = this.vertexesGroup.path(path);
    var gridNode = this.vertexesGroup.circle();
    gridNode.attr({fill: params.stroke, r: params.r}).center(vertex.pos[0], vertex.pos[1]);
    // this.vertexesGroup.text(vertex.idx + '').center(vertex.pos[0] + 5, vertex.pos[1] + 20);
    // gridNode.style({cx: vertex.pos[0], cy: vertex.pos[1]})

    vertex.neightbors.forEach(function (neightborId) {
      var neightbor = _this.vertexes[neightborId];
      neightbor.neightbors.push(vertex.idx);
      _this.edgeGroup.line(new SVG.PointArray([vertex.pos, neightbor.pos]))
                     .attr(params);
    });
  };


  window.Graph = Graph;
})();