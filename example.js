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

//$e λnil.λext.λ0.λ1.nil
//$0 λx.λnil.λext.λ0.λ1.(ext 0 x)
//$1 λx.λnil.λext.λ0.λ1.(ext 1 x)
//$id (Y λid.λx.(x e λf.λp.(f (id p)) 0 1))
//$ID (Y λid.λx.λnil.λext.λ0.λ1.(x nil λf.λp.(ext f (id p)) 0 1))
//$not (Y λid.λx.(x e λf.λp.(f (id p)) 1 0))
//$NOT (Y λid.λx.λnil.λext.λ0.λ1.(x nil λf.λp.(ext f (id p)) 1 0))
//$inc (Y λinc.λx.(x e λf.λp.(f p) 1 λp.(0 (inc p))))
//$INC (Y λinc.λx.λnil.λext.λ0.λ1.(x nil λf.λp.(f p) λp.(ext 1 p) λp.(ext 0 (inc p))))
//$add (Y λadd.λx.(x λy.e λxf.λxp.λy.λnil.λext.λ0.λ1.(y nil λyf.λyp.(xf (ext yf (add xp yp))) 0 1) λx.x INC))

//Bitstrings
//$e λe. λ0. λ1. e
//$0 λx. λe. λ0. λ1. (0 x)
//$1 λx. λe. λ0. λ1. (1 x)
//$id (Y λid.λx.(x e λp.(0 (id p)) λp.(1 (id p))))
//$not (Y λnot.λx.(x e λp.(1 (not p)) λp.(0 (not p)))) // non-fisible negation
//$NOT (Y λnot.λx.λe.λ0.λ1.(x e λp.(1 (not p)) λp.(0 (not p)))) // fusible negation
//$inc (Y λinc.λx.(x e λp.(1 p) λp.(0 (inc p)))) // non-fusible increment
//$INC (Y λinc.λx.λe.λ0.λ1.(x e λp.(1 p) λp.(0 (inc p)))) // fusible increment
//$0b (0 (0 (0 (0 (0 (0 (0 (0 e)))))))) // 8-bit 0
//$0s (0 (0 (0 (0 (0 (0 (0 (0 0b)))))))) // 16-bit 0
//$0k (0 (0 (0 (0 (0 (0 (0 (0 0s)))))))) // 24-bit 0
//$0u (0 (0 (0 (0 (0 (0 (0 (0 0k)))))))) // 32-bit 0
//$dbl (Y λdbl.λx.(x λdbl.e λxp.λdbl.(0 (dbl xp)) λxp.λdbl.(INC (1 (dbl xp))) dbl))
//$add (Y λadd.λx.(x λadd.e λxp.λadd.(0 (add xp)) λxp.λadd.(INC (1 (add xp))) add))
//(id (inc (0 (0 (0 (0 (0 (0 (0 (0 e))))))))))

$0 λ0. λ1. 0
$1 λ0. λ1. 1
$nil λnil. λext. nil
$ext λh. λt. λnil. λext. (ext h t)
$id (Y λid.λxs.(xs nil λh.λt.(ext (h 0 1) (id t))))
$ID (Y λid.λxs.λnil.λext.(xs nil λh.λt.(ext h (id t))))
$not (Y λnot.λxs.(xs nil λh.λt.(ext (h 1 0) (not t))))
$NOT (Y λnot.λxs.λnil.λext.(xs nil λh.λt.(ext λ0.λ1.(h 1 0) (not t))))
$inc (Y λinc.λxs.(xs nil λh.λt.(h λt.(ext 1 t) λt.(ext 0 (inc t)) t)))
$INC (Y λinc.λxs.λnil.λext.(xs nil λh.λt.(h λext.λt.λfn.(ext (fn !B) t) λext.λt.λf.(ext (fn !A) t) ext t λx.λ!A.λ!B.x)))
$INC (Y λinc.λxs.λnil.λext.(xs nil λh.λt.(ext λ0.λ1.(h 1 0) (inc t)))) 
$z4  (ext 0 (ext 0 (ext 0 (ext 0 nil))))
$z8  (ext 0 (ext 0 (ext 0 (ext 0 z4))))
$z12 (ext 0 (ext 0 (ext 0 (ext 0 z8))))
$z16 (ext 0 (ext 0 (ext 0 (ext 0 z12))))
(id (INC (INC z16)))

//(λ!k.λx.x λy.y !k)


//((λ_.λ$5.$5 λ$7.$7) $8)

//- root $2 root
//- $3 $8 $2
//- $1 $6 $3
//- $6 $7 $7
//- $1 - $4
//- $4 $5 $5



//$13k (1 (0 (1 (1 (0 (0 (0 (0 (0 (0 (0 (0 e))))))))))))
//$0k  (0 (0 (0 (0 (0 (0 (0 (0 (0 (0 (0 (0 e))))))))))))

//(id (add 13k 0k))
//(id (p1 (add 13k) 0k))

`);

//010010100
//010010100


//010010100
//010010110

//001100010
//010010110
//000110001

//(id (dbl (0 (1 (1 (0 (0 (0 (1 (0 (0 e)))))))))))

//1010001
//* 11011
//-------
   //1010001
  //1010001
 //1010001
//1010001

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
//function bits(func) { return func("")((p) => "0" + bits(p))((p) => "1" + bits(p)); };
//function bits(func) { return func("")(val => xs => val + bits(xs))("0")("1"); };
function bits(func) { return func("")(h => t => h("0")("1") + bits(t)); }
console.log(bits(eval(tojs(term))));
