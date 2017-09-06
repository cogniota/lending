// var VERTEXES = [
//   {index: 1, pos: [25, 25]},
//   {index: 2, pos: [85, 30]},
//   {index: 3, pos: [185, 45]},
//   {index: 4, pos: [325, 30]},
//   {index: 5, pos: [475, 15]},

//   {index: 6, pos: [25, 120]},
//   {index: 7, pos: [115, 100]},
//   {index: 8, pos: [250, 120]},
//   {index: 9, pos: [330, 90]},
//   {index: 10, pos: [450, 90]},

//   {index: 11, pos: [25, 180]},
//   {index: 12, pos: [125, 195]},
//   {index: 13, pos: [175, 160]},
//   {index: 14, pos: [290, 180]},
//   {index: 15, pos: [375, 135]},
//   {index: 16, pos: [450, 195]},

//   {index: 17, pos: [25, 270]},
//   {index: 18, pos: [120, 270]},
//   {index: 19, pos: [190, 275]},
//   {index: 20, pos: [265, 245]},
//   {index: 21, pos: [350, 270]},
// ];
var VERTEXES = [
  {idx: 1, neightbors: [2, 6, 7], pos: [25, 25]},
  {idx: 2, neightbors: [3, 6], pos: [137, 25], is_ml: true, is_customer: true},
  {idx: 3, neightbors: [4, 7, 8], pos: [255, 25]},
  {idx: 4, neightbors: [5, 8], pos: [361, 25], is_ml: true, is_customer: true},
  {idx: 5, neightbors: [9, 10], pos: [475, 25]},

  {idx: 6, neightbors: [11, 12], pos: [25, 108], is_ml: true, main_ml: true},
  {idx: 7, neightbors: [13], pos: [137, 108]},
  {idx: 8, neightbors: [9, 13], pos: [255, 108]},
  {idx: 9, neightbors: [14, 20], pos: [361, 108], is_ml: true, is_customer: true},
  {idx: 10, neightbors: [15], pos: [475, 108]},

  {idx: 11, neightbors: [12, 18], pos: [25, 192]},
  {idx: 12, neightbors: [13, 17, 18], pos: [97, 192], is_customer: true},
  {idx: 13, neightbors: [14, 19], pos: [170, 192]},
  {idx: 14, neightbors: [15], pos: [242, 192]},
  {idx: 15, neightbors: [16], pos: [313, 192]},
  {idx: 16, neightbors: [20, 21], pos: [475, 192]},

  {idx: 17, neightbors: [18], pos: [25, 275]},
  {idx: 18, neightbors: [19], pos: [137, 275], is_ml: true, is_customer: true},
  {idx: 19, neightbors: [20], pos: [255, 275]},
  {idx: 20, neightbors: [21], pos: [361, 275]},
  {idx: 21, neightbors: [], pos: [475, 275], is_ml: true, is_customer: true},
];

function Graph(draw, bound, r) {
  this.edgeGroup = draw.group();
  this.vertexesDefGroup = draw.group();
  this.vertexesGroup = draw.group();

  this.vertexesList = VERTEXES;
  this.vertexes = this.vertexesList.reduce(function (bucket, v) {
    bucket[v.idx] = v;
    return bucket;
  }, {});

  var color = '#14753d';
  // var color = '#165749';

  for (var idx in this.vertexes) {
    var vertex = this.vertexes[idx];
    vertex.pos[0] = Random.deviate(vertex.pos[0], 15);
    vertex.pos[1] = Random.deviate(vertex.pos[1], 15);

    var defPath = getCirclePath(12);
    vertex.defNode = this.vertexesDefGroup.path(defPath).fill(color).center(vertex.pos[0], vertex.pos[1]);
  }

  for (var idx in this.vertexes) {
    var vertex = this.vertexes[idx];
    for (var i = 0; i < vertex.neightbors.length; i++) {
      var neightborIdx = vertex.neightbors[i];
      if (neightborIdx > idx) {
        var neightbor = this.vertexes[neightborIdx];
        var arr = new SVG.PointArray([vertex.pos, neightbor.pos]);
        var edge = this.edgeGroup.line(arr).stroke({color: color});
      }
    }
  }
}


function getCirclePath(r) {
  var a = r / 4, b = a * 2, c = a * 3;
  return 'M' + b + ' 0 ' +
         'C' + c + ' 0 ' + r + ' ' + a + ' ' + r + ' ' + b + ' ' +
         'C' + r + ' ' + c + ' ' + c + ' ' + r + ' ' + b + ' ' + r + ' ' +
         'C' + a + ' ' + r + ' 0 ' + c + ' 0 ' + b + ' ' +
         'C0 ' + a + ' ' + a + ' 0 ' + b + ' 0 Z';
};

function getCircle3QPath(r) {
  var a = r / 4, b = a * 2, c = a * 3;
  return 'M' + b + ' 0 ' +
         'C' + c + ' 0 ' + r + ' ' + a + ' ' + r + ' ' + b + ' ' +
         'C' + r + ' ' + c + ' ' + c + ' ' + r + ' ' + b + ' ' + r + ' ' +
         'C' + a + ' ' + r + ' 0 ' + c + ' 0 ' + b + ' ';
};


function getCircleHPath(r) {
  var a = r / 4, b = a * 2, c = a * 3;
  return 'M' + b + ' 0 ' +
         'C' + c + ' 0 ' + r + ' ' + a + ' ' + r + ' ' + b + ' ' +
         'C' + r + ' ' + c + ' ' + c + ' ' + r + ' ' + b + ' ' + r + ' ';
};

function getCircleQPath(r) {
  var a = r / 4, b = a * 2, c = a * 3;
  return 'M' + b + ' 0 ' +
         'C' + c + ' 0 ' + r + ' ' + a + ' ' + r + ' ' + b + ' ';
};


function getHexPath(s) { //side
  var a = r * 0.86602, b = a / 2, c = a + b, d = a * -1, e = b * -1, f = r * -1;
  // return 'M ' + c + ' 0' +
  //       ' l ' + a + ' ' + b +
  //       ' v ' + r +
  //       ' l ' + d + ' ' + b +
  //       ' l ' + d + ' ' + e +
  //       ' v ' + f + ' z';
  return 'M 0 0 l 86.602 50 v 100 l -86.602 50 l -86.603 -50 v -100 z'
}



function getOxoPath(s) { //side
  var a = s * 2, b = s /2, c = s * -1, d = b * -1;
  return 'M ' + a + ' ' + 0 +
        ' h ' + s +
        ' l ' + b + ' ' + b +
        ' v ' + s +
        ' l ' + d + ' ' + b +
        ' h ' + c +
        ' l ' + d + ' ' + d +
        ' v ' + c + ' z';
}


// 30 51.96152422706631
// 100 0.86602

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
var Random = {
  range: function range(min, max) {
    return Math.round(Math.random() * (max - min) + min);
  },
  choice: function choice(arr) {
    var max = arr.length;
    if (max === void 0) {
      arr = Object.keys(arr);
      max = arr.length;
    }
    var n = this.range(0, max - 1);
    return arr[n];
  },
  shuffle: function shuffle(_a) {
    var a = _a.slice();
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
    return a;
  },
  deviate: function deviate(i, d) {
    var a = this.range(d * -1, d);
    return i + a;
  }
};



var maxR = 20;

function createTangle(parent) {
  var svg = document.createElement('svg');
  var svgId = 'svg-' + document.getElementsByTagName('div').length;
  svg.setAttribute('id', svgId);
  parent.appendChild(svg);

  var bounds = parent.getBoundingClientRect();
  var tangle = new Tangle(svgId, bounds);
}


function Tangle(svgId, bounds) {
  this.svgId = svgId;
  this.bounds = bounds;

  this.createSVG();
}


Tangle.prototype.setTimeout = function(method, t) {
  var _this = this;
  setTimeout(function () {
    _this[method]();
  }, t);
};

Tangle.prototype.highlightDes = function(idx) {
  this.descriptionList.forEach(function (li, n) {
    if (n == idx) {
      li.className = 'active';
    } else {
      li.className = '';
    }
  });
};


Tangle.prototype.createSVG = function() {
  this.draw = SVG(this.svgId);

  this.rootGroup = this.draw.group();
  this.graph = new Graph(this.rootGroup, this.bounds, maxR);

  this.mlhosts = VERTEXES.filter(function (v) {return v.is_ml;});
  this.customers = VERTEXES.filter(function (v) {return v.is_customer;});

  var mlhostGroup = this.rootGroup.group();
  this.mlhosts.forEach(function(v) {
    v.node = new VertexNode(mlhostGroup, v);
  });
  this.cognNode = this.mlhosts.find(function (v) {return v.main_ml;}).node;


  this.descriptionList = document.querySelectorAll('#protocolDescription ol li');
  // this.descriptionList.forEach(function (li) {
  //   li.className = 'active';
  // });
  this.N = 0;
  this.createMLNodes();
  // this.createCustomers();
};

Tangle.prototype.createMLNodes = function(nextStep) {
  var nextStep = 'nodesToCluster';
  var desIdx = 0;
  this.highlightDes(desIdx);

  var t = 0;
  this.mlhosts.forEach(function (vertex, i) {
    setTimeout(function () {
      vertex.node.activateML();
    }, t);
    t += 500;
  });

  this.setTimeout(nextStep, 3000);
};

Tangle.prototype.nodesToCluster = function() {
  var nextStep = 'createCustomers';
  // var nextStep = 'destroyScheme';
  var desIdx = 1;
  this.highlightDes(desIdx);

  var lineGroup = this.rootGroup.group();
  var _this = this;

  function createLine(s, e) {
    var l = lineGroup.line(new SVG.PointArray([s.pos, s.pos]));
    l.attr({stroke: mlcolor, opacity: 0.3, 'stroke-width': 1.5});

    var end = [];
    end[0] = s.pos[0] - ((s.pos[0] - e.pos[0]) / 2);
    end[1] = s.pos[1] - ((s.pos[1] - e.pos[1]) / 2);
    l.animate(150, 'sineOut').plot(new SVG.PointArray([s.pos, end]));

    l.delay(25).animate(180, 'sineOut').attr({opacity: 1});
    l.animate(200, 'sineIn').attr({opacity: 0.7});
  }

  this.mlhosts.forEach(function (vertex, i) {
    var neightbors = _this.mlhosts.slice(0, i);
    neightbors.forEach(function (nVertex) {
      createLine(vertex, nVertex);
      createLine(nVertex, vertex);
    });
  });

  var t = (150 + 25 + 200) + 600;
  setTimeout(function () {
    _this.mlhosts.forEach(function (vertex) {
      vertex.node.toCloud();
    });
    lineGroup.animate(100).opacity(0)
    setTimeout(function () {
      lineGroup.remove();
    }, 100);

    _this.N = 0;
    colors = Random.shuffle(colors);
    _this.setTimeout(nextStep, 1000);
  }, t);
};

Tangle.prototype.createCustomers = function() {
  var nextStep = 'customerSendRequest';
  var desIdx = 2;

  this.highlightDes(desIdx);

  var customersGroup = this.rootGroup.group();
  customersGroup.backward();
  this.customers.forEach(function (vertex, i) {
    vertex.node && vertex.node.group.remove();
    vertex.node = new VertexNode(customersGroup, vertex);
    vertex.node.activateBuyer(
      colors[i]
    );
  });

  this.N = 0;

  this.setTimeout(nextStep, 1200);

};

Tangle.prototype.customerSendRequest = function() {
  var nextStep = 'customerRecieveResponse';
  var desIdx = 2;
  this.highlightDes(desIdx);

  var nodes = this.customers.map(function (v) {return v.node;})
  var agents = Random.shuffle(nodes);
  this.customer = agents[0];
  this.agents = agents.slice(1, 5);

  this.customer.sendRequest();

  var shadowTime = this.cognNode.shadow.width() * 0.5 * qSpeed,
      oneBodyTime = this.customer.qtext.node.getBBox().width * qSpeed;

  var t = this.customer.s - shadowTime + oneBodyTime;
  this.setTimeout(nextStep, t);
};

Tangle.prototype.customerRecieveResponse = function() {
  // var nextStep = 'customerSendRequest';
  // var nextStep = 'destroyScheme';

  var desIdx = 3;
  this.highlightDes(desIdx);

  this.cognNode.findProvider(this.customer, this.agents);
  this.N += 1;

  if (this.N < 3) {
    this.setTimeout('customerSendRequest', 18400);
  } else {
    this.setTimeout('destroyScheme', 19500);
  }
};

Tangle.prototype.destroyScheme = function() {
  var nextStep = 'createSVG';
  this.highlightDes(null);

  this.draw.addClass('blured');
  this.draw.delay(100).animate(100, '>').opacity(0);

  var _this = this;
  setTimeout(function () {
    _this.draw.remove();
    VERTEXES.forEach(function (v) {
      v.node = undefined;
    });
    _this.setTimeout(nextStep, 250);
  }, 300);

};

