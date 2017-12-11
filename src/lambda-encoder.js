// Encode/decode λ-terms to/from interaction nets.

var L = require("lambda-calculus");
var I = require("./interaction-combinators.js");

function encode(term) {
  var kind = 1;
  var m = [];
  return {mem: m, ptr: (function encode(term, scope){
    switch (term.ctor){
      case "Lam": 
        var fun = I.Node(m,1);
        var era = I.Node(m,0);
        I.link(m, I.Wire(fun,1), I.Wire(era,0));
        I.link(m, I.Wire(era,1), I.Wire(era,2));
        var bod = encode(term.body, [fun].concat(scope));
        I.link(m, I.Wire(fun,2), bod);
        return I.Wire(fun,0);
      case "App":
        var app = I.Node(m,1);
        var fun = encode(term.left, scope);
        I.link(m, I.Wire(app,0), fun);
        var arg = encode(term.right, scope);
        I.link(m, I.Wire(app,1), arg);
        return I.Wire(app,2);
      case "Var":
        var lam = scope[term.index];
        if (I.kind(m,I.node(I.flip(m,I.Wire(lam,1)))) === 0) {
          return I.Wire(lam,1);
        } else {
          var dup = I.Node(m, ++kind);
          var arg = I.flip(m, I.Wire(lam,1));
          I.link(m,I.Wire(dup,1), I.flip(m,I.Wire(lam,1)));
          I.link(m,I.Wire(dup,0), I.Wire(lam,1));
          return I.Wire(dup,2);
        }
    };
  })(term, [])};
}

function decode(net) {
  var nodeDepth = {};
  return (function go(next, exit, depth){
    var prev = I.flip(net.mem, next);
    var prevPort = I.port(prev);
    var prevNode = I.node(prev);
    if (I.kind(net.mem, prevNode) === 1) {
      switch (prevPort) {
        case 0:
          nodeDepth[prevNode] = depth;
          return L.Lam(go(I.Wire(prevNode,2), exit, depth +1 ));
        case 1:
          return L.Var(depth - nodeDepth[prevNode] - 1);
        case 2:
          return L.App(
            go(I.Wire(prevNode,0), exit, depth),
            go(I.Wire(prevNode,1), exit, depth));
      }
    } else {
      return go(
        I.Wire(prevNode, prevPort > 0 ? 0 : exit.head),
        prevPort > 0 ? {head: prevPort, tail: exit} : exit.tail,
        depth);
    }
  })(net.ptr, null, 0);
}

module.exports = {
  encode: encode,
  decode: decode
}
