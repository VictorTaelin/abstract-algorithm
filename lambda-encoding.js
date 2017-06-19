// Encode/decode λ-terms to/from interaction nets

const L = require("lambda-calculus");
const A = require("./abstract-net.js");

const encode = (term) => {
  var kind = 1;
  var m = [];
  return {mem: m, ref: (function encode(term, scope){
    switch (term.type){
      case L.LAM: 
        var fun = A.Node(m,1);
        var era = A.Node(m,0);
        A.link(m, A.Wire(fun,1), A.Wire(era,0));
        A.link(m, A.Wire(era,1), A.Wire(era,2));
        var bod = encode(term.body, [fun].concat(scope));
        A.link(m, A.Wire(fun,2), bod);
        return A.Wire(fun,0);
      case L.APP:
        var app = A.Node(m,1);
        var fun = encode(term.left, scope);
        A.link(m, A.Wire(app,0), fun);
        var arg = encode(term.right, scope);
        A.link(m, A.Wire(app,1), arg);
        return A.Wire(app,2);
      case L.VAR:
        var lam = scope[term.index];
        if (A.kind(m,A.node(A.flip(m,A.Wire(lam,1)))) === 0) {
          return A.Wire(lam,1);
        } else {
          var dup = A.Node(m, ++kind);
          var arg = A.flip(m, A.Wire(lam,1));
          A.link(m,A.Wire(dup,1), A.flip(m,A.Wire(lam,1)));
          A.link(m,A.Wire(dup,0), A.Wire(lam,1));
          return A.Wire(dup,2);
        }
    };
  })(term, [])};
}

const decode = (net) => {
  var nodeDepth = {};
  return (function go(next, exit, depth){
    var prev = A.flip(net.mem, next);
    var prevPort = A.port(prev);
    var prevNode = A.node(prev);
    if (A.kind(net.mem, prevNode) === 1) {
      switch (prevPort) {
        case 0:
          nodeDepth[prevNode] = depth;
          return L.Lam(go(A.Wire(prevNode,2), exit, depth +1 ));
        case 1:
          return L.Var(depth - nodeDepth[prevNode] - 1);
        case 2:
          return L.App(
            go(A.Wire(prevNode,0), exit, depth),
            go(A.Wire(prevNode,1), exit, depth));
      }
    } else {
      return go(
        A.Wire(prevNode, prevPort > 0 ? 0 : exit.head),
        prevPort > 0 ? {head: prevPort, tail: exit} : exit.tail,
        depth);
    }
  })(net.ref, null, 0);
}
module.exports = {
  encode,
  decode
}
