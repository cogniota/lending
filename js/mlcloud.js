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
      // this.logo.opacity(0);
      this.group.scale(0.01);
      // this.group.rotate(-30);
      this.group.opacity(1);

      var _this = this;
      this.group.animate(t, 'elastic').scale(0.8).during(function (pos, morph) {
        // console.log(p)
        // if (pos > 0.3) {
          var p = SVG.easing['circIn'](pos) * 360;
          // this.rotate(p * 360);
        // _this.group.rotate(10);
        _this.shadow.rotate(pos * 360);
        _this.hex.rotate(pos * 360);
        // }
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