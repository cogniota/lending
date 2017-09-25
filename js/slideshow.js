
function MapSlideShow() {
  this.slideOptions = {
    paths : {
      rect : 'M33,0h41c0,0,0,9.871,0,29.871C74,49.871,74,60,74,60H32.666h-0.125H6c0,0,0-10,0-30S6,0,6,0H33',
      right : 'M33,0h41c0,0,5,9.871,5,29.871C79,49.871,74,60,74,60H32.666h-0.125H6c0,0,5-10,5-30S6,0,6,0H33', 
      left : 'M33,0h41c0,0-5,9.871-5,29.871C69,49.871,74,60,74,60H32.666h-0.125H6c0,0-5-10-5-30S6,0,6,0H33'
    },
    speed : 500
  };
  this.h = 60;
  this.w = 68;

  this.slides = [];
  this.elem = document.querySelector('#secondPage .main');

  this._initSlides();
  this._initNavs();
}

MapSlideShow.prototype._initSlides = function() {
  this.slidesParent = this.elem.querySelector('ul.slideshow');

  var elems = this.slidesParent.children;
  this.screenW = this.slidesParent.offsetWidth;
  this.count = elems.length;

  this.slidesParent.style.width = this.slidesParent.offsetWidth * this.count + 'px';

  for (var i = 0; i < elems.length; i++) {
    var slide = this.createSlide(elems[i], i);
    this.slides.push(slide);
  }

  this.currentN = 0;
};

MapSlideShow.prototype.createSlide = function(slide, i) {
  var _this = this;
  var color = 'rgba(237, 236, 218, 1)';
  var svgId = 'secondPageSVGBG' + i;

  slide.style.width = this.screenW + 'px';

  var svgParent = slide.querySelector('.bg');
  svgParent.setAttribute('id', svgId);

  var H = svgParent.offsetHeight, W = this.screenW;
  var cx = W/2, cy = H/2;
  var sx = W/this.w * 0.8, sy = H/this.h;


  var draw = SVG(svgId);
  var path = draw.path(this.slideOptions.paths.rect)
                 .fill(color)
                 .center(cx, cy)
                 .scale(sx, sy);

  slide.animate = function (d, speed, easing, callback) {
    path.stop()
        .animate(speed, easing)
            .plot(_this.slideOptions.paths[d])
            .center(cx, cy).once(1, function () {
              callback && callback();
            });
  };
  slide.plot = function (d) {
    path.plot(_this.slideOptions.paths[d]).center(cx, cy);
  };

  slide.querySelector('.svg').style.width = sx * this. w + 'px';
  return slide;
};

MapSlideShow.prototype._initNavs = function() {
  var _this = this;
  var nav = this.elem.querySelector('ul.nav');
  this.prev = nav.querySelector('.prev');
  this.prev.onclick = function () {
    _this.goPrev();
  };
  this.next = nav.querySelector('.next');
  this.next.onclick = function () {
    _this.goNext();
  };

  this.play = nav.querySelector('.play');
  // keyboard navigation events
      // document.addEventListener( 'keydown', function( ev ) {
      //   var keyCode = ev.keyCode || ev.which;
      //   switch (keyCode) {
      //     // left key
      //     case 37:
      //       self._navigate('prev');
      //       break;
      //     // right key
      //     case 39:
      //       self._navigate('next');
      //       break;
      //   }
      // } );
};

MapSlideShow.prototype._translate = function(nextN) {
  this.currentN = nextN;
  var translateVal = -1 * this.currentN * 100 / this.count;
  this.slidesParent.style.WebkitTransform = 'translate3d(' + translateVal + '%,0,0)';
  this.slidesParent.style.transform = 'translate3d(' + translateVal + '%,0,0)';
};

MapSlideShow.prototype.goNext = function() {
  // morph svg path on exiting slide to "curved"
  var nextN = this.currentN + 1;
  if (nextN > (this.count - 1)) {
    nextN = 0;
  }
  this._morph(nextN);
};

MapSlideShow.prototype.goPrev = function() {
  var nextN = this.currentN - 1;
  if (nextN < 0) {
    nextN = this.count - 1;
  }
  this._morph(nextN);
};

MapSlideShow.prototype._morph = function(nextN) {
  if (this.isAnimating) return;

  this.isAnimating = true;
  var _this = this;

  var dir = nextN > this.currentN ? 'right' : 'left';
  var speed = this.slideOptions.speed,
      outSpeed = speed * 0.5,
      inSpeed = speed * 0.3;

  // change svg path on entering slide to "curved"
  var nextItem = this.slides[ nextN ];

  // morph svg path on exiting slide to "curved"
  this.slides[ this.currentN ].animate(
    dir, outSpeed, '>',
    function () {
      // morph svg path on entering slide to "rectangle"
      nextItem.plot(dir === 'right' ? 'left' : 'right');
      setTimeout(function () {
        nextItem.animate('rect', speed, 'elastic');
        _this.isAnimating = false;
      }, outSpeed);
    });

  this._translate(nextN);
};


