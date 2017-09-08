function AgentCircle(draw, vertex, color) {
  this.color = color;

  this.r = 21;
  this.length = this.r * 2 * 3.14;

  this.defParams = {
    'stroke-dasharray': this.length + ' ' + this.length,
    'stroke-dashoffset': 0,
    'fill': this.color,
    'fill-opacity': 0,
    'stroke': this.color,
    'stroke-width': 1,
  };
  this.activeParams = {
    'scale': 1.1,
    'fill-opacity': 0.3,
    'stroke-width': 2,
  };

  this.cx = vertex.pos[0];
  this.cy = vertex.pos[1];

  this.elem = this.draw(draw);
}

AgentCircle.prototype.draw = function(draw) {
  var plot = getCirclePath(this.r);
  var circle = draw.path(plot).attr(this.defParams).center(this.cx, this.cy);
  circle.attr({
    'stroke-dashoffset': this.length + 'px',
  });
  return circle;
};


AgentCircle.prototype.show = function() {
  this.elem.animate(1500, 'circOut').attr(this.defParams);
};

AgentCircle.prototype.activate = function(callback) {
  this.elem.animate(200, 'backIn').scale(this.activeParams.scale).attr(this.activeParams);
};

AgentCircle.prototype.deactivate = function() {
  this.elem.animate(100, '<').scale(1).attr(this.defParams);
};

AgentCircle.prototype.colorize = function(color) {
  this.elem.animate(200).attr({'stroke': color, 'fill': color});
};

AgentCircle.prototype.spinAround = function(callback, toActive) {
  var t1 = 250, d = 200;
  var params = toActive ? this.activeParams : {};
  this.elem.animate(t1, '>').attr({'stroke-dashoffset': this.length * -1 + 'px'})
           .delay(d)
           .animate(t1, '>').attr({'stroke-dashoffset': 0}).attr(params)
           .once(1, function () {
              callback && callback();
           });
};
function AgentLine(draw, vertex, color, circle) {
  this.color = color;
  this.speed = 60;
  this.defParams = {
    'stroke-linecap': "round",
    'stroke-dasharray': '5 5',
    'stroke-width': 2,
    'stroke-dashoffset': 0,
    'opacity': 0.8,
    'stroke': this.color,
  };
  this.activeParams = {
    'stroke-width': 4,
    'opacity': 1,
  };

  this.sx = vertex.pos[0];
  this.sy = vertex.pos[1];
  this.ex = mlNodeCloudParams.cx;
  this.ey = mlNodeCloudParams.cy;

  this.elem = this.draw(draw);
}

AgentLine.prototype.array = function() {
  return [this.sx, this.sy, this.ex, this.ey];
};

AgentLine.prototype.draw = function(draw) {
  var line = draw.line(this.sx, this.sy, this.sx, this.sy);
  line.attr(this.defParams);
  return line;
};

AgentLine.prototype.show = function(event) {
  var d = 500, t = 300;
  this.elem.delay(d)
           .animate(t, 'cubicIn').plot(this.sx, this.sy, this.ex, this.ey);
  var _this = this;
  setTimeout(function () {
    _this.toCenter();
    event && event();
  }, d + t);
};

AgentLine.prototype.toCenter = function(attr, i) {
  // this.lastDirection = 'toCenter';
  var s = this.elem.attr('stroke-dasharray').split(' ');
  var d = s.reduce(function(a, b) {return a + parseInt(b);}, 0);

  this.elem.finish().attr({'stroke-dashoffset': 0});

  if (attr) {
    this.elem.animate(100).attr(attr);
  }
  this.elem.animate(d * this.speed).attr({'stroke-dashoffset': d * (i || -1)}).loop();
};

AgentLine.prototype.fromCenter = function(attr) {
  // this.lastDirection = 'fromCenter';
  this.toCenter(attr, 1);
};

AgentLine.prototype.activate = function() {
  this.toCenter(this.activeParams);
};

AgentLine.prototype.deactivate = function() {
  this.toCenter(this.defParams);
};

AgentLine.prototype.colorize = function(color) {
  this.toCenter({'stroke': color});
};
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
 function Agent(draw, vertex, color, event, mlCloud) {
  this.vertex = Object.assign({}, vertex);
  this.mlCloud = mlCloud;

  this.color = color;

  this.group = draw.group();
  this.circle = new AgentCircle(this.group, vertex, color);
  this.circle.show();

  this.line = new AgentLine(this.group, vertex, color);
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
function Graph(draw) {
  this.edgeGroup = draw.group();
  this.vertexesGroup = draw.group();

  this.vertexes = VERTEXES.reduce(function (bucket, v) {
    bucket[v.idx] = v;
    return bucket;
  }, {});

  this.createVertexes();
}

Graph.prototype.createVertexes = function() {
  var _this = this;
  VERTEXES.forEach(function (vertex) {
    _this.createVertex(vertex);
  });
};

Graph.prototype.createVertex = function(vertex) {
  var _this = this;

  var path = getCirclePath(gridParams.r);
  var gridNode = this.vertexesGroup.path(path);
  gridNode.fill(gridParams.color).center(vertex.pos[0], vertex.pos[1]);


  vertex.neightbors.forEach(function (neightborId) {
    var neightbor = _this.vertexes[neightborId];
    _this.edgeGroup.line(new SVG.PointArray([vertex.pos, neightbor.pos]))
                   .attr({
                      'stroke': gridParams.color
                    });
  });
};
function getCirclePath(r) {
  var a = r / 4, b = a * 2, c = a * 3;
  return 'M' + b + ' 0 ' +
         'C' + c + ' 0 ' + r + ' ' + a + ' ' + r + ' ' + b + ' ' +
         'C' + r + ' ' + c + ' ' + c + ' ' + r + ' ' + b + ' ' + r + ' ' +
         'C' + a + ' ' + r + ' 0 ' + c + ' 0 ' + b + ' ' +
         'C0 ' + a + ' ' + a + ' 0 ' + b + ' 0 Z';
};

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

  function callback() {
    customer.receiveResponse(function() {
      customer.line.toCenter();
      event()
    });
  }

  // function callback() {
    _this.shadow.animate(t1).fill(color);
    _this.hex.fill(color);
    _this.tmp.scale(1).center(0, 0);
    _this.tmp.delay(t1 + d1).once(1, function () {
     _this.ding(callback);
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

function MLNode(draw, vertex, event) {
  this.hexParams = {
    'radius': 15,
    'edges': 6,
    'edgesStart': 3,
    // 'fill': '#00fff5',
    'fill': '#00d6ff',
  };
  this.shadowParams = {
    'radius': this.hexParams.radius * 1.3,
    'edges': this.hexParams.edges,
    'fill': this.hexParams.fill,
    'opacity': 0.3,
  };
  this.lineParams = {
    'stroke': this.hexParams.fill,
    'stroke-width': 1.5,
    'opacity': 0.7
  };


  this.vertex = Object.assign({}, vertex);
  var neightborsIdxs = this.vertex.neightbors;
  this.neightborsVertexes = VERTEXES.reduce(function (bucket, v) {
    if (neightborsIdxs.indexOf(v.idx) > -1) {
      bucket.push(Object.assign({}, v));
    }
    return bucket;
  }, []);

  this.group = draw.group();

  this.cx = this.vertex.pos[0];
  this.cy = this.vertex.pos[1];

  this.shadow = this.drawShadow();
  this.hex = this.drawHex();

  this.show(event);
}

MLNode.prototype.drawShadow = function() {
  var params = {edges: this.shadowParams.edges, radius: 0.1};
  var shadow = this.group.polygon().ngon(params);
  shadow.attr(this.shadowParams).center(this.cx, this.cy);
  return shadow;
};

MLNode.prototype.drawHex = function() {
  var params = {edges: this.hexParams.edgesStart, radius: 0.1};
  var hex = this.group.polygon().ngon(params);
  hex.attr(this.hexParams).fill(gridParams.color).center(this.cx, this.cy);
  return hex;
};

MLNode.prototype.show = function(event) {
  var hexT = 100,
      hexTotalT = ((this.hexParams.edges + 1) - this.hexParams.edgesStart) * hexT;
  var shadowDelayAfter = 100,
      shadowT = 300,
      shadowDelayBefore = hexTotalT + shadowDelayAfter - shadowT;

  this.shadow.delay(shadowDelayBefore);

  var ngonParams = {edges: this.hexParams.edges, radius: this.hexParams.radius};
  for (var i = this.hexParams.edgesStart; i <= this.hexParams.edges; i++) {
    ngonParams.edges = i;
    this.hex.animate(hexT).ngon(ngonParams).center(this.cx, this.cy)
                          .fill(i > 4 ? this.hexParams.fill : gridParams.color);
  }

  this.shadow.animate(shadowT, 'backOut').attr(this.shadowParams)
                                         .ngon(this.shadowParams)
                                         .center(this.cx, this.cy)
             .once(1, function () {event && event(); });
};

MLNode.prototype.connectToOther = function(nodes, event) {
  this.lineGroup = this.group.group();

  var t1 = 150, d1 = 25, t2 = 180, t3 = 200;

  var _this = this;
  var raised = false;
  function createLine(s, e) {
    var l = _this.lineGroup.line(new SVG.PointArray([s, s]));
    l.attr(_this.lineParams).opacity(0.3);

    var middle = [
      s[0] - ((s[0] - e[0]) / 2),
      s[1] - ((s[1] - e[1]) / 2)
    ];
    l.animate(t1, 'sineOut').plot(new SVG.PointArray([s, middle]));

    l.delay(d1).animate(t2, 'sineOut').attr({'opacity': 1});
    l.animate(t3, 'sineIn').attr(_this.lineParams)
     .once(1, function () {
      // animations are simultaneous so there is no need to check which is the last
      if (event && raised === false) {
        raised = true;
        event();
      }
     });
  }

  nodes.forEach(function (node, i) {
    if (node.vertex.idx != _this.vertex.idx) {
      createLine(_this.vertex.pos, node.vertex.pos);
      createLine(node.vertex.pos, _this.vertex.pos);
    }
  });
};

MLNode.prototype.moveToCenter = function(showCloud, event) {
  this.lineGroup.animate(100).opacity(0);

  var cloudParams = Object.assign({}, mlNodeCloudParams);
  var dx = cloudParams.cx - this.cx;
  var dy = cloudParams.cy - this.cy;
  var t1 = 250, t2 = 500;

  var _this = this;
  function move(elem, params) {
    elem.animate(t1, '<>').ngon(ngonParams).center(_this.cx, _this.cy).once(1, function () {
      if (showCloud) {
        showCloud();
        showCloud = undefined;
      }
    });
    elem.animate(t2, '>').scale(1.5).opacity(0).center(_this.cx, _this.cy).once(1, function () {
      if (event) {
        event();
        event = undefined;
      }
    });;
  }

  var ngonParams = {radius: cloudParams.r, edges: cloudParams.edges};
  move(this.hex, ngonParams);

  ngonParams.radius = cloudParams.r * cloudParams.shadowK;
  move(this.shadow, ngonParams);

  this.group.animate(t1, 'backIn').dmove(dx, dy);
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

var VERTEXES = [
  {idx: 1, neightbors: [2, 6, 7], pos: [25, 25]},
  {idx: 2, neightbors: [3, 6], pos: [137, 25]},
  {idx: 3, neightbors: [4, 7, 8], pos: [255, 25]},
  {idx: 4, neightbors: [5, 8], pos: [361, 25]},
  {idx: 5, neightbors: [9, 10], pos: [475, 25]},

  {idx: 6, neightbors: [11, 12], pos: [25, 108]},
  {idx: 7, neightbors: [13], pos: [137, 108]},
  {idx: 8, neightbors: [9, 13], pos: [255, 108]},
  {idx: 9, neightbors: [14, 20], pos: [361, 108]},
  {idx: 10, neightbors: [15], pos: [475, 108]},

  {idx: 11, neightbors: [12, 18], pos: [25, 192]},
  {idx: 12, neightbors: [13, 17, 18], pos: [97, 192]},
  {idx: 13, neightbors: [14, 19], pos: [170, 192]},
  {idx: 14, neightbors: [15], pos: [242, 192]},
  {idx: 15, neightbors: [16], pos: [413, 192]},
  {idx: 16, neightbors: [20, 21], pos: [475, 192]},

  {idx: 17, neightbors: [18], pos: [25, 275]},
  {idx: 18, neightbors: [19], pos: [137, 275]},
  {idx: 19, neightbors: [20], pos: [255, 275]},
  {idx: 20, neightbors: [21], pos: [361, 275]},
  {idx: 21, neightbors: [], pos: [475, 275]},
];


var mlHosts = [2, 4, 6, 9, 18, 21];
var agentHosts = [2, 4, 9, 12, 18, 21];

var agentsColors = [
  'rgb(255, 191, 0)',  // orange
  'rgb(0, 255, 191)', // blue
  'rgb(191, 255, 0)', // yellow
  'rgb(75, 255, 0)',  // green
  'rgb(255, 64, 255)', // purple
  'rgb(255, 0, 106)',  // red
];

var gridParams = {
  r: 12,
  color: '#2c9b5a',
};

 var mlNodeCloudParams = {
  // logo
  logoPath: 'dist/l4.png',
  logoW: 50,
  // main
  r: 30,
  // color: '#00fff5',
  color: '#00d6ff',
  edges: 8,
  cx: 250,
  cy: 150,
  // shadow
  shadowK: 1.3,
  shadowOpacity: 0.3,
};
function createTangle(parent) {
  var bounds = parent.getBoundingClientRect();
  var svgId = parent.getAttribute('id');
  var tangle = new Tangle(svgId, bounds);
}

function Tangle(svgId, bounds) {
  this.svgId = svgId;
  this.bounds = bounds;

  this.description = document.querySelector('#protocolDescription');

  this.run();
}

Tangle.prototype.showDescription = function(params, event) {
  var _this = this;

  function show(text){
    if (text) {
      _this.draw.addClass('overflowed');
      _this.description.innerHTML = '<div>' + text + '</div>';
      _this.description.className = 'active';
    } else {
      _this.draw.removeClass('overflowed');
      _this.description.innerHTML = '';
      _this.description.className = '';
    }
  }

  show(params.description);

  setTimeout(function () {
    show();

    setTimeout(function () {
      _this[params.name](event);
    }, params.beforeActionT || 1450);

  }, params.textT || 3300);
};

Tangle.prototype.run = function() {
  var chain = [
    {name: 'createSVG', beforeStageT: 600},

    {name: 'drawTangle', beforeStageT: 100,
     description:
      'It is <strong>IOTA tangle</strong>.',
     textT: 1900, beforeActionT: 530},

    {name: 'drawmlHosts', beforeStageT: 1000,
     description:
      'Any IOTA node can be turned into a <strong>machine learning node</strong>.',
     beforeActionT: 550},

    {name: 'mlHostsToCluster', beforeStageT: 800,
     description:
      'Machine Learning nodes create <strong>CognIOTA cluster.</strong>',
     },
    {name: 'mlClusterToCenter', beforeStageT: 100},

    {name: 'drawAgents', beforeStageT: 700,
     description:
      'IOTA nodes <strong>request</strong> machine learning <strong>services</strong> from CognIOTA.',
     },
    {name: 'customerSendRequest', beforeStageT: 150},

    {name: 'findSolution', beforeStageT: 680,
     description: 'CognIOTA <strong>finds the solution</strong> for the request.',
    },

    {name: 'testProviders', beforeStageT: 550,
     description: 'It uses <strong>auctions</strong> for finding the best task executer.',
     },

    {name: 'providerSendResponse', beforeStageT: 700,
     description: 'CognIOTA powers <br><strong>the economy of IoT</strong>.'},

    {name: 'clear', beforeStageT: 600,}
  ];

  chain.forEach(function (method, i) {
    var nextMethod = chain[i + 1];
    if (!nextMethod) nextMethod = chain[0];
    method.next = nextMethod && [nextMethod.name];
  });

  var methods = chain.reduce(function (bucket, method) {
    // if (bucket[method.name]) {
    //   bucket[method.name].next = bucket[method.name].next.concat(method.next);
    // } else {
    // }
    bucket[method.name] = method;
    return bucket;
  }, {});

  var _this = this;

  document.addEventListener('stageIsOver', function (e) {
    var method = methods[e.detail];
    if(!method) {
      return;
    }

    var t = method.beforeStageT || 0;
    setTimeout(function () {
      callMethod(method);
    }, t);

  }, false);

  function createEvent(params) {
    return function () {
      var nextMethod = params.next;
      // var nextMethod = params.next && params.next[0];
      // params.next = params.next && params.next.slice(1, params.next.length);
      var event = new CustomEvent('stageIsOver', {detail: nextMethod});
      document.dispatchEvent(event);
    };
  }

  function callMethod(params) {
    var event = createEvent(params);
    if (params.description != void 0) {
      return _this.showDescription(params, event);
    }
    _this[params.name](event);
  }

  callMethod(chain[0]);
};


Tangle.prototype.createSVG = function(event) {
  this.draw = SVG(this.svgId);
  this.draw.addClass('overflowed');

  this.graph = new Graph(this.draw);

  this.mlCloud = new MLCloud(this.draw);
  event();
};

Tangle.prototype.drawTangle = function(event) {
  setTimeout(function () {
    event();
  }, 300);
};

Tangle.prototype.drawmlHosts = function(event) {
  this.mlHosts = [];
  var mlhostGroup = this.draw.group();

  var _this = this, t = 0;
  VERTEXES.forEach(function (vertex, i) {
    if (mlHosts.indexOf(vertex.idx) > -1) {

      setTimeout(function () {
        var isLast = (_this.mlHosts.length + 1) == mlHosts.length;
        var mlhost = new MLNode(mlhostGroup, vertex, isLast && event);
        _this.mlHosts.push(mlhost);
      }, t);

      t += 500;
    }
  });
};

Tangle.prototype.mlHostsToCluster = function(event) {
  var _this = this;
  this.mlHosts.forEach(function (node, i) {
    var isLast = i == _this.mlHosts.length - 1;
    node.connectToOther(_this.mlHosts, isLast && event);
  });
};

Tangle.prototype.mlClusterToCenter = function(event) {
  var _this = this;

  function showCloud() {
    _this.mlCloud.show();
  }

  this.mlHosts.forEach(function (node, i) {
    var isLast = i == _this.mlHosts.length - 1;
    node.moveToCenter(isLast && showCloud, isLast && event);
  });
};

Tangle.prototype.drawAgents = function(event) {
  this.agents = []; // alll

  var agentGroup = this.draw.group();
  this.graph.vertexesGroup.before(agentGroup);

  var _colors = Random.shuffle(agentsColors);

  var _this = this;
  VERTEXES.forEach(function (vertex, i) {
    if (agentHosts.indexOf(vertex.idx) > -1) {
      var isLast = (_this.agents.length + 1) == agentHosts.length;
      var color = _colors[_this.agents.length];
      var agent = new Agent(
        agentGroup, vertex, color,
        isLast && event,
        _this.mlCloud
      );
      _this.agents.push(agent);
    }
  });
};

Tangle.prototype.customerSendRequest = function(event) {
  this.mlCloud.show()
  var agents = Random.shuffle(this.agents);
  // var agents = this.agents.slice();
  var _this = this;

  this.customer = agents.pop();
  this.providers = agents.slice(0, 3);

  this.customer.sendRequest(event, true);
};


Tangle.prototype.findSolution = function(event) {
  var _this = this;
  // this.customer.sendRequest(function () {
    _this.mlCloud.findSolution(_this.customer, event);
  // })
};

Tangle.prototype.testProviders = function(event) {
  var t = 0, d = 500;
  var _this = this;

  function testProviders() {
    _this.providers.forEach(function (provider, i) {
      setTimeout(function () {
        var prev = _this.providers[i - 1];
        if (prev) prev.deactivate();
        provider.activate();
        _this.mlCloud.testProvider(provider.color);

        if (i == _this.providers.length - 1) {
          setTimeout(function () {
            _this.provider = provider;
            _this.mlCloud.ding(event);
          }, 150)
          // _this.provider.startContract(_this.customer.color);
          // _this.mlCloud.chooseProvider(_this.customer.color, event);
          // event();
        }
      }, t);

      t += d;
    });

    setTimeout(function () {
    }, t);
  }

  testProviders();

};


Tangle.prototype.providerSendResponse = function(event) {
  var _this = this;

  function receiveResponse() {
    _this.customer.receiveResponse(function () {
      _this.mlCloud.fallOutColor(function () {
        _this.customer.deactivate();
        _this.provider.deactivate();
        event();
      });
    });
  }


  this.mlCloud.chooseProvider(this.customer.color);
  this.provider.receiveRequest(this.customer.color, function () {
    _this.provider.sendResponse(function () {
      // _this.provider.deactivate();
      receiveResponse();
      // _this.mlCloud.receiveResponse(receiveResponse);
    });
  });

};


Tangle.prototype.clear = function(event) {
  this.draw.addClass('blured');
  this.draw.delay(100).animate(100, '>').opacity(0);

  var _this = this;
  setTimeout(function () {
    _this.draw.remove();
    event();
  }, 300);

};
