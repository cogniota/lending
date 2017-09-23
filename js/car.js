function Car(draw, vertex, grid, color) {
  this.grid = grid;
  this.w = 40;
  this.color = color;

  this.currentVertexIdx = vertex.idx;
  this.group = draw.group().center(vertex.pos[0] - this.w / 2, vertex.pos[1] - this.w / 2);

  // this.drawCircle(gridParams_SALESMAN.fill, '#f5da98', 1);
  this.drawCircle(this.color, '#f5da98', 1);
  // this.drawCircle(this.color, this.color, 1);
  this.img = this.drawCar('black', 0.65);
  // this.drawCar(this.color, 0.5)
  // var path = [];
  // for (var i = 0; i < 1; i++) {
  //   var nextId = Random.choice(vertex.neightbors);
  //   var vertex = this.grid.vertexes[nextId];
  //   path.push(vertex);
  //   console.log(vertex.pos)
  // }
  // var _this = this;
  // path.forEach(function (vertex) {
  //   console.log(vertex.pos)
  //   _this.group.animate(3000).center(vertex.pos[0], vertex.pos[1])
  // });
  // this.go(Random.choice(vertex.neightbors));
}

Car.prototype.drawCar = function() {
  // var img = this.group.image('dist/cars/electricity.svg', 30, 30);
  // img.center(this.w / 2, this.w / 2);
  // return img;
  var car = this.group.group();
  car.opacity(0.65);
  // car.fill(color);
  // car.attr({'stroke': 'white', 'stroke-width': '3px'});
  car.path("M264.719,145.282l-6.709-48.631c-5.274-38.25-38.184-67.118-76.712-67.516v20.204 c28.505,0.397,52.825,21.753,56.737,50.068l5.822,42.221c-4.566-0.144,12.15-0.105-74.792-0.105 c-18.292,32.607-17.683,32.837-22.051,35.357c-9.406,5.414-20.508-1.961-20.508-11.839v-23.519c0,0-63.808,0.079-64.605,0.105 l5.822-42.221c3.932-28.49,28.521-49.974,57.25-50.118l11.994-20.19h-11.709c-38.877,0-72.199,29.039-77.509,67.552l-6.708,48.631 C17.039,153.244,0,173.11,0,196.424c0,25.727,20.743,47.257,48.7,53.214v26.082c0,15.243,12.356,27.6,27.6,27.6 c15.248,0,27.604-12.356,27.604-27.6V251.33h97.953v24.391c0,15.243,12.357,27.6,27.6,27.6c15.248,0,27.604-12.356,27.604-27.6 v-26.082c27.958-5.957,48.695-27.486,48.695-53.214C305.755,173.115,288.715,153.244,264.719,145.282z M36.338,179.355 c15.423-12.393,37.23-0.725,37.23,17.801c0,12.666-10.266,22.933-22.932,22.933C29.145,220.089,19.376,193.006,36.338,179.355z M255.124,220.089c-12.665,0-22.932-10.267-22.932-22.933c0-0.035,0.011-0.074,0.011-0.108 c0.094-18.65,22.001-29.922,37.219-17.692c5.226,4.205,8.634,10.575,8.634,17.801C278.056,209.822,267.789,220.089,255.124,220.089 z");
  car.path("M116.326,88.838c0.328,0.572,0.94,0.932,1.603,0.932h20.413v75.273c0,0.841,0.567,1.572,1.379,1.787 c0.154,0.039,0.309,0.06,0.463,0.06c0.657,0,1.279-0.349,1.612-0.94l49.78-88.727c0.323-0.572,0.313-1.269-0.015-1.836 c-0.334-0.563-0.936-0.911-1.592-0.911h-20.503V4.277c0-0.831-0.557-1.557-1.355-1.776c-0.159-0.045-0.323-0.065-0.487-0.065 c-0.637,0-1.249,0.334-1.587,0.901l-49.691,83.645C116.006,87.554,115.997,88.26,116.326,88.838z");
  car.center(this.w / 2, this.w / 2 - 3);
  car.scale(0.1);
  return car;
};

Car.prototype.drawCircle = function(stroke, fill, op) {
  var circle = this.group.circle().attr({
    'r': 20,
    // 'fill': '#f8d27b',
    'fill': fill,
    'fill-opacity': op,
    'stroke': stroke,
    'stroke-width': 3
  }).center(this.w / 2, this.w / 2);
  return circle;
};

Car.prototype.go = function(nextId) {
  var vertex = this.grid.vertexes[nextId];
  var _this = this;
  this.group.animate(3000, '<>').center(vertex.pos[0], vertex.pos[1]).once(1, function () {
    _this.go(Random.choice(vertex.neightbors));
  });
};