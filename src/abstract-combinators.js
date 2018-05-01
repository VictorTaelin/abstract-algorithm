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

function meta(net, node) {
  return (net.nodes[node * 4 + 3] >>> 0) & 3;
}

function setMeta(net, node, meta) {
  return net.nodes[node * 4 + 3] = net.nodes[node * 4 + 3] & 0xFFFFFFFC | meta;
}

function link(net, a, b) {
  net.nodes[a] = b;
  net.nodes[b] = a;
}

function reduce(net) {
  var next = net.nodes[0];
  var prev, back;
  while (next > 0) {
    prev = enterPort(net, next);
    next = enterPort(net, prev);
    if (slot(next) === 0) {
      if (slot(prev) === 0 && node(prev) !== 0) {
        back = enterPort(net, port(node(prev), meta(net, node(prev))));
        rewrite(net, node(prev), node(next), net.stats);
        next = enterPort(net, back);
      } else {
        setMeta(net, node(next), 1);
        next = enterPort(net, port(node(next), 1));
      }
    } else {
      var metaNext = meta(net, node(next));
      setMeta(net, node(next), metaNext === 0 ? slot(next) : metaNext + 1);
      next = enterPort(net, port(node(next), metaNext === 1 ? 2 : 0));
    }
    ++net.stats.loops;
  }
  return net;
}

function rewrite(net, A, B) {
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
    net.reuse.push(A, B);
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

    setMeta(net, A, 0);
    setMeta(net, B, 0);
    net.stats.dupls += 1;
  }
  net.stats.rules += 1;
}

function show(net) {
  console.log(net.stats);
  for (var i=0; i < net.nodes.length;i+=4) {
    if (net.reuse.some(x => x === i>>2)) {
      console.log(i>>2);
      continue;
    }
    [a,b,c,d] = net.nodes.slice(i, i+3)
    console.log(i>>2, `${a>>2}:${a&3} ${b>>2}:${b&3} ${c>>2}:${c&3} ${d>>2}:${d&3}`);
  }
}

module.exports = {
  port,
  node,
  slot,
  newNet,
  newNode,
  enterPort,
  kind,
  meta,
  setMeta,
  link,
  reduce,
  rewrite,
  show
};
