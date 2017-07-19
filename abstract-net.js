// Interaction combinators with infinite node types

const Wire = (node, port) => (node << 2) | port;
const node = wire => wire >>> 2;
const port = wire => wire & 3;
const flip = (mem, w) => mem[w];

const Node = (mem, kind) => {
  const node = mem.length / 4;
  mem.push(Wire(node,0), Wire(node,1), Wire(node,2), kind << 2);
  return node;
}
const kind = (mem, node) => (mem[node * 4 + 3] >>> 2);
const exit = (mem, node) => (mem[node * 4 + 3] >>> 0) & 3;
const setExit = (mem, node, exit) => mem[node * 4 + 3] = mem[node * 4 + 3] & 0xFFFFFFFC | exit;
const link = (mem, a, b) => { mem[a] = b; mem[b] = a; }

const rewrite = (mem, x, y) => {
  if (kind(mem,x) === kind(mem,y)){
    link(mem, flip(mem,Wire(x,1)), flip(mem,Wire(y,1)));
    link(mem, flip(mem,Wire(x,2)), flip(mem,Wire(y,2)));
  } else {
    var x1 = Node(mem,kind(mem,x)), x2 = Node(mem,kind(mem,x));
    var y1 = Node(mem,kind(mem,y)), y2 = Node(mem,kind(mem,y));
    link(mem, flip(mem,Wire(y1,0)), flip(mem,Wire(x,1)));
    link(mem, flip(mem,Wire(y2,0)), flip(mem,Wire(x,2)));
    link(mem, flip(mem,Wire(x1,0)), flip(mem,Wire(y,1)));
    link(mem, flip(mem,Wire(x2,0)), flip(mem,Wire(y,2)));
    link(mem, flip(mem,Wire(x1,1)), flip(mem,Wire(y1,1)));
    link(mem, flip(mem,Wire(x1,2)), flip(mem,Wire(y2,1)));
    link(mem, flip(mem,Wire(x2,1)), flip(mem,Wire(y1,2)));
    link(mem, flip(mem,Wire(x2,2)), flip(mem,Wire(y2,2)));
  }
}

var reduce = (net) => {
  var x, y, z, a, b;
  var M = net.mem;
  var L = net.mem.length;
  var B = 0xFFFFFFC;
  var v = [net.ref], V = 1;
  var S = 0;
  while (V > 0) {
    x = v[--V];
    y = M[x];
    x = M[y];
    if (M[x & B | 3] & 3 === 3)
      continue;
    if ((x & 3) === 0 && (y & 3) === 0 && (y & B) !== (x & B)) {
      z = M[y + (M[y & B | 3] & 3)];
      if ((M[y & B | 3] & B) === (M[x & B | 3] & B)){
        a = M[y & B | 1];
        b = M[x & B | 1];
        M[a] = b;
        M[b] = a;
        a = M[y & B | 2];
        b = M[x & B | 2];
        M[a] = b;
        M[b] = a;
      } else {
        L += 16;
        M[L - 15] = L - 7;
        M[L - 14] = L - 3;
        M[L - 11] = L - 6;
        M[L - 10] = L - 2;
        M[L - 7] = L - 15;
        M[L - 6] = L - 11;
        M[L - 3] = L - 14;
        M[L - 2] = L - 10;
        M[L - 13] = M[y & B | 3] & B;
        M[L - 9] = M[y & B | 3] & B;
        M[L - 5] = M[x & B | 3] & B;
        M[L - 1] = M[x & B | 3] & B;
        a = M[x & B | 1];
        b = L - 16;
        M[b] = a;
        M[a] = b;
        a = M[x & B | 2];
        b = L - 12;
        M[b] = a;
        M[a] = b;
        a = M[y & B | 1];
        b = L - 8;
        M[b] = a;
        M[a] = b;
        a = M[y & B | 2];
        b = L - 4;
        M[b] = a;
        M[a] = b;
      }
      v[V++] = M[z];
    } else if ((x & 3) === 0) {
      M[x & B | 3] = M[x & B | 3] | 3;
      v[V++] = M[x | 2];
      v[V++] = M[x | 1];
    } else {
      M[x & B | 3] = M[x & B | 3] & B | (x & 3);
      v[V++] = M[x & B | 0];
    }
  }
  return net;
}

var reduce_ = (net) => {
  let visit = [net.ref];
  let prev, next, back;
  let steps = 0, rules = 0;
  while (visit.length > 0) {
    prev = visit.pop();
    next = flip(net.mem,prev);
    prev = flip(net.mem,next);
    if (exit(net.mem,node(prev)) === 3)
      continue;
    if (port(prev) === 0) {
      if (port(next) === 0 && !(node(next) === node(prev))){ 
        back = flip(net.mem,Wire(node(next),exit(net.mem,node(next))));
        rewrite(net.mem,node(next),node(prev));
        visit.push(flip(net.mem,back));
        ++rules;
      } else {
        setExit(net.mem,node(prev),3);
        visit.push(flip(net.mem,Wire(node(prev),2)));
        visit.push(flip(net.mem,Wire(node(prev),1)));
      };
    } else {
      setExit(net.mem,node(prev),port(prev));
      visit.push(flip(net.mem,Wire(node(prev),0)));
    }
    ++steps;
  }
  return net;
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
