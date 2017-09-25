function WHouse(draw, vertex, cx, cy, color) {
  this.cx = vertex.pos[0];
  this.cy = vertex.pos[1];
  this.idx = vertex.idx;
  this.color = color;

  this.group = draw.group();
  this.w = 35;
  this.link = new AgentLine(this.group, cx, cy, vertex, this.color);
  // this.drawCircle(gridParams_SALESMAN.fill, '#f5da98', 1);
  // this.drawCircle(this.color, '#f5da98', 1);
  // this.drawCircle(this.color, this.color, 0.6);
  this.img = this.drawImg();
  // this.img = this.group.image(
  //   'https://www.shareicon.net/download/2016/04/04/744533_boxes.svg',
  //   30, 30).center(this.cx, this.cy - 2);
  // this.drawCircle(this.color, 0.15);
  // this.group.plain('W').font({
  //   'fill': this.color,
  //   'family': 'Rajdhani',
  //   'weight': 'bold',
  //   'size': '14px'
  // }).center(this.cx, this.cy);
};

WHouse.prototype.drawImg = function() {
  var img = this.group.image('dist/cars/storage.png', this.w, this.w);
  img.center(this.cx, this.cy);
  return img;
};

WHouse.prototype.drawCircle = function(stroke, fill, op) {
  var circle = this.group.rect().attr({
    'width': 20 * 2,
    'height': 20 * 2,
    'fill': fill,
    'fill-opacity': op,
    'stroke': stroke,
    'stroke-width': 2
  }).center(this.cx, this.cy);
  return circle;
};
// WHouse.prototype.drawCircle = function(stroke, fill, op) {
//   var circle = this.group.circle().attr({
//     'r': 20,
//     // 'fill': '#f8d27b',
//     'fill': fill,
//     'fill-opacity': op,
//     'stroke': stroke,
//     'stroke-width': 3
//   }).center(this.cx, this.cy);
//   return circle;
// };

WHouse.prototype.showLink = function() {
  var _this = this;
  this.link.show(function () {
    _this.link.opacity(0.25);
  });
};