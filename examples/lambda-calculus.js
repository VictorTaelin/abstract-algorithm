// This implements an evaluator for arbitrary λ-calculus terms inside the
// λ-calculus itself. This implementation works with the oracleless fragment of
// Lamping's algorithm, proving that oracleless terms are turing-complete. To
// demonstrate this, we compute the normal form of λx.(x x) λf.λx.(f (f x)), a
// term which doesn't work on Lamping's algorithm by direct compilation, but
// does through this emulation.

var A = require("./..");
var L = require("lambda-calculus");

// The λ-calculus term to be evaluated inside the oracleless evaluator.
// You can change this to any arbitrary term!
var input = `(App (Lam (App Var Var)) (Lam (Lam (App (Box Var) (App (Box Var) Var)))))`; // (x.(x x) f.x.(f (f x)))

// An oracleless implementation of the λ-calculus inside itself.
var lambda = `
  Lam:      bod. l.a.b.v.(l bod)
  App: fun. arg. l.a.b.v.(a fun arg)
  Box:      ter. l.a.b.v.(b ter)
  Var:           l.a.b.v. v

  Suc: nat. s.z.(s nat)
  Zer:      s.z.z
  pre: nat. (nat pred.pred Zer)

  W: W.X.L.A.(W.(X
    X.L.A.(W X (Suc L) A X.L.A.R.(R (Lam X) (pre L) A))
    X.Y.L.A.(W X L A X.L.A.(W Y L A Y.L.A.R.(R (App X Y) L A)))
    X.L.A.(L
      L.X.A.(W X L A X.L.A.R.(R (Box X) (Suc L) A))
      X.A.(A A.X.(W (Box X) Zer A X.L.A.R.(R (Box X) L (Suc A))) X.R.(R (Box X) Zer Zer) X)
      X A)
    L.A.(L
      L.A.R.(R Var (Suc L) A)
      A.(A A.(W Var Zer A X.L.A.R.(R (Box X) L (Suc A))) R.(R Var Zer Zer))
      A)
    L A) (W W))

  S: S.X.L.A.V.(S.(X
    X.L.A.V.(S X (Suc L) A V X.L.A.V.R.(R (Lam X) (pre L) A V))
    X.Y.L.A.V.(S X L A V X.L.A.V.(S Y L A V Y.L.A.V.R.(R (App X Y) L A V)))
    X.L.A.V.(L
      L.X.A.V.(S X L (Suc A) V X.L.A.V.R.(R X (Suc L) (pre A) V))
      X.A.V.(A A.X.V.(S (Box X) Zer A V X.L.A.V.R.(R (Box X) L (Suc A) V)) X.V.R.(R X Zer Zer V) X V)
      X A V)
    L.A.V.(L
      L.A.V.(S (Box Var) Zer A V X.Z.A.V.R.(R X (Suc L) A V))
      A.V.(W W V Zer A X.L.A.R.(R X L A V))
      A V)
    L A V) (S S))

  R: R.X.(R.(X
    X.(Lam (R X)) 
    X.Y.(R X
      x.Y. (S S x Zer Zer Y X.L.A.V.(R X))
      x.y.Y. (App (App x y) Y)
      x.Y. (App (Box x) Y)
      Y. (App Var Y)
      (R Y))
    X.(Box (R X))
    Var) (R R))

  reduce: term. (R R term)

  (reduce ${input})
`;

var show = str => {
  var go = ter => ter(bod => "λ" + go(bod))(fun => arg => "(" + go(fun) + " " + go(arg) + ")")(vaa => 1 + go(vaa))(0);
  return go(L.toFunction(L.fromString(str)));
}

console.log("This evaluates a λ-calculus term that evaluates the inputted λ-calculus term.");
console.log("");

console.log("Input term:");
console.log(input);
console.log("");

console.log("Input term emulated inside the λ-calculus:");
console.log(L.toString(L.fromString(lambda)));
console.log("");

console.log("Evaluating it with JavaScript:");
console.log("Result:", L.toString(L.reduce(L.fromString(lambda))));
console.log("Pretty:", show(L.toString(L.reduce(L.fromString(lambda)))));
console.log("");

console.log("Evaluating it with Lamping's algorithm (oracleless):");
console.log("Result:", A(lambda));
console.log("Pretty:", show(A(lambda)));
console.log("");
