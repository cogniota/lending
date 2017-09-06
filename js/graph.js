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

