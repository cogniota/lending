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