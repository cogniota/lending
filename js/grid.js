function getCirclePath(r) {
  var a = r / 4, b = a * 2, c = a * 3;
  return 'M' + b + ' 0 ' +
         'C' + c + ' 0 ' + r + ' ' + a + ' ' + r + ' ' + b + ' ' +
         'C' + r + ' ' + c + ' ' + c + ' ' + r + ' ' + b + ' ' + r + ' ' +
         'C' + a + ' ' + r + ' 0 ' + c + ' 0 ' + b + ' ' +
         'C0 ' + a + ' ' + a + ' 0 ' + b + ' 0 Z';
};

function getCircle3QPath(r) {
  var a = r / 4, b = a * 2, c = a * 3;
  return 'M' + b + ' 0 ' +
         'C' + c + ' 0 ' + r + ' ' + a + ' ' + r + ' ' + b + ' ' +
         'C' + r + ' ' + c + ' ' + c + ' ' + r + ' ' + b + ' ' + r + ' ' +
         'C' + a + ' ' + r + ' 0 ' + c + ' 0 ' + b + ' ';
};


function getCircleHPath(r) {
  var a = r / 4, b = a * 2, c = a * 3;
  return 'M' + b + ' 0 ' +
         'C' + c + ' 0 ' + r + ' ' + a + ' ' + r + ' ' + b + ' ' +
         'C' + r + ' ' + c + ' ' + c + ' ' + r + ' ' + b + ' ' + r + ' ';
};

function getCircleQPath(r) {
  var a = r / 4, b = a * 2, c = a * 3;
  return 'M' + b + ' 0 ' +
         'C' + c + ' 0 ' + r + ' ' + a + ' ' + r + ' ' + b + ' ';
};


function getHexPath(s) { //side
  var a = r * 0.86602, b = a / 2, c = a + b, d = a * -1, e = b * -1, f = r * -1;
  // return 'M ' + c + ' 0' +
  //       ' l ' + a + ' ' + b +
  //       ' v ' + r +
  //       ' l ' + d + ' ' + b +
  //       ' l ' + d + ' ' + e +
  //       ' v ' + f + ' z';
  return 'M 0 0 l 86.602 50 v 100 l -86.602 50 l -86.603 -50 v -100 z'
}



function getOxoPath(s) { //side
  var a = s * 2, b = s /2, c = s * -1, d = b * -1;
  return 'M ' + a + ' ' + 0 +
        ' h ' + s +
        ' l ' + b + ' ' + b +
        ' v ' + s +
        ' l ' + d + ' ' + b +
        ' h ' + c +
        ' l ' + d + ' ' + d +
        ' v ' + c + ' z';
}


// 30 51.96152422706631
// 100 0.86602
