var lam = require("./../lambda-calculus");
var net = require("./interaction-combinators.js");
var l2n = require("./lambda-encoding.js");
var lnf = str => lam.toString(lam.reduce(lam.fromString(str)));
var nnf = str => lam.toString(l2n.decode(net.reduce(l2n.encode(lam.fromString(str)))));

// 4 ^ 4 % 3
var test = `
  (a.b.c.(
    ((c d.e.(d f.((e g.h.(g ((f g) h))) f)))
    d.(d e.f.f))
    d.(((b a) (((c e.f.g.(e h.((f h) g))) e.e) e.f.(f e))) (((c e.f.e) e.e) e.e)))
    f.x.(f (f (f (f x))))
    f.x.(f (f (f (f x))))
    f.x.(f (f (f x))))`;

// Tests reducing with naive λ-calculus interpreter
console.log(lnf(test));

// Tests reducing with Lamping's abstract algorithm
console.log(nnf(test));

