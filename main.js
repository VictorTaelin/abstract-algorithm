#!/usr/bin/env -S node --stack-size=5000000
//#!/usr/bin/env node --stack_size=5000000

var fs = require("fs");
var Absal = require("./src/absal.js");
var path = require("path");

if (!process.argv[2] || process.argv[2] === "--help" || process.argv[2] === "-h") {
  console.log("# Absal "+require("./package.json").version);
  console.log("Evaluates some λ-terms optimally.");
  console.log("\nUsage:");
  console.log("  absal <file_name>");
  console.log("  absal <expression>");
  console.log("\nSyntax:");
  console.log("  λx. body => lambda");
  console.log("  (fn arg) => application");
  console.log("\nExample:");
  console.log("  absal \"(λf.λx.(f (f x)) λf.λx.(f (f x)))\"");
  process.exit();
}

var file_name = process.argv[2];

if (fs.existsSync(file_name)) {
  var file = fs.readFileSync(file_name, "utf8");
} else {
  var file = file_name;
}

var term = Absal.core.read(file);
console.log("# Term:");
console.log(Absal.core.show(term));
console.log("");

console.log("# Inet:");
var inet = Absal.inet.read(Absal.comp.compile(term));
console.log(Absal.inet.show(inet));
console.log("");

console.log("# Inet-Norm:");
var rwts = Absal.inet.reduce(inet);
inet = Absal.inet.read(Absal.inet.show(inet));
console.log(Absal.inet.show(inet));
console.log("");

console.log("# Term-Norm:");
console.log(Absal.core.show(Absal.comp.decompile(inet)));
console.log("");

console.log("# Stats:");
console.log("- "+rwts+" graph-rewrites.");
