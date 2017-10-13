(function (window) {
  'use strict';

  var TYPE_SPEED = 50;

  var VERTEXES = [
    {idx: 1, pos: [63, 35], neightbors: [2, 6]},
    {idx: 2, pos: [137, 17], neightbors: [3, 7]},
    {idx: 3, pos: [245, 18], neightbors: [4, 7]},
    {idx: 4, pos: [376, 27], neightbors: [7, 9]},

    {idx: 5, pos: [44, 118], neightbors: [6, 10, 11]},
    {idx: 6, pos: [125, 108], neightbors: [7, 11]},
    {idx: 7, pos: [286, 86], neightbors: []},
    {idx: 8, pos: [362, 102], neightbors: [9, 11, 12, 13]},
    {idx: 9, pos: [471, 101], neightbors: [13]},

    {idx: 10, pos: [23, 226], neightbors: [11, 14]},
    {idx: 11, pos: [113, 178], neightbors: [15]},
    {idx: 12, pos: [377, 195], neightbors: [16, 18]},
    {idx: 13, pos: [464, 155], neightbors: [18]},

    {idx: 14, pos: [42, 275], neightbors: [15]},
    {idx: 15, pos: [166, 276], neightbors: [16, 19]},
    {idx: 16, pos: [238, 259], neightbors: [17, 20, 21]},
    {idx: 17, pos: [343, 283], neightbors: [18, 21, 22]},
    {idx: 18, pos: [473, 275], neightbors: []},

    {idx: 19, pos: [27, 346], neightbors: [20]},
    {idx: 20, pos: [178, 342], neightbors: []},
    {idx: 21, pos: [301, 352], neightbors: [22]},
    {idx: 22, pos: [457, 332], neightbors: []},

    {idx: 23, pos: [120, 220], neightbors: []},

    {idx: 24, pos: [142, 249], neightbors: []},
  ];

  var GRAPH_SETTINGS = {
    'r': 3,
    'stroke-width': 6,
    'stroke': '#79909b',
  };

  var IMG_SRC = {
    bg: 'dist/img/env.png',
    whouse: 'dist/img/storage.png',
    shop: 'dist/img/shopping.png',
    carEmpty: 'dist/img/carEmpty.png',
    carFull: 'dist/img/carFull.png',
    tree: 'dist/img/tree.png',
  };

  var TREES = [
    {idx: 23},
  ];

  var WHOUSES = [
    {idx: 4, color: '#03a9f4', params: {bet: ['27', '750']}},
    {idx: 14, color: '#9e4f24', params: {bet: ['25', '500']}},
    {idx: 21, color: '#00838f', params: {bet: ['15', '680']}},
  ];

  var SHOPS = [
    {idx: 1, color: '#9575cd'},
    {idx: 12, color: '#5d4037'},
    {idx: 20, color: '#827717'},
    {idx: 22, color: '#3f51b5'},
    {idx: 11, color: '#e040fb'},
  ];

  var CARS = [
    {idx: 7, color: '#b71c1c', params: {bet:
      ['10', ['17', '100'], 'low']
    }},
    {idx: 9, color: '#ff6f00', params: {bet:
      ['8', ['31', '65'], 'low']
    }},
    {idx: 19, color: '#ff4081', params: {bet:
      ['3', ['12', '50'], 'average']
    }},
  ];

  var AGENT_IMG_SETTINGS = {
    w: 35,
    h: 35,
  };

  var AGENT_CIRCLE_SETTINGS = {
    r: AGENT_IMG_SETTINGS.w * 1.4 / 2,
    border: 1,

    bg: {
      fill: 'transparent',
    },

    'fill-opacity': 0.4,
  };


  var DELIVERY_PATH = {
    toWarehouse: [15, 16, 21],
    toTree: [16, 15, 24],
    toShop: [15, 14, 10, 5, 6, 1],
    toEnd: [2],
  };

  AGENT_CIRCLE_SETTINGS.bg.r = AGENT_CIRCLE_SETTINGS.r;

  var AGENT_LINE_SETTINGS = {
    'stroke-width': 2,
    'stroke-opacity': 0.2,
  };

  var AGENT_TEXT_SETTINGS = {
    r: 11,
    'stroke-width': 2,
    'fill-opacity': 0.3,
    'family': 'Times, serif',
    bg: {
      fill: '#63749b',
      'fill-opacity': 0.9,
    },
  };
  AGENT_TEXT_SETTINGS.fz = AGENT_TEXT_SETTINGS.r * 1.2;

  var AGENT_BRACKETS_SETTINGS = {
    'font-family': 'Rajdhani',
    // 'font-weight': '400',
    'font-size': '52px',
    'fill': '#0060ff',
    'stroke': '#0060ff',
    'stroke-width': '1px',
    'width': 40,
  };

  var HEADER_ACCENT_CLASS = 'secondPage-slideshow-item__header--accent';

  function generateIP() {
    var text = '';
    var possible = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "9", "9", "9", "9", "9", "9", "9", "9"];

    for (var i = 0; i < 5; i++) {
      text += Random.choice(possible);
    }

    return text;
  }

  function ProtocolCognIOTA (params, headerElement, consoleElement) {
    this.headerElement = headerElement;
    this.headerText = headerElement.getAttribute('header');
    this.consoleElement = consoleElement;

    params.vertexes = {
      array: VERTEXES,
      params: GRAPH_SETTINGS,
    };
    params.mlx = 500 / 2;
    params.mly = 385 / 2;

    CognIOTA.call(this, params);
  }

  // inherit ProtocolCognIOTA
  ProtocolCognIOTA.prototype = Object.create(CognIOTA.prototype);

  // correct the constructor pointer because it points to ProtocolCognIOTA
  ProtocolCognIOTA.prototype.constructor = ProtocolCognIOTA;

  ////////////

  ProtocolCognIOTA.prototype.init = function() {
    this.bg = this._addBG();
    this.trees = this._createElements(TREES, IMG_SRC.tree);
    this.tree = this.trees[0];
    this.tree.img.img.addClass('tree');
    this.whouses = this._createElements(WHOUSES, IMG_SRC.whouse);
    this.shops = this._createElements(SHOPS, IMG_SRC.shop);
    this.cars = this._createElements(CARS, IMG_SRC.carEmpty);

    this.agents = this.whouses.concat(this.shops).concat(this.cars);

    this.shop = this.shops[0];
    this.provider = this.whouses[this.whouses.length - 1];
    this.delivery = this.cars[this.cars.length - 1];


    this.shopBid = {
      price: '23',
      day: 'today',
      quantity: '678',
      speed: 'average',
    }
  };

  ProtocolCognIOTA.prototype._addBG = function() {
    var bg = this.draw.image(IMG_SRC.bg, 500, 420);
    bg.backward();

    var _this = this;

    var blurFilter, gridFilter;
    bg.blur = function (blurValue) {
      var t = 200;

      bg.filter(function(add) {
        blurFilter = add.gaussianBlur(0);
      });
      _this.graph.group.filter(function (add) {
        gridFilter = add.gaussianBlur(0);
      });
      blurFilter.animate(t, '<').attr('stdDeviation', blurValue);
      gridFilter.animate(t, '<').attr('stdDeviation', blurValue);

      return window.timePromise(t);
    };
    bg.unblur = function () {
      var t = 200;

      blurFilter.animate(t, '>').attr('stdDeviation', '0 0');
      gridFilter.animate(t, '>').attr('stdDeviation', '0 0');

      setTimeout(function () {
        _this.graph.group.unfilter(true);
        bg.unfilter(true);
      }, t);

      return window.timePromise(t);
    };

    return bg;
  };

  ProtocolCognIOTA.prototype._createElements = function(settings, imgSrc) {
    var _this = this;
    var group = this.draw.group();
    this.mlCloud.group.forward();

    var img_settings = Object.assign({}, AGENT_IMG_SETTINGS);
    img_settings.src = imgSrc;

    var elements = settings.map(function (s) {
      var vertex = _this.graph.vertexes[s.idx];
      var agent = new Agent(group, {
        circle: AGENT_CIRCLE_SETTINGS,
        line: AGENT_LINE_SETTINGS,
        text: AGENT_TEXT_SETTINGS,
        img: img_settings,
        brackets: AGENT_BRACKETS_SETTINGS,

        color: s.color,
        cx: vertex.pos[0],
        cy: vertex.pos[1],
        mlx: _this.mlx,
        mly: _this.mly,
        mlw: 60,
      });

      agent.ip = generateIP(8) + '...';

      s.params = s.params || {};
      for (var name in s.params) {
        agent[name] = s.params[name];
      }

      agent.hide();

      return agent;
    });

    elements.blur = function (blurValue, animateBrackets) {
      var a;
      elements.forEach(function (agent) {
        a = agent.blur(blurValue, animateBrackets);
      });
      return a;
    };

    elements.unblur = function (animated) {
      var a;
      elements.forEach(function (agent) {
        a = agent.unblur(animated);
      });
      return a;
    };

    return elements;
  };
  //////
  ProtocolCognIOTA.prototype._writeHeader = function(text) {
    text = text || '';
    var _this = this;
    this.headerElement.stop = false;
    var badIdx = -1;
    var stack = (text + ' ').split('').reduce(function (bucket, l, i) {
      if (l == '<') {
        badIdx = text.indexOf('>', i);
      }

      if (i > badIdx) {
        bucket.push(function () {
          if (!_this.headerElement.stop) {
            _this.headerElement.innerHTML = text.slice(0, i);
            return window.timePromise(TYPE_SPEED);
          } else {
            stack.stop = true;
            return NOOPPromise;
          }
        });
      }
      return bucket;
    }, []);
    return window.promisesStack(stack);
  };

  ProtocolCognIOTA.prototype.writeHeader = function(forced) {
    if (forced) {
      this.headerElement.innerHTML = this.headerText;
      return window.NOOPPromise;
    }
    return this._writeHeader(this.headerText);
  };

  ProtocolCognIOTA.prototype.writeConsole = function(params) {
    var title = '<span style="color: ' +  params.author.color + '">' +
                   params.author.ip + '</span> ' +
                params.verb + ':'
    this.consoleElement.querySelector('[console-author]').innerHTML = title;

    var body = '';

    params.lines = params.lines || {};
    var maxL = Object.keys(params.lines).reduce(function (a, b) {
      return a.length > b.length ? a : b;
    }, '').length;

    if (params.type) {
      var name = 'TYPE';
      maxL = maxL || name.length;
      var d = '&nbsp;'.repeat(maxL - name.length);
      body += '<p>' + name + ' ' + d + ': <strong>' + params.type + '</strong></p>';
    }

    for (var name in params.lines) {
      var d = '&nbsp;'.repeat(maxL - name.length);
      body += '<p>' + name + ' ' + d + ': ' + params.lines[name] + '<p>';
    }
    this.consoleElement.querySelector('[console-body]').innerHTML = body;

    return window.NOOPPromise;
  };

  ProtocolCognIOTA.prototype.clearConsole = function() {
    this.consoleElement.querySelector('[console-author]').innerHTML = '';
    this.consoleElement.querySelector('[console-body]').innerHTML = '';
  }
  //////


  ProtocolCognIOTA.prototype.showDescription = function(end, params) {
    params = params || {};
    var _this = this;

    function clear() {
      _this._writeHeader();
      classie.remove(_this.headerElement, HEADER_ACCENT_CLASS);

      _this.trees.unblur();
      _this.bg.unblur();
      _this.shops.unblur();
      _this.whouses.unblur();
      _this.cars.unblur();

      return NOOPPromise;
    }

    if (params.clear) {
      clear();
      this.headerElement.innerHTML = ' ';
      return end();
    }

    else if (params.forced) {
      classie.add(this.headerElement, HEADER_ACCENT_CLASS);
      this.writeHeader(true);
      return end();
    }

    else {
      classie.add(this.headerElement, HEADER_ACCENT_CLASS);

      var t1 = 100, t2 = 300, t3 = 1000;
      var blurValue = '3 3';

      var stack = [];

      stack.push(function () {
        _this.trees.blur(blurValue);
        _this.bg.blur(blurValue);
        _this.shops.blur(blurValue);
        _this.whouses.blur(blurValue);
        return _this.cars.blur(blurValue);
      });

      [
        {title: 'Automatic Shops', elements: _this.shops},
        {title: 'Automatic Warehouses', elements: _this.whouses},
        {title: 'Self-Driving Cars', elements: _this.cars},
      ].forEach(function (params, i) {
        var title = params.title;
        var elements = params.elements;

        stack.push(function () {
          return window.timePromise(t1);
        });

        stack.push(function () {
          return _this._writeHeader(title);
        });

        stack.push(function () {
          return window.timePromise(t2);
        });

        stack.push(function () {
          return elements.unblur(true);
        });

        stack.push(function () {
          return window.timePromise(t3);
        });

        stack.push(function () {
          return elements.blur(blurValue, true);
        });
      });

      stack.push(function () {
        return timePromise(200);
      })

      stack.push(clear);


      stack.push(function () {
        return window.NOOPPromise.then(end);
      });
      this.stack = stack;
      return window.promisesStack(stack);
    }
  };

  ProtocolCognIOTA.prototype.showML = function(end, params) {
    params = params || {};

    if (params.clear) {
      this.mlCloud.hide();
      this.agents.forEach(function (agent) {
        agent.line.hide();
      });
      return end();
    }

    var _this = this;
    var animated = !params.forced;
    var stack = [];

    stack.push(function () {
      return _this.mlCloud.show(animated);
    });

    stack.push(function () {
      var promise;
      _this.agents.forEach(function (agent) {
        promise = agent.line.show(animated);
      });
      return promise;
    });

    if (params.forced) {
      classie.remove(this.headerElement, HEADER_ACCENT_CLASS);
      this._writeHeader('');
    }

    else {
      stack.push(function () {
        return window.timePromise(500);
      });
    }


    stack.push(function () {
      return window.NOOPPromise.then(end);
    });
    this.stack = stack;
    return window.promisesStack(stack);

  };

  ProtocolCognIOTA.prototype.initialRequest = function(end, params) {
    params = params || {};

    if (params.clear) {
      this._writeHeader('');
      this.shop.deactivate(false);
      this.shop.circle.circleOut(false);
      this.shop.circle.hideBG(false);
      this.mlCloud.toDefault();
      this.clearConsole();
      return end();
    }

    var stack = [];
    var _this = this;
    var animated = !params.forced;

    if (params.forced) {
      this.shop.activate(false);
      this.shop.circle.circleIn(false);
      // this.shop.circle.showBG(false);
    }

    else {
      stack.push(function () {
        return _this.writeHeader();
      });

      stack.push(function () {
        var spanColor = '<span style="color:' + _this.shop.color + '">';
        return _this.writeConsole({
          author: _this.shop,
          verb: 'requests',
          type: 'INITIAL',
          lines: {
            PRODUCT: 'milk',
            QUANTITY: spanColor + _this.shopBid.quantity + '</span>',
            MAX_PRICE: spanColor + _this.shopBid.price + '</span>',
            SPEED: spanColor + _this.shopBid.speed + '</span>'
          },
        });
      });

      stack.push(function () {
        return _this.shop.sendRequest();
        // .then(function () {
        //   return _this.shop.circle.showBG(true);
        // });
      });
    }

    stack.push(function () {
      return _this.mlCloud.fallInColor(_this.shop.color, animated);
    });

    stack.push(function () {
      return window.NOOPPromise.then(end);
    });
    this.stack = stack;
    return window.promisesStack(stack);

  };

  ProtocolCognIOTA.prototype.providersAuction = function(end, params) {
    params = params || {};
    if (params.clear) {
      this._writeHeader('');
      this.clearConsole();
      this.provider.colorize(this.provider.color);
      this.provider.deactivate();
      return end();
    }


    var _this = this;
    var stack = [];

    if (!params.forced) {
      stack.push(function () {
        return _this.writeHeader();
      });
      stack.push(function () {
        return _this.mlCloud.ding();
      });
    }


    var auctionPackets = {
      initial: function (agent) {
        var spanColor = '<span style="color:' + _this.shop.color + '">';
        return {
          author: _this.mlCloud,
          verb: 'broabcasts',
          type: 'AUCTION_BROADCAST',
          lines: {
            PRODUCT: 'milk',
            MAX_PRICE: spanColor + _this.shopBid.price + '</span>',
            QUANTITY: spanColor + _this.shopBid.quantity + '</span>',
          }
        };
      },
      bet: function (agent) {
        var spanColor = '<span style="color:' + agent.color + '">';
        return {
          author: agent,
          verb: 'answers',
          type: 'AUCTION_BID',
          lines: {
            PRODUCT: 'milk',
            PRICE: spanColor + agent.bet[0] + '</span>',
            QUANTITY: spanColor + agent.bet[1] + '</span>',
          }
        };
      },
      calculate: function (agent) {
        var agentSpanColor = '<span style="color:' + agent.color + '">';
        // var spanColor = '<span style="color:' + _this.shop.color + '">';
        return {
          author: _this.mlCloud,
          verb: 'calculates',
          type: '--',
          lines: {
            PRODUCT: 'milk',
            PRICE: agentSpanColor + agent.bet[0] + '</span>',
            QUANTITY: agentSpanColor + agent.bet[1] + '</span>',
          }
        };
      },
      ack: function (agent) {
        var spanColor = '<span style="color:' + agent.color + '">';
        return {
          author: _this.mlCloud,
          verb: 'answers',
          type: 'AUCTION_ACK',
          lines: {
            PRODUCT: 'milk',
            PRICE: spanColor + agent.bet[0] + '</span>',
            QUANTITY: spanColor + agent.bet[1] + '</span>',
          }
        };
      },
    };

    var auctionStack = this.auction(this.whouses, this.provider, auctionPackets, params.forced)
    stack = stack.concat(auctionStack);

    stack.push(function () {
      return window.NOOPPromise.then(end);
    });
    this.stack = stack;
    return window.promisesStack(stack);
  };

  ProtocolCognIOTA.prototype.deliveryAuction = function(end, params) {
    params = params || {};

    if (params.clear) {
      this._writeHeader('');
      this.clearConsole();
      this.delivery.colorize(this.provider.color);
      this.delivery.deactivate();
      return end();
    }

    var stack = [];


    if (!params.forced) {
      var _this = this;
      stack.push(function () {
        return _this.writeHeader();
      });
    }

    var auctionPackets = {
      initial: function (agent) {
        var spanColor = '<span style="color:' + _this.shop.color + '">';
        return {
          author: _this.mlCloud,
          verb: 'broabcasts',
          type: 'AUCTION_BROADCAST',
          // lines: {
          //   MAX_PRICE: spanColor + _this.shopBid.price + '</span>',
          //   QUANTITY: spanColor + _this.shopBid.quantity + '</span>',
          // }
        };
      },
      bet: function (agent) {
        var spanColor = '<span style="color:' + agent.color + '">';
        return {
          author: agent,
          verb: 'answers',
          type: 'AUCTION_BID',
          lines: {
            PRICE: spanColor + agent.bet[0] + '</span> / km',
            LAT: spanColor + agent.bet[1][0] + '</span>',
            LNT: spanColor + agent.bet[1][1] + '</span>',
          }
        };
      },
      calculate: function (agent) {
        var agentSpanColor = '<span style="color:' + agent.color + '">';
        // var spanColor = '<span style="color:' + _this.shop.color + '">';
        return {
          author: _this.mlCloud,
          verb: 'calculates',
          type: '--',
          lines: {
            PRICE: agentSpanColor + agent.bet[0] + '</span> / km',
            SPEED: agentSpanColor + agent.bet[2] + '</span>',
          }
        };
      },
      ack: function (agent) {
        var spanColor = '<span style="color:' + agent.color + '">';
        return {
          author: _this.mlCloud,
          verb: 'answers',
          type: 'AUCTION_ACK',
          lines: {
            WAREHOUS_POSITION: '[110, 80]',
            SHOP_POSITION: '[120, 100]',
            PRODUCT: 'milk',
          }
        };
      },
    };

    var auctionStack = this.auction(this.cars, this.delivery, auctionPackets, params.forced)
    stack = stack.concat(auctionStack);

    stack.push(function () {
      return window.NOOPPromise.then(end);
    });
    this.stack = stack;
    return window.promisesStack(stack);
  };

  ProtocolCognIOTA.prototype.deliveryProcess = function(end, params) {
    params = params || {};
    var _this = this;

    function toVertex(idx, animated) {
      var vertex = _this.graph.vertexes[idx];
      var cx = vertex.pos[0], cy = vertex.pos[1];
      return _this.delivery.go(cx, cy, animated);
    }

    if (params.clear) {
      this._writeHeader('');
      this.clearConsole();
      this.delivery.img.update(IMG_SRC.carEmpty);
      this.delivery.go(this.delivery.cx, this.delivery.cy, false);
      this.tree.img.img.removeClass('fallen-tree');
      return end();
    }

    else if (params.forced) {
      this.delivery.img.update(IMG_SRC.carEmpty);
      var lastIdx = DELIVERY_PATH.toEnd[DELIVERY_PATH.toEnd.length - 1];
      toVertex(lastIdx, false);
      this.tree.img.img.addClass('fallen-tree');
      return end();
    }

    else {
      var stack = [];

      stack.push(function () {
        return _this.writeHeader();
      });


      DELIVERY_PATH.toWarehouse.forEach(function (idx) {
        stack.push(function () {
          return toVertex(idx, true);
        });
      });

      stack.push(function () {
        _this.delivery.img.update(IMG_SRC.carFull);
        return window.timePromise(100);
      });

      stack.push(function () {
        return _this.mlCloud.ding();
      });

      DELIVERY_PATH.toTree.forEach(function (idx) {
        stack.push(function () {
          return toVertex(idx, true);
        });
      });

      stack.push(function () {
        _this.tree.img.img.addClass('fallen-tree');
        return window.timePromise(150);
      });

      DELIVERY_PATH.toShop.forEach(function (idx) {
        stack.push(function () {
          return toVertex(idx, true);
        });
      });

      stack.push(function () {
        _this.delivery.img.update(IMG_SRC.carEmpty);
        return window.timePromise(100);
      });

      stack.push(function () {
        return _this.mlCloud.ding();
      });

      DELIVERY_PATH.toEnd.forEach(function (idx) {
        stack.push(function () {
          return toVertex(idx, true);
        });
      });

      stack.push(function () {
        return window.NOOPPromise.then(end);
      });
      this.stack = stack;
      return window.promisesStack(stack);
    }
  };

  ProtocolCognIOTA.prototype.paymentProcess = function(end, params) {
    params = params || {};
    if (params.clear) {
      this._writeHeader('');
      this.clearConsole();
      this.mlCloud.fallInColor(this.shop.color, false);
      this.provider.activate(false);
      this.provider.colorize(this.shop.color);
      this.shop.activate(false);
      this.delivery.activate(false);
      this.delivery.colorize(this.shop.color);
      return end();
    }

    else if (params.forced) {
      return end();
    }

    else {
      var stack = [];
      var _this = this;
      stack.push(function () {
        return _this.writeHeader();
      });

      stack.push(function () {
        return _this.shop.sendRequest('I');
      });

      stack.push(function () {
        _this.shop.deactivate(true);
        return _this.mlCloud.ding();
      });

      stack.push(function () {
        _this.provider.text.receive('I');
        return _this.delivery.text.receive('I', _this.delivery.img.cx, _this.delivery.img.cy);
      });

      stack.push(function () {
        _this.provider.deactivate(true);
        _this.delivery.deactivate(true);
        return _this.mlCloud.fallOutColor();
      });

      stack.push(function () {
        return window.NOOPPromise.then(end);
      });
      this.stack = stack;
      return window.promisesStack(stack);
    }
  };

  window.ProtocolCognIOTA = ProtocolCognIOTA;
})(window);
