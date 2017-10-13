(function (window) {
  'use strict';

  function Graph(draw, vertexes, params) {
    this.vertexes = vertexes.reduce(function (bucket, vertex) {
      bucket[vertex.idx] = Object.assign({}, vertex);
      return bucket;
    }, {});

    this.group = draw.group();
    this.edgeGroup = this.group.group();
    this.vertexesGroup = this.group.group();

    for (var idx in this.vertexes) {
      var vertex = this.vertexes[idx];
      this.createVertex(vertex, params);
    }
  }

  Graph.prototype.createVertex = function(vertex, params) {
    var _this = this;
    var gridNode = this.vertexesGroup.circle();
    gridNode.attr({fill: params.stroke, r: params.r});
    gridNode.center(vertex.pos[0], vertex.pos[1]);
    // gridNode.fill('red')
    // this.vertexesGroup.text(vertex.idx + '').center(vertex.pos[0] + 5, vertex.pos[1] + 20);
    // gridNode.style({cx: vertex.pos[0], cy: vertex.pos[1]});

    // // HARDCORE!
    if (vertex.idx == 23 || vertex.idx == 24) {
      gridNode.opacity(0);
    }

    vertex.neightbors.forEach(function (neightborId) {
      var neightbor = _this.vertexes[neightborId];
      neightbor.neightbors.push(vertex.idx);
      _this.edgeGroup.line(new SVG.PointArray([vertex.pos, neightbor.pos]))
                     .attr(params);
    });
  };


  window.Graph = Graph;
})(window);