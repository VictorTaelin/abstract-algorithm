//var ERA = 0, ABS = 1, DUP = 2, WIR = 3;
var WIR = Math.pow(2,31);

function port(node, slot) {
  return (node * 4) + slot;
}

function node(port) {
  return Math.floor(port / 4);
}

function slot(port) {
  return port % 4;
}

function newNet(nodes) {
  return {
    nodes: nodes || [],
    stats: {loops:0, rules:0, betas:0, dupls:0, annis:0}
  };
}

function newNode(net, kind) {
  var node = net.nodes.length / 4;
  net.nodes[node * 4 + 0] = node * 4 + 0;
  net.nodes[node * 4 + 1] = node * 4 + 1;
  net.nodes[node * 4 + 2] = node * 4 + 2;
  net.nodes[node * 4 + 3] = kind * 4;
  return node;
}

function isWire(net, node) {
  return net.nodes[port(node,0)] === port(node,0);
}

function enterPort(net, next) {
  do {
    next = net.nodes[next];
  } while (isWire(net, node(next)));
  return next;
}

function kind(net, node) {
  return Math.floor(net.nodes[node * 4 + 3] / 4);
}

function link(net, a, b) {
  net.nodes[a] = b;
  net.nodes[b] = a;
}

var N = 0;
function reduce(net) {
  var bots = [0];
  while (bots.length > 0) {
    if (++N > 20) process.exit();
    var show = nodes => nodes.map((x,i) => (i % 4 === 0 ? i/4 + "[" : "") + (i % 4 !== 3 ? node(x)+":"+slot(x) : String(x)) + (i % 4 === 3 ? "]" : "")).join(" ");
    console.log("start", bots.map(x => ([node(x),slot(x)])));

    // Walks through graph looking for active pairs
    var cmds = [];
    for (var i = 0; i < bots.length; ++i) {
      var init = bots[i];
      console.log("WITH", node(init), slot(init));
      console.log(".");
      var next = enterPort(net,init);
      console.log(",");
      var done = 0;
      while (!done) {
        prev = enterPort(net,next);
        console.log("go", node(prev),slot(prev),"->",node(next),slot(next));
        //if (++N > 10) process.exit();
        if (!next) {
          done = 1; // end of route
        } else if (node(prev) && !slot(prev) && !slot(next)) {
          done = 2; // active pair
        } else if (!slot(next)) {
          done = 3; // normal node
        } else {
          next = enterPort(net,port(node(next),0));
        }
      }
      switch (done) {
        case 2:
          var redx = node(prev) < node(next) ? node(prev) : node(next);
          var dups = Number(kind(net, node(prev)) !== kind(net, node(next)));
          cmds.push(1, init);
          cmds.push(2, redx * 2 + dups);
          break;
        case 3:
          cmds.push(1, port(node(next), 1));
          cmds.push(1, port(node(next), 2));
          break;
      }
    }

    // Gathers issued commands
    var bots = [];
    var anis = [];
    var dups = [];
    for (var i = 0; i < cmds.length; i += 2) {
      var cmd = cmds[i + 0];
      var arg = cmds[i + 1];
      switch (cmd) {
        case 1: // spawn
          bots[arg] = 1;
          //bots.push(arg);
          break;
        case 2: // reduce
          if (arg & 1) {
            dups[arg >>> 1] = 1;
          } else {
            anis[arg >>> 1] = 1;
          }
          break;
      }
    }
    bots = bots.map((x,i) => x >= 0 ? i : 0).filter(x => x >= 0);
    anis = anis.map((x,i) => x >= 0 ? i : 0).filter(x => x >= 0);
    dups = dups.map((x,i) => x >= 0 ? i : 0).filter(x => x >= 0);

    //console.log("n,bots,anis,dups",N, bots.map(x => ([node(x),slot(x)])), anis, dups, JSON.stringify(net.nodes));
    //if (++N > 6) process.exit();

    //console.log(bots, anis, dups);
    //process.exit();

    // Performs annihilations
    //                                              
    //  Q[ A2]   [ A1]P         Q[ A2]<,  ,>[ A1]P  
    //     |       |               v   |  |   v     
    // A2[ Q ]---[ P ]A1       A2[ S ]  \/  [ R ]A1 
    //      \  A  /                |    /\    |     
    //       [ B0]A0                \  |  |  /      
    //         |                     \/    \/       
    //         |                     /\    /\       
    //       [ A0]B0                /  |  |  \      
    //      /  B  \                |    \/    |     
    // B1[ R ]---[ S ]B2       B1[ P ]  /\  [ Q ]B2 
    //     |       |               ^   |  |   ^     
    //  R[ B1]   [ B2]S         R[ B1]<'  '>[ B2]S  
    
    for (var i = 0; i < anis.length; ++i) {
      var A = anis[i], B = node(enterPort(net, port(A, 0)));
      console.log("beg ani", A, B, show(net.nodes));
      var P = net.nodes[port(A,1)];
      var Q = net.nodes[port(A,2)];
      var R = net.nodes[port(B,1)];
      var S = net.nodes[port(B,2)];
      net.nodes[port(A,0)] = port(A,0);
      net.nodes[port(A,1)] = R;
      net.nodes[port(A,2)] = S;
      net.nodes[port(B,0)] = port(B,0);
      net.nodes[port(B,1)] = P;
      net.nodes[port(B,2)] = Q;
      net.stats.anis += 1;
      console.log("end ani", A, B, show(net.nodes));
    }

    // Performs duplications
    //                                                            
    //                              Q[ A2]<-,     ,->[ A1]P       
    //                                 v    |     |    v          
    //  Q[ A2]   [ A1]P            A2[Bl0]  |     |  [Br0]A1      
    //     |       |                   v    |     |    v          
    // A2[ Q ]---[ P ]A1          Bl0[ Q ]--'     '--[ P ]Br0     
    //      \  A  /                 /  Bl \Bl2   Br1/  Br \       
    //       [ B0]A0          Bl1[Al2]---[Ar2]   [Al1]---[Ar1]Br2 
    //         |                   |          \ /          |      
    //         |                   |          / \          |      
    //       [ A0]B0          Al2[Bl1]---[Br1]   [Bl2]---[Br2]Ar1 
    //      /  B  \                 \  Al /Al1   Ar2\  Ar /       
    // B1[ R ]---[ S ]B2          Al0[ R ]--,      ,--[ S ]Ar0    
    //     |       |                   ^    |      |    ^         
    //  R[ B1]   [ B2]S            B1[Al0]  |      |  [Ar0]B2     
    //                                 ^    |      |    ^         
    //                              R[ B1]<-'      '->[ B2]S      
    //                                                            
    var count = net.nodes.length / 4;
    for (var i = 0; i < dups.length; ++i) {
      var A = dups[i], B = node(enterPort(net, port(A, 0)));
      console.log("beg dup", A, B, show(net.nodes));
      var P = net.nodes[port(A,1)];
      var Q = net.nodes[port(A,2)];
      var R = net.nodes[port(B,1)];
      var S = net.nodes[port(B,2)];
      var Al = count + 0;
      var Ar = count + 1;
      var Bl = count + 2;
      var Br = count + 3;
      net.nodes[port(A,0)]  = port(A,0);
      net.nodes[port(A,1)]  = port(Br,0);
      net.nodes[port(A,2)]  = port(Bl,0);
      net.nodes[port(B,0)]  = port(B,0);
      net.nodes[port(B,1)]  = port(Al,0);
      net.nodes[port(B,2)]  = port(Ar,0);
      net.nodes[port(Al,0)] = R;
      net.nodes[port(Al,1)] = port(Br,1);
      net.nodes[port(Al,2)] = port(Bl,1);
      net.nodes[Al*4+3]     = kind(net,A) * 4;
      net.nodes[port(Ar,0)] = S;
      net.nodes[port(Ar,1)] = port(Br,2);
      net.nodes[port(Ar,2)] = port(Bl,2);
      net.nodes[Ar*4+3]     = kind(net,A) * 4;
      net.nodes[port(Bl,0)] = Q;
      net.nodes[port(Bl,1)] = port(Al,2);
      net.nodes[port(Bl,2)] = port(Ar,2);
      net.nodes[Bl*4+3]     = kind(net,B) * 4;
      net.nodes[port(Br,0)] = P;
      net.nodes[port(Br,1)] = port(Al,1);
      net.nodes[port(Br,2)] = port(Ar,1);
      net.nodes[Br*4+3]     = kind(net,B) * 4;
      net.stats.dupls += 1;
      console.log("end dup", A, B, show(net.nodes));
    }
    net.stats.rules += 1;
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
  link,
  reduce,
  //rewrite,
};
