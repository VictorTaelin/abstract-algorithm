function port(node, slot) {
  return (node << 2) | slot;
}

function getPortNode(port) {
  return port >>> 2;
}

function getPortSlot(port) {
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

function getNodeKind(net, node) {
  return net.nodes[node * 4 + 3] >>> 2;
}

function getNodeMeta(net, node) {
  return (net.nodes[node * 4 + 3] >>> 0) & 3;
}

function setNodeMeta(net, node, meta) {
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
    if (getPortSlot(next) === 0) {
      if (getPortSlot(prev) === 0 && getPortNode(prev) !== 0) {
        back = enterPort(net, port(getPortNode(prev), getNodeMeta(net, getPortNode(prev))));
        rewrite(net, getPortNode(prev), getPortNode(next), net.stats);
        next = enterPort(net, back);
      } else {
        setNodeMeta(net, getPortNode(next), 1);
        next = enterPort(net, port(getPortNode(next), 1));
      }
    } else {
      var meta = getNodeMeta(net, getPortNode(next));
      setNodeMeta(net, getPortNode(next), meta === 0 ? getPortSlot(next) : meta + 1);
      next = enterPort(net, port(getPortNode(next), meta === 1 ? 2 : 0));
    }
    ++net.stats.loops;
  }
  return net;
}

function rewrite(net, x, y) {
  if (getNodeKind(net,x) === getNodeKind(net,y)) {
    //  a          b            a   b
    //   \        /              \ / 
    //     A -- B       -->       X  
    //   /        \              / \ 
    //  c          d            c   d
    link(net, enterPort(net, port(x, 1)),  enterPort(net, port(y, 1)));
    link(net, enterPort(net, port(x, 2)),  enterPort(net, port(y, 2)));
    net.stats.betas += getNodeKind(net, x) === 1 ? 1 : 0;
    net.stats.annis += 1;
  } else {
    //  a          d       a - B --- A - d
    //   \        /              \ /   
    //     A -- B     -->         X    
    //   /        \              / \  
    //  b          c       b - B --- A - c 
    var x1 = newNode(net, getNodeKind(net, x)), x2 = newNode(net, getNodeKind(net, x));
    var y1 = newNode(net, getNodeKind(net, y)), y2 = newNode(net, getNodeKind(net, y));
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
  getPortNode,
  getPortSlot,
  newNet,
  newNode,
  enterPort,
  getNodeKind,
  getNodeMeta,
  setNodeMeta,
  link,
  reduce,
  rewrite
};
