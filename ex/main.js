const L = require("./../src/lambda-calculus.js");
const base = require("fs").readFileSync("./base.lam", "utf8");
const main = require("fs").readFileSync("./main.lam", "utf8");
console.log(L.reduce(`${base} ${main}`, 1));
