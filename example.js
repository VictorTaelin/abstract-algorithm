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
$p2 (mul p1 p1) // 2^2
$p3 (mul p2 p1) // 2^3
$p4 (mul p3 p1) // 2^4
$p5 (mul p4 p1) // 2^5
$p6 (mul p5 p1) // 2^6
$p7 (mul p6 p1) // 2^7
$p8 (mul p7 p1) // 2^8
$p9 (mul p8 p1) // 2^9
$pA (mul p9 p1) // 2^10
$pB (mul pA p1) // 2^11
$pC (mul pB p1) // 2^12
$pD (mul pC p1) // 2^13
$pE (mul pD p1) // 2^14
$pF (mul pE p1) // 2^15
$pG (mul pF p1) // 2^16

// Bitstrings
$e λe. λ0. λ1. e
$0 λx. λe. λ0. λ1. (0 x)
$1 λx. λe. λ0. λ1. (1 x)
$id (Y λid.λx.(x e λp.(0 (id p)) λp.(1 (id p))))
$not (Y λnot.λx.(x e λp.(1 (not p)) λp.(0 (not p)))) // non-fisible negation
$NOT (Y λnot.λx.λe.λ0.λ1.(x e λp.(1 (not p)) λp.(0 (not p)))) // fusible negation
$inc (Y λinc.λx.(x e λp.(1 p) λp.(0 (inc p)))) // non-fusible increment
$INC (Y λinc.λx.λe.λ0.λ1.(x e λp.(1 p) λp.(0 (inc p)))) // fusible increment
$0b (0 (0 (0 (0 (0 (0 (0 (0 e)))))))) // 8-bit 0
$0s (0 (0 (0 (0 (0 (0 (0 (0 0b)))))))) // 16-bit 0
$0k (0 (0 (0 (0 (0 (0 (0 (0 0s)))))))) // 24-bit 0
$0u (0 (0 (0 (0 (0 (0 (0 (0 0k)))))))) // 32-bit 0

// Main
(id (pF INC 0s)) // 5k rewrites, vs 921k for the non-fusible inc
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

// Compiles to JavaScript
function tojs(term) {
  switch (term.ctor) {
    case "Var":
      return term.name;
    case "Lam":
      var name = term.name;
      var body = tojs(term.body);
      return "(("+name+")=>"+body+")";
    case "App":
      var func = tojs(term.func);
      var argm = tojs(term.argm);
      return func+"("+argm+")";
  }
};

// Pretty-prints bitstring
function bits(func) {
  return func("")((p) => "0" + bits(p))((p) => "1" + bits(p));
};

console.log(bits(eval(tojs(term))));
