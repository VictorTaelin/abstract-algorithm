function port(node, slot) {
  return (node << 2) | slot;
}

function node(port) {
  return port >> 2;
}

function slot(port) {
  return port & 3;
}

function newNet() {
  return {
    debug: null,
    gonxt: 0,
    nodes: [],
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
  if(net.debug) { net.debug.nodes.add(node); net.debug.rmove.delete(node) }
  return node;
}

function enterPort(net, w) {
  return net.nodes[w];
}

function kind(net, node) {
  return net.nodes[node * 4 + 3] >>> 2;
}

function exit(net, node) {
  return (net.nodes[node * 4 + 3] >>> 0) & 3;
}

function setExit(net, node, exit) {
  return net.nodes[node * 4 + 3] = net.nodes[node * 4 + 3] & 0xFFFFFFFC | exit;
}

function link(net, a, b) {
  net.nodes[a] = b; if (net.debug) net.debug.nodes.add(node(a))
  net.nodes[b] = a; if (net.debug) net.debug.nodes.add(node(b))
}

function reuse(net, node) {
  net.reuse.push(node); if (net.debug) net.debug.rmove.add(node)
}

function reduce(net) {
  var prev, back;
  var warp = [];
  net.gonxt = net.nodes[0];
  if (net.debug) net.debug.flush();
  while (net.gonxt || warp.length) {
    // console.log(JSON.stringify(net.nodes, space=0)); console.log(JSON.stringify(net.reuse, space=0)); 
    net.gonxt = net.gonxt || enterPort(net, port(warp.pop(), 2));
    prev = enterPort(net, net.gonxt);
    net.gonxt = enterPort(net, prev);
    if (slot(net.gonxt) === 0 && slot(prev) === 0 && node(prev)) {
      back = enterPort(net, port(node(prev), exit(net, node(prev))));
      rewrite(net, node(prev), node(net.gonxt));
      net.gonxt = enterPort(net, back);
    } else if (slot(net.gonxt) === 0) {
      warp.push(node(net.gonxt));
      net.gonxt = enterPort(net, port(node(net.gonxt), 1));
      setExit(net, node(net.gonxt), 3); 
    } else {
      setExit(net, node(net.gonxt), slot(net.gonxt));
      net.gonxt = enterPort(net, port(node(net.gonxt), 0));
    }
    ++net.stats.loops;
    if(net.debug) net.debug.flush()
  }
  return net;
}

function rewrite(net, A, B) {
  if (kind(net, A) === kind(net, B)) {
    //  1          2            1   2
    //   \        /              \ / 
    //     A == B       -->       X  
    //   /        \              / \ 
    //  2          1            2   1
    link(net, enterPort(net, port(A, 1)), enterPort(net, port(B, 1)));
    link(net, enterPort(net, port(A, 2)), enterPort(net, port(B, 2)));
    net.stats.betas += kind(net, A) === 1 ? 1 : 0;
    net.stats.annis += 1;
    reuse(net, A);
    reuse(net, B)
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
  }
  net.stats.rules += 1;
}

function toJson(net, index) {
  var node = {

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
  exit,
  setExit,
  link,
  reuse,
  reduce,
  rewrite,
};
