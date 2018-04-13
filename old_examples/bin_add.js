var algo = require("./..");
var base = require("./base");

var test = `
  ${base}

  binSize: 32
  binZero: (binSize r.a.b.c.(a r) a.b.c.c)
  binSucc: (binSize r.x.a.b.c.(x b x.(a (r x)) c) a.a)
  binFold: x.a.b.c.(binSize r.x.(x x.f.(a (f x)) x.f.(b (f x)) f.c r) a.c x)
  binToNat: (binSize r.n.x.(x x.f.(f x) x.f.(add n (f x)) f.0 (r (mul 2 n))) n.x.0 1)
  binAdd: a. b. (binToNat a binSucc (binToNat b binSucc binZero))

  A: x.a.b.c.(a x)
  B: x.a.b.c.(b x)
  C: a.b.c.c
  X: (A (A (A (A (A (B (B (B (B (A (B (B (B (B (B (A (A (A (B (B (A (B (A (B (A (A (A (A (B (A (A (A C))))))))))))))))))))))))))))))))
  Y: (A (A (B (B (B (B (B (B (A (B (A (B (B (B (A (A (A (B (A (A (B (A (A (B (B (A (B (B (B (A (A (A C))))))))))))))))))))))))))))))))


  (binFold (binAdd X Y))
`;

// bX      =  10000101011000111110111100000 = 279739872
// bY      =  11101100100100011101011111100 = 496122620
// bX + bY = 101110001111101011100011011100 = 775862492

// 279739872 + 496122620

console.log(algo(test));
