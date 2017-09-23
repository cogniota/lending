 function Agent(draw, cx, cy, vertex, color, event, mlCloud) {
  this.vertex = Object.assign({}, vertex);
  this.mlCloud = mlCloud;

  this.color = color;

  this.group = draw.group();
  this.circle = new AgentCircle(this.group, vertex, color);
  this.circle.show();

  this.line = new AgentLine(this.group, cx, cy, vertex, color);
  this.line.show(event);

  this.text = new AgentText(this.group, this.line.array(), this.circle.r, color);
}

Agent.prototype.activate = function() {
  this.circle.activate();
  this.line.activate();
};

Agent.prototype.deactivate = function() {
  this.circle.deactivate();
  this.line.deactivate();
  this.text.colorize(this.color);
};

////////

Agent.prototype.sendRequest = function(event, animateCircle) {
  var _this = this;
  var distance = this.mlCloud.shadow.width() * 0.5;
  if (animateCircle) {
    this.circle.spinAround(function () {
      _this.line.activate();
      _this.text.sendRequest(event, distance);
    }, true);
  } else {
    this.text.sendRequest(event, distance);
  }
};


Agent.prototype.stopRequest = function(callback) {
  var distance = this.mlCloud.hex.width() * 0.5;
  this.text.stopRequest(callback);
};

// Agent.prototype.startContract = function(color) {
//   this.circle.colorize(color);
//   this.line.colorize(color);
//   this.text.colorize(color);
// };

Agent.prototype.receiveRequest = function(color, event) {
  var _this = this;

  setTimeout(function () {
    _this.circle.colorize(color);
    _this.line.colorize(color);
    _this.text.colorize(color);

    _this.text.receiveRequest(event);
    _this.line.fromCenter();
  }, 570);
};

Agent.prototype.sendResponse = function(event) {
  var _this = this;

  function callback () {
    _this.line.toCenter();
    _this.text.sendResponse(event, distance);
  }

  var distance = this.mlCloud.shadow.width() * 0.5;
  this.circle.spinAround(callback);
};

Agent.prototype.receiveResponse = function(event) {
  this.line.fromCenter();
  var _this = this;
  this.text.receiveResponse(function () {
    _this.circle.spinAround(event);
  });
};