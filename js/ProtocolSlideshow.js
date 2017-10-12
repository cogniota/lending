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