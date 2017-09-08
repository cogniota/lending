var chain = [
{name: 'createSVG', beforeStageT: 10},

{name: 'drawTangle', beforeStageT: 10,
 description: 'This is IOTA tangle',
 textT: 1900, beforeActionT: 500},

{name: 'drawmlHosts', beforeStageT: 1000,
 description: 'Any IOTA node can be turned into a machine learning node.',
 beforeActionT: 800},

{name: 'mlHostsToCluster', beforeStageT: 880,
 description: 'Machine Learning nodes create CognIOTA clusters.',
 },
{name: 'mlClusterToCenter', beforeStageT: 150},

{name: 'drawAgents', beforeStageT: 900,
 description: 'IOTA nodes request machine learing services from CognIOTA.',
 },
{name: 'customerSendRequest', beforeStageT: 150},

{name: 'findSolution', beforeStageT: 880,
 description: 'CognIOTA finds the solution for the request',
},

{name: 'testProviders', beforeStageT: 550,
 description: 'It uses auctions for finding the best provider',
 },

{name: 'providerSendResponse', beforeStageT: 550,
 description: 'CognIOTA creates smartcontracts between customers.'},

{name: 'clear'}
];

chain.forEach(function (method, i) {
var nextMethod = chain[i + 1];
if (!nextMethod) nextMethod = chain[0];
method.next = nextMethod && [nextMethod.name];
});
