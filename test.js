var lam = require("lambda-calculus");
var stx = require("./syntax.js");
var com = require("./interaction-combinators");
var l2u = require("./lambda-encoding");
var A   = lam.App;
var L   = lam.Lam;
var V   = lam.Var;
var N   = lam.fromNumber;
var R   = lam.toNumber;
var NF  = lam.reduce;
var P   = lam.toString;
var E   = l2u.encode;
var D   = l2u.decode;

console.log("\n:: Creating net from interaction calculus");
var src = `
  x:(@ (a a))
  x:(b b)`;
var net = stx.fromSource(src);
console.log(stx.toSource(net));
console.log("\n:: Reducing");
console.log(stx.toSource(com.reduce(net)));

console.log("\n:: Creating net from λ-calculus");
var term = A(A(N(2),N(2)),N(2));
var net = E(term);
console.log(stx.toSource(net));
console.log(P(D(net)));
console.log("\n:: Reducing");
var net = com.reduce(net);
console.log(stx.toSource(net));
console.log(P(D(net)));
