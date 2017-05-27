// Interaction combinators with infinite node types

module.exports = (function(){
  function wire(mem, node, port) {
    return (node << 2) | (port + 1);
  }
  function flip(mem, w) {
    return wire(mem, NODE(mem, w), PORT(mem, w));
  }
  function NODE(mem, w) {
    return mem[w >>> 2][(w & 3) - 1] >>> 2;
  }
  function PORT(mem, w) {
    return (mem[w >>> 2][(w & 3) - 1] & 3) - 1;
  }

  function node(mem, kind) {
    var id = mem.length << 2;
    mem.push([id + 1, id + 2, id + 3, kind << 3]);
    return mem.length - 1;
  }
  function kind(mem, node) {
    return (mem[node][3] >>> 3);
  }
  function exit(mem, node) {
    return (mem[node][3] >>> 1) & 3;
  }
  function used(mem, node) {
    return mem[node][3] & 1;
  }
  function setExit(mem, node, exit) {
    return mem[node][3] = mem[node][3] & 0xFFFFFFF9 | (exit << 1);
  }
  function setUsed(mem, node) {
    return mem[node][3] = mem[node][3] | 1;
  }
  function link(mem, a, b) {
    mem[a>>>2][(a&3)-1] = b;
    mem[b>>>2][(b&3)-1] = a;
  }

  function rewrite(mem, x, y) {
    if (kind(mem,x) === kind(mem,y)){
      link(mem,flip(mem,wire(mem,x,1)), flip(mem,wire(mem,y,1)));
      link(mem,flip(mem,wire(mem,x,2)), flip(mem,wire(mem,y,2)));
    } else {
      var x1 = node(mem,kind(mem,x)), x2 = node(mem,kind(mem,x));
      var y1 = node(mem,kind(mem,y)), y2 = node(mem,kind(mem,y));
      link(mem,flip(mem,wire(mem,y1,0)), flip(mem,wire(mem,x,1)));
      link(mem,flip(mem,wire(mem,y2,0)), flip(mem,wire(mem,x,2)));
      link(mem,flip(mem,wire(mem,x1,0)), flip(mem,wire(mem,y,1)));
      link(mem,flip(mem,wire(mem,x2,0)), flip(mem,wire(mem,y,2)));
      link(mem,flip(mem,wire(mem,x1,1)), flip(mem,wire(mem,y1,1)));
      link(mem,flip(mem,wire(mem,x1,2)), flip(mem,wire(mem,y2,1)));
      link(mem,flip(mem,wire(mem,x2,1)), flip(mem,wire(mem,y1,2)));
      link(mem,flip(mem,wire(mem,x2,2)), flip(mem,wire(mem,y2,2)));
    }
  }

  function reduce(net) {
    var mem = net.mem;
    var steps = 0;
    var visit = [net.ref];
    var prev, next;
    while (next || visit.length > 0) {
      ++steps;
      if (!next) {
        prev = visit.pop();
        next = flip(mem,prev);
      }
      prev = flip(mem,next);
      if (used(mem,NODE(mem,next)))  {
        next = null;
      } else if (PORT(mem,next) === 0){
        if (PORT(mem,prev) === 0 && !(NODE(mem,prev) === NODE(mem,next))){ 
          next = flip(mem,wire(mem,NODE(mem,prev), exit(mem,NODE(mem,prev))));
          rewrite(mem,NODE(mem,prev), NODE(mem,flip(mem,prev)));
        } else {
          setUsed(mem,NODE(mem,next));
          visit.push(mem,flip(mem,wire(mem,NODE(mem,next),2)));
          visit.push(mem,flip(mem,wire(mem,NODE(mem,next),1)));
          next = null;
        };
      } else {
        setExit(mem,NODE(mem,next), PORT(mem,next));
        next = wire(mem,NODE(mem,next),0);
      }
    }
    return net;
  }

  return {
    reduce: reduce,
    link: link,
    NODE: NODE,
    PORT: PORT,
    node: node,
    kind: kind,
    wire: wire,
    flip: flip
  };
})();
