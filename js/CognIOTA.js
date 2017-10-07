(function () {
  'use strict';

  var NOOP = Function.prototype;
  var NOOPPromise = new Promise(function (resolve) {resolve()});

  function CognIOTA(params) {
    this.root = params.root;

    this.mlx = params.mlx;
    this.mly = params.mly;

    this.vertexes = params.vertexes;

    this.method = this[params.method] || NOOP;
    this.preparationMethods = params.preparationMethods == void 0 ? [] : params.preparationMethods;

    this._init();
  };

  CognIOTA.prototype.play = function(end) {
    var beforePlayTime = 1000;
    var afterPlayTime = 1000;
    var _this = this;

    setTimeout(function () {
      _this.method(function () {
        setTimeout(end, afterPlayTime);
      });
    }, beforePlayTime);
  };

  CognIOTA.prototype.out = function() {
    var _this = this;
    _this.method(NOOP, {clear: true});
    // setTimeout(function () {
    // }, 100);
  };

  /////

  CognIOTA.prototype._init = function() {
    this.draw = this.root.group();
    this.graph = new Graph(this.draw, this.vertexes.array, this.vertexes.params);
    this.mlCloud = new MLCloud(this.draw, this.mlx, this.mly);

    this.init();

    var _this = this;
    function promisesStack(i, promise) {
      var methodName = _this.preparationMethods[i];
      if (!methodName) return;

      return new Promise(function (resolve) {
        return _this[methodName](resolve, {forced: true});
      }).then(function () {
        promisesStack(i + 1);
      });
    }
    promisesStack(0, NOOPPromise);
  };

  CognIOTA.prototype.init = function() {
    // pass
  };

  window.CognIOTA = CognIOTA;
})();