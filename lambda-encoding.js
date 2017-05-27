// Encode/decode λ-terms to/from interaction nets

var lc  = require("lambda-calculus");
var com = require("./interaction-combinators.js");
module.exports = {
  encode: function(term){
    var nextkind = 0;
    var mem = [];
    return {mem: mem, ref: (function encode(term, scope){
      switch (term.type){
        case lc.LAM: 
          var fun = com.node(mem,0);
          var era = com.node(mem,65535);
          com.link(mem,com.flip(mem,com.wire(mem,fun,1)), com.flip(mem,com.wire(mem,era,0)));
          com.link(mem,com.flip(mem,com.wire(mem,era,1)), com.flip(mem,com.wire(mem,era,2)));
          var bod = encode(term.body, [fun].concat(scope));
          com.link(mem,com.flip(mem,com.wire(mem,fun,2)), bod);
          return com.wire(mem,fun,0);
        case lc.APP:
          var app = com.node(mem,0);
          var fun = encode(term.left , scope);
          com.link(mem,com.flip(mem,com.wire(mem,app,0)), fun);
          var arg = encode(term.right, scope);
          com.link(mem,com.flip(mem,com.wire(mem,app,1)), arg);
          return com.wire(mem,app,2);
        case lc.VAR:
          var lam = scope[term.index];
          if (com.kind(mem,com.NODE(mem,com.wire(mem,lam,1))) === 65535) {
            return com.wire(mem,lam,1);
          } else {
            var dup = com.node(mem,++nextkind);
            var arg = com.wire(mem,com.NODE(mem,com.wire(mem,lam,1)), com.PORT(mem,com.wire(mem,lam,1)));
            com.link(mem,com.flip(mem,com.wire(mem,dup,1)), com.flip(mem,com.wire(mem,lam,1)));
            com.link(mem,com.flip(mem,com.wire(mem,dup,0)), com.wire(mem,lam, 1));
            return com.wire(mem,dup,2);
          }
      };
    })(term, [])};
  },
  decode: function(net){
    var mem = net.mem;
    var nodeDepth = {};
    return (function go(wire, exit, depth){
      return com.kind(mem,com.NODE(mem,wire)) === 0
        ? ( com.PORT(mem,wire) === 0 ? lc.Lam(go(com.wire(mem,com.NODE(mem,wire),2), exit, (nodeDepth[com.NODE(mem,wire)]=depth)+1))
          : com.PORT(mem,wire) === 1 ? lc.Var(depth - nodeDepth[com.NODE(mem,wire)] - 1)
          : lc.App(
            go(com.wire(mem,com.NODE(mem,wire),0), exit, depth),
            go(com.wire(mem,com.NODE(mem,wire),1), exit, depth)))
        :   go(com.wire(mem,com.NODE(mem,wire), com.PORT(mem,wire) > 0 ? 0 : exit.head),
            com.PORT(mem,wire) > 0 ? {head: com.PORT(mem,wire), tail: exit} : exit.tail,
            depth)
    })(net.ref, null, 0);
  }
}
