const I = require("./interaction-combinators.js");

const Var = (idx)      => ({tag: "Var", idx});
const Lam = (bod)      => ({tag: "Lam", bod});
const App = (fun, arg) => ({tag: "App", fun, arg});

const fromString = src => {
  var i = 0;
  var parseString = (name) => {
    var str = "";
    while (src[i] && (name ? !/[ \n]/.test(src[i]) : src[i] !== ")")) {
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
      case ' ':
        return parseTerm(ctx, nofv);
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
      case "/":
        var fun = parseTerm(ctx, nofv);
        var arg = parseTerm(ctx, nofv);
        return App(fun, arg);
      case "(":
        var str = parseString();
        var lis = arr => {
          return arr.reduce((t,h) => {
            return Lam(Lam(App(App(Var(1), h), t)));
          }, Lam(Lam(Var(0))));
        };
        return lis(str.split("").map(chr => {
          return lis(chr.charCodeAt(0).toString(2).split("").reverse().map(bit => {
            return Lam(Lam(Var(1 - Number(bit))));
          }));
        }));
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

const toString = term => {
  const varName = n => {
    const suc = c => String.fromCharCode(c.charCodeAt(0) + 1);
    const inc = s => !s ? "a" : s[0] === "z" ? "a" + inc(s.slice(1)) : suc(s) + s.slice(1);
    return n === 0 ? "a" : inc(varName(n - 1));
  }
  const interpretLiteral = (term) => {
    const bind = (value, fn) =>
      value === null ? null : fn(value);
    const getList = (term) =>
      (  term.tag === "Lam"
      && term.bod.tag === "Lam"
      && term.bod.bod.tag === "App"
      && term.bod.bod.fun.tag === "App"
      && term.bod.bod.fun.fun.tag === "Var"
      && term.bod.bod.fun.fun.idx === 1
      ?  bind(getList(term.bod.bod.arg), list =>
        [term.bod.bod.fun.arg].concat(list))
      :  term.tag === "Lam"
      && term.bod.tag === "Lam"
      && term.bod.bod.tag === "Var"
      && term.bod.bod.idx === 0
      ?  []
      :  null);
    const getBit = (term) =>
      (  term.tag === "Lam"
      && term.bod.tag === "Lam"
      && term.bod.bod.tag === "Var"
      && term.bod.bod.idx <= 1
      ? 1 - Number(term.bod.bod.idx)
      : null);
    const getString = (term) =>
      ( bind(getList(term), chars =>
        chars.reduce((mayStr,chr) =>
          bind(mayStr, str =>
          bind(getList(chr), bits =>
          bind(bits.reduce((mayBits,bit) =>
            bind(mayBits, bits =>
            bind(getBit(bit), bit =>
            bits + bit)), ""), bits =>
          String.fromCharCode(parseInt(bits,2)) + str))), "")));
    return getString(term);
  };
  const go = (term, dph) => {
    const literal = interpretLiteral(term);
    if (false) {
      return "(" + literal + ")";
    } else {
      switch (term.tag) {
        case "Var":
          return varName(dph - term.idx - 1);
        case "App":
          return "/" + go(term.fun, dph) + " " + go(term.arg, dph);
        case "Lam":
          return "#" + varName(dph) + " " + go(term.bod, dph + 1);
      }
    }
  };
  return go(term, 0);
};

const toNet = term => {
  var kind = 1;
  var m = [];
  return {mem: m, ptr: (function encode(term, scope){
    switch (term.tag){
      case "Lam": 
        var fun = I.Node(m,1);
        var era = I.Node(m,0);
        I.link(m, I.Wire(fun,1), I.Wire(era,0));
        I.link(m, I.Wire(era,1), I.Wire(era,2));
        var bod = encode(term.bod, [fun].concat(scope));
        I.link(m, I.Wire(fun,2), bod);
        return I.Wire(fun,0);
      case "App":
        var app = I.Node(m,1);
        var fun = encode(term.fun, scope);
        I.link(m, I.Wire(app,0), fun);
        var arg = encode(term.arg, scope);
        I.link(m, I.Wire(app,1), arg);
        return I.Wire(app,2);
      case "Var":
        var lam = scope[term.idx];
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
};

const fromNet = net => {
  var nodeDepth = {};
  return (function go(next, exit, depth){
    var prev = I.flip(net.mem, next);
    var prevPort = I.port(prev);
    var prevNode = I.node(prev);
    if (I.kind(net.mem, prevNode) === 1) {
      switch (prevPort) {
        case 0:
          nodeDepth[prevNode] = depth;
          return Lam(go(I.Wire(prevNode,2), exit, depth + 1));
        case 1:
          return Var(depth - nodeDepth[prevNode] - 1);
        case 2:
          var fun = go(I.Wire(prevNode,0), exit, depth);
          var arg = go(I.Wire(prevNode,1), exit, depth);
          return App(fun, arg);
      }
    } else {
      var wire = I.Wire(prevNode, prevPort > 0 ? 0 : exit.head);
      var port = prevPort > 0 ? {head: prevPort, tail: exit} : exit.tail;
      return go(wire, port, depth);
    }
  })(net.ptr, null, 0);
};

const reduce = (src, returnStats) => {
  const reduced = I.reduce(toNet(fromString(src)));
  if (returnStats) {
    return {term: toString(fromNet(reduced)), stats: reduced.stats};
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
  reduce
};














