var K = 0;
HALT = (msg) => {if (++K>100000000) throw ("infloop " + msg)};

var Net = (() => {

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
      HALT("enterPort loop " + node(next) + ":" + slot(next));
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

  var show = nodes =>
    net.nodes
      .map((x,i) =>
        (i % 4 === 0 ? i/4 + "[" : "")
        + (i % 4 !== 3 ? node(x)+":"+slot(x) : String(x))
        + (i % 4 === 3 ? "]" : ""))
      .join(" ");

  function* reduce(net) {
    var showPort = p => node(p) + ("abc"[slot(p)]);
    var bots = [0];
    while (bots.length > 0) {
      //console.log("Bots: " + bots.map(showPort).join(" "));

      // Walks through graph looking for active pairs
      var cmds = [];
      for (var i = 0; i < bots.length; ++i) {
        var init = bots[i];
        //console.log("Starting from " + showPort(init));
        var next = enterPort(net,init);
        var done = 0;
        while (!done) {
          HALT();
          prev = enterPort(net,next);
          //console.log("Moving from " + showPort(prev) + " to " + showPort(next));
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
        //console.log("Annihilating nodes " + A + " & " + B);
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
      for (var i = 0; i < dups.length; ++i) {
        var A = dups[i], B = node(enterPort(net, port(A, 0)));
        //console.log("Duplicating nodes " + A + " & " + B);
        var P = net.nodes[port(A,1)];
        var Q = net.nodes[port(A,2)];
        var R = net.nodes[port(B,1)];
        var S = net.nodes[port(B,2)];
        var L = net.nodes.length / 4;
        var Al = L + 0;
        var Ar = L + 1;
        var Bl = L + 2;
        var Br = L + 3;
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
      }
      net.stats.rules += 1;
      console.log(JSON.stringify(net.stats), anis.length, dups.length);
      yield net;
    }
  }

  return {port,node,slot,newNet,newNode,isWire,enterPort,kind,link,reduce,show};
})();

var Term = (() => {
  const Var = (idx)      => ({tag: "Var", idx});
  const Lam = (bod)      => ({tag: "Lam", bod});
  const App = (fun, arg) => ({tag: "App", fun, arg});

  const fromString = src => {
    var i = 0;
    var parseString = (name) => {
      var str = "";
      while (src[i] && (name ? !/[\r|\n| ]/.test(src[i]) : src[i] !== ")")) {
        str += src[i++];
      }
      return str;
    };
    var rem = (ctx) => {
      return ctx ? (ctx[0][1] ? [ctx[0],rem(ctx[1])] : rem(ctx[1])) : null;
    };
    var parseTerm = (ctx, nofv) => {
      switch (src[i++]) {
        case ' ':
        case '\r':
        case '\n':
          return parseTerm(ctx, nofv);
        case '#':
          var nam = parseString(1);
          var bod = parseTerm([[nam,null],ctx], nofv);
          return Lam(bod);
        case "@":
          var nam = parseString(1);
          var val = parseTerm(rem(ctx), true);
          var bod = parseTerm([[nam,val],ctx], nofv);
          return bod;
        case ":":
          var nam = parseString(1);
          var val = parseTerm(ctx, nofv);
          var bod = parseTerm([[nam,null],ctx], nofv);
          return App(Lam(bod), val);
        case "/":
          var fun = parseTerm(ctx, nofv);
          var arg = parseTerm(ctx, nofv);
          return App(fun, arg);
        default:
          --i;
          var nam = parseString(1);
          var dph = 0;
          while (ctx && ctx[0][0] !== nam) {
            dph += ctx[0][1] === null ? 1 : 0;
            ctx = ctx[1];
          }
          if (ctx) {
            return ctx[0][1] ? ctx[0][1] : Var(dph);
          } else {
            throw "Unbound variable '" + nam + "'.";
          }
      }
    };
    return parseTerm(null, false);
  };

  const toString = (term, bruijn) => {
    const varName = n => {
      const suc = c => String.fromCharCode(c.charCodeAt(0) + 1);
      const inc = s => !s ? "a" : s[0] === "z" ? "a" + inc(s.slice(1)) : suc(s) + s.slice(1);
      return n === 0 ? "a" : inc(varName(n - 1));
    };
    const go = (term, dph) => {
      switch (term.tag) {
        case "Var":
          return varName(bruijn ? term.idx : dph - term.idx - 1);
        case "App":
          return "/" + go(term.fun, dph) + " " + go(term.arg, dph);
        case "Lam":
          return "#" + (bruijn ? "" : varName(dph) + " ") + go(term.bod, dph + 1);
      }
    };
    return go(term, 0);
  };

  const toNet = term => {
    var kind = 1;
    var indx = 0;
    var net = Net.newNet([0,2,1,4]);
    var ptr = (function encode(term, scope){
      switch (term.tag){
        // Arg
        //    \
        //     App = Fun
        //    /
        // Ret
        case "App":
          var app = Net.newNode(net,1);
          var fun = encode(term.fun, scope);
          Net.link(net, Net.port(app,0), fun);
          var arg = encode(term.arg, scope);
          Net.link(net, Net.port(app,1), arg);
          return Net.port(app,2);
        // Era =- Fun = Ret  
        //         |     
        //        Bod  
        case "Lam": 
          var fun = Net.newNode(net,1);
          var era = Net.newNode(net,0);
          Net.link(net, Net.port(fun,1), Net.port(era,0));
          Net.link(net, Net.port(era,1), Net.port(era,2));
          var bod = encode(term.bod, [[fun,++kind]].concat(scope));
          Net.link(net, Net.port(fun,2), bod);
          return Net.port(fun,0);
        // Arg
        //    \
        //     Dup =- Fun      Ret - Era
        //    /
        // Ret
        case "Var":
          var [lam,kin] = scope[term.idx];
          var arg = Net.enterPort(net, Net.port(lam,1));
          if (Net.kind(net, Net.node(arg)) === 0) {
            return Net.port(lam, 1);
          } else {
            var dup = Net.newNode(net,kin);
            Net.link(net, Net.port(dup,2), arg);
            Net.link(net, Net.port(dup,0), Net.port(lam,1));
            return Net.port(dup,1);
          }
      };
    })(term, []);
    Net.link(net, 0, ptr);
    return net;
  };

  const fromNet = net => {
    var nodeDepth = {};
    return (function go(next, exit, depth){
      var prev = Net.enterPort(net, next);
      var prevPort = Net.slot(prev);
      var prevNode = Net.node(prev);
      if (Net.kind(net, prevNode) === 1) {
        switch (prevPort) {
          case 0:
            nodeDepth[prevNode] = depth;
            return Lam(go(Net.port(prevNode,2), exit, depth + 1));
          case 1:
            return Var(depth - nodeDepth[prevNode] - 1);
          case 2:
            var fun = go(Net.port(prevNode,0), exit, depth);
            var arg = go(Net.port(prevNode,1), exit, depth);
            return App(fun, arg);
        }
      } else {
        var wire = Net.port(prevNode, prevPort > 0 ? 0 : exit.head);
        var port = prevPort > 0 ? {head: prevPort, tail: exit} : exit.tail;
        return go(wire, port, depth);
      }
    })(0, null, 0);
  };

  const reduce = (src, returnStats, bruijn) => {
    const reduced = Net.reduce(toNet(fromString(src)));
    if (returnStats) {
      return {term: toString(fromNet(reduced), bruijn), stats: reduced.stats};
    } else {
      return toString(fromNet(reduced));
    };
  };

  return {fromString, toString, toNet, fromNet, reduce};
})();

var render = (() => {
  if (typeof document === "undefined") return;
  const cvs = document.createElement("canvas");
  cvs.width = window.innerWidth * 2;
  cvs.height = window.innerHeight * 2;
  cvs.style.width = window.innerWidth + "px";
  cvs.style.height = window.innerHeight + "px";
  cvs.ctx = cvs.getContext("2d");
  cvs.ctx.scale(2,2);
  cvs.style.border = "1px solid #E0E0E0";
  document.body.appendChild(cvs);
  const circle = (cvs,pos,r,w,c) => {
    cvs.ctx.lineWidth = w;
    cvs.ctx.strokeStyle = c;
    cvs.ctx.beginPath();
    cvs.ctx.arc(pos.x,pos.y,r,0,2*Math.PI);
    cvs.ctx.stroke();
  }
  const line = (cvs,aPos,bPos,w,c0,c1) => {
    var grad = cvs.ctx.createLinearGradient(aPos.x, aPos.y, bPos.x, bPos.y);
    grad.addColorStop(0, c0);
    grad.addColorStop(1, c1);
    cvs.ctx.lineWidth = w;
    cvs.ctx.strokeStyle = grad;
    cvs.ctx.beginPath();
    cvs.ctx.moveTo(aPos.x, aPos.y);
    cvs.ctx.lineTo(bPos.x, bPos.y);
    cvs.ctx.stroke();
  }
  const bfs = (net,withNode) => {
    var visited = {};
    var depth = {};
    var visit = [0];
    depth[0] = 0;
    visited[0] = 1;
    while (visit.length > 0) {
      var node = visit.shift();
      withNode(node, depth[node]);
      for (var i = 0; i < 3; ++i) {
        var neig = Net.node(net.nodes[Net.port(node, i)]);
        if (!visited[neig]) {
          visited[neig] = 1;
          depth[neig] = depth[node] + 1;
          visit.push(neig);
        }
      }
    }
  }
  const render = (net) => {
    var nodesPerDepth = {};
    var nodeCoord = {};
    var w = cvs.width * 0.5;
    var h = cvs.height * 0.5;
    var rad = 15;
    var pad = 60;
    bfs(net, (node,depth) => {
      nodeCoord[node] = {x: nodesPerDepth[depth] || 0, y: depth};
      nodesPerDepth[depth] = (nodesPerDepth[depth] || 0) + 1;
    });
    var nodePos = (node) => {
      var {x:i,y:j} = nodeCoord[node];
      return {
        x: w * 0.5 + (i - nodesPerDepth[j] * 0.5) * pad,
        y: pad + j * pad
      };
    };
    var portPos = (node,port) => {
      var {x:cx,y:cy} = nodePos(node);
      var px, py;
      var r = rad;
      var a = Math.PI * 0.1;
      var c = Math.cos(a);
      var s = Math.sin(a);
      switch (port) {
        case 0: px = cx  ; py = cy-r; break;
        case 1: px = cx-r*c; py = cy+r*s; break;
        case 2: px = cx+r*c; py = cy-r*s; break;
      }
      return {x:px, y:py};
    };
    cvs.ctx.clearRect(0, 0, w * 2, h * 2);
    bfs(net, node => {
      var coord = nodeCoord[node];
      var pos = nodePos(node);
      var col = Net.kind(net,node) === 1 ? "blue" : "green";
      circle(cvs, pos, rad, 0.1, col);
      if (!Net.isWire(net,node)) {
        line(cvs, portPos(node,0), pos, 0.5, col, col);
        line(cvs, portPos(node,1), portPos(node,2), 0.5, col, col);
      }
      cvs.ctx.lineWidth = "0.5";
      cvs.ctx.strokeStyle = "black";
      cvs.ctx.font = "10px monospace";
      cvs.ctx.strokeText(node, pos.x - rad * 0.1, pos.y + rad * 0.7);
      for (var p = 0; p < 3; ++p) {
        var other = net.nodes[Net.port(node, p)];
        //var other = Net.enterPort(net,Net.port(node, p));
        var aPos = portPos(node, p);
        var bPos = portPos(Net.node(other), Net.slot(other));
        line(cvs, aPos, bPos, 0.3, "red", "green");
      }
    });
  }
  return render;
})();

var code = "/ #f #x /f /f x #f #x /f x";
var code = "/ #f #x /f /f /f x #f #x /f /f /f x";
var code = "//#a /#b /a /b b #b /a /b b #a #b ////b #c #d /#e #f #g #h /f e /d c #c #d /#e #f #g #h /g e /d c #c #d #e #f f a //#a /#b /#c /#d /c /d d #d /c /d d #c #d ////d #e #f /#g #h #i #j /h g /f e #e #f /b /#g #h #i #j /h g /f e #e #f #g #h h c //#b /#c /b /c c #c /b /c c #b #c #d /////c #e #f ////f #g #h #i /#j #k #l #m /k j //i h g #g #h #i //#j /#k /j /k k #k /j /k k #j #k #l #m #n ///k m #o /l /j o n /#j #k #l #m /k j //i h g #g #h #i #j #k k e #e #f ////f #g #h #i //#j /#k /j /k k #k /j /k k #j #k #l #m #n ///k m #o /l /j o n /#j #k #l #m /k j //i h g #g #h #i //#j /#k /j /k k #k /j /k k #j #k #l #m #n ///k m #o /l /j o n /#j #k #l #m /l j //i h g #g #h #i #j #k k e #e #f #g #h #i i d b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a #a #b #c c /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a #a #b #c c";

var net = Term.toNet(Term.fromString(code));


if (typeof document === "undefined") {
  var gen = Net.reduce(net);
  for (var i = 0; i < 500000; ++i)
    gen.next();
  try { console.log(Term.toString(Term.fromNet(net))); } catch (e) { };

} else {
  render(net);
  var gen = Net.reduce(net);
  document.body.onkeypress = (() => {
    gen.next();
    console.log(Net.show(net));
    try { console.log(Term.toString(Term.fromNet(net))); } catch (e) { };
    render(net);
  });
}



//console.log("code ", Term.toString(Term.fromString(code)));
//var code2 = Term.toString(Term.fromNet(net));
//console.log("2net ", code2);

//Net.reduce(net);

//console.log("");
//console.log("");

//console.log("norm ", Term.toString(Term.fromNet(net)));



