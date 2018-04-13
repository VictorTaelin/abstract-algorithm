// Implements symmetric interaction combinators with infinite node colors.

function Wire(node, port) {
  return (node << 2) | port;
}

function node(wire) {
  return wire >>> 2;
}

function port(wire) {
  return wire & 3;
}

function flip(mem, w) {
  return mem[w];
}

function Node(mem, kind) {
  var node = mem.length / 4;
  mem.push(Wire(node, 0), Wire(node, 1), Wire(node, 2), kind << 2);
  return node;
}

function kind(mem, node) {
  return mem[node * 4 + 3] >>> 2;
}

function meta(mem, node) {
  return (mem[node * 4 + 3] >>> 0) & 3;
}

function setMeta(mem, node, meta) {
  return mem[node * 4 + 3] = mem[node * 4 + 3] & 0xFFFFFFFC | meta;
}

function link(mem, a, b) {
  mem[a] = b;
  mem[b] = a;
}

// This walks through the graph looking for redexes, following the logical flow
// of information, in such a way that only redexes that interfere on the normal
// form are reduced. 
function reduce(net) {
  var visit = [net.ptr];
  var prev, next, back;
  net.stats = {loops: 0, rewrites: 0, betas: 0, dupls: 0, annis: 0};
  while (visit.length > 0) {
    ++net.stats.loops;
    prev = visit.pop();
    next = flip(net.mem, prev);
    prev = flip(net.mem, next);
    if (meta(net.mem, node(prev)) === 3) {
      continue;
    }
    if (port(prev) === 0) {
      if (port(next) === 0 && node(next) !== node(prev)){ 
        ++net.stats.rewrites;
        if (kind(net.mem, node(next)) === 1 && kind(net.mem, node(prev)) === 1) {
          ++net.stats.betas;
        }
        back = flip(net.mem, Wire(node(next), meta(net.mem, node(next))));
        rewrite(net.mem, node(next), node(prev), net.stats);
        visit.push(flip(net.mem, back));
      } else {
        setMeta(net.mem, node(prev), 3);
        visit.push(flip(net.mem, Wire(node(prev), 2)));
        visit.push(flip(net.mem, Wire(node(prev), 1)));
      }
    } else {
      setMeta(net.mem, node(prev), port(prev));
      visit.push(flip(net.mem, Wire(node(prev), 0)));
    }
  }
  return net;
}

// This performs the reduction of redexes. It, thus, implements annihilation
// and commutation, as described on Lafont's paper on interaction combinators.
// It is the heart of algorithm. In theory, the reduce() function above isn't
// necessary; you could just store an array of redexes and keep applying this
// function on them. You'd lose the lazy aspect of the algorithm, but you could,
// in turn, perform reductions in parallel. There is an inherent tradeoff
// between laziness and parallelization, because, by reducing nodes in parallel,
// you inevitably reduce redexes which do not influence on the normal form.
function rewrite(mem, x, y, stats) {
  if (kind(mem,x) === kind(mem,y)){
    //  a          b            a   b
    //   \        /              \ / 
    //     A -- B       -->       X  
    //   /        \              / \ 
    //  c          d            c   d
    link(mem, flip(mem, Wire(x, 1)),  flip(mem, Wire(y, 1)));
    link(mem, flip(mem, Wire(x, 2)),  flip(mem, Wire(y, 2)));
    ++stats.annis;
  } else {
    //  a          d       a - B --- A - d
    //   \        /              \ /   
    //     A -- B     -->         X    
    //   /        \              / \  
    //  b          c       b - B --- A - c 
    var x1 = Node(mem, kind(mem, x)), x2 = Node(mem, kind(mem, x));
    var y1 = Node(mem, kind(mem, y)), y2 = Node(mem, kind(mem, y));
    link(mem, flip(mem, Wire(y1, 0)), flip(mem, Wire(x, 1)));
    link(mem, flip(mem, Wire(y2, 0)), flip(mem, Wire(x, 2)));
    link(mem, flip(mem, Wire(x1, 0)), flip(mem, Wire(y, 1)));
    link(mem, flip(mem, Wire(x2, 0)), flip(mem, Wire(y, 2)));
    link(mem, flip(mem, Wire(x1, 1)), flip(mem, Wire(y1, 1)));
    link(mem, flip(mem, Wire(x1, 2)), flip(mem, Wire(y2, 1)));
    link(mem, flip(mem, Wire(x2, 1)), flip(mem, Wire(y1, 2)));
    link(mem, flip(mem, Wire(x2, 2)), flip(mem, Wire(y2, 2)));
    ++stats.dupls;
  }
}

module.exports = {
  reduce: reduce,
  Node: Node,
  link: link,
  flip: flip,
  kind: kind,
  Wire: Wire,
  node: node,
  port: port
};
