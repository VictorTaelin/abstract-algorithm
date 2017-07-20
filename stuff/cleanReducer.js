var rewrite = (mem, x, y) => {
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

var reduce_ = (net) => {
  let visit = [net.ptr];
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

