function initBtns() {
  var openProtocolBtn = document.querySelector('#openProtocol');
  var bbox = openProtocolBtn.getBoundingClientRect();

  var secondPage = document.querySelector('#secondPage');
  secondPage.style.left = 0;
  secondPage.style.top = 0;
  secondPage.style.width = '100%';
  secondPage.style.height = '100%';

  var slideShow = new MapSlideShow();

  // var map = new SalesManMap(slideShow);
  slideShow.slides.forEach(function (slide, i) {
    var svgId = 'secondPageSVG' + i;
    var svgParent = slide.querySelector('.svg');
    svgParent.setAttribute('id', svgId);

    var draw = SVG(svgId);
    new SalesManMap(draw);
  });

  secondPage.style.left = bbox.x + 'px';
  secondPage.style.top = bbox.y + 'px';
  secondPage.style.width = bbox.width + 'px';
  secondPage.style.height = bbox.height + 'px';

  var isOpen = false;
  function toggle(event) {
    if (isOpen && event.srcElement.getAttribute('id') == 'backToMain') {
      document.body.className = '';
      isOpen = false;
    } else {
      document.body.className = 'secondPage';
      isOpen = true;

      setTimeout(function () {
      }, 500)
    }
  };

  secondPage.addEventListener('click', toggle);
}

function createSalesMan() {
  initBtns();
}

function SalesManMap(draw) {
  this.draw = draw;
  this.elements = {};

  this.createSVG();

  this.mlCloud = new MLCloud(this.draw, 250, 192.5);

  this.drawWHouses();
  this.drawShops();

  this.drawML();

  this.drawCars();
}

SalesManMap.prototype.createSVG = function() {
  this.grid = new Graph(this.draw, VERTEXES_SALESMAN, gridParams_SALESMAN);
  this._drawBG();
};


SalesManMap.prototype._drawBG = function() {
  var parksPaths = [
    'M26 68 l45 3 l 32 26 l -67 15 Z',
    'M42 207 l57 -13 l 37 25 l 12 26 l -70 10  l -35 -10 Z',
    'M356 75 l50 -16 l 32 11 l -17 25 l -80 5 Z',
    'M357 142 l10 -11 l 88 61 l 10 54 l -10 10 l -80 -54 Z',
  ];


  var greenGroup = this.draw.group();
  parksPaths.forEach(function (d) {
    greenGroup.path(d).fill('#4caf50').opacity(0.6);
  });


  var enviromentElems = [
    {pos: [155, 70], src: '768320_garden_512x512.png', o: 1, w: 25},
    {pos: [275, 305], src: '804184_garden_512x512.png', o: 1, w: 25},

    {pos: [400, 257], src: '804198_protection_512x512.png', o: 1, w: 24},
    {pos: [160, 295], src: '771160_firefighter_512x512.png', o: 1, w: 28},

    {pos: [290, 55], src: '773385_tree_512x512.png', o: 1, w: 30},
    {pos: [360, 245], src: '773368_tree_512x512.png', o: 1, w: 30},
    {pos: [60, 160], src: '773373_tree_512x512.png', o: 1, w: 30},
    {pos: [110, 330], src: '773371_tree_512x512.png', o: 1, w: 30},
    {pos: [325, 165], src: '773393_tree_512x512.png', o: 1, w: 25},
  ];

  enviromentElems.forEach(function (params) {
    greenGroup.image('dist/enviroment/' + params.src, params.w)
              .center(params.pos[0], params.pos[1])
              .opacity(params.o);
  });
};

SalesManMap.prototype.drawWHouses = function() {
  this.whouses = [];
  var whousesGroup = this.draw.group();
  this.mlCloud.group.before(whousesGroup);

  var _this = this;
  whouses_SALESMAN.forEach(function (idx, i) {
    var vertex = _this.grid.vertexes[idx];
    var color = whouses_colors_SALESMAN[i];
    var whouse = new WHouse(whousesGroup, vertex, _this.mlCloud.cx, _this.mlCloud.cy, color);
    _this.whouses.push(whouse);
    _this.elements[idx] = whouse;
  });
};

SalesManMap.prototype.drawShops = function() {
  this.shops = [];
  var shopsGroup = this.draw.group();
  this.mlCloud.group.before(shopsGroup);

  var _this = this;
  shops_SALESMAN.forEach(function (idx, i) {
    var vertex = _this.grid.vertexes[idx];
    var color = shops_colors_SALESMAN[i];
    var shop = new Shop(shopsGroup, vertex, _this.mlCloud.cx, _this.mlCloud.cy, color);
    _this.shops.push(shop);
    _this.elements[idx] = shop;
  });
};

SalesManMap.prototype.drawCars = function() {
  this.cars = [];
  var carsGroup = this.draw.group();

  // var cars_SALESMAN = Random.shuffle(VERTEXES_SALESMAN).slice(0, 3);
  // var cars_SALESMAN = [VERTEXES_SALESMAN[1]];
  var _this = this;
  cars_SALESMAN.forEach(function (idx, i) {
    var vertex = _this.grid.vertexes[idx];
    var color = cars_color_SALESMAN[i];
    var car = new Car(carsGroup, vertex, _this.grid, color, _this.elements);
    _this.cars.push(car);
  });
};


SalesManMap.prototype.drawML = function() {
  this.mlCloud.show();
};

// function SalesMan(svgId, bounds) {
//   this.svgId = svgId;
//   // this.bounds = bounds;

//   this.createSVG();
//   this.drawML();
//   this.drawWHouses();
//   this.linkWHouses();
//   this.drawShops();
//   this.linkShops();

//   this.drawCars();
// }

// SalesMan.prototype.drawML = function() {

// };


// SalesMan.prototype.linkWHouses = function() {
//   var _this = this;
//   this.whouses.forEach(function (whouse) {
//     whouse.showLink();
//   });
// };


// SalesMan.prototype.linkShops = function() {
//   var _this = this;
//   this.shops.forEach(function (shop) {
//     shop.showLink();
//   });
// };