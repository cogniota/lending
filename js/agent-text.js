function AgentText(draw, positions, r, color) {
  this.d = 10;
  this.speed = 15;

  this.r = r;
  this.color = color;

  this.params = {
    'fill': this.color
  };

  this.elem = this.draw(draw, positions);
}

AgentText.prototype.draw = function(draw, positions) {
  var x1 = positions[0],
      y1 = positions[1],
      x2 = positions[2],
      y2 = positions[3];
  var d = this.d * (x1 > x2 ? 1 : -1);
  var L = SVGIntersections.lengthBetweenTwoPoints(x1, y1, x2, y2);
  var cosA = (x2 - x1) / L,
      sinA = (y2 - y1) / L;
  var dx = d * sinA,
      dy = d * cosA;

  this.start = [x1 - dx, y1 + dy];
  this.end = [x2 - dx, y2 + dy];

  this.length = L;
  this.time = this.length * this.speed;

  // draw.line(new SVG.PointArray([this.start, this.end])).stroke('yellow');
  var text = draw.plain('').attr(this.params).opacity(0).center(0, 0);

  return text;
};

AgentText.prototype.colorize = function(color) {
  this.elem.fill(color);
};

AgentText.prototype.move = function(params, event) {
  var d = this.r / this.length;
  var d1 = this.elem.node.getBBox().width / this.length;

  var eventPos = 1 - d - d1;

  var k = 10 / (d + d1);

  var start = params.toCenter ? this.start : this.end;
  var end = params.toCenter ? this.end : this.start;
  this.toCenter = params.toCenter;

  if (this.inLoop) {
    this.elem.stop();
  }

  if (params.text) {
    this.elem.plain(params.text);
  }
  if (params.color) {
    this.elem.fill(params.color);
  }
  this.elem.center(start[0], start[1]).opacity(0);


  // var n = params.isLoop ? undefined : 1;
  // this.inLoop = params.isLoop;

  function getOpacity(pos) {
    if (params.toCenter && pos > d) return 1; //Math.log10(pos * k);
    if (!params.toCenter && pos < (1 - d)) return 1; //Math.log10((1 - pos) * k);
    return 0;
  }
  this.elem.animate(this.time).center(end[0], end[1])
           // .loop(n)
           .during(function(pos, morph, eased, situation) {
    var o = getOpacity(pos)
    this.opacity(o);
    if (event && pos > eventPos) {
      event();
      event = undefined;
    }
  });
};

AgentText.prototype.toCenterTimeout = function(event, d) {
  var shadowTime = d * this.speed,
      oneBodyTime = this.elem.node.getBBox().width * this.speed;

  var t = this.time - shadowTime - oneBodyTime;
  var _this = this;
  setTimeout(function () {
    event(_this.time);
  }, t);
};

AgentText.prototype.sendRequest = function(event, d) {
  this.move({isLoop: true, toCenter: true, text: '?'}, event);

  // this.toCenterTimeout(event, d, true);
};

// AgentText.prototype.stopRequest = function(callback, d) {
//   var x = this.end[0] - d;
//   var y = this.end[1] - d;

//   var end = this.end, start = this.start;

//   function isSent(animations) {
//     var x = animations.cx[0].value;
//     var y = animations.cy[0].value;

//     if (end[0] > start[0] && x < (end[0] - d)) return false;
//     if (end[1] > start[1] && y < (end[1] - d)) return false;
//     if (end[0] < start[0] && x > (end[0] + d)) return false;
//     if (end[1] < start[1] && y > (end[1] + d)) return false;

//     return true;
//   }

//   while (!isSent(this.elem.fx.situation.animations)) {
//     // white
//   }

//   this.elem.finish().hide();
//   this.elem.inLoop = false;
//   callback();
// };

AgentText.prototype.receiveRequest = function(event) {
  this.move({text: '?'}, event);
};

AgentText.prototype.sendResponse = function(event, d) {
  this.move({toCenter: true, text: '!'}, event);

  // this.toCenterTimeout(event, d);
};

AgentText.prototype.receiveResponse = function(event) {
  this.move({text: '!'}, event);
};