#!/usr/bin/env node --stack_size=5000000

var fs = require("fs");
var path = require("path");
var L = require("./lambda-calculus.js");

try {
  var args = [].slice.call(process.argv, 2);
  var stats = args.indexOf("-s") !== -1 || args.indexOf("--stats") !== -1;
  var bruijn = args.indexOf("-b") !== -1 || args.indexOf("--bruijn") !== -1;
  var nobase = args.indexOf("-n") !== -1 || args.indexOf("--nobase") !== -1;
  var dump = args.indexOf("-d") !== -1 || args.indexOf("--dump") !== -1;
  var file = args[args.length - 1];
  var base = fs.readFileSync(path.join(__dirname, "..", "lib", "base.lam"), "utf8");
  var code = fs.readFileSync("./" + (file.indexOf(".") === -1 ? file + ".lam" : file), "utf8");
} catch (e) {
  console.log("Absal evaluates λ-terms optimally (no oracle).");
  console.log("\nUsage:");
  console.log("  absal [--stats] [--bruijn] [--nobase] fileName[.lam]");
  console.log("\nSyntax:");
  console.log("  #arg body      : lambda expression");
  console.log("  /fn arg        : applies fn to arg");
  console.log("  @name val expr : let name be val in expr");
  console.log("\nExample:");
  console.log("  @four #f #x /f /f /f /f x");
  console.log("  /four four");
  console.log("\nStats:");
  console.log("  - loops    : how many times the main loop was executed");
  console.log("  - rules    : total graph rewrites (dupls + annis)");
  console.log("    - dupls  : different color rewrites (duplications)");
  console.log("    - annis  : equal color rewrites (annihilations)");
  console.log("    - betas  : annis with color=0 (lam/app nodes)");
  process.exit();
}

function print(net) {
  for (var i=0; i < net.nodes.length; i+=4) {
    if (net.reuse.some(x => x === i >> 2)) {
      console.log(i>>2);
      continue;
    }
    [a,b,c,d] = net.nodes.slice(i, i+4);
    console.log(i>>2, `${a>>2}:${a&3} ${b>>2}:${b&3} ${c>>2}:${c&3} ${d>>2}:${d&3}`);
  }
}

var start = Date.now();
var net = L.toNet(L.fromString(nobase ? code : base + " " + code));
if (dump) { print(net); }
var net = L.net.reduce(net);
if (dump) { print(net); }
var result = {term: L.toString(L.fromNet(net), bruijn), stats: net.stats};
var time = Date.now() - start;

console.log(result.term);
if (stats) {
  console.log("");
  console.log("- time    : " + ((Date.now() - start) / 1000) + "s");
  console.log("- loops   : " + result.stats.loops);
  console.log("- rules   : " + result.stats.rules);
  console.log("  - dupls : " + result.stats.dupls);
  console.log("  - annis : " + result.stats.annis);
  console.log("  - betas : " + result.stats.betas);
}
