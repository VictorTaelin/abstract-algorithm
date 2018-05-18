const L = require("./lambda-calculus.js");
const debug = require("./debug.js");

var logs = [];
global.LOG = (str) => logs.push(str);

//function H(net) {
  //var pairs = [];
  //for (var key in net.nodes) {
    //pairs.push([Number(key),Number(net.nodes[key])]);
  //}
  //pairs.sort((a,b) => a[0] - b[0]);
  //var nums = [];
  //for (var i = 0; i < pairs.length; ++i) {
    //nums.push(pairs[i][0], pairs[i][1]);
  //}
  //return "H" + L.net.hash(nums) + "\n(" + JSON.stringify(nums) + ")";
//};

var code = "/#a //a #b b #b b ///#a #b /b a #a #b /a /a b #a #b /a /a b //#a #b /b a #a #b /a /a b #a #b /a /a b";

var code = "//#a /#b /a /b b #b /a /b b #a #b ////b #c #d /#e #f #g #h /f e /d c #c #d /#e #f #g #h /g e /d c #c #d #e #f f a //#a /#b /#c /#d /c /d d #d /c /d d #c #d ////d #e #f /#g #h #i #j /h g /f e #e #f /b /#g #h #i #j /h g /f e #e #f #g #h h c //#b /#c /b /c c #c /b /c c #b #c #d /////c #e #f ////f #g #h #i /#j #k #l #m /k j //i h g #g #h #i //#j /#k /j /k k #k /j /k k #j #k #l #m #n ///k m #o /l /j o n /#j #k #l #m /k j //i h g #g #h #i #j #k k e #e #f ////f #g #h #i //#j /#k /j /k k #k /j /k k #j #k #l #m #n ///k m #o /l /j o n /#j #k #l #m /k j //i h g #g #h #i //#j /#k /j /k k #k /j /k k #j #k #l #m #n ///k m #o /l /j o n /#j #k #l #m /l j //i h g #g #h #i #j #k k e #e #f #g #h #i i d b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a #a #b #c c /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a #a #b #c c";

var code = "/ #f #x /f /f x #f #x /f x";
var code = "/ #f #x /f /f x #x x";
var code = "/ #f #x /f /f x #f #x /f x";
var code = "//#a /#b /a /b b #b /a /b b #a #b ////b #c #d /#e #f #g #h /f e /d c #c #d /#e #f #g #h /g e /d c #c #d #e #f f a //#a /#b /#c /#d /c /d d #d /c /d d #c #d ////d #e #f /#g #h #i #j /h g /f e #e #f /b /#g #h #i #j /h g /f e #e #f #g #h h c //#b /#c /b /c c #c /b /c c #b #c #d /////c #e #f ////f #g #h #i /#j #k #l #m /k j //i h g #g #h #i //#j /#k /j /k k #k /j /k k #j #k #l #m #n ///k m #o /l /j o n /#j #k #l #m /k j //i h g #g #h #i #j #k k e #e #f ////f #g #h #i //#j /#k /j /k k #k /j /k k #j #k #l #m #n ///k m #o /l /j o n /#j #k #l #m /k j //i h g #g #h #i //#j /#k /j /k k #k /j /k k #j #k #l #m #n ///k m #o /l /j o n /#j #k #l #m /l j //i h g #g #h #i #j #k k e #e #f #g #h #i i d b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a #a #b #c c /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a /#a #b #c #d /b a /#a #b #c #d /c a /#a #b #c #d /c a #a #b #c c";

var net = L.toNet(L.fromString(code));

//console.log("");
//console.log(debug.show(net));
//console.log("");

console.log("code ", L.toString(L.fromString(code)));
var code2 = L.toString(L.fromNet(net));
console.log("2net ", code2);

L.net.reduce(net);

console.log("");
//var show = nodes => nodes.map((x,i) => (i % 4 === 0 ? i/4 + "[" : "") + (i % 4 !== 3 ? L.net.node(x)+":"+L.net.slot(x) : String(x)) + (i % 4 === 3 ? "]" : "")).join(" ");
//console.log(show(net.nodes));
console.log("");

console.log("norm ", L.toString(L.fromNet(net)));
