var Term = require("./lambda-calculus.js");
var Net = require("./abstract-combinators.js");

// Applies structural identity to Scott-encoded 256
var code = `
  @Y #f :#x :f :x x #x :f :x x

  @Succ #n #Succ #Zero :Succ n
  @Zero    #Succ #Zero Zero

  @256
    :Succ :Succ :Succ :Succ :Succ :Succ :Succ :Succ
    :Succ :Succ :Succ :Succ :Succ :Succ :Succ :Succ
    :Succ :Succ :Succ :Succ :Succ :Succ :Succ :Succ
    :Succ :Succ :Succ :Succ :Succ :Succ :Succ :Succ
    :Succ :Succ :Succ :Succ :Succ :Succ :Succ :Succ
    :Succ :Succ :Succ :Succ :Succ :Succ :Succ :Succ
    :Succ :Succ :Succ :Succ :Succ :Succ :Succ :Succ
    :Succ :Succ :Succ :Succ :Succ :Succ :Succ :Succ
    :Succ :Succ :Succ :Succ :Succ :Succ :Succ :Succ
    :Succ :Succ :Succ :Succ :Succ :Succ :Succ :Succ
    :Succ :Succ :Succ :Succ :Succ :Succ :Succ :Succ
    :Succ :Succ :Succ :Succ :Succ :Succ :Succ :Succ
    :Succ :Succ :Succ :Succ :Succ :Succ :Succ :Succ
    :Succ :Succ :Succ :Succ :Succ :Succ :Succ :Succ
    :Succ :Succ :Succ :Succ :Succ :Succ :Succ :Succ
    :Succ :Succ :Succ :Succ :Succ :Succ :Succ :Succ
    :Succ :Succ :Succ :Succ :Succ :Succ :Succ :Succ
    :Succ :Succ :Succ :Succ :Succ :Succ :Succ :Succ
    :Succ :Succ :Succ :Succ :Succ :Succ :Succ :Succ
    :Succ :Succ :Succ :Succ :Succ :Succ :Succ :Succ
    :Succ :Succ :Succ :Succ :Succ :Succ :Succ :Succ
    :Succ :Succ :Succ :Succ :Succ :Succ :Succ :Succ
    :Succ :Succ :Succ :Succ :Succ :Succ :Succ :Succ
    :Succ :Succ :Succ :Succ :Succ :Succ :Succ :Succ
    :Succ :Succ :Succ :Succ :Succ :Succ :Succ :Succ
    :Succ :Succ :Succ :Succ :Succ :Succ :Succ :Succ
    :Succ :Succ :Succ :Succ :Succ :Succ :Succ :Succ
    :Succ :Succ :Succ :Succ :Succ :Succ :Succ :Succ
    :Succ :Succ :Succ :Succ :Succ :Succ :Succ :Succ
    :Succ :Succ :Succ :Succ :Succ :Succ :Succ :Succ
    :Succ :Succ :Succ :Succ :Succ :Succ :Succ :Succ
    :Succ :Succ :Succ :Succ :Succ :Succ :Succ :Succ
    Zero

  @ID :Y #go #nat
    ::nat
      #n :Succ :go n
      Zero

  :ID 256
`;

// 67 131 195 259 323 387 451 515
// 646 1254 1862 2470 3078 3686 4294

// Converts to net and reduces it
var term = Term.fromString(code);
var net  = Term.toNet(term);
Net.reduce(net);

// Reads back and prints normal form
console.log(Term.toString(Term.fromNet(Net.reduce(net))));

// Prints reduction stats
console.log(net.stats);

