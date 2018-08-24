#!/usr/bin/env node --stack_size=5000000

var fs = require("fs");
var path = require("path");
var L = require("./lambda-calculus.js");
var A = require("./abstract-combinators.js");

try {
  var args = [].slice.call(process.argv, 2);
  var stats = args.indexOf("-s") !== -1 || args.indexOf("--stats") !== -1;
  var bruijn = args.indexOf("-b") !== -1 || args.indexOf("--bruijn") !== -1;
  var nobase = args.indexOf("-n") !== -1 || args.indexOf("--nobase") !== -1;
  var debug = args.indexOf("-d") !== -1 || args.indexOf("--debug") !== -1;
  var file = args[args.length - 1];
  var base = fs.readFileSync(path.join(__dirname, "..", "lib", "base.lam"), "utf8");
  var code = fs.readFileSync("./" + (file.indexOf(".") === -1 ? file + ".lam" : file), "utf8");
} catch (e) {
  console.log("Absal evaluates λ-terms optimally (no oracle).");
  console.log("\nUsage:");
  console.log("  absal [--stats] [--bruijn] [--nobase] fileName[.lam]");
  console.log("\nSyntax:");
  console.log("  #arg body      => lambda expression");
  console.log("  :fn arg        => applies fn to arg");
  console.log("  @name val expr => let name be val in expr");
  console.log("  =name val expr => same as :#name expr val");
  console.log("\nExample:");
  console.log("  @four #f #x :f :f :f :f x");
  console.log("  :four four");
  console.log("\nStats:");
  console.log("  - loops    : how many times the main loop was executed");
  console.log("  - rules    : total graph rewrites (dupls + annis)");
  console.log("    - dupls  : different color rewrites (duplications)");
  console.log("    - annis  : equal color rewrites (annihilations)");
  console.log("    - betas  : annis with color=0 (lam/app nodes)");
  process.exit();
}

var net = A.newNet();
if (debug) {
  fs.writeFileSync('debug.txt', '');
  var file = fs.createWriteStream('debug.txt', {'flags':'a'});
  net.debug = {
    chnge: new Set([]),
    flush: () => {
      net.debug.chnge.forEach( i => file.write(`${i} ${net.nodes[i+0]} ${net.nodes[i+1]} ${net.nodes[i+2]} ${net.nodes[i+3]}\n`));
      net.debug.chnge.clear()
      file.write('\n');
    }
  }
}

var start = Date.now();
var net = L.toNet(net, L.fromString(nobase ? code : base + " " + code));
var net = L.net.reduce(net);
var result = { term: L.toString(L.fromNet(net), bruijn), stats: net.stats };

if (debug) file.end('')

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
