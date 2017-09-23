function createSalesMan() {
  var parent = document.querySelector('#secondPage .main');
  // var bounds = parent.getBoundingClientRect();
  var svgId = parent.getAttribute('id');
  var salesman = new SalesMan(svgId);
}


function SalesMan(svgId, bounds) {
  this.svgId = svgId;
  // this.bounds = bounds;

  this.createSVG();
  this.drawML();
  this.drawWHouses();
  this.linkWHouses();
  this.drawShops();
  this.linkShops();

  this.drawCars();
}

SalesMan.prototype.createSVG = function() {
  this.draw = SVG(this.svgId);
  this.graph = new Graph(this.draw, VERTEXES_SALESMAN, gridParams_SALESMAN);

  var greenGroup = this.draw.group();
  greens_SALESMAN.forEach(function (d) {
    greenGroup.path(d).fill('#d0e7ae');
  });
  fountains_SALESMAN.forEach(function (pos) {
    greenGroup.image('https://www.shareicon.net/download/2016/06/07/777008_garden.svg', 24, 24)
              .center(pos[0], pos[1]).opacity(0.25);
  });

  greenGroup.image('https://www.shareicon.net/download/2016/05/31/773385_tree.svg', 30, 30)
              .center(290, 55).opacity(0.4);
  greenGroup.image('https://www.shareicon.net/download/2016/05/31/773393_tree.svg', 30, 30)
              .center(325, 165).opacity(0.4);
  greenGroup.image('https://www.shareicon.net/download/2016/05/30/773368_tree.svg', 30, 30)
              .center(360, 245).opacity(0.4);
  greenGroup.image('https://www.shareicon.net/download/2016/01/28/710377_oriental.svg', 35, 35)
              .center(400, 257).opacity(0.25);
  greenGroup.image('https://www.shareicon.net/download/2016/05/31/773373_tree.svg', 30, 30)
              .center(60, 160).opacity(0.4);
  greenGroup.image('https://www.shareicon.net/download/2016/01/28/710253_art.svg', 35, 35)
              .center(160, 295).opacity(0.25);
  greenGroup.image('https://www.shareicon.net/download/2016/05/31/773371_tree.svg', 30, 30)
              .center(110, 330).opacity(0.4);
};

SalesMan.prototype.drawML = function() {
  this.mlCloud = new MLCloud(this.draw, 250, 192.5);
  this.mlCloud.show();
};

SalesMan.prototype.drawWHouses = function() {
  this.whouses = [];
  var whousesGroup = this.draw.group();
  this.mlCloud.group.before(whousesGroup);

  var _this = this;
  VERTEXES_SALESMAN.forEach(function (vertex, i) {
    if (whouses_SALESMAN.indexOf(vertex.idx) > -1) {
      // var isLast = (_this.whouses.length + 1) == whouses_SALESMAN.length;
      var color = whouses_colors_SALESMAN[_this.whouses.length];
      var whouse = new WHouse(whousesGroup, vertex, _this.mlCloud.cx, _this.mlCloud.cy, color);
      _this.whouses.push(whouse);
    }
  });
};

SalesMan.prototype.linkWHouses = function() {
  var _this = this;
  this.whouses.forEach(function (whouse) {
    whouse.showLink();
  });
};


SalesMan.prototype.drawShops = function() {
  this.shops = [];
  var shopsGroup = this.draw.group();
  this.mlCloud.group.before(shopsGroup);

  var _this = this;
  VERTEXES_SALESMAN.forEach(function (vertex, i) {
    if (shops_SALESMAN.indexOf(vertex.idx) > -1) {
      // var isLast = (_this.whouses.length + 1) == whouses_SALESMAN.length;
      var color = shops_colors_SALESMAN[_this.shops.length];
      var shop = new Shop(shopsGroup, vertex, _this.mlCloud.cx, _this.mlCloud.cy, color);
      _this.shops.push(shop);
    }
  });
};

SalesMan.prototype.linkShops = function() {
  var _this = this;
  this.shops.forEach(function (shop) {
    shop.showLink();
  });
};

SalesMan.prototype.drawCars = function() {
  this.cars = [];
  var carsGroup = this.draw.group();

  var _this = this;
  var cars_SALESMAN = Random.shuffle(VERTEXES_SALESMAN).slice(0, 3);
  // var cars_SALESMAN = [VERTEXES_SALESMAN[1]];
  cars_SALESMAN.forEach(function (vertex, i) {
    var color = cars_color_SALESMAN[i];
    var car = new Car(carsGroup, vertex, _this.graph, color);
    _this.cars.push(car);
  });
};