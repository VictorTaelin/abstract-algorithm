// Encode/decode λ-terms to/from interaction combinators
var lc  = require("lambda-calculus");
var com = require("./interaction-combinators.js");
module.exports = {
  encode: function(term){
    var nextColor = 0;
    return (function encode(term, scope){
      switch (term.type){
        case lc.LAM: 
          var fun = com.node(0);
          var bod = encode(term.body, [fun].concat(scope));
          com.link(fun.c, bod);
          return fun.a;
        case lc.APP:
          var app = com.node(0);
          var fun = encode(term.left , scope);
          com.link(app.a, fun);
          var arg = encode(term.right, scope);
          com.link(app.b, arg);
          return app.c;
        case lc.VAR:
          var lam = scope[term.index];
          if (com.reverse(lam.b) === lam.b){
            return lam.b;
          } else {
            var dup = com.node(++nextColor);
            var arg = com.reverse(lam.b);
            com.link(dup.b, lam.b);
            com.link(dup.a, com.wire(lam, 1));
            return dup.c;
          };
      };
    })(term, []);
  },
  decode: function(wire){
    return (function go(wire, exit, depth){
      return wire.node.k === 0
        ? ( wire.port === 0 ? lc.Lam(go(wire.node.c, exit, (wire.node.depth=depth)+1))
          : wire.port === 1 ? lc.Var(depth - wire.node.depth - 1)
          : lc.App(
            go(wire.node.a, exit, depth),
            go(wire.node.b, exit, depth)))
        :   go(com.port(wire.node, wire.port > 0 ? 0 : exit.head),
            wire.port > 0 ? {head: wire.port, tail: exit} : exit.tail,
            depth)
    })(wire, null, 0);
  }
};
