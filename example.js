const Absal = require(".");

// Parses a λ-term
var term = Absal.core.read(`
// Y-Combinator
$Y λf. (λx.(f (x x)) λx.(f (x x)))

// Church Nats
$zer λs. λz. z
$suc λn. λs. λz. (s (n s z))
$add λa. λb. λs. λz. (a s (b s z))
$mul λa. λb. λs. (a (b s))
$exp λa. λb. (b a)

// Powers of 2
$p0 λs. λz. (s z)
$p1 λs. λz. (s (s z))
$p2 (mul p1 p1)
$p3 (mul p2 p1)
$p4 (mul p3 p1)
$p5 (mul p4 p1)
$p6 (mul p5 p1)
$p7 (mul p6 p1)
$p8 (mul p7 p1)

// Bitstrings
$e λe. λ0. λ1. e
$0 λx. λe. λ0. λ1. (0 x)
$1 λx. λe. λ0. λ1. (1 x)
$not (Y λnot.λx.(x e λp.(1 (not p)) λp.(0 (not p))))

// Main
(not (1 (0 (0 (1 e)))))
`);

// Compiles to interaction combinators net
var inet = Absal.inet.read(Absal.comp.compile(term));
//console.log(Absal.inet.show(inet));

// Reduces the net
var rewrites = Absal.inet.reduce(inet);

// Decompiles back to a λ-term
var term = Absal.comp.decompile(inet);

// Prints the result
console.log(Absal.core.show(term));
console.log("("+rewrites+" rewrites)");
