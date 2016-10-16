// Interaction-calculus-like syntax for interaction combinators
var com = require("./interaction-combinators.js");
module.exports = (function(){
  // Wire -> String
  function toSource(wire){
    var wireName = (function(){
      var next = 0;
      var name = {};
      function genName(){
        var alphabet 
          = "abcdefghijklmnopqrstuvwxyz"
          + "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
          + "0123456789";
        var base = alphabet.length;
        return (function go(id){
          return id < base ? "" : alphabet[id%base] + go(~~(id / base));
        })((next++)+alphabet.length);
      };
      return function(next){
        var prev = com.reverse(next);
        if (next.port === prev.port && next.node === prev.node)
          return "@";
        var ai = next.node.id*3 + next.port;
        var bi = prev.node.id*3 + prev.port;
        var pairId = ai < bi ? ai+":"+bi : bi+":"+ai;
        return name[pairId] = name[pairId] || genName();
      };
    })();
    function buildTree(wire){
      function wrap(n, str){
        return n < 4 ? str :
          ( n % 4 === 0 ? "("+wrap(~~(n/4), str)+")"
          : n % 4 === 1 ? "["+wrap(~~(n/4), str)+"]"
          : n % 4 === 2 ? "{"+wrap(~~(n/4), str)+"}"
          : n % 4 === 3 ? "<"+wrap(~~(n/4), str)+">" : "?");
      };
      var treeCode = (function go(wire){
        return wire.port !== 0 
          ? wireName(wire) 
          : wrap(wire.node.k+4,
              go(wire.node.b)+" "+
              go(wire.node.c));
      })(wire);
      return wireName(wire)+":"+treeCode;
    };
    var visited = {};
    var trees = [];
    (function findTrees(wire){
      var node = wire.node;
      if (!visited[node.id]){
        visited[node.id] = true;
        if (node.a.port === 0)
          trees.push(buildTree(node.a, true));
        for (var i=0; i<3; ++i)
          findTrees(com.port(node, i));
      };
    })(wire);
    return trees.join("\n");
  };

  // String -> Wire
  function fromSource(source){
    function skip(){
      ++idx;
    };
    function buildPort(name, wire){
      if (name === "@"){
        root = wire;
      } else if (wires[name]){
        com.link(wires[name], wire);
      } else {
        wires[name] = wire;
      }
    };
    function skipWhite(){
      while (/[ \t\n]/.test(source[idx]))
        skip();
    };
    function parseName(){
      var name = "";
      while (/^\w$/.test(source[idx]) || source[idx] === "@"){
        name += source[idx];
        skip();
      };
      return name;
    };
    function parseNode(upWire){
      var chr = source[idx];
      var kind 
        = chr === "(" ? 0
        : chr === "[" ? 1
        : chr === "{" ? 2 
        : chr === "<" ? 3
        : -1;
      if (kind === -1){
        buildPort(parseName(), upWire);
      } else {
        var nodeA = com.node(kind);    skip();
        var nodeB = parseNode(nodeA.b); skip();
        var nodeC = parseNode(nodeA.c); skip();
        if (nodeB) com.link(nodeA.b, nodeB.a);
        if (nodeC) com.link(nodeA.c, nodeC.a);
        return nodeA;
      };
    };
    function parseLine(){
      skipWhite();
      var name = parseName(); skip();
      var node = parseNode(); skip();
      buildPort(name, node.a);
    };
    var wires = {};
    var root = null;
    var idx = 0;
    while (idx < source.length)
      parseLine();
    return root;
  };

  return {
    fromSource: fromSource,
    toSource: toSource};
})();
