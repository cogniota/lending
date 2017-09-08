function MLCloud(draw) {
  this.group = draw.group();
  this.group.backward();

  this.params = Object.assign({}, mlNodeCloudParams);
  this.cx = this.params.cx;
  this.cy = this.params.cy;

  this.group.opacity(0).center(this.cx, this.cy);

  this.shadow = this.drawShadow();
  this.hex = this.drawHex();

  this.tmp = this.drawHex().scale(0.01).center(0, 0);

  this.logo = this.drawLogo();
}

MLCloud.prototype.drawShadow = function() {
  var shadow = this.group.polygon().ngon({
    radius: this.params.r * this.params.shadowK,
    edges: this.params.edges
  });
  shadow.fill(this.params.color).opacity(this.params.shadowOpacity);
  shadow.center(0, 0);
  return shadow;
};

MLCloud.prototype.drawHex = function() {
  var hex = this.group.polygon().ngon({
    radius: this.params.r,
    edges: this.params.edges
  });
  hex.fill(this.params.color).center(0, 0);
  return hex;
};

MLCloud.prototype.drawLogo = function() {
  var logo = this.group.image(this.params.logoPath, this.params.logoW, this.params.logoW);
  logo.center(0, 0);
  return logo;
};

MLCloud.prototype.show = function(event) {
  this.group.opacity(1).forward();
};

MLCloud.prototype.ding = function(event, reversed) {
  var t = 300;
  this.group.animate(t, 'expoIn').rotate(140 * (reversed ? 1 : -1)).loop(2, true);
  setTimeout(function () {
    event();
  }, t * 2);
};

MLCloud.prototype.findSolution = function(customer, event) {
  var t1 = 200, d1 = 350, t2 = 180, color = customer.color;
  var _this = this;

  // function callback() {
    _this.shadow.animate(t1).fill(color);
    _this.hex.fill(color);
    _this.tmp.scale(1).center(0, 0);
    _this.tmp.delay(t1 + d1).once(1, function () {
     _this.ding(event);
    }).animate(t2).scale(0.01).center(0, 0);
  // }

  // customer.stopRequest(callback);

};

MLCloud.prototype.fallOutColor = function(event) {
  var d1 = 420, t1 = 150, d2 = 200, t2 = 70;

  var _this = this, color = this.params.color;
  this.tmp.delay(d1).fill(color).animate(t1).scale(1).center(0, 0);
  this.shadow.delay(d1 + t1 + d2).animate(t2).fill(color).once(1, function () {
    _this.tmp.fill(color).scale(0.01).center(0, 0);
    _this.hex.fill(color);
    event();
  });
};

MLCloud.prototype.testProvider = function(color) {
  this.shadow.animate(200, '>').fill(color).opacity(0.6);
  this.shadow.delay(100).animate(200).opacity(this.params.shadowOpacity);
  // this.hex.animate(200).fill(color).loop(2, true);
};

MLCloud.prototype.chooseProvider = function(color, event) {
  this.shadow.animate(100).fill(color);

  this.ding(function(){});
};

MLCloud.prototype.receiveResponse = function(event) {
  var _this = this;
  this.ding(function() {
    _this.fallOutColor(event);
  }, true);
};
