(function () {
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

    // var path = Helpers.getCirclePath(params.r);
    // var gridNode = this.vertexesGroup.path(path);
    var gridNode = this.vertexesGroup.circle();
    gridNode.attr({fill: params.stroke, r: params.r}).center(vertex.pos[0], vertex.pos[1]);
    // this.vertexesGroup.text(vertex.idx + '').center(vertex.pos[0] + 5, vertex.pos[1] + 20);
    // gridNode.style({cx: vertex.pos[0], cy: vertex.pos[1]})

    vertex.neightbors.forEach(function (neightborId) {
      var neightbor = _this.vertexes[neightborId];
      neightbor.neightbors.push(vertex.idx);
      _this.edgeGroup.line(new SVG.PointArray([vertex.pos, neightbor.pos]))
                     .attr(params);
    });
  };


  window.Graph = Graph;
})();