const L = require("./../lambda-calculus");
const N = require("./abstract-net.js");
const E = require("./lambda-encoding.js");

// String -> Net
// Converts a lambda-calculus string to an interaction net
const lamToNet = lam => E.encode(L.fromString(lam));

// Net -> String
// Converts an interaction net to a lambda-calculus string
const netToLam = net => L.toString(E.decode(net));

// Net -> Net
// Reduces net to normal form
const reduceNet = N.reduce;

// String -> String
// Reduces a lambda-calculus string to normal form (naively)
const reduceNaive = lam => L.toString(L.reduce(L.fromString(lam)));

// String -> String
// Reduces a lambda-calculus string to normal form (optimally)
const reduceOptimal = lam => netToLam(reduceNet(lamToNet(lam)));

module.exports = {
  lamToNet,
  netToLam,
  reduceNet,
  reduceNaive,
  reduceOptimal
}
