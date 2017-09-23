function WHouse(draw, vertex, cx, cy, color) {
  this.cx = vertex.pos[0];
  this.cy = vertex.pos[1];
  this.color = color;

  this.group = draw.group();
  this.link = new AgentLine(this.group, cx, cy, vertex, this.color);
  // this.drawCircle(gridParams_SALESMAN.fill, '#f5da98', 1);
  this.drawCircle(this.color, '#f5da98', 1);
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
  var img = this.group.group();
  img.opacity(0.65);
  // img.fill(this.color);
  img.path("M475,355h-15V200c0-8.284-6.716-15-15-15h-85V30c0-8.284-6.716-15-15-15H145c-8.284,0-15,6.716-15,15v155 H45c-8.284,0-15,6.716-15,15v155H15c-8.284,0-15,6.716-15,15v90c0,8.284,6.716,15,15,15h60c8.284,0,15-6.716,15-15v-15h110v15 c0,8.284,6.716,15,15,15h60c8.284,0,15-6.716,15-15v-15h110v15c0,8.284,6.716,15,15,15h60c8.284,0,15-6.716,15-15v-90 C490,361.716,483.284,355,475,355z M430,215v140H260V215H430z M160,45h170v140H160V45z M60,215h170v140H60V215z M460,445h-30v-15 c0-8.284-6.716-15-15-15H275c-8.284,0-15,6.716-15,15v15h-30v-15c0-8.284-6.716-15-15-15H75c-8.284,0-15,6.716-15,15v15H30v-60h430 V445z");
  img.center(this.cx, this.cy - 16);
  img.scale(0.055);
  return img;
};

// WHouse.prototype.drawCircle = function(color, op) {
//   var circle = this.group.rect().attr({
//     'width': 9 * 2,
//     'height': 9 * 2,
//     'fill': color,
//     'fill-opacity': op,
//     'stroke': color,
//     'stroke-width': 2
//   }).center(this.cx, this.cy);
//   return circle;
// };
WHouse.prototype.drawCircle = function(stroke, fill, op) {
  var circle = this.group.circle().attr({
    'r': 20,
    // 'fill': '#f8d27b',
    'fill': fill,
    'fill-opacity': op,
    'stroke': stroke,
    'stroke-width': 3
  }).center(this.cx, this.cy);
  return circle;
};

WHouse.prototype.showLink = function() {
  var _this = this;
  this.link.show(function () {
    _this.link.opacity(0.25);
  });
};