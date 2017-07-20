module.exports = {print: (mem, prev, next) => {
  var node = a => a >>> 2;
  var wire = i => pad((node(mem[i])-(i/4|0)).toString(16) + ["a","b","c","d"][mem[i]&3]);
  var pad = s => ("    " + s).slice(-4)
  var strs = ["","","","",""];
  for (var i = 0; i < mem.length; i+=4) {
    strs[0] += pad(i/4 === node(next) ? ">" : i/4 === node(prev) ? "<" : i/4);
    strs[1] += wire(i+0);
    strs[2] += wire(i+1);
    strs[3] += wire(i+2);
    strs[4] += pad((mem[i+3]/4|0).toString(16));
  }
  console.log("|"+strs[0]);
  console.log("|"+strs[1]);
  console.log("|"+strs[2]);
  console.log("|"+strs[3]);
  console.log("|"+strs[4]);
  console.log(" ");
}};
