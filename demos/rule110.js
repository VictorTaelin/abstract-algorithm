var A = require("./..");
var L = require("lambda-calculus");
var NAT = n => {
  var go = n => n === 0 ? "z" : "(s " + go(n-1) + ")";
  return "s.z." + go(n);
};

var test = NAT => `
  I= a.a
  T= a.b.a
  F= a.b.b
  C= h.t.c.n.(c h (t c n))
  N= c.n.n

  rule110= a.(a
    b.(b c.t.(t (c F T) T T) c.t.(t (c T F) T F))
    b.(b c.t.(t (c T T) F T) c.t.(t (c T F) F F)))

  next= a.(a
    a.res.(res l.b.c.
      (rule110 a b c x.a.b.res.
        (res (C x l) a b)))
    res.(res N T F)
    l.b.c.(rule110 F b c x.a.b.(C x l)))

  (${NAT} next N)
`;

var show = automata => L.toFunction(L.fromString(automata))(a => b => a("1")("0") + b)("0");

for (var i = 0; i < 100; ++i) {
  console.log(show(A.reduceOptimal(test(NAT(i)))));
}
