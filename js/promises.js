(function (window) {
  'use strict';

  window.NOOP = Function.prototype;
  window.NOOPPromise = new Promise(function (resolve) {resolve()});
  window.timePromise = function (t) {
    return new Promise(function (resolve) {
      setTimeout(resolve, t);
    });
  };
  window.promisesStack = function (stack) {
    return new Promise(function (end) {
      function process(i) {
        var p = stack[i];
        if (!p || stack.stop) return end();

        return new Promise(function (resolve) {
          if (stack.stop) {
            end();
            resolve();
          }
          return p().then(resolve);
        }).then(function () {
          if (!stack.stop) {
            process(i + 1);
          }
        });
      }

      return process(0);
    });
  };
})(window);