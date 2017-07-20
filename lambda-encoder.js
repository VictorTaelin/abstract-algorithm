// Encode/decode λ-terms to/from interaction nets

var L = require("lambda-calculus");
var G = require("./sharing-graph.js");

function encode(term) {
  var kind = 1;
  var m = [];
  return {mem: m, ptr: (function encode(term, scope){
    switch (term.type){
      case L.LAM: 
        var fun = G.Node(m,1);
        var era = G.Node(m,0);
        G.link(m, G.Wire(fun,1), G.Wire(era,0));
        G.link(m, G.Wire(era,1), G.Wire(era,2));
        var bod = encode(term.body, [fun].concat(scope));
        G.link(m, G.Wire(fun,2), bod);
        return G.Wire(fun,0);
      case L.APP:
        var app = G.Node(m,1);
        var fun = encode(term.left, scope);
        G.link(m, G.Wire(app,0), fun);
        var arg = encode(term.right, scope);
        G.link(m, G.Wire(app,1), arg);
        return G.Wire(app,2);
      case L.VAR:
        var lam = scope[term.index];
        if (G.kind(m,G.node(G.flip(m,G.Wire(lam,1)))) === 0) {
          return G.Wire(lam,1);
        } else {
          var dup = G.Node(m, ++kind);
          var arg = G.flip(m, G.Wire(lam,1));
          G.link(m,G.Wire(dup,1), G.flip(m,G.Wire(lam,1)));
          G.link(m,G.Wire(dup,0), G.Wire(lam,1));
          return G.Wire(dup,2);
        }
    };
  })(term, [])};
}

function decode(net) {
  var nodeDepth = {};
  return (function go(next, exit, depth){
    var prev = G.flip(net.mem, next);
    var prevPort = G.port(prev);
    var prevNode = G.node(prev);
    if (G.kind(net.mem, prevNode) === 1) {
      switch (prevPort) {
        case 0:
          nodeDepth[prevNode] = depth;
          return L.Lam(go(G.Wire(prevNode,2), exit, depth +1 ));
        case 1:
          return L.Var(depth - nodeDepth[prevNode] - 1);
        case 2:
          return L.App(
            go(G.Wire(prevNode,0), exit, depth),
            go(G.Wire(prevNode,1), exit, depth));
      }
    } else {
      return go(
        G.Wire(prevNode, prevPort > 0 ? 0 : exit.head),
        prevPort > 0 ? {head: prevPort, tail: exit} : exit.tail,
        depth);
    }
  })(net.ptr, null, 0);
}

module.exports = {
  encode: encode,
  decode: decode
}
