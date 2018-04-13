var algo = require("./..");
var base = require("./base");

var nat = "Z";
for (var i = 0; i < 10; ++i) {
  var term = `
    S: λpred. λS. λZ. (S (pred S Z))

    Z: λS. λZ. Z

    match: λnat. λcaseSucc. λcaseZero.
      (nat
        λpair. (pair (λpred. λreturn. λpair. (λ return. (pair return (caseSucc return)) (S pred))))
        λpair. (pair Z caseZero)
        λpred. λreturn. return)

    pred: λnat. (match nat λx.x Z)

    E: λS. λZ. ${nat}

    (pred E)
  `;
  nat = "(S " + nat + ")";
  console.log("pred of " + nat);
  console.log(JSON.stringify(algo(term, true), null, 2));
  console.log("");
}

