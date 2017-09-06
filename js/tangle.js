

var maxR = 20;

function createTangle(parent) {
  var svg = document.createElement('svg');
  var svgId = 'svg-' + document.getElementsByTagName('div').length;
  svg.setAttribute('id', svgId);
  parent.appendChild(svg);

  var bounds = parent.getBoundingClientRect();
  var tangle = new Tangle(svgId, bounds);
}


function Tangle(svgId, bounds) {
  this.svgId = svgId;
  this.bounds = bounds;

  this.createSVG();
}


Tangle.prototype.setTimeout = function(method, t) {
  var _this = this;
  setTimeout(function () {
    _this[method]();
  }, t);
};

Tangle.prototype.highlightDes = function(idx) {
  this.descriptionList.forEach(function (li, n) {
    if (n == idx) {
      li.className = 'active';
    } else {
      li.className = '';
    }
  });
};


Tangle.prototype.createSVG = function() {
  this.draw = SVG(this.svgId);

  this.rootGroup = this.draw.group();
  this.graph = new Graph(this.rootGroup, this.bounds, maxR);

  this.mlhosts = VERTEXES.filter(function (v) {return v.is_ml;});
  this.customers = VERTEXES.filter(function (v) {return v.is_customer;});

  var mlhostGroup = this.rootGroup.group();
  this.mlhosts.forEach(function(v) {
    v.node = new VertexNode(mlhostGroup, v);
  });
  this.cognNode = this.mlhosts.find(function (v) {return v.main_ml;}).node;


  this.descriptionList = document.querySelectorAll('#protocolDescription ol li');
  // this.descriptionList.forEach(function (li) {
  //   li.className = 'active';
  // });
  this.N = 0;
  this.createMLNodes();
  // this.createCustomers();
};

Tangle.prototype.createMLNodes = function(nextStep) {
  var nextStep = 'nodesToCluster';
  var desIdx = 0;
  this.highlightDes(desIdx);

  var t = 0;
  this.mlhosts.forEach(function (vertex, i) {
    setTimeout(function () {
      vertex.node.activateML();
    }, t);
    t += 500;
  });

  this.setTimeout(nextStep, 3000);
};

Tangle.prototype.nodesToCluster = function() {
  var nextStep = 'createCustomers';
  // var nextStep = 'destroyScheme';
  var desIdx = 1;
  this.highlightDes(desIdx);

  var lineGroup = this.rootGroup.group();
  var _this = this;

  function createLine(s, e) {
    var l = lineGroup.line(new SVG.PointArray([s.pos, s.pos]));
    l.attr({stroke: mlcolor, opacity: 0.3, 'stroke-width': 1.5});

    var end = [];
    end[0] = s.pos[0] - ((s.pos[0] - e.pos[0]) / 2);
    end[1] = s.pos[1] - ((s.pos[1] - e.pos[1]) / 2);
    l.animate(150, 'sineOut').plot(new SVG.PointArray([s.pos, end]));

    l.delay(25).animate(180, 'sineOut').attr({opacity: 1});
    l.animate(200, 'sineIn').attr({opacity: 0.7});
  }

  this.mlhosts.forEach(function (vertex, i) {
    var neightbors = _this.mlhosts.slice(0, i);
    neightbors.forEach(function (nVertex) {
      createLine(vertex, nVertex);
      createLine(nVertex, vertex);
    });
  });

  var t = (150 + 25 + 200) + 600;
  setTimeout(function () {
    _this.mlhosts.forEach(function (vertex) {
      vertex.node.toCloud();
    });
    lineGroup.animate(100).opacity(0)
    setTimeout(function () {
      lineGroup.remove();
    }, 100);

    _this.N = 0;
    colors = Random.shuffle(colors);
    _this.setTimeout(nextStep, 1000);
  }, t);
};

Tangle.prototype.createCustomers = function() {
  var nextStep = 'customerSendRequest';
  var desIdx = 2;

  this.highlightDes(desIdx);

  var customersGroup = this.rootGroup.group();
  customersGroup.backward();
  this.customers.forEach(function (vertex, i) {
    vertex.node && vertex.node.group.remove();
    vertex.node = new VertexNode(customersGroup, vertex);
    vertex.node.activateBuyer(
      colors[i]
    );
  });

  this.N = 0;

  this.setTimeout(nextStep, 1200);

};

Tangle.prototype.customerSendRequest = function() {
  var nextStep = 'customerRecieveResponse';
  var desIdx = 2;
  this.highlightDes(desIdx);

  var nodes = this.customers.map(function (v) {return v.node;})
  var agents = Random.shuffle(nodes);
  this.customer = agents[0];
  this.agents = agents.slice(1, 5);

  this.customer.sendRequest();

  var shadowTime = this.cognNode.shadow.width() * 0.5 * qSpeed,
      oneBodyTime = this.customer.qtext.node.getBBox().width * qSpeed;

  var t = this.customer.s - shadowTime + oneBodyTime;
  this.setTimeout(nextStep, t);
};

Tangle.prototype.customerRecieveResponse = function() {
  // var nextStep = 'customerSendRequest';
  // var nextStep = 'destroyScheme';

  var desIdx = 3;
  this.highlightDes(desIdx);

  this.cognNode.findProvider(this.customer, this.agents);
  this.N += 1;

  if (this.N < 3) {
    this.setTimeout('customerSendRequest', 18400);
  } else {
    this.setTimeout('destroyScheme', 19500);
  }
};

Tangle.prototype.destroyScheme = function() {
  var nextStep = 'createSVG';
  this.highlightDes(null);

  this.draw.addClass('blured');
  this.draw.delay(100).animate(100, '>').opacity(0);

  var _this = this;
  setTimeout(function () {
    _this.draw.remove();
    VERTEXES.forEach(function (v) {
      v.node = undefined;
    });
    _this.setTimeout(nextStep, 250);
  }, 300);

};

