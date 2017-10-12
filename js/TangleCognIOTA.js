(function (window) {
  'use strict';

  var VERTEXES = [
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
    {idx: 14, neightbors: [15], pos: [292, 192]},
    {idx: 15, neightbors: [16], pos: [413, 192]},
    {idx: 16, neightbors: [20, 21], pos: [475, 192]},

    {idx: 17, neightbors: [18], pos: [25, 275]},
    {idx: 18, neightbors: [19], pos: [137, 275]},
    {idx: 19, neightbors: [20], pos: [255, 275]},
    {idx: 20, neightbors: [21], pos: [361, 275]},
    {idx: 21, neightbors: [], pos: [475, 275]},
  ];

  var GRAPH_SETTINGS = {
    'r': 6,
    'stroke-width': 1,
    'stroke': '#2bd46c',
  };

  var MLHOSTS_IDXS = [2, 4, 6, 9, 18, 21];
  var AGENTS_IDXS = [2, 4, 9, 12, 18, 21];

  var COLORS = [
    '#ff80ab', // pink
    '#f57c00',  // orange
    '#1de9b6', // blue
    '#b2ff59', // yellow
    // 'rgb(75, 255, 0)',  // green
    '#6a1b9a', // purple
    '#d50000',  // red
  ];

  var AGENT_CIRCLE_SETTINGS = {
    r: GRAPH_SETTINGS.r * 1.7,
    border: 1,

    bg: {
      r: GRAPH_SETTINGS.r,
      fill: GRAPH_SETTINGS.stroke,
    },

    'fill-opacity': 0.4,
  };

  var AGENT_LINE_SETTINGS = {
    'stroke-width': 2,
  };

  var AGENT_TEXT_SETTINGS = {
    r: AGENT_CIRCLE_SETTINGS.r * 0.8,
    'stroke-width': 1,
    'fill-opacity': 0.5,
    bg: {
      fill: '#63749b',
      opacity: 0.7,
    },
    fz: AGENT_CIRCLE_SETTINGS.r * 0.8 * 1.8
  };

  function TangleCognIOTA (params) {
    params.vertexes = {
      array: VERTEXES,
      params: GRAPH_SETTINGS,
    };
    params.mlx = 500 / 2;
    params.mly = 300 / 2;
    CognIOTA.call(this, params);

  }
  // inherit TangleCognIOTA
  TangleCognIOTA.prototype = Object.create(CognIOTA.prototype);

  // correct the constructor pointer because it points to TangleCognIOTA
  TangleCognIOTA.prototype.constructor = TangleCognIOTA;


  TangleCognIOTA.prototype.init = function() {
    this.agents = this._createShops();

    this._createMLNodes();

    var _this = this;
    this.shop = this.agents[0];
    this.providers = [1, 2, 4].map(function (i) {return _this.agents[i];});
    this.provider = this.providers[this.providers.length - 1];
  };
  //////

  TangleCognIOTA.prototype._createShops = function() {
    var _this = this;
    var group = this.draw.group();
    this.mlCloud.group.forward();

    return AGENTS_IDXS.map(function (idx, i) {
      var vertex = _this.graph.vertexes[idx];
      var agent = new Agent(group, {
        circle: AGENT_CIRCLE_SETTINGS,
        line: AGENT_LINE_SETTINGS,
        text: AGENT_TEXT_SETTINGS,

        color: COLORS[i],
        cx: vertex.pos[0],
        cy: vertex.pos[1],
        mlx: _this.mlx,
        mly: _this.mly,
        mlw: 60,
      });
      agent.circle.hideFill(false);
      agent.hide();
      return agent;
    });
  };

  TangleCognIOTA.prototype._createMLNodes = function() {
    var _this = this;
    var group = this.draw.group();

    this.mlhosts = MLHOSTS_IDXS.map(function (idx) {
      var vertex = _this.graph.vertexes[idx];
      var mlhost = new MLHost(group, vertex);
      mlhost.hide();
      return mlhost;
    });
  };

  TangleCognIOTA.prototype._hideMLHosts = function() {
    this.mlhosts.forEach(function (mlhost) {
      mlhost.hide();
    });
  };

  // params :
  //    forced: prepare all things for another stage
  //    clear: remove all after yourself to be able to play again

  TangleCognIOTA.prototype.createTangle = function(end, params) {
    params = params || {};
    if (params.forced) {
      return end();
    }

    // just show the graph for some time
    return setTimeout(end, 800);
  };

  TangleCognIOTA.prototype.createMLNodes = function(end, params) {
    params = params || {};
    var _this = this;

    if (params.clear) {
      return this._hideMLHosts();
    }

    var d = 250;
    if (params.forced) {
      d = 0;
    }
    var t = -d;
    return Random.shuffle(this.mlhosts).forEach(function (mlhost, i) {
      t += d;
      return setTimeout(function () {
        var promise = mlhost.show(!params.forced);

        if (i == _this.mlhosts.length - 1) {
          return promise.then(end);
        }
      }, t);

    });
  };

  TangleCognIOTA.prototype.createMLCloud = function(end, params) {
    params = params || {};

    if (params.forced) {
      this.mlCloud.show();
      this._hideMLHosts();
      return end();
    } else if (params.clear) {
      this.mlCloud.hide();
      return this.mlhosts.forEach(function (mlhost) {
        mlhost.deleteLines();
        return mlhost.show();
      });
    }

    var _this = this;

    var a;
    this.mlhosts.forEach(function (mlhost) {
      a = mlhost.connectTo(_this.mlhosts);
    });

    return a.then(function () {
      var b;
      _this.mlhosts.forEach(function (mlhost) {
        b = mlhost.toCenter(_this.mlx, _this.mly);
      });

      return b.then(function () {
        var c;
        setTimeout(function () {
          _this.mlCloud.show();
        }, 100);

        _this.mlhosts.forEach(function (mlhost) {
          c = mlhost.disappear(_this.mlx, _this.mly, MLCloud.r, MLCloud.edges);
        });

        return c.then(end);
      });
    });
  };

  TangleCognIOTA.prototype.shopRequests = function(end, params) {
    params = params || {};
    var _this = this;

    if (params.clear) {
      this.agents.forEach(function (agent) {
        agent.hide();
      });
      this.shop.deactivate();
      return end();
    }

    var promise, animated = !params.forced;
    this.agents.forEach(function (agent) {
      promise = agent.show(animated);
    });

    return promise.then(function () {
      if (params.forced) {
        return _this.shop.activate(false).then(end);
      }

      return setTimeout(function () {
        _this.shop.sendRequest().then(end);
      }, 1000);
    });
  };

  TangleCognIOTA.prototype.mlSendsResponse = function(end, params) {
    params = params || {};
    if (params.clear) {
      return this.mlCloud.toDefault();
    }

    var promise = this.mlCloud.fallInColor(this.shop.color, !params.forced);
    if (params.forced) {
      return promise.then(end);
    }

    var _this = this;
    return promise.then(function () {
      return _this.mlCloud.ding().then(function () {
        return _this.shop.receiveResponse().then(end);
      });
    });
  };

  TangleCognIOTA.prototype.mlAuction = function(end, params) {
    params = params || {};

    if (params.clear) {
      this.provider.deactivate(false);
      this.mlCloud.colorShadow(this.shop.color, false);
      return end();
    }

    else if (params.forced) {
      this.provider.activate(false);
      this.mlCloud.colorShadow(this.provider.color, false);
      return end();
    }

    else {
      var stack = [];
      var _this = this;
      var t1 = 200, t2 = 100;

      this.providers.forEach(function (agent) {
        stack.push(function () {
          agent.activate(true, false);
          return _this.mlCloud.colorShadow(agent.color, true);
        });

        stack.push(function () {
          return window.timePromise(t1);
        });

        if (agent.idx == _this.provider.idx) {
          stack.push(function () {
            return _this.mlCloud.ding();
          });
        } else {
          stack.push(function () {
            return agent.deactivate(true, false);
          });

          stack.push(function () {
            return window.timePromise(t2);
          });
        }
      });

      stack.push(function () {
        return window.NOOPPromise.then(end);
      });

      return window.promisesStack(stack);
    }

  };

  TangleCognIOTA.prototype.mlChooseProvider = function(end, params) {
    params = params || {};

    if (params.clear) {
      this.mlCloud.colorShadow(this.provider.color, false);
      return this.provider.colorize(this.provider.color, false, false);
    }

    else if (params.forced) {
      return end();
    }

    else {
      var _this = this;

      this.mlCloud.colorShadow(this.shop.color, true);
      this.mlCloud.ding();
      this.provider.colorize(this.shop.color);

      return this.provider.receiveRequest().then(function () {
        return _this.provider.sendResponse().then(function () {
          _this.shop.receiveResponse().then(end);
        });
      });
    }
  };


  TangleCognIOTA.GRAPH_SETTINGS = GRAPH_SETTINGS;

  window.TangleCognIOTA = TangleCognIOTA;
})(window);