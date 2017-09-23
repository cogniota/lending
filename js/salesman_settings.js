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

var greens_SALESMAN = [
  'M26 68 l45 3 l 32 26 l -67 15 Z',
  'M42 207 l57 -13 l 37 25 l 12 26 l -70 10  l -35 -10 Z',
  'M356 75 l50 -16 l 32 11 l -17 25 l -80 5 Z',
  'M357 142 l10 -11 l 88 61 l 10 54 l -10 10 l -80 -54 Z',
];

var fountains_SALESMAN = [
  [155, 70],
  [275, 305],
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

var cars_color_SALESMAN = [
  '#ef5350',
  '#ff5722',
  '#ff9800',
];

var gridParams_SALESMAN = {
  r: 5,
  sw: 1,
  w: 6,
  // bg: 'rgba(234, 230, 220, 0.8)',
  fill: '#ffc133',
  stroke: '#ffc133',
  // color: '#2c9b5a',
  // color: 'yellow',
  // color: '#f1f1b8',
  // color: '#b3f7ad',
};