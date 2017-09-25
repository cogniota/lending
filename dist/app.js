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
function AgentLine(draw, cx, cy, vertex, color, circle) {
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
  this.ex = cx;
  this.ey = cy;

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

AgentLine.prototype.opacity = function(opacity) {
  this.elem.animate().opacity(opacity);
};

AgentLine.prototype.toCenter = function(attr, i) {
  // this.lastDirection = 'toCenter';
  var s = this.elem.attr('stroke-dasharray').split(' ');
  var d = s.reduce(function(a, b) {return a + parseInt(b);}, 0);

  this.elem.finish().attr({'stroke-dashoffset': 0});

  if (attr) {
    this.elem.animate(100).attr(attr);
  }
  // this.elem.animate(d * this.speed).attr({'stroke-dashoffset': d * (i || -1)}).loop();
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
function Graph(draw, VERTEXES, gridParams) {
  this.edgeGroup = draw.group();
  this.vertexesGroup = draw.group();
  this.gridParams = gridParams;

  this.vertexes = VERTEXES.reduce(function (bucket, v) {
    bucket[v.idx] = v;
    return bucket;
  }, {});
  this.vertexesList = VERTEXES.slice();

  this.createVertexes();
}

Graph.prototype.createVertexes = function() {
  var _this = this;
  this.vertexesList.forEach(function (vertex) {
    _this.createVertex(vertex);
  });
};

Graph.prototype.createVertex = function(vertex) {
  var _this = this;

  var path = getCirclePath(this.gridParams.r);
  var gridNode = this.vertexesGroup.path(path);
  gridNode.attr({
    'fill': this.gridParams.fill,
    'stroke': this.gridParams.stroke,
    'stroke-width': this.gridParams.sw,
  })
  .center(vertex.pos[0], vertex.pos[1]);
  // this.vertexesGroup.text(vertex.idx + '').center(vertex.pos[0] + 5, vertex.pos[1] + 5);

  vertex.neightbors.forEach(function (neightborId) {
    var neightbor = _this.vertexes[neightborId];
    neightbor.neightbors.push(vertex.idx);
    _this.edgeGroup.line(new SVG.PointArray([vertex.pos, neightbor.pos]))
                   .attr({'stroke': _this.gridParams.stroke, 'stroke-width': _this.gridParams.w});
  });
};

Graph.prototype.toColor = function(fill, stroke, t) {
  this.vertexesGroup.children().forEach(function (point) {
    point.animate(t, 'sineIn').attr({fill: fill, stroke: stroke});
  });
  this.edgeGroup.children().forEach(function (line) {
    line.animate(t, 'sineIn').attr({fill: fill, stroke: stroke});
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

function MLCloud(draw, cx, cy) {
  this.group = draw.group();
  this.group.backward();

  this.params = Object.assign({}, mlNodeCloudParams);
  this.cx = cx;
  this.cy = cy;
  // this.cx = this.params.cx;
  // this.cy = this.params.cy;
  // console.log(draw)

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

function MLNode(draw, vertex, fill, event) {
  this.startColor = fill;
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
  this.neightborsVertexes = VERTEXES_TANGLE.reduce(function (bucket, v) {
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
  hex.attr(this.hexParams).fill(this.startColor).center(this.cx, this.cy);
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
                          .fill(i > 4 ? this.hexParams.fill : this.startColor);
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

MLNode.prototype.moveToCenter = function(cx, cy, showCloud, event) {
  this.lineGroup.animate(100).opacity(0);

  var cloudParams = Object.assign({}, mlNodeCloudParams);
  var dx = cx - this.cx;
  var dy = cy - this.cy;
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

function initBtns() {
  var openProtocolBtn = document.querySelector('#openProtocol');
  var bbox = openProtocolBtn.getBoundingClientRect();

  var secondPage = document.querySelector('#secondPage');
  secondPage.style.left = 0;
  secondPage.style.top = 0;
  secondPage.style.width = '100%';
  secondPage.style.height = '100%';

  var slideShow = new MapSlideShow();

  // var map = new SalesManMap(slideShow);
  slideShow.slides.forEach(function (slide, i) {
    var svgId = 'secondPageSVG' + i;
    var svgParent = slide.querySelector('.svg');
    svgParent.setAttribute('id', svgId);

    var draw = SVG(svgId);
    new SalesManMap(draw);
  });

  secondPage.style.left = bbox.x + 'px';
  secondPage.style.top = bbox.y + 'px';
  secondPage.style.width = bbox.width + 'px';
  secondPage.style.height = bbox.height + 'px';

  var isOpen = false;
  function toggle(event) {
    if (isOpen && event.srcElement.getAttribute('id') == 'backToMain') {
      document.body.className = '';
      isOpen = false;
    } else {
      document.body.className = 'secondPage';
      isOpen = true;

      setTimeout(function () {
      }, 500)
    }
  };

  secondPage.addEventListener('click', toggle);
}

function createSalesMan() {
  initBtns();
}

function SalesManMap(draw) {
  this.draw = draw;
  this.elements = {};

  this.createSVG();

  this.mlCloud = new MLCloud(this.draw, 250, 192.5);

  this.drawWHouses();
  this.drawShops();

  this.drawML();

  this.drawCars();
}

SalesManMap.prototype.createSVG = function() {
  this.grid = new Graph(this.draw, VERTEXES_SALESMAN, gridParams_SALESMAN);
  this._drawBG();
};


SalesManMap.prototype._drawBG = function() {
  var parksPaths = [
    'M26 68 l45 3 l 32 26 l -67 15 Z',
    'M42 207 l57 -13 l 37 25 l 12 26 l -70 10  l -35 -10 Z',
    'M356 75 l50 -16 l 32 11 l -17 25 l -80 5 Z',
    'M357 142 l10 -11 l 88 61 l 10 54 l -10 10 l -80 -54 Z',
  ];


  var greenGroup = this.draw.group();
  parksPaths.forEach(function (d) {
    greenGroup.path(d).fill('#4caf50').opacity(0.6);
  });


  var enviromentElems = [
    {pos: [155, 70], src: '768320_garden_512x512.png', o: 1, w: 25},
    {pos: [275, 305], src: '804184_garden_512x512.png', o: 1, w: 25},

    {pos: [400, 257], src: '804198_protection_512x512.png', o: 1, w: 24},
    {pos: [160, 295], src: '771160_firefighter_512x512.png', o: 1, w: 28},

    {pos: [290, 55], src: '773385_tree_512x512.png', o: 1, w: 30},
    {pos: [360, 245], src: '773368_tree_512x512.png', o: 1, w: 30},
    {pos: [60, 160], src: '773373_tree_512x512.png', o: 1, w: 30},
    {pos: [110, 330], src: '773371_tree_512x512.png', o: 1, w: 30},
    {pos: [325, 165], src: '773393_tree_512x512.png', o: 1, w: 25},
  ];

  enviromentElems.forEach(function (params) {
    greenGroup.image('dist/enviroment/' + params.src, params.w)
              .center(params.pos[0], params.pos[1])
              .opacity(params.o);
  });
};

SalesManMap.prototype.drawWHouses = function() {
  this.whouses = [];
  var whousesGroup = this.draw.group();
  this.mlCloud.group.before(whousesGroup);

  var _this = this;
  whouses_SALESMAN.forEach(function (idx, i) {
    var vertex = _this.grid.vertexes[idx];
    var color = whouses_colors_SALESMAN[i];
    var whouse = new WHouse(whousesGroup, vertex, _this.mlCloud.cx, _this.mlCloud.cy, color);
    _this.whouses.push(whouse);
    _this.elements[idx] = whouse;
  });
};

SalesManMap.prototype.drawShops = function() {
  this.shops = [];
  var shopsGroup = this.draw.group();
  this.mlCloud.group.before(shopsGroup);

  var _this = this;
  shops_SALESMAN.forEach(function (idx, i) {
    var vertex = _this.grid.vertexes[idx];
    var color = shops_colors_SALESMAN[i];
    var shop = new Shop(shopsGroup, vertex, _this.mlCloud.cx, _this.mlCloud.cy, color);
    _this.shops.push(shop);
    _this.elements[idx] = shop;
  });
};

SalesManMap.prototype.drawCars = function() {
  this.cars = [];
  var carsGroup = this.draw.group();

  // var cars_SALESMAN = Random.shuffle(VERTEXES_SALESMAN).slice(0, 3);
  // var cars_SALESMAN = [VERTEXES_SALESMAN[1]];
  var _this = this;
  cars_SALESMAN.forEach(function (idx, i) {
    var vertex = _this.grid.vertexes[idx];
    var color = cars_color_SALESMAN[i];
    var car = new Car(carsGroup, vertex, _this.grid, color, _this.elements);
    _this.cars.push(car);
  });
};


SalesManMap.prototype.drawML = function() {
  this.mlCloud.show();
};

// function SalesMan(svgId, bounds) {
//   this.svgId = svgId;
//   // this.bounds = bounds;

//   this.createSVG();
//   this.drawML();
//   this.drawWHouses();
//   this.linkWHouses();
//   this.drawShops();
//   this.linkShops();

//   this.drawCars();
// }

// SalesMan.prototype.drawML = function() {

// };


// SalesMan.prototype.linkWHouses = function() {
//   var _this = this;
//   this.whouses.forEach(function (whouse) {
//     whouse.showLink();
//   });
// };


// SalesMan.prototype.linkShops = function() {
//   var _this = this;
//   this.shops.forEach(function (shop) {
//     shop.showLink();
//   });
// };
var VERTEXES_SALESMAN = [
  {idx: 1, neightbors: [2, 6], pos: [45, 45]},
  {idx: 2, neightbors: [3, 7], pos: [137, 25]},
  {idx: 3, neightbors: [4, 7], pos: [255, 25]},
  {idx: 4, neightbors: [7, 9], pos: [450, 35]},

  {idx: 5, neightbors: [6, 10, 11], pos: [45, 120]},
  {idx: 6, neightbors: [7, 11], pos: [150, 108]},
  {idx: 7, neightbors: [], pos: [265, 100]},
  {idx: 8, neightbors: [9, 11, 12, 13], pos: [350, 108]},
  {idx: 9, neightbors: [13], pos: [475, 108]},

  {idx: 10, neightbors: [11, 14], pos: [25, 192]},
  {idx: 11, neightbors: [15], pos: [127, 182]},
  {idx: 12, neightbors: [16, 18], pos: [350, 200]},
  {idx: 13, neightbors: [18], pos: [465, 192]},

  {idx: 14, neightbors: [15], pos: [25, 275]},
  {idx: 15, neightbors: [16, 19], pos: [160, 250]},
  {idx: 16, neightbors: [17, 20, 21], pos: [255, 275]},
  {idx: 17, neightbors: [18, 21, 22], pos: [361, 285]},
  {idx: 18, neightbors: [], pos: [475, 275]},

  {idx: 19, neightbors: [20], pos: [25, 358]},
  {idx: 20, neightbors: [], pos: [157, 358]},
  {idx: 21, neightbors: [22], pos: [240, 358]},
  {idx: 22, neightbors: [], pos: [455, 338]},
];


var whouses_SALESMAN = [4, 14, 21];
var whouses_colors_SALESMAN = [
  '#388e3c',  // green
  '#8bc34a', // lightgreen
  '#9e9d24', // lime
];

var shops_SALESMAN = [1, 11, 12, 20, 22];
var shops_colors_SALESMAN = [
  '#3f51b5',  // indigo
  '#03a9f4', // light-blue
  '#00838f',  // cyan
  '#9575cd',  // deep-purple
  '#e040fb', // purple
];

var cars_SALESMAN = [2, 9, 19];
var cars_color_SALESMAN = [
  '#ef5350',
  '#ff5722',
  '#ff9800',
];

var gridParams_SALESMAN = {
  r: 5,
  sw: 1,
  w: 6,
  fill: '#78909c',
  stroke: '#78909c',
};
function Shop(draw, vertex, cx, cy, color) {
  this.cx = vertex.pos[0];
  this.cy = vertex.pos[1];
  this.idx = vertex.idx;

  this.color = color;

  this.group = draw.group();
  this.link = new AgentLine(this.group, cx, cy, vertex, this.color);
  // this.drawCircle(gridParams_SALESMAN.fill, '#f5da98', 1);
  // this.drawCircle(this.color, '#f5da98', 1);
  // this.drawCircle(this.color, this.color, 0.6);
  // this.img = this.group.image(
  //   'https://www.shareicon.net/download/2016/01/23/707839_shopping.svg',
  //   24, 24).center(this.cx, this.cy);
  this.img = this.drawImg();
  // this.drawCircle(this.color, 0.15);
  // this.group.plain('S').font({
  //   'fill': this.color,
  //   'family': 'Rajdhani',
  //   'weight': 'bold',
  //   'size': '14px'
  // }).center(this.cx, this.cy);
};

Shop.prototype.drawImg = function() {
  this.w = 35;
  var img = this.group.image('dist/cars/shopping.png', this.w, this.w);
  img.center(this.cx, this.cy);
  return img;
};

Shop.prototype.drawCircle = function(stroke, fill, op) {
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

Shop.prototype.showLink = function() {
  var _this = this;
  this.link.show(function () {
    _this.link.opacity(0.25);
  });
};

function MapSlideShow() {
  this.slideOptions = {
    paths : {
      rect : 'M33,0h41c0,0,0,9.871,0,29.871C74,49.871,74,60,74,60H32.666h-0.125H6c0,0,0-10,0-30S6,0,6,0H33',
      right : 'M33,0h41c0,0,5,9.871,5,29.871C79,49.871,74,60,74,60H32.666h-0.125H6c0,0,5-10,5-30S6,0,6,0H33', 
      left : 'M33,0h41c0,0-5,9.871-5,29.871C69,49.871,74,60,74,60H32.666h-0.125H6c0,0-5-10-5-30S6,0,6,0H33'
    },
    speed : 500
  };
  this.h = 60;
  this.w = 68;

  this.slides = [];
  this.elem = document.querySelector('#secondPage .main');

  this._initSlides();
  this._initNavs();
}

MapSlideShow.prototype._initSlides = function() {
  this.slidesParent = this.elem.querySelector('ul.slideshow');

  var elems = this.slidesParent.children;
  this.screenW = this.slidesParent.offsetWidth;
  this.count = elems.length;

  this.slidesParent.style.width = this.slidesParent.offsetWidth * this.count + 'px';

  for (var i = 0; i < elems.length; i++) {
    var slide = this.createSlide(elems[i], i);
    this.slides.push(slide);
  }

  this.currentN = 0;
};

MapSlideShow.prototype.createSlide = function(slide, i) {
  var _this = this;
  var color = 'rgba(237, 236, 218, 1)';
  var svgId = 'secondPageSVGBG' + i;

  slide.style.width = this.screenW + 'px';

  var svgParent = slide.querySelector('.bg');
  svgParent.setAttribute('id', svgId);

  var H = svgParent.offsetHeight, W = this.screenW;
  var cx = W/2, cy = H/2;
  var sx = W/this.w * 0.8, sy = H/this.h;


  var draw = SVG(svgId);
  var path = draw.path(this.slideOptions.paths.rect)
                 .fill(color)
                 .center(cx, cy)
                 .scale(sx, sy);

  slide.animate = function (d, speed, easing, callback) {
    path.stop()
        .animate(speed, easing)
            .plot(_this.slideOptions.paths[d])
            .center(cx, cy).once(1, function () {
              callback && callback();
            });
  };
  slide.plot = function (d) {
    path.plot(_this.slideOptions.paths[d]).center(cx, cy);
  };

  slide.querySelector('.svg').style.width = sx * this. w + 'px';
  return slide;
};

MapSlideShow.prototype._initNavs = function() {
  var _this = this;
  var nav = this.elem.querySelector('ul.nav');
  this.prev = nav.querySelector('.prev');
  this.prev.onclick = function () {
    _this.goPrev();
  };
  this.next = nav.querySelector('.next');
  this.next.onclick = function () {
    _this.goNext();
  };

  this.play = nav.querySelector('.play');
  // keyboard navigation events
      // document.addEventListener( 'keydown', function( ev ) {
      //   var keyCode = ev.keyCode || ev.which;
      //   switch (keyCode) {
      //     // left key
      //     case 37:
      //       self._navigate('prev');
      //       break;
      //     // right key
      //     case 39:
      //       self._navigate('next');
      //       break;
      //   }
      // } );
};

MapSlideShow.prototype._translate = function(nextN) {
  this.currentN = nextN;
  var translateVal = -1 * this.currentN * 100 / this.count;
  this.slidesParent.style.WebkitTransform = 'translate3d(' + translateVal + '%,0,0)';
  this.slidesParent.style.transform = 'translate3d(' + translateVal + '%,0,0)';
};

MapSlideShow.prototype.goNext = function() {
  // morph svg path on exiting slide to "curved"
  var nextN = this.currentN + 1;
  if (nextN > (this.count - 1)) {
    nextN = 0;
  }
  this._morph(nextN);
};

MapSlideShow.prototype.goPrev = function() {
  var nextN = this.currentN - 1;
  if (nextN < 0) {
    nextN = this.count - 1;
  }
  this._morph(nextN);
};

MapSlideShow.prototype._morph = function(nextN) {
  if (this.isAnimating) return;

  this.isAnimating = true;
  var _this = this;

  var dir = nextN > this.currentN ? 'right' : 'left';
  var speed = this.slideOptions.speed,
      outSpeed = speed * 0.5,
      inSpeed = speed * 0.3;

  // change svg path on entering slide to "curved"
  var nextItem = this.slides[ nextN ];

  // morph svg path on exiting slide to "curved"
  this.slides[ this.currentN ].animate(
    dir, outSpeed, '>',
    function () {
      // morph svg path on entering slide to "rectangle"
      nextItem.plot(dir === 'right' ? 'left' : 'right');
      setTimeout(function () {
        nextItem.animate('rect', speed, 'elastic');
        _this.isAnimating = false;
      }, outSpeed);
    });

  this._translate(nextN);
};



function createTangle() {
  var parent = document.querySelector('#firstPage .svg');
  // var bounds = parent.getBoundingClientRect();
  var svgId = parent.getAttribute('id');
  var tangle = new Tangle(svgId);
}

function Tangle(svgId, bounds) {
  this.svgId = svgId;
  // this.bounds = bounds;

  this.description = document.querySelector('#firstPage .main [description]');

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

  this.graph = new Graph(this.draw, VERTEXES_TANGLE, gridParams_TANGLE);

  this.mlCloud = new MLCloud(this.draw, 250, 150);
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
  this.graph.toColor(gridParams_TANGLE.fill1, gridParams_TANGLE.stroke1, 4500);
  VERTEXES_TANGLE.forEach(function (vertex, i) {
    if (mlHosts_TANGLE.indexOf(vertex.idx) > -1) {

      setTimeout(function () {
        var isLast = (_this.mlHosts.length + 1) == mlHosts_TANGLE.length;
        var mlhost = new MLNode(mlhostGroup, vertex, gridParams_TANGLE.fill, isLast && event);
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
    node.moveToCenter(_this.mlCloud.cx, _this.mlCloud.cy,
                      isLast && showCloud,
                      isLast && event);
  });
};

Tangle.prototype.drawAgents = function(event) {
  this.agents = [];

  var agentGroup = this.draw.group();
  this.graph.vertexesGroup.before(agentGroup);

  var _colors = Random.shuffle(agentsColors);

  var _this = this;
  VERTEXES_TANGLE.forEach(function (vertex, i) {
    if (agentHosts_TANGLE.indexOf(vertex.idx) > -1) {
      var isLast = (_this.agents.length + 1) == agentHosts_TANGLE.length;
      var color = _colors[_this.agents.length];
      var agent = new Agent(
        agentGroup, _this.mlCloud.cx, _this.mlCloud.cy, vertex, color,
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

var VERTEXES_TANGLE = [
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


var mlHosts_TANGLE = [2, 4, 6, 9, 18, 21];
var agentHosts_TANGLE = [2, 4, 9, 12, 18, 21];

var agentsColors = [
  'rgb(255, 191, 0)',  // orange
  'rgb(0, 255, 191)', // blue
  'rgb(191, 255, 0)', // yellow
  'rgb(75, 255, 0)',  // green
  'rgb(255, 64, 255)', // purple
  'rgb(255, 0, 106)',  // red
];

var gridParams_TANGLE = {
  r: 12,
  w: 1,
  sw: 1,
  fill1: '#6f8b82',
  stroke1: '#5d7e74',
  fill: '#2bd46c',
  stroke: '#2bd46c',
  // color: '#2c9b5a',
  // color: 'yellow',
  // color: '#f1f1b8',
  // color: '#b3f7ad',
};

 var mlNodeCloudParams = {
  // logo
  logoPath: 'dist/logo/l4.png',
  logoW: 50,
  // main
  r: 30,
  // color: '#00fff5',
  color: '#00d6ff',
  edges: 8,
  // shadow
  shadowK: 1.3,
  shadowOpacity: 0.3,
};
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