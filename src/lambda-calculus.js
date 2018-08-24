const I = require("./abstract-combinators.js");

const Var = (idx)      => ({tag: "Var", idx});
const Lam = (bod)      => ({tag: "Lam", bod});
const App = (fun, arg) => ({tag: "App", fun, arg});

const fromString = src => {
  var i = 0;
  var parseString = (name) => {
    var str = "";
    while (src[i] && (name ? !/[\r|\n| ]/.test(src[i]) : src[i] !== ")")) {
      str += src[i++];
    }
    return str;
  };
  var rem = (ctx) => {
    return ctx ? (ctx[0][1] ? [ctx[0],rem(ctx[1])] : rem(ctx[1])) : null;
  };
  var parseTerm = (ctx, nofv) => {
    switch (src[i++]) {
      case ' ':
      case '\r':
      case '\n':
        return parseTerm(ctx, nofv);
      case '#':
        var nam = parseString(1);
        var bod = parseTerm([[nam,null],ctx], nofv);
        return Lam(bod);
      case "@":
        var nam = parseString(1);
        var val = parseTerm(rem(ctx), true);
        var bod = parseTerm([[nam,val],ctx], nofv);
        return bod;
      case "=":
        var nam = parseString(1);
        var val = parseTerm(ctx, nofv);
        var bod = parseTerm([[nam,null],ctx], nofv);
        return App(Lam(bod), val);
      case ":":
        var fun = parseTerm(ctx, nofv);
        var arg = parseTerm(ctx, nofv);
        return App(fun, arg);
      default:
        --i;
        var nam = parseString(1);
        var dph = 0;
        while (ctx && ctx[0][0] !== nam) {
          dph += ctx[0][1] === null ? 1 : 0;
          ctx = ctx[1];
        }
        if (ctx) {
          return ctx[0][1] ? ctx[0][1] : Var(dph);
        } else {
          throw "Unbound variable '" + nam + "'.";
        }
    }
  };
  return parseTerm(null, false);
};

const toString = (term, bruijn) => {
  const varName = n => {
    const suc = c => String.fromCharCode(c.charCodeAt(0) + 1);
    const inc = s => !s ? "a" : s[0] === "z" ? "a" + inc(s.slice(1)) : suc(s) + s.slice(1);
    return n === 0 ? "a" : inc(varName(n - 1));
  };
  const go = (term, dph) => {
    switch (term.tag) {
      case "Var":
        return varName(bruijn ? term.idx : dph - term.idx - 1);
      case "App":
        return ":" + go(term.fun, dph) + " " + go(term.arg, dph);
      case "Lam":
        return "#" + (bruijn ? "" : varName(dph) + " ") + go(term.bod, dph + 1);
    }
  };
  return go(term, 0);
};

const toNet = (net, term) => {
  var kind = 1;
  I.newNode(net, kind); I.link(net, 1, 2);
  var ptr = (function encode(term, scope){
    switch (term.tag){
      // Arg
      //    \
      //     App = Fun
      //    /
      // Ret
      case "App":
        var app = I.newNode(net,1);
        var fun = encode(term.fun, scope);
        I.link(net, I.port(app,0), fun);
        var arg = encode(term.arg, scope);
        I.link(net, I.port(app,1), arg);
        return I.port(app,2);
      // Era =- Fun = Ret  
      //         |     
      //        Bod  
      case "Lam": 
        var fun = I.newNode(net,1);
        var era = I.newNode(net,0);
        I.link(net, I.port(fun,1), I.port(era,0));
        I.link(net, I.port(era,1), I.port(era,2));
        var bod = encode(term.bod, [[fun,++kind]].concat(scope));
        I.link(net, I.port(fun,2), bod);
        return I.port(fun,0);
      // Arg
      //    \
      //     Dup =- Fun      Ret - Era
      //    /
      // Ret
      case "Var":
        var [lam,kin] = scope[term.idx];
        var arg = I.enterPort(net, I.port(lam,1));
        if (I.kind(net, I.node(arg)) === 0) {
          net.reuse.push(I.node(arg));
          return I.port(lam, 1);
        } else {
          var dup = I.newNode(net, kin);
          I.link(net, I.port(dup,2), arg);
          I.link(net, I.port(dup,0), I.port(lam,1));
          return I.port(dup,1);
        }
    };
  })(term, []);
  I.link(net, 0, ptr);
  return net;
};

const fromNet = net => {
  var nodeDepth = {};
  return (function go(next, exit, depth){
    var prev = I.enterPort(net, next);
    var prevPort = I.slot(prev);
    var prevNode = I.node(prev);
    if (I.kind(net, prevNode) === 1) {
      switch (prevPort) {
        case 0:
          nodeDepth[prevNode] = depth;
          return Lam(go(I.port(prevNode,2), exit, depth + 1));
        case 1:
          return Var(depth - nodeDepth[prevNode] - 1);
        case 2:
          var fun = go(I.port(prevNode,0), exit, depth);
          var arg = go(I.port(prevNode,1), exit, depth);
          return App(fun, arg);
      }
    } else {
      var wire = I.port(prevNode, prevPort > 0 ? 0 : exit.head);
      var port = prevPort > 0 ? {head: prevPort, tail: exit} : exit.tail;
      return go(wire, port, depth);
    }
  })(0, null, 0);
};

const reduce = (src, returnStats, bruijn) => {
  const reduced = I.reduce(toNet(fromString(src)));
  if (returnStats) {
    return {term: toString(fromNet(reduced), bruijn), stats: reduced.stats};
  } else {
    return toString(fromNet(reduced));
  };
};

module.exports = {
  Var,
  Lam,
  App,
  fromString,
  toString,
  fromNet,
  toNet,
  reduce,
  net: I
};
