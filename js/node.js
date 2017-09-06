var mlcolor = '#00fff5';
var mlCenter = [250, 150];
var qSpeed = 20;
var qStrokeSpeed = 60;

var defStroke = {
  'stroke-linecap': "round",
  'stroke-dasharray': "5,5",
  'stroke-width': 2
}
var requestStroke = {
  // 'stroke-linecap': "round",
  // 'stroke-dasharray': "5,10",
  'stroke-width': 4
};
var responseStroke = {
  // 'stroke-linecap': "butt",
  // 'stroke-dasharray': "20,5",
  'stroke-width': 4
};
var colors = [
  'rgb(255, 191, 0)',  // orange
  'rgb(0, 255, 191)', // blue
  'rgb(191, 255, 0)', // yellow
  'rgb(75, 255, 0)',  // green
  'rgb(255, 64, 255)', // purple
  'rgb(255, 0, 106)',  // red
];


function sumOfString(s) {
  return s.split(',').reduce(function(a, b) {return a+parseInt(b)}, 0);
}


function VertexNode(draw, vertex) {
  this.params = vertex;
  this.draw = draw;

  this.group = vertex.node = draw.group();

  this.group.center(vertex.pos[0], vertex.pos[1]);
  // this.group.text(this.params.idx + '');


  this.customerR = 21;
  this.d = this.customerR * 2 * 3.14;
  this.customerPath = getCirclePath(this.customerR);

  var endPos = mlCenter.slice();
  endPos[0] = endPos[0] - this.customerR;
  endPos[1] = endPos[1] - this.customerR;
  var startPos = this._getQLineStart(endPos);
  this.s = this._getQSpeed(startPos, endPos);
  this._setQdmove(startPos, endPos);
}

VertexNode.prototype.destroy = function() {
  var _this = this;
  this.destructible.forEach(function (elemName) {
    _this[elemName].remove && _this[elemName].remove();
    _this[elemName] = undefined;
  });
  this.destructible = [];

  _this.group.opacity(1).scale(1).center(_this.params.pos[0], _this.params.pos[1]);
};


VertexNode.prototype.activateML = function(neightbors, lineGroup) {
  var c = 0, r = 15;

  this.shadow = this.group.polygon().ngon({radius: r * 1.3, edges: 6})
                    .fill(mlcolor).center(c, c).opacity(0.3).scale(0.1);
  this.shadow.delay(200)
             .animate(300, 'backOut').scale(1).center(c, c).opacity(0.3);

  this.path = this.group.polygon().ngon({radius: 0.1, edges: 3})
                  .fill(mlcolor).center(c, c);
  this.path.animate(100).ngon({radius: r, edges: 3}).center(c, c)
           .animate(100).ngon({radius: r, edges: 4}).center(c, c)
           .animate(100).ngon({radius: r, edges: 5}).center(c, c)
           .animate(100).ngon({radius: r, edges: 6}).center(c, c);
};


VertexNode.prototype.toCloud = function() {
  var cx = 25, cy = 22;
  var _this = this;

  this.shadow.animate(250, '<>').ngon({radius: 42, edges: 8})
  this.path.animate(250, '<>').ngon({radius: 30, edges: 8}).center(cx, cy)

  this.group.animate(250, 'backIn').center(mlCenter[0], mlCenter[1]);

  if (this.params.main_ml) {
    setTimeout(function () {
      _this.logo = _this.group.image('dist/l2.png', 50, 50).center(cx, cy);
    }, 250);
  } else {
    this.group.animate(500).scale(1.5).opacity(0).center(250, 150);
  }
};


VertexNode.prototype._getQLineStart = function(endPos) {
  var tmpLine = this.draw.line(new SVG.PointArray([this.params.pos, endPos]));
  var tmpPath = this.draw.path(this.customerPath).center(this.params.pos[0], this.params.pos[1])
  var intersectPoint = tmpPath.intersectsLine(tmpLine)[0];
  var startPos = [intersectPoint.x, intersectPoint.y];
  tmpLine.remove();
  tmpPath.remove();

  return startPos;
};

VertexNode.prototype._setQdmove = function(startPos, endPos) {
  var dy = 0, dx = 0;
  if (this.params.idx == 2) {
    dx += 12;
  }
  else if (this.params.idx == 4) {
    dx -= 14;
    dy -= 2
  }
  else if (this.params.idx == 9) {
    dx -= 5;
    dy -= 10;
  }
  else if (this.params.idx == 12) {
    dx += 0;
    dy -= 11;
  }
  else if (this.params.idx == 18) {
    dx -= 5;
    dy -= 10;
  }
  else if (this.params.idx == 21) {
    dx -= 4;
    dy -= 14;
  }


  this.startPos = startPos;
  this.endPos = endPos;
  this.qtextStart = [startPos[0] + dx, startPos[1] + dy];
  this.qtextEnd = [endPos[0] + dx, endPos[1] + dy];
  this.qdmove = [dx, dy];
};

VertexNode.prototype._getQSpeed = function(startPos, endPos) {
  var l = SVGIntersections.lengthBetweenTwoPoints(startPos[0], startPos[1], endPos[0], endPos[1]);
  return l * qSpeed;
};

VertexNode.prototype._createQline = function(startPos, endPos) {
  var arr = new SVG.PointArray([startPos, startPos]);
  var qline = this.qlineGroup.line(arr);
  qline.attr({'stroke': this.color, 'stroke-dashoffset': 0});
  qline.attr(defStroke);

  arr.value[1] = endPos;

  qline.delay(500).animate(300, 'cubicIn').plot(arr);

  return qline;
};

VertexNode.prototype.activateBuyer = function(color) {
  this.color = color;

  this.path = this.group.path(this.customerPath).center(0, 0).attr({
    'stroke-dasharray': this.d + ' ' + this.d,
    'stroke-dashoffset': this.d + 'px',
    'fill': this.color,
    'fill-opacity': 0,
    'stroke': this.color,
    'stroke-width': 1
  });
  this.path.animate(1500, '>').attr({'stroke-dashoffset': 0});

  this.qlineGroup = this.draw.group();
  this.qlineGroup.back();

  this.qtext = this.qlineGroup.plain('?').fill(this.color).hide();

  this.qline = this._createQline(this.startPos, this.endPos);
  this.lineToCenter(null, null, true);
};


VertexNode.prototype.lineToCenter = function(attr, i, skipFinish) {
  var i = i || -1;
  var s = attr && attr['stroke-dasharray'] || this.qline.attr('stroke-dasharray');
  var d = sumOfString(s);

  if (!skipFinish) {
    this.qline.finish();
  }
  if (attr) {
    this.qline.attr({'stroke-dashoffset': 0}).animate(attr['t']).attr(attr);
  }
  this.qline.animate(d * qStrokeSpeed).attr({'stroke-dashoffset': d * i}).loop();
};

VertexNode.prototype.lineFromCenter = function(attr) {
  this.lineToCenter(attr, 1);
};

VertexNode.prototype.sendRequest = function() {
  this.activateAgent(requestStroke);
  // this.lineToCenter(requestStroke);

  var _this = this;
  this.qtext.plain('?').center(this.qtextStart[0], this.qtextStart[1]);
  setTimeout(function () {
    _this.qtext.show()
               .animate(_this.s, '>').center(_this.qtextEnd[0], _this.qtextEnd[1]).loop();
  }, 400);
};

VertexNode.prototype.recolor = function(color, lineFn) {
  this[lineFn]({'stroke': color});
  this.qtext.animate(100).fill(color);
  this.path.animate().attr({'stroke': color, 'fill': color});
};

VertexNode.prototype.receiveRequest = function(main, customer) {
  var _this = this;
  var params = Object.assign({}, requestStroke);
  this.lineFromCenter(params);

  this.qtext.show().plain('?')
            .center(this.qtextEnd[0], this.qtextEnd[1]);
  this.recolor(customer.color, 'lineFromCenter');

  customer.stopRequest();

  var oneBodyTime = this.qtext.node.getBBox().width * qSpeed;
  this.qtext.animate(this.s, '>').center(this.qtextStart[0], this.qtextStart[1]);
  setTimeout(function () {
    _this.qtext.hide();
  }, this.s - oneBodyTime);

  this.spinAround(function () {
    _this.sendResponse(main, customer);
  });

};


VertexNode.prototype.stopRequest = function() {
  this.qtext.stop().hide();
};

VertexNode.prototype.spinAround = function(callback) {
  if (this.params.main_ml) {
    var reversed = callback ? 1 : -1;
    this.group.animate(300, 'expoIn').rotate(140 * reversed).loop(2, true);
  } else {
    var _this = this;
    var oneBodyTime = this.qtext.node.getBBox().width * qSpeed;
    var t = this.s - oneBodyTime, t1 = 400, t2 = 400;
    this.path.delay(t);
    this.path.animate(t1, '>').attr({'stroke-dashoffset': this.d * -1 + 'px'});
    this.path.animate(t2, '>').attr({'stroke-dashoffset': this.d * -2 + 'px'});
    setTimeout(function () {
      _this.path.attr({'stroke-dashoffset': 0});
      callback();
    }, t + t1 + t2);
  }
};


VertexNode.prototype.receiveResponse = function() {
  var _this = this;
  this.lineFromCenter(responseStroke);

  this.qtext.stop().show().plain('!')
            .center(this.qtextEnd[0], this.qtextEnd[1])
            .animate(this.s, '>').center(this.qtextStart[0], this.qtextStart[1]);

  setTimeout(function () {
    _this.stopRequest();
  }, this.s);

  this.spinAround(function () {
      _this.deactivateAgent();
  });

};

VertexNode.prototype.sendResponse = function(main, customer) {
  var _this = this;
  customer.stopRequest();
  this.lineToCenter(responseStroke);
  this.qtext.stop().show().plain('!')
            .center(this.qtextStart[0], this.qtextStart[1])
            .animate(this.s, '>').center(this.qtextEnd[0], this.qtextEnd[1]);

  setTimeout(function () {
    _this.deactivateAgent();
    main.spinAround(true);
    customer.receiveResponse();
  }, this.s);
};


VertexNode.prototype.deactivateAgent = function() {
  this.path.animate(300).scale(1)
                        .attr({
                          'fill-opacity': 0,
                          'fill': this.color,
                          'stroke-width': 1,
                          'stroke': this.color
                        });
  this.qtext.fill(this.color);
  var params = Object.assign({}, defStroke);
  params['stroke'] = this.color;
  this.lineToCenter(params);
};

VertexNode.prototype.activateAgent = function(params) {
  params = Object.assign({}, params || {});
  params.t = 300;

  this.path.animate(300, '>').scale(1.1)
                             .attr({
                              'fill-opacity': 0.3,
                              'stroke-width': 2
                            });
  this.lineToCenter(params);
};

VertexNode.prototype.findProvider = function(customer, providers) {
  var _this = this;

  var pathTime = this.path.width() * qSpeed,
      at = 100;

  this.shadow.animate(at).fill(customer.color);
  this.path.animate(at).fill(customer.color);

  var t = at, tstep = 500;

  providers.forEach(function (node, i) {
    t += tstep;

    setTimeout(function () {
      _this.shadow.stop().animate(70).fill(node.color);
      _this.path.stop().animate(70).fill(node.color);

      node.activateAgent();

      if (i > 0) {
        var prev = providers[i - 1];
        prev.deactivateAgent();
      }

      if (i == providers.length - 1) {
        var diff = t % customer.s - pathTime;
        setTimeout(function () {
          _this.chooseProvider(customer, node, tstep);
        }, diff);
      }

    }, t);
  });
};

VertexNode.prototype.chooseProvider = function(customer, provider, tstep) {
  this.spinAround();
  this.shadow.delay(tstep).animate(70).fill(mlcolor);
  this.path.delay(tstep).animate(70).fill(mlcolor);

  // customer.stopRequest();
  provider.receiveRequest(this, customer);
};