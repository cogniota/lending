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