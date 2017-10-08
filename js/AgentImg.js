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