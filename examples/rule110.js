var A = require("./..");
var L = require("lambda-calculus");
var NAT = n => {
  var go = n => n === 0 ? "z" : "(s " + go(n-1) + ")";
  return "s.z." + go(n);
};

var rule110 = NAT => `
  I: a.a
  T: a.b.a
  F: a.b.b
  C: h.t.c.n.(c h (t c n))
  N: c.n.n

  rule110: a.(a
    b.(b c.t.(t a.b.(c b a) T T) c.t.(t c T F))
    b.(b c.t.(t a.b.a       F T) c.t.(t c F F)))

  apply: rule.a.(a
    a.r.(r l.b.c.(rule a b c x.a.b.r.(r (C x l) a b)))
    r.(r N T F)
    l.b.c.(rule F b c x.a.b.(C x l)))

  (${NAT} (apply rule110) N)
`;

var show = automata => L.toFunction(L.fromString(automata))(a => b => a("1")("0") + b)("0");

for (var i = 1; i < 70; ++i) {
  console.log(show(A(rule110(NAT(i))).term));
}
