const Api = require("./api.js");

// 5 ^ 5 % 3
var test = `
  (a.b.c.(((c d.e.(d f.((e g.h.(g ((f g) h))) f))) d.(d e.f.f)) d.(((b a) (((c e.f.g.(e h.((f h) g))) e.e) e.f.(f e))) (((c e.f.e) e.e) e.e))) 
    s.z.(s (s (s (s (s z)))))
    s.z.(s (s (s (s (s z)))))
    s.z.(s (s (s z))))
`;

// Tests reducing with naive λ-calculus interpreter
console.log(Api.reduceNaive(test));

// Tests reducing with Lamping's abstract algorithm
console.log(Api.reduceOptimal(test));
