var H = require("js-sha3");

function rand(x) {
  return (1103515245 * x + 12345) % Math.pow(2, 31);
}

function hash(xs) {
  var hash = 5381;
  for (var i = 0, l = xs.length; i < l; ++i) {
    hash = (hash * 33) ^ xs[i];
  }
  return (hash >>> 0) % Math.pow(2,28);
}

function hash(xs) {
  return parseInt(H.keccak256(JSON.stringify(xs)).slice(0,7),16);
}

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
    nodes: nodes || {},
    stats: {loops:0, rules:0, betas:0, dupls:0, annis:0}
  };
}

function newNode(net, kind, seed) {
  var node = hash(seed);
  //var node = Math.floor(Math.random() * Math.pow(2,28)) >>> 0;
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

function link(net, a, b) {
  net.nodes[a] = b;
  net.nodes[b] = a;
}

var PICK = Math.random() > 0.5 ? 2 : 1;
function reduce(net,dir) {
  var prev, back;
  var exit = {};
  var warp = [];
  var next = net.nodes[0];
  while (next || warp.length) {
    next = next || enterPort(net, warp.pop());
    prev = enterPort(net, next);
    next = enterPort(net, prev);
    if (slot(next) === 0 && slot(prev) === 0 && node(prev)) {
      back = enterPort(net, port(node(prev), exit[node(prev)]));
      rewrite(net, node(prev), node(next), net.stats);
      next = enterPort(net, back);
    } else if (slot(next) === 0) {
      var pick = Math.random() > 0.5 ? 2 : 1;
      var pick = PICK;
      warp.push(port(node(next),pick===2?1:2));
      next = enterPort(net, port(node(next), pick));
    } else {
      exit[node(next)] = slot(next);
      next = enterPort(net, port(node(next), 0));
    }
    ++net.stats.loops;
  }
  return net;
}

function rewrite(net, A, B) {
  if (A > B) {
    return rewrite(net, B, A);
  }
  //console.log("rw", A, B);
  if (kind(net,A) === kind(net,B)) {
    //  1          2            1   2
    //   \        /              \ / 
    //     A == B       -->       X  
    //   /        \              / \ 
    //  2          1            2   1
    link(net, enterPort(net, port(A, 1)),  enterPort(net, port(B, 1)));
    link(net, enterPort(net, port(A, 2)),  enterPort(net, port(B, 2)));
    net.stats.betas += kind(net, A) === 1 ? 1 : 0;
    net.stats.annis += 1;
  } else {
    //  1          2       1 = B --- A = 2
    //   \        /              \ /   
    //     A == B     -->         X    
    //   /        \              / \  
    //  2          1       2 = B --- A = 1 
    
    //var a = newNode(net, kind(net, A), [A,B,0]);
    //var b = newNode(net, kind(net, B), [A,B,1]);
    //link(net, port(b, 0), enterPort(net, port(A, 1)));
    //link(net, port(B, 0), enterPort(net, port(A, 2)));
    //link(net, port(a, 0), enterPort(net, port(B, 1)));
    //link(net, port(A, 0), enterPort(net, port(B, 2)));
    //link(net, port(a, 1), port(b, 1));
    //link(net, port(a, 2), port(B, 1));
    //link(net, port(A, 1), port(b, 2));
    //link(net, port(A, 2), port(B, 2));

    var X = node(A);
    var Y = node(B);
    var x1 = newNode(net, kind(net, A), [X,Y,0]), x2 = newNode(net, kind(net, A), [X,Y,1]);
    var y1 = newNode(net, kind(net, B), [X,Y,2]), y2 = newNode(net, kind(net, B), [X,Y,3]);
    LOG("rw " + node(A) + " " + node(B) + " -> " + x1 + " " + x2 + " " + y1 + " " + y2);
    link(net, enterPort(net, port(y1, 0)), enterPort(net, port(A, 1)));
    link(net, enterPort(net, port(y2, 0)), enterPort(net, port(A, 2)));
    link(net, enterPort(net, port(x1, 0)), enterPort(net, port(B, 1)));
    link(net, enterPort(net, port(x2, 0)), enterPort(net, port(B, 2)));
    link(net, enterPort(net, port(x1, 1)), enterPort(net, port(y1, 1)));
    link(net, enterPort(net, port(x1, 2)), enterPort(net, port(y2, 1)));
    link(net, enterPort(net, port(x2, 1)), enterPort(net, port(y1, 2)));
    link(net, enterPort(net, port(x2, 2)), enterPort(net, port(y2, 2)));
    net.stats.dupls += 1;
  }
  net[X * 4 + 0] = 0;
  net[X * 4 + 1] = 0;
  net[X * 4 + 2] = 0;
  net[X * 4 + 3] = 0;
  net[Y * 4 + 0] = 0;
  net[Y * 4 + 1] = 0;
  net[Y * 4 + 2] = 0;
  net[Y * 4 + 3] = 0;
  net.stats.rules += 1;
}

function show(net, next) {
  var prev = enterPort(net, next);
  next = next || 0;
  function varName(n) {
    var suc = c => String.fromCharCode(c.charCodeAt(0) + 1);
    var inc = s => !s ? "a" : s[0] === "z" ? "a" + inc(s.slice(1)) : suc(s) + s.slice(1);
    return n === 0 ? "a" : inc(varName(n - 1));
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
          + "("
          //+ (k > 1 ? (k-2)+"" : k === 0 ? "- " : "")
          //+ node(x) + ": 
          + (k+"|")
          //+ (m === 1 ? "." : "")
          + tree(enterPort(net, port(node(x), 1)))
          + " "
          + tree(enterPort(net, port(node(x), 2)))
          //+ (m === 2 ? "." : "")
          + ")");
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
  link,
  reduce,
  rewrite,
  show,
  hash
};
