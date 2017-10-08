(function (window) {
  'use strict';

  function CognIOTA(params) {
    this.root = params.root;

    this.mlx = params.mlx;
    this.mly = params.mly;

    this.vertexes = params.vertexes;

    this.method = this[params.method] || window.NOOP;
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

  CognIOTA.prototype.out = function(end) {
    var _this = this;
    _this.method(end || window.NOOP, {clear: true});
  };

  /////

  CognIOTA.prototype._init = function() {
    this.draw = this.root.group();
    this.graph = new Graph(this.draw, this.vertexes.array, this.vertexes.params);
    this.mlCloud = new MLCloud(this.draw, this.mlx, this.mly);

    this.init();

    this.initPrepare();
  };

  CognIOTA.prototype.initPrepare = function() {
    var _this = this;
    var stack = this.preparationMethods.map(function (methodName) {
      return function () {
        return new Promise(function (resolve) {
          return _this[methodName](resolve, {forced: true});
        });
      };
    });
    window.promisesStack(stack);
  };

  CognIOTA.prototype.init = function() {
    // for inheritance
  };

  ////

  CognIOTA.prototype.auction = function(agents, winner, packets, forced) {
    var t1 = 80;
    var _this = this;

    var stack = [];

    if (forced) {
      winner.activate(false);
      winner.colorize(this.shop.color);
      return stack;
    }

    stack.push(function () {
      return _this.writeConsole({
        author: _this.mlCloud,
        verb: 'broabcasts',
        type: 'AUCTION INITIAL',
        lines: packets.initial(),
      });
    });

    stack.push(function () {
      var promise;
      agents.forEach(function (agent) {
        var s = [];
        s.push(function () {
          return agent.text.receive('?');
        });

        s.push(function () {
          agent.circle.showFill(true);
          return agent.circle.circleIn(true).then(function () {
            return agent.circle.showBG(true);
          });
        });

        promise = window.promisesStack(s);
      });
      return promise;
    });

    stack.push(function () {
      return window.timePromise(300);
    });

    agents.forEach(function (agent, i) {

      stack.push(function () {
        return _this.writeConsole({
          author: agent,
          verb: 'answers',
          type: 'AUCTION BET',
          lines: packets.bet(agent),
        });
      });

      stack.push(function () {
        agent.circle.hideBG(true);
        agent.circle.hideFill(true);
        agent.circle.circleOut(true);

        return agent.text.send(agent.bet ? agent.bet[0] : '!');
      });

    });


    agents.forEach(function (agent) {
      stack.push(function () {
        _this.writeConsole({
          author: _this.mlCloud,
          verb: 'calculates',
          type: '--',
          lines: packets.calculate(agent),
        });
        return window.NOOPPromise;
      });

      stack.push(function () {
        return _this.mlCloud.colorShadow(agent.color, true);
      });

      stack.push(function () {
        return window.timePromise(t1);
      });
    });

    for (var i = 0; i < 4; i++) {
      stack.push(function () {
        return _this.mlCloud.colorShadow(_this.shop.color, true);
      });

      stack.push(function () {
        return window.timePromise(t1);
      });

      stack.push(function () {
        return _this.mlCloud.colorShadow(winner.color, true);
      });

      stack.push(function () {
        return window.timePromise(t1);
      });
    }

    stack.push(function () {
      return _this.mlCloud.ding();
    });

    stack.push(function () {
      _this.mlCloud.colorShadow(_this.shop.color, true);
      return winner.colorize(_this.shop.color, false, true);
    });

    stack.push(function () {
      winner.activate(true);
      return winner.text.receive('!');
    });

    return stack;
  };

  window.CognIOTA = CognIOTA;
})(window);