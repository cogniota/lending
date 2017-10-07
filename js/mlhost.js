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