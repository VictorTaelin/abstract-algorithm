var A = require("./..");
var L = require("lambda-calculus");
var Base = require("./base");

var test = `
  ${Base}

  add= x.y.
    (x. (x x)
      r.x.y.k.(x
        xs. (y
          ys. xs.k.f.a.b.c.(k b a (f xs ys a.b.b))
          ys. xs.k.f.a.b.c.(k a b (f xs ys k))
          xs.k.f.a.b.c.c
          xs)
        xs. (y
          ys. xs.k.f.a.b.c.(k a b (f xs ys k))
          ys. xs.k.f.a.b.c.(k b a (f xs ys a.b.a))
          xs.k.f.a.b.c.c
          xs)
        k.f.a.b.c.c
        k
        (r r))
      x
      y
      a.b.b)

  binSize= 32
  binFold= x.a.b.c.(binSize r.x.(x x.f.(a (f x)) x.f.(b (f x)) f.c r) a.c x)

  A= x.a.b.c.(a x)
  B= x.a.b.c.(b x)
  C= a.b.c.c
  X= (A (A (A (A (A (B (B (B (B (A (B (B (B (B (B (A (A (A (B (B (A (B (A (B (A (A (A (A (B (A (A (A C))))))))))))))))))))))))))))))))
  Y= (A (A (B (B (B (B (B (B (A (B (A (B (B (B (A (A (A (B (A (A (B (A (A (B (B (A (B (B (B (A (A (A C))))))))))))))))))))))))))))))))

  (binFold (add X Y))
`;

// bX      =  10000101011000111110111100000 = 279739872
// bY      =  11101100100100011101011111100 = 496122620
// bX + bY = 101110001111101011100011011100 = 775862492

// 279739872 + 496122620

console.log(A.netToLam(A.reduceNet(A.lamToNet(test))));
