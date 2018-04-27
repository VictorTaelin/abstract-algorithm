// Implements abstract-combinators with infinite node colors.

function port(node, slot) {
  return (node << 2) | slot;
}

function getPortNode(port) {
  return port >>> 2;
}

function getPortSlot(port) {
  return port & 3;
}

function enterPort(mem, w) {
  return mem[w];
}

function newNode(mem, kind) {
  var node = mem.length / 4;
  mem.push(port(node, 0), port(node, 1), port(node, 2), kind << 2);
  return node;
}

function getNodeKind(mem, node) {
  return mem[node * 4 + 3] >>> 2;
}

function getNodeMeta(mem, node) {
  return (mem[node * 4 + 3] >>> 0) & 3;
}

function setNodeMeta(mem, node, meta) {
  return mem[node * 4 + 3] = mem[node * 4 + 3] & 0xFFFFFFFC | meta;
}

function link(mem, a, b) {
  mem[a] = b;
  mem[b] = a;
}

function reduce(mem) {
  mem.stats = {loops:0, rules:0, betas:0, dupls:0, annis:0};
  var next = mem[0];
  var prev, back;
  while (next > 0) {
    prev = enterPort(mem, next);
    next = enterPort(mem, prev);
    if (getPortSlot(next) === 0) {
      if (getPortSlot(prev) === 0 && getPortNode(prev) !== 0) {
        back = enterPort(mem, port(getPortNode(prev), getNodeMeta(mem, getPortNode(prev))));
        rewrite(mem, getPortNode(prev), getPortNode(next), mem.stats);
        next = enterPort(mem, back);
      } else {
        setNodeMeta(mem, getPortNode(next), 1);
        next = enterPort(mem, port(getPortNode(next), 1));
      }
    } else {
      var meta = getNodeMeta(mem, getPortNode(next));
      setNodeMeta(mem, getPortNode(next), meta === 0 ? getPortSlot(next) : meta + 1);
      next = enterPort(mem, port(getPortNode(next), meta === 1 ? 2 : 0));
    }
    ++mem.stats.loops;
  }
  return mem;
}

// Rewrite 
function rewrite(mem, x, y) {
  if (getNodeKind(mem,x) === getNodeKind(mem,y)) {
    //  a          b            a   b
    //   \        /              \ / 
    //     A -- B       -->       X  
    //   /        \              / \ 
    //  c          d            c   d
    link(mem, enterPort(mem, port(x, 1)),  enterPort(mem, port(y, 1)));
    link(mem, enterPort(mem, port(x, 2)),  enterPort(mem, port(y, 2)));
    mem.stats.betas += getNodeKind(mem, x) === 1 ? 1 : 0;
    mem.stats.annis += 1;
  } else {
    //  a          d       a - B --- A - d
    //   \        /              \ /   
    //     A -- B     -->         X    
    //   /        \              / \  
    //  b          c       b - B --- A - c 
    var x1 = newNode(mem, getNodeKind(mem, x)), x2 = newNode(mem, getNodeKind(mem, x));
    var y1 = newNode(mem, getNodeKind(mem, y)), y2 = newNode(mem, getNodeKind(mem, y));
    link(mem, enterPort(mem, port(y1, 0)), enterPort(mem, port(x, 1)));
    link(mem, enterPort(mem, port(y2, 0)), enterPort(mem, port(x, 2)));
    link(mem, enterPort(mem, port(x1, 0)), enterPort(mem, port(y, 1)));
    link(mem, enterPort(mem, port(x2, 0)), enterPort(mem, port(y, 2)));
    link(mem, enterPort(mem, port(x1, 1)), enterPort(mem, port(y1, 1)));
    link(mem, enterPort(mem, port(x1, 2)), enterPort(mem, port(y2, 1)));
    link(mem, enterPort(mem, port(x2, 1)), enterPort(mem, port(y1, 2)));
    link(mem, enterPort(mem, port(x2, 2)), enterPort(mem, port(y2, 2)));
    mem.stats.dupls += 1;
  }
  mem.stats.rules += 1;
}

module.exports = {
  port,
  getPortNode,
  getPortSlot,
  enterPort,
  newNode,
  getNodeKind,
  getNodeMeta,
  setNodeMeta,
  link,
  reduce,
  rewrite,
};
