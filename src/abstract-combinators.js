function port(node, slot) {
  return (node << 2) | slot;
}

function node(port) {
  return port >>> 2;
}

function slot(port) {
  return port & 3;
}

function newNet(nodes) {
  return {
    nodes: nodes || [],
    reuse: [],
    stats: {loops:0, rules:0, betas:0, dupls:0, annis:0}
  };
}

function newNode(net, kind) {
  var node = net.reuse.pop() || (net.nodes.length / 4);
  net.nodes[node * 4 + 0] = node * 4 + 0;
  net.nodes[node * 4 + 1] = node * 4 + 1;
  net.nodes[node * 4 + 2] = node * 4 + 2;
  net.nodes[node * 4 + 3] = kind << 2;
  return node;
}

function enterPort(net, w) {
  return net.nodes[w];
}

function kind(net, node) {
  return net.nodes[node * 4 + 3] >>> 2;
}

function exit(net, node) {
  return (net.nodes[node * 4 + 3] >>> 0) & 3;
}

function setExit(net, node, exit) {
  return net.nodes[node * 4 + 3] = net.nodes[node * 4 + 3] & 0xFFFFFFFC | exit;
}

function link(net, a, b) {
  net.nodes[a] = b;
  net.nodes[b] = a;
}

function reduce(net) {
  var prev, back;
  var warp = [];
  var next = net.nodes[0];
  var N = 0;
  while ((next || warp.length) && ++N < 10000) {
    next = next || enterPort(net, port(warp.pop(), 2));
    prev = enterPort(net, next);
    next = enterPort(net, prev);
    if (active(net, prev, next)) {
      back = enterPort(net, port(node(prev), exit(net, node(prev))));
      rewrite(net, node(prev), node(next), net.stats);
      next = enterPort(net, back);
    } else if (slot(next) === 0) {
      warp.push(node(next));
      next = enterPort(net, port(node(next), 1));
    } else {
      setExit(net, node(next), slot(next));
      next = enterPort(net, port(node(next), 0));
    }
    ++net.stats.loops;
  }
  return net;
}

function active(net, A, B) {
  var Ak = kind(net, node(A));
  var Ai = Ak / 2 | 0;
  var At = Ak % 2;
  var Bk = kind(net, node(B));
  var Bi = Bk / 2 | 0;
  var Bt = Bk % 2;
  return (
    (  slot(A) === 0                        // A must hit main-port
    && slot(B) === 0                        // B must hit main-port
    && node(A) !== 0                        // A can't be root
    && node(B) !== 0                        // B can't be root
    && !(At === 0 && Bt > 0 && Ai <= Bi)    // EAL can't duplicate lower level A
    && !(Bt === 0 && At > 0 && Bi <= Ai))); // EAL can't duplicate lower level B
}

function rewrite(net, A, B) {
  var Ak = kind(net, A);
  var Ai = Ak / 2 | 0;
  var At = Ak % 2;
  var Bk = kind(net, B);
  var Bi = Ak / 2 | 0;
  var Bt = Bk % 2;
  if (At === 0 && Bt === 0 || Ak === Bk) {
    //  1          2            1   2
    //   \        /              \ / 
    //     A == B       -->       X  
    //   /        \              / \ 
    //  2          1            2   1
    link(net, enterPort(net, port(A, 1)),  enterPort(net, port(B, 1)));
    link(net, enterPort(net, port(A, 2)),  enterPort(net, port(B, 2)));
    net.stats.betas += kind(net, A) === 1 ? 1 : 0;
    net.stats.annis += 1;
    net.reuse.push(A, B);
    return 1;
  } else {
    //  1          2       1 = B --- A = 2
    //   \        /              \ /   
    //     A == B     -->         X    
    //   /        \              / \  
    //  2          1       2 = B --- A = 1 
    var a = newNode(net, kind(net, A));
    var b = newNode(net, kind(net, B));
    link(net, port(b, 0), enterPort(net, port(A, 1)));
    link(net, port(B, 0), enterPort(net, port(A, 2)));
    link(net, port(a, 0), enterPort(net, port(B, 1)));
    link(net, port(A, 0), enterPort(net, port(B, 2)));
    link(net, port(a, 1), port(b, 1));
    link(net, port(a, 2), port(B, 1));
    link(net, port(A, 1), port(b, 2));
    link(net, port(A, 2), port(B, 2));
    setExit(net, A, 0);
    setExit(net, B, 0);
    net.stats.dupls += 1;
    return 1;
  }
  net.stats.rules += 1;
  return 0;
}

function show(net, next) {
  var prev = enterPort(net, next);
  next = next || 0;
  function varName(n) {
    var suc = c => String.fromCharCode(c.charCodeAt(0) + 1);
    var inc = s => !s ? "a" : s[0] === "z" ? "a" + inc(s.slice(1)) : suc(s) + s.slice(1);
    return n === 0 ? "a" : inc(varName(n - 1));
  }
  var visited = {};
  var actives = {};
  function visit(x) {
    if (!visited[x]) {
      visited[x] = 1;
      visit(node(enterPort(net, port(x, 0))));
      visit(node(enterPort(net, port(x, 1))));
      visit(node(enterPort(net, port(x, 2))));
      if (slot(enterPort(net, port(x, 0))) === 0) {
        actives[port(x, 0)] = 1;
      }
    }
  };
  visit(0);
  var count = 0;
  var names = {};
  function name(x) {
    if (names[x] === undefined) {
      var y = enterPort(net, x);
      names[x] = varName(count).toUpperCase();
      names[y] = varName(count++).toUpperCase();
    }
    return names[x];
  };
  var str = [];
  Object.keys(actives).map(Number).forEach(x => {
    var localNames = {};
    var localSeens = {};
    var localCount = 0;
    (function makeLocalNames(x) {
      if (slot(x) !== 0) {
        var y = enterPort(net, x);
        if (localSeens[y]) {
          localNames[x] = varName(localCount);
          localNames[y] = varName(localCount++);
        }
        localSeens[x] = 1;
      } else {
        makeLocalNames(enterPort(net, port(node(x), 1)));
        makeLocalNames(enterPort(net, port(node(x), 2)));
      }
    })(x);
    var deco = x => prev === x ? "←" : next === x ? "→" : "";
    var tree = (function tree(x) {
      //if (x === 0) {
        //return "*";
      //} else 
      if (slot(x) !== 0) {
        return deco(x) + (localNames[x] || name(x));
      } else {
        //var m = meta(net, node(x));
        var k = kind(net, node(x));
        return (
          deco(x)
          + (k%2?"{":"(")
          //+ (k > 1 ? (k-2)+"" : k === 0 ? "- " : "")
          //+ node(x) + ": 
          + (((k/2)|0)+"|")
          //+ (m === 1 ? "." : "")
          + tree(enterPort(net, port(node(x), 1)))
          + " "
          + tree(enterPort(net, port(node(x), 2)))
          //+ (m === 2 ? "." : "")
          + (k%2?"}":")"));
      }
    })(x)
    str.push(name(x) + " = " + tree);
  });
  return str.join("\n");
}

module.exports = {
  port,
  node,
  slot,
  newNet,
  newNode,
  enterPort,
  kind,
  exit,
  setExit,
  link,
  reduce,
  rewrite,
  show
};
