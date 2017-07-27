var A = require("./api.js");

// This λ-calculus term implements a minimalist cryptographic hash function
// using a 3-symbol block cellular automata. We then test it by computing the
// (6^5)th interation of a small initial state.
var test = `
  0= s.z.z
  1= s.z.(s z)
  2= s.z.(s (s z))
  3= s.z.(s (s (s z)))
  4= s.z.(s (s (s (s z))))
  5= s.z.(s (s (s (s (s z)))))
  6= s.z.(s (s (s (s (s (s z))))))
  7= s.z.(s (s (s (s (s (s (s z)))))))
  8= s.z.(s (s (s (s (s (s (s (s z))))))))
  9= s.z.(s (s (s (s (s (s (s (s (s z)))))))))
  10= s.z.(s (s (s (s (s (s (s (s (s (s z))))))))))

  A= a.b.c.a
  B= a.b.c.b
  C= a.b.c.c
  mix= x.y.(x
    y.(y B C A)
    y.(y A A B)
    y.(y B C C) y)

  tick= s.(s a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.t.(t
    (mix c d) (mix d c) (mix e f) (mix f e)
    (mix g h) (mix h g) (mix i j) (mix j i)
    (mix k l) (mix l k) (mix m n) (mix n m)
    (mix o p) (mix p o) (mix a b) (mix b a)))

  space= t.(t A A B C A B B C A B C C A A B C)

  (5 6 tick space)
`;

console.log(A.reduceOptimal(test));
