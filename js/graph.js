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