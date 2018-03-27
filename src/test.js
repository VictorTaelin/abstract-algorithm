const L = require("./lambda-calculus.js");

const term = `

$2
  #s
  #z
  /s /s z

//2 2 /2 2

`;

console.log(L.reduce(term));
