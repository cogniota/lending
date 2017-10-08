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


  window.TangleSlideshow = TangleSlideshow;
})(window);