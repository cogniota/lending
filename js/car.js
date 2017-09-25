 function Car(draw, vertex, grid, color, elements) {
  this.grid = grid;
  this.w = 33;
  this.color = color;
  this.elements = elements;

  this.currentVertexIdx = vertex.idx;
  this.group = draw.group()
                   .width(this.w).height(this.w)
                   .center(vertex.pos[0] -this.w/2, vertex.pos[1]-this.w/2);

  this.img = this.drawCar(draw);
  this.go(vertex.neightbors[0]);
}

Car.prototype.drawCar = function(draw) {
  var img = this.group.image('dist/cars/2.png', this.w, this.w);
  img.center(this.w / 2, this.w / 2);
  return img;
};

// Car.prototype.drawCircle = function(stroke, fill, op) {
//   var circle = this.group.circle();
//   var cx = this.w / 2
//   var cy = this.w / 2
//   // var cy = cx - 5;
//   // var circle = this.group.polygon().ngon({
//   //   radius: 30,
//   //   edges: 3
//   // });
//   circle.attr({
//     // 'r': 17,
//     // 'fill': '#f8d27b',
//     'fill': fill,
//     'fill-opacity': op,
//     'stroke': stroke,
//     'stroke-width': 3
//   }).center(cx, cy);
//   return circle;
// };

Car.prototype.go = function(nextId) {
  var vertex = this.grid.vertexes[nextId];
  var _this = this;
  if (vertex.pos[0] < this.group.cx() && !this.reversed) {
    this.img.addClass('flipped');
  } else if (this.img.hasClass('flipped')) {
    this.img.removeClass('flipped')
  }
  this.group.animate(3000).center(vertex.pos[0], vertex.pos[1]).once(1, function (pos) {
    _this.go(vertex.neightbors[0]);
  });
};