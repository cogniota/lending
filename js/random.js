(function (window) {
  'use strict';

  window.Random = {
    range: function range(min, max) {
      return Math.round(Math.random() * (max - min) + min);
    },
    choice: function choice(arr) {
      var max = arr.length;
      if (max === void 0) {
        arr = Object.keys(arr);
        max = arr.length;
      }
      var n = this.range(0, max - 1);
      return arr[n];
    },
    shuffle: function shuffle(_a) {
      var a = _a.slice();
      var j, x, i;
      for (i = a.length; i; i--) {
          j = Math.floor(Math.random() * i);
          x = a[i - 1];
          a[i - 1] = a[j];
          a[j] = x;
      }
      return a;
    },
    deviate: function deviate(i, d) {
      var a = this.range(d * -1, d);
      return i + a;
    }
  };

})(window);