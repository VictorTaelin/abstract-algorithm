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

function rewrite(net, x, y) {
  if (kind(net,x) === kind(net,y)) {
    //  1          2            1   2
    //   \        /              \ / 
    //     A == B       -->       X  
    //   /        \              / \ 
    //  2          1            2   1
    link(net, enterPort(net, port(x, 1)),  enterPort(net, port(y, 1)));
    link(net, enterPort(net, port(x, 2)),  enterPort(net, port(y, 2)));
    net.stats.betas += kind(net, x) === 1 ? 1 : 0;
    net.stats.annis += 1;
  } else {
    //  1          2       1 = B --- A = 2
    //   \        /              \ /   
    //     A == B     -->         X    
    //   /        \              / \  
    //  2          1       2 = B --- A = 1 
    var x1 = newNode(net, kind(net, x)), x2 = newNode(net, kind(net, x));
    var y1 = newNode(net, kind(net, y)), y2 = newNode(net, kind(net, y));
    link(net, enterPort(net, port(y1, 0)), enterPort(net, port(x, 1)));
    link(net, enterPort(net, port(y2, 0)), enterPort(net, port(x, 2)));
    link(net, enterPort(net, port(x1, 0)), enterPort(net, port(y, 1)));
    link(net, enterPort(net, port(x2, 0)), enterPort(net, port(y, 2)));
    link(net, enterPort(net, port(x1, 1)), enterPort(net, port(y1, 1)));
    link(net, enterPort(net, port(x1, 2)), enterPort(net, port(y2, 1)));
    link(net, enterPort(net, port(x2, 1)), enterPort(net, port(y1, 2)));
    link(net, enterPort(net, port(x2, 2)), enterPort(net, port(y2, 2)));
    net.stats.dupls += 1;
  }
  net.reuse.push(x, y);
  net.stats.rules += 1;
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
  rewrite
};
