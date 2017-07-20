var L = require("./../lambda-calculus");
var G = require("./sharing-graph.js");
var E = require("./lambda-encoder.js");

// String -> Net
// Converts a lambda-calculus string to an interaction net
function lamToNet(lam) {
  return E.encode(L.fromString(lam));
}

// Net -> String
// Converts an interaction net to a lambda-calculus string
function netToLam(net) {
  return L.toString(E.decode(net));
}

// Net -> Net
// Reduces net to normal form
var reduceNet = G.reduce;

// String -> String
// Reduces a lambda-calculus string to normal form (naively)
function reduceNaive(lam) {
  return L.toString(L.reduce(L.fromString(lam)));
}

// String -> String
// Reduces a lambda-calculus string to normal form (optimally)
function reduceOptimal(lam) {
  return netToLam(reduceNet(lamToNet(lam)));
}

module.exports = {
  lamToNet,
  netToLam,
  reduceNet,
  reduceNaive,
  reduceOptimal
}
