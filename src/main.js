#!/usr/bin/env node --stack_size=5000000

var fs = require("fs");
var path = require("path");
var L = require("./lambda-calculus.js");

try {
  var args = [].slice.call(process.argv, 2);
  var stats = args.indexOf("-s") !== -1 || args.indexOf("--stats") !== -1;
  var bruijn = args.indexOf("-b") !== -1 || args.indexOf("--bruijn") !== -1;
  var file = args[args.length - 1];
  var base = fs.readFileSync(path.join(__dirname, "..", "lib", "base.lam"), "utf8");
  var code = fs.readFileSync("./" + (file.indexOf(".") === -1 ? file + ".lam" : file), "utf8");
} catch (e) {
  console.log("Absal evaluates λ-terms optimally (no oracle).");
  console.log("Usage:");
  console.log("  absal [--stats] [--bruijn] fileName[.lam]");
  console.log("Syntax:");
  console.log("  #arg body      : lambda expression");
  console.log("  /fn arg        : applies fn to arg");
  console.log("  @name val expr : let name be val in expr");
  console.log("Example:");
  console.log("  @four #f #x /f /f /f /f x");
  console.log("  /four four");
  console.log("Stats:");
  console.log("  - loops: how many times the main loop was executed");
  console.log("  - rewrites : total graph rewrites (dupls + annis)");
  console.log("    - dupls  : different color rewrites (duplications)");
  console.log("    - annis  : equal color rewrites (annihilations)");
  console.log("    - betas  : annis with color=0 (lam/app nodes)");
  process.exit();
}

var start = Date.now();
var result = L.reduce(`${base} ${code}`, 1, bruijn);

console.log(result.term);
if (stats) {
  console.log("");
  console.log("- time     : " + ((Date.now() - start) / 1000) + "s");
  console.log("- loops    : " + result.stats.loops);
  console.log("- rewrites : " + result.stats.rewrites);
  console.log("  - dupls  : " + result.stats.dupls);
  console.log("  - annis  : " + result.stats.annis);
  console.log("  - betas  : " + result.stats.betas);
}
