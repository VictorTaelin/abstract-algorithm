// Interaction combinators with infinite node types
module.exports = (function(){
  // type Color = Nat
  // data Port  = 0 | 1 | 2
  // data Wire  = Wire Node Port
  // data Node  = Node Color Wire Wire Wire
  var nextId = 0;

  // Node, Port -> Wire
  function Wire(node, port){
    this.id = ++nextId;
    this.node = node;
    this.port = port;
  };
  function wire(node, port){
    return {
      id: ++nextId,
      node: node,
      port: port};
  };

  // Color -> Node
  function Node(color){
    this.id = ++nextId;
    this.k = color;
    this.a = wire(this, 0);
    this.b = wire(this, 1);
    this.c = wire(this, 2);
  };
  function node(color){
    return new Node(color);
  };

  // Node, Port -> Wire
  function port(node, port){
    switch (port){
      case 0: return node.a;
      case 1: return node.b;
      case 2: return node.c;
    };
  };

  // Wire -> Maybe Wire
  function reverse(wire){
    return port(wire.node, wire.port);
  };

  // Wire, Wire -> ()
  function link(a, b){
    var nodeA = a.node, portA = a.port;
    var nodeB = b.node, portB = b.port;
    port(nodeA, portA).node = nodeB;
    port(nodeA, portA).port = portB;
    port(nodeB, portB).node = nodeA;
    port(nodeB, portB).port = portA;
  };

  // Node*, Node* -> ()
  function rewrite(x, y){
    function eraseWire(wire){
      var back = reverse(wire);
      if (port(back) === wire)
        link(back, back);
    };
    function eraseNode(node){
      eraseWire(port(node, 0));
      eraseWire(port(node, 1));
      eraseWire(port(node, 2));
    };
    if (x.k === y.k){
      link(x.b, y.b);
      link(x.c, y.c);
    } else {
      var x1 = new Node(x.k);
      var x2 = new Node(x.k);
      var y1 = new Node(y.k);
      var y2 = new Node(y.k);
      link(y1.a, x.b);
      link(y2.a, x.c);
      link(x1.a, y.b);
      link(x2.a, y.c);
      link(x1.b, y1.b);
      link(x1.c, y2.b);
      link(x2.b, y1.c);
      link(x2.c, y2.c);
    };
    eraseNode(x);
    eraseNode(y);
  };

  // *Wire -> Stats
  function reduce(wire){
    var stats = {steps: 0, rewrites: 0, time: Date.now()}; 
    var solid = {};
    var exits = {};
    (function move(prev){
      console.log(stats.steps);
      var next = reverse(prev);
      while (next !== undefined){
        var prev = reverse(next);
        ++stats.steps;
        if (solid[next.node.id]) 
          return;
        if (next.port === 0){
          if (prev.port === 0 && !(prev.node === next.node)){ 
            ++stats.rewrites;
            next = reverse(port(prev.node, exits[prev.node.id]));
            rewrite(prev.node, reverse(prev).node);
          } else {
            solid[next.node.id] = true;
            move(reverse(next.node.c));
            move(reverse(next.node.b));
            return;
          };
        } else {
          exits[next.node.id] = next.port;
          next = next.node.a;
        };
      };
    })(wire);
    link(wire, wire);
    stats.time = (Date.now()-stats.time)/1000;
    return wire;
  };

  return {
    Node: Node,
    reduce: reduce,
    reverse: reverse,
    link: link,
    wire: wire,
    node: node,
    port: port,
  };
})();
