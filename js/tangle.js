function createTangle() {
  var parent = document.querySelector('#firstPage .svg');
  // var bounds = parent.getBoundingClientRect();
  var svgId = parent.getAttribute('id');
  var tangle = new Tangle(svgId);
}

function Tangle(svgId, bounds) {
  this.svgId = svgId;
  // this.bounds = bounds;

  this.description = document.querySelector('#firstPage .description [protocol]');

  this.run();
}

Tangle.prototype.showDescription = function(params, event) {
  var _this = this;

  function show(text){
    if (text) {
      _this.draw.addClass('overflowed');
      _this.description.innerHTML = '<div>' + text + '</div>';
      _this.description.className = 'active';
    } else {
      _this.draw.removeClass('overflowed');
      _this.description.innerHTML = '';
      _this.description.className = '';
    }
  }

  show(params.description);

  setTimeout(function () {
    show();

    setTimeout(function () {
      _this[params.name](event);
    }, params.beforeActionT || 1450);

  }, params.textT || 3300);
};

Tangle.prototype.run = function() {
  var chain = [
    {name: 'createSVG', beforeStageT: 600},

    {name: 'drawTangle', beforeStageT: 100,
     description:
      'It is <strong>IOTA tangle</strong>.',
     textT: 1900, beforeActionT: 530},

    {name: 'drawmlHosts', beforeStageT: 1000,
     description:
      'Any IOTA node can be turned into a <strong>machine learning node</strong>.',
     beforeActionT: 550},

    {name: 'mlHostsToCluster', beforeStageT: 800,
     description:
      'Machine Learning nodes create <strong>CognIOTA cluster.</strong>',
     },
    {name: 'mlClusterToCenter', beforeStageT: 100},

    {name: 'drawAgents', beforeStageT: 700,
     description:
      'IOTA nodes <strong>request</strong> machine learning <strong>services</strong> from CognIOTA.',
     },
    {name: 'customerSendRequest', beforeStageT: 150},

    {name: 'findSolution', beforeStageT: 680,
     description: 'CognIOTA <strong>finds the solution</strong> for the request.',
    },

    {name: 'testProviders', beforeStageT: 550,
     description: 'It uses <strong>auctions</strong> for finding the best task executer.',
     },

    {name: 'providerSendResponse', beforeStageT: 700,
     description: 'CognIOTA powers <br><strong>the economy of IoT</strong>.'},

    {name: 'clear', beforeStageT: 600,}
  ];

  chain.forEach(function (method, i) {
    var nextMethod = chain[i + 1];
    if (!nextMethod) nextMethod = chain[0];
    method.next = nextMethod && [nextMethod.name];
  });

  var methods = chain.reduce(function (bucket, method) {
    // if (bucket[method.name]) {
    //   bucket[method.name].next = bucket[method.name].next.concat(method.next);
    // } else {
    // }
    bucket[method.name] = method;
    return bucket;
  }, {});

  var _this = this;

  document.addEventListener('stageIsOver', function (e) {
    var method = methods[e.detail];
    if(!method) {
      return;
    }

    var t = method.beforeStageT || 0;
    setTimeout(function () {
      callMethod(method);
    }, t);

  }, false);

  function createEvent(params) {
    return function () {
      var nextMethod = params.next;
      // var nextMethod = params.next && params.next[0];
      // params.next = params.next && params.next.slice(1, params.next.length);
      var event = new CustomEvent('stageIsOver', {detail: nextMethod});
      document.dispatchEvent(event);
    };
  }

  function callMethod(params) {
    var event = createEvent(params);
    if (params.description != void 0) {
      return _this.showDescription(params, event);
    }
    _this[params.name](event);
  }

  callMethod(chain[0]);
};


Tangle.prototype.createSVG = function(event) {
  this.draw = SVG(this.svgId);
  this.draw.addClass('overflowed');

  this.graph = new Graph(this.draw, VERTEXES_TANGLE, gridParams_TANGLE);

  this.mlCloud = new MLCloud(this.draw, 250, 150);
  event();
};

Tangle.prototype.drawTangle = function(event) {
  setTimeout(function () {
    event();
  }, 300);
};

Tangle.prototype.drawmlHosts = function(event) {
  this.mlHosts = [];
  var mlhostGroup = this.draw.group();

  var _this = this, t = 0;
  this.graph.toColor(gridParams_TANGLE.fill1, gridParams_TANGLE.stroke1, 4500);
  VERTEXES_TANGLE.forEach(function (vertex, i) {
    if (mlHosts_TANGLE.indexOf(vertex.idx) > -1) {

      setTimeout(function () {
        var isLast = (_this.mlHosts.length + 1) == mlHosts_TANGLE.length;
        var mlhost = new MLNode(mlhostGroup, vertex, gridParams_TANGLE.fill, isLast && event);
        _this.mlHosts.push(mlhost);
      }, t);

      t += 500;
    }
  });
};

Tangle.prototype.mlHostsToCluster = function(event) {
  var _this = this;
  this.mlHosts.forEach(function (node, i) {
    var isLast = i == _this.mlHosts.length - 1;
    node.connectToOther(_this.mlHosts, isLast && event);
  });
};

Tangle.prototype.mlClusterToCenter = function(event) {
  var _this = this;

  function showCloud() {
    _this.mlCloud.show();
  }

  this.mlHosts.forEach(function (node, i) {
    var isLast = i == _this.mlHosts.length - 1;
    node.moveToCenter(_this.mlCloud.cx, _this.mlCloud.cy,
                      isLast && showCloud,
                      isLast && event);
  });
};

Tangle.prototype.drawAgents = function(event) {
  this.agents = [];

  var agentGroup = this.draw.group();
  this.graph.vertexesGroup.before(agentGroup);

  var _colors = Random.shuffle(agentsColors);

  var _this = this;
  VERTEXES_TANGLE.forEach(function (vertex, i) {
    if (agentHosts_TANGLE.indexOf(vertex.idx) > -1) {
      var isLast = (_this.agents.length + 1) == agentHosts_TANGLE.length;
      var color = _colors[_this.agents.length];
      var agent = new Agent(
        agentGroup, _this.mlCloud.cx, _this.mlCloud.cy, vertex, color,
        isLast && event,
        _this.mlCloud
      );
      _this.agents.push(agent);
    }
  });
};

Tangle.prototype.customerSendRequest = function(event) {
  this.mlCloud.show()
  var agents = Random.shuffle(this.agents);
  // var agents = this.agents.slice();
  var _this = this;

  this.customer = agents.pop();
  this.providers = agents.slice(0, 3);

  this.customer.sendRequest(event, true);
};


Tangle.prototype.findSolution = function(event) {
  var _this = this;
  // this.customer.sendRequest(function () {
    _this.mlCloud.findSolution(_this.customer, event);
  // })
};

Tangle.prototype.testProviders = function(event) {
  var t = 0, d = 500;
  var _this = this;

  function testProviders() {
    _this.providers.forEach(function (provider, i) {
      setTimeout(function () {
        var prev = _this.providers[i - 1];
        if (prev) prev.deactivate();
        provider.activate();
        _this.mlCloud.testProvider(provider.color);

        if (i == _this.providers.length - 1) {
          setTimeout(function () {
            _this.provider = provider;
            _this.mlCloud.ding(event);
          }, 150)
          // _this.provider.startContract(_this.customer.color);
          // _this.mlCloud.chooseProvider(_this.customer.color, event);
          // event();
        }
      }, t);

      t += d;
    });

    setTimeout(function () {
    }, t);
  }

  testProviders();

};


Tangle.prototype.providerSendResponse = function(event) {
  var _this = this;

  function receiveResponse() {
    _this.customer.receiveResponse(function () {
      _this.mlCloud.fallOutColor(function () {
        _this.customer.deactivate();
        _this.provider.deactivate();
        event();
      });
    });
  }


  this.mlCloud.chooseProvider(this.customer.color);
  this.provider.receiveRequest(this.customer.color, function () {
    _this.provider.sendResponse(function () {
      // _this.provider.deactivate();
      receiveResponse();
      // _this.mlCloud.receiveResponse(receiveResponse);
    });
  });

};


Tangle.prototype.clear = function(event) {
  this.draw.addClass('blured');
  this.draw.delay(100).animate(100, '>').opacity(0);

  var _this = this;
  setTimeout(function () {
    _this.draw.remove();
    event();
  }, 300);

};
