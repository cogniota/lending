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