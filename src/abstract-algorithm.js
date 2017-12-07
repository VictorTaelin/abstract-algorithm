// Performs the abstract algorithm by converting λ-terms to
// interaction combinators, reducing, then converting back.

var E = require("./lambda-encoder.js");
var L = require("lambda-calculus");
var I = require("./interaction-combinators.js");

// String -> Net
// Converts a lambda-calculus string to an interaction net
function lambdaToNet(lam) {
  return E.encode(L.fromString(lam));
}

// Net -> String
// Converts an interaction net to a lambda-calculus string
function netToLambda(net) {
  return L.toString(E.decode(net));
}

// String -> {term: String, stats: {rewrites: Number, loops: Number}}
// Reduces a lambda-calculus string to normal form
module.exports = function(lambda, debug) {
  var net = I.reduce(lambdaToNet(lambda));
  var term = netToLambda(net);
  return {term: term, stats: net.stats};
}
