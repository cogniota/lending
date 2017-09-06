function getCirclePath(r) {
  var qrt = r / 4;
  var [a, b, c] = [qrt, qrt * 2, qrt * 3];
  return 'M' + b + ' 0 ' +
         'C' + c + ' 0 ' + r + ' ' + a + ' ' + r + ' ' + b + ' ' +
         'C' + r + ' ' + c + ' ' + c + ' ' + r + ' ' + b + ' ' + r + ' ' +
         'C' + a + ' ' + r + ' 0 ' + c + ' 0 ' + b + ' ' +
         'C0 ' + a + ' ' + a + ' 0 ' + b + ' 0 Z';
};

function getRoundPath(r) {
  return 'M' + 0 + ' ' + 0 + ' ' +
         'L' + r + ' ' + 0 + ' ' +
         'L' + r + ' ' + r + ' ' +
         'L' + 0 + ' ' + r + ' ' +
         'Z';
};

function getTriangleTopPath(r) {
  return 'M' + (r / 2) + ' ' + 0 + ' ' +
         'L' + r + ' ' + r + ' ' +
         'L' + 0 + ' ' + r + ' ' +
         'Z';
};

function getTriangleBottomPath(r) {
  return 'M' + 0 + ' ' + 0 + ' ' +
         'L' + r + ' ' + 0 + ' ' +
         'L' + (r / 2) + ' ' + r + ' ' +
         'Z';
};

function getCloudPath(r) {
    // return 'M 25,60 ' +
    //      'a 20,20 1 0,0 0,40 ' +
    //      'h 50 ' +
    //      'a 20,20 1 0,0 0,-40 ' +
    //      'a 10,10 1 0,0 -15,-10 ' +
    //      'a 15,15 1 0,0 -35,10' +
    //      ' z'
  var i = 3.75, k = 4.5;
  var a = r,
      b = a * 2,
      c = a * 2.5,
      d = a * 0.5,
      e = a * 0.75,
      f = a * 1.75,
      g = a * 1.25;
  return ' M ' + a +', ' + g +
         ' a ' + a + ',' + a + ' 1 0,0 0,' + b +
         ' h ' + c +
         ' a ' + a + ',' + a + ' 1 0,0 0,' + (b * -1) +
         ' a ' + d + ',' + d + ' 1 0,0 ' + (e * -1) + ',' + (d * -1) +
         ' a ' + e + ',' + e + ' 1 0,0 ' + (f * -1) + ',' + d +
         ' z';
}

////////
function Grid (draw, bounds, r) {
  this.step = 50;

  this.group = draw.group();

  var corrections = this.createGrid(draw, bounds, r);
  draw.x(correction.x).y(correction.y);

  for (var i = this.group.children().length - 1; i >= 0; i--) {
    var node = this.group.children()[i];
    node.matrixNeightbors = this.getNodeMatrixNeightbors(node);
    node.possibleNeightbors = node.matrixNeightbors.reduce(function (bucket, n) {
      if (n.id() != node.id()) {
        bucket[n.id()] = n;
      }
      return bucket;
    }, {});
  }
}

Grid.prototype.createGrid = function(draw, bounds, r) {
  var step = this.step + r;
  var border = step * 0.2;
  var width = bounds.width - border;
  var height = bounds.height - border;

  this.matrix = [];
  var my = 0, row, mx, node;
  for (var y = border; y < height; y += Random.deviate(step, step * 0.3)) {
    row = [];
    mx = 0;
    for (var x = border; x < width; x += Random.deviate(step, step * 0.3)) {
      node = this.createNode(r, x, y, my, mx);
      row.push(node);
      mx += 1;
    }
    my += 1;
    this.matrix.push(row);
  }
  this.X = mx;
  this.Y = my;

  var groupBounds = this.group.node.getBoundingClientRect();
  return correction = {
    x: (width - border - groupBounds.width)/2,
    y: (height - border - groupBounds.height)/2,
  };
};

Grid.prototype.createNode = function(r, x, y, my, mx) {  //x, y, matrixY, matrixX
  var path = getCirclePath(r);
  var dev = r * 0.2;
  // var x = Random.deviate(x, dev);
  // var y = Random.deviate(y, dev);
  var node = this.group.group();
  var group = this.group;
  node.hasIntersect = function (line) {
    var tmpNode = group.path(path).move(x, y);
    var crossed = tmpNode.intersectsLine(line).length != 0;
    tmpNode.remove();
    return crossed;
  };
  node.clear = function () {
    var clsnames = node.classes();
    clsnames.forEach(function (cls) {
      if (cls != 'node' && cls != 'active') {
        node.removeClass(cls);
      }
    });
    node.move(x, y);
    node.children().forEach(function (ch) {
      ch.remove();
    });
    node.opacity(1);
  }
  node.move(x, y);
  node.r = r;
  node.c = r /2;
  node.defPath = node.path(path);
  node.defPath.addClass('defPath');
  node.edges = [];
  node.neightbors = [];
  node.mpos = [my, mx];
  node.addClass('node');

  // this.bindText(node);
  return node;
};

Grid.prototype.bindText = function(node) {
  var text = node.id().replace( /^\D+/g, '');
  // var text = node.mpos.toString();
  node.text(text)
      .font('weight', '400').font('size', '12px').fill('#fff').center(node.c, node.c);
};

Grid.prototype.getNodeMatrixNeightbors = function(node) {
  var deepX = 3;
  var deepY = 2;

  var my = node.mpos[0];
  var mx = node.mpos[1];
  var matrix = this.matrix;
  var neightbors = [];

  var maxX = Math.min(mx + deepX, this.X - 1);
  var maxY = Math.min(my + deepY, this.Y - 1);
  var minX = Math.max(mx - deepX, 0);
  var minY = Math.max(my - deepY, 0);
  for (var y = minY; y <= maxY; y++) {
    for (var x = minX; x <= maxX; x++) {
      if (!(x === minX && y === minY) && !(x === minX && y === maxY) &&
          !(x === maxX && y === minY) && !(x === maxX && y === maxY)) {
        var neightbor = matrix[y][x];
        if (neightbor.id() !== node.id()) {
          neightbors.push(neightbor);
        }
      }
    }
  }

  return neightbors;
};