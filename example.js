var Api = require("./api.js");

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
  11= s.z.(s (s (s (s (s (s (s (s (s (s (s z)))))))))))
  12= s.z.(s (s (s (s (s (s (s (s (s (s (s (s z))))))))))))
  13= s.z.(s (s (s (s (s (s (s (s (s (s (s (s (s z)))))))))))))
  14= s.z.(s (s (s (s (s (s (s (s (s (s (s (s (s (s z))))))))))))))
  15= s.z.(s (s (s (s (s (s (s (s (s (s (s (s (s (s (s z)))))))))))))))
  16= s.z.(s (s (s (s (s (s (s (s (s (s (s (s (s (s (s (s z))))))))))))))))
  17= s.z.(s (s (s (s (s (s (s (s (s (s (s (s (s (s (s (s (s z)))))))))))))))))
  18= s.z.(s (s (s (s (s (s (s (s (s (s (s (s (s (s (s (s (s (s z))))))))))))))))))
  19= s.z.(s (s (s (s (s (s (s (s (s (s (s (s (s (s (s (s (s (s (s z)))))))))))))))))))
  20= s.z.(s (s (s (s (s (s (s (s (s (s (s (s (s (s (s (s (s (s (s (s z))))))))))))))))))))

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

  t.(t (3 2) (5 6 tick space))
`;

var a = Api.lamToNet(test);
console.log(JSON.stringify(a));
console.log(Api.netToLam(a));

var b = Api.reduceNet(a);
console.log(JSON.stringify(b));
console.log(Api.netToLam(b));
