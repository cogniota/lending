var minEdges = 3;
var maxEdges = 4;

function pointFromNodes(start, end) {
  var x1 = start.cx(),
      x2 = end.cx(),
      y1 = start.cy(),
      y2 = end.cy();
  return new SVG.PointArray([[x1, y1], [x2, y2]]);
}

function Graph(draw, bound, r) {
  this.edgeGroup = draw.group();
  this.edges = [];

  var baseGrid = new Grid(draw, bound, r);

  // this.build(baseGrid);
}

Graph.prototype.build = function(baseGrid) {

  var max = baseGrid.matrix.length;
  // var startX = Random.range(0, max * 0.25);
  // var startY = Random.range(0, max * 0.25);
  var startX = 0;
  var startY = 0;

  this.nodes = baseGrid.group.children();
  this.activeVetrexes = [baseGrid.matrix[startX][startY]];
  this.possibleNodes = this.activeVetrexes.reduce(function (bucket, vertex) {
    bucket[vertex.id()] = vertex;
    return bucket;
  }, {});

  var i = 0;
  do {
    var startId = Random.choice(this.possibleNodes);
    var start = this.possibleNodes[startId];
    var j = 0;
    // console.log(this.possibleNodes, start)
    this.createEdge(start);
    // while (start.edges.length < minEdges && j < 10) {
    //   j += 1;
    // }
    i += 1;
    if (start.edges.length >= maxEdges) {
      for (var neightborId in start.possibleNeightbors) {
        var neightbor = start.possibleNeightbors[neightborId];
        delete neightbor.possibleNeightbors[startId];
        delete start.possibleNeightbors[neightborId];
      }
      delete this.possibleNodes[startId];
    }
  } while (
    this.activeVetrexes.length < 24 &&
    Object.keys(this.possibleNodes).length > 0
  );
  // } while (i < 10);
};

Graph.prototype.hasFreeVertex = function(first_argument) {
  return this.activeVetrexes.some(function (v) {
    return Object.keys(v.possibleNeightbors).length > 0;
  });
};

Graph.prototype.createEdge = function(start) {
  var startId = start.id();
  var endId = Random.choice(start.possibleNeightbors);
  var end = start.possibleNeightbors[endId];
  this.activeVetrexes.push(end);

  delete start.possibleNeightbors[endId];
  delete end.possibleNeightbors[startId];

  start.addClass('active');
  end.addClass('active');

  var edge = this.edgeGroup.line(pointFromNodes(start, end));
  edge.addClass('edge');
  edge.start = start.id();
  edge.end = end.id();
  edge.hasIntersect = function (pos) {
    return SVGIntersections.linePos_linePos(
      pos, SVGIntersections.fromLineToLinePos(edge));
  };
  this.edges.push(edge);

  start.edges.push(edge);
  end.edges.push(edge);

  var _this = this;
  this.nodes.forEach(function (node) {
    if (Object.keys(node.possibleNeightbors).length > 0) {

      var hasIntersect = node.id() != startId && node.id() != endId && node.hasIntersect(edge);

      for (var neightborId in node.possibleNeightbors) {
        var neightbor = node.possibleNeightbors[neightborId];
        // if (neightborId == 'SvgjsG1011' || node.id() == 'SvgjsG1011') {
        //   console.log(node.id(), neightborId, hasIntersect, _this.hasEdgeAtLine(node, neightbor));
        // }
        if (hasIntersect
          // || _this.hasEdgeAtLine(node, neightbor)
            // || _this.hasVertexAtLine(node, neightbor)
            ) {
          delete neightbor.possibleNeightbors[node.id()];
          delete node.possibleNeightbors[neightborId];
        }
      }
    }
  });

  this.possibleNodes = this.activeVetrexes.reduce(function (bucket, vertex) {
    if (Object.keys(vertex.possibleNeightbors).length > 0) {
      bucket[vertex.id()] = vertex;
    }
    return bucket;
  }, {});

};

Graph.prototype.hasVertexAtLine = function(start, end) {
  return false;
  if (this.activeVetrexes.length == 0) {
    return false;
  }
  // return false;
  var tmp = this.edgeGroup.line(pointFromNodes(start, end));
  var crossed = this.activeVetrexes.some(function (vertex) {
    return vertex.id() != start.id() && vertex.id() != end.id() &&
           vertex.hasIntersect(tmp);
  });
  tmp.remove();
  return crossed;
};

Graph.prototype.hasEdgeAtLine = function(start, end) {
  if (this.edges.length == 0) {
    return false;
  }
  var x1 = start.cx(),
      x2 = end.cx(),
      y1 = start.cy(),
      y2 = end.cy();
  var startId = start.id(),
      endId = end.id();
  var pos = {x1: x1, x2: x2, y1: y1, y2: y2};
  return this.edges.some(function (edge) {
    if (edge.start == startId || edge.start == endId) return false;
    if (edge.end == startId || edge.end == endId) return false;
    // console.log(road.nodes, ids, pos, ids.indexOf(road.nodes[0]) < 0, ids.indexOf(road.nodes[1]) < 0);
    return edge.hasIntersect(pos);
  });
};