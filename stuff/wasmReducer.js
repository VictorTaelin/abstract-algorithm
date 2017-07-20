const wasm = require("./wasm.js");

const code = () => {
  const B = "$B";
  const x = "$x";
  const y = "$y";
  const z = "$z";
  const a = "$a";
  const b = "$b";
  const M = "$M";
  const V = "$V";
  const r = "$r";
  const l = "$l";

  const params = [r, l];
  const locals = [B, x, y, z, a, b, M, V];

  const par = name => "(param " + name + " i32)";
  const loc = name => "(local " + name + " i32)";
  const set = (name, val) => "(set_local " + name + " " + val + ")";
  const get = (name) => "(get_local " + name + ")";

  const uno = (op) => (a) => "(i32." + op + " " + a + ")";
  const bin = (op) => (a, b) => "(i32." + op + " " + a + " " + b + ")";
  const num = uno("const");
  const eqz = uno("eqz");
  const eq = bin("eq");
  const sub = bin("sub");
  const add = bin("add");
  const and = bin("and");
  const or = bin("or");
  const ne = bin("ne");
  const gt_u = bin("gt_u");
  const gv = (a) => uno("load")("(i32.mul " + a + " (i32.const 4))");
  const sv = (a,b) => bin("store")("(i32.mul " + a + " (i32.const 4))", b);
  const gm = (a) => uno("load")("(i32.mul (i32.add " + a + " (i32.const 256)) (i32.const 4))");
  const sm = (a,b) => bin("store")("(i32.mul (i32.add " + a + " (i32.const 256)) (i32.const 4))", b);

  const slot = (a,b) => or(and(get(a),get(B)),num(b));
  const link = (a_,b_) => set(a,a_) + " " + set(b,b_) + " " + sm(get(a),get(b))  + " " + sm(get(b),get(a));

  const log = (a,b,c,d) => {
    const S = a => typeof a === "number" ? "(i32.const " + a + ")" : a || "(i32.const 0)";
    return "(call $log " + S(a) + " " + S(b) + " " + S(c) + " " + S(d) + ")";
  };
  const S = "$S";

  return `
    (module
      (func $log (import "imports" "log") (param i32) (param i32) (param i32) (param i32))
      (memory (export "mem") 10000)
      (func $reduce
        ${params.map(par).join(" ")} (result i32)
        ${locals.map(loc).join(" ")}

        (local $S i32)

        ${set(B, num(268435452))}
        ${set(M, get(l))}
        ${set(V, num(1))}
        ${sv(num(0), get(r))}

        (set_local $S (i32.const 0))

        (block $break (loop $continue
          (br_if $break ${eqz(get(V))})

          (set_local $S (i32.add (get_local $S) (i32.const 1)))

          ${set(V, sub(get(V), num(1)))}
          ${set(x, gv(get(V)))}
          ${set(y, gm(get(x)))}
          ${set(x, gm(get(y)))}

          (br_if $continue ${eq(and(gm(slot(x,3)),num(3)),num(3))})

          (if ${and(eqz(and(get(x),num(3))), and(eqz(and(get(y),num(3))), ne(and(get(y),get(B)), and(get(x),get(B)))))} (then

            ${set(z, gm(add(get(y), and(gm(slot(y,3)), num(3)))))}
            (if ${eq(and(gm(slot(y,3)),get(B)), and(gm(slot(x,3)),get(B)))} (then
              ${link(gm(slot(y,1)), gm(slot(x,1)))}
              ${link(gm(slot(y,2)), gm(slot(x,2)))}
            ) (else
              ${set(M,add(get(M),num(16)))}
              ${sm(sub(get(M),num(15)),sub(get(M),num(7)))}
              ${sm(sub(get(M),num(14)),sub(get(M),num(3)))}
              ${sm(sub(get(M),num(11)),sub(get(M),num(6)))}
              ${sm(sub(get(M),num(10)),sub(get(M),num(2)))}
              ${sm(sub(get(M),num(7)),sub(get(M),num(15)))}
              ${sm(sub(get(M),num(6)),sub(get(M),num(11)))}
              ${sm(sub(get(M),num(3)),sub(get(M),num(14)))}
              ${sm(sub(get(M),num(2)),sub(get(M),num(10)))}
              ${sm(sub(get(M),num(13)),and(gm(slot(y,3)),get(B)))}
              ${sm(sub(get(M),num(9)),and(gm(slot(y,3)),get(B)))}
              ${sm(sub(get(M),num(5)),and(gm(slot(x,3)),get(B)))}
              ${sm(sub(get(M),num(1)),and(gm(slot(x,3)),get(B)))}
              ${link(gm(slot(x,1)),sub(get(M),num(16)))}
              ${link(gm(slot(x,2)),sub(get(M),num(12)))}
              ${link(gm(slot(y,1)),sub(get(M),num(8)))}
              ${link(gm(slot(y,2)),sub(get(M),num(4)))}
            ))
            ${sv(get(V), gm(get(z)))}
            ${set(V,add(get(V),num(1)))}
          ) (else (if ${eqz(and(get(x),num(3)))} (then
            ${sm(slot(x,3), or(gm(slot(x,3)), num(3)))}
            ${sv(get(V),gm(or(get(x), num(2))))}
            ${set(V,add(get(V),num(1)))}
            ${sv(get(V),gm(or(get(x), num(1))))}
            ${set(V,add(get(V),num(1)))}
          ) (else
            ${sm(slot(x,3), or(and(gm(slot(x,3)),get(B)),and(get(x),num(3))))}
            ${sv(get(V), gm(slot(x,0)))}
            ${set(V,add(get(V),num(1)))}
          ))))

          (br $continue)
        ))

        ${log(get(S))}
        ${get(M)}
      )
      (export "reduce" (func $reduce)))`;
};

//console.log(code(),"\n\n\n\n");

(async () => {
  var lib = await wasm.build(code(), {imports:{log:(a,b,c,d)=>console.log(a,b,c,d)}});
  var mem = new Uint32Array(lib.mem.buffer);

  var input = [6,212,2,4,10,204,0,4,14,144,4,4,16,84,8,4,12,80,24,4,17,22,21,0,18,77,34,4,25,30,29,0,41,38,26,4,42,46,33,4,49,32,36,8,50,54,37,4,57,40,44,12,58,62,45,4,65,48,52,16,66,70,53,4,73,56,60,20,74,78,61,4,81,64,68,24,82,25,69,4,17,72,76,28,13,140,92,4,85,90,89,0,86,137,102,4,93,98,97,0,109,106,94,4,110,114,101,4,117,100,104,32,118,122,105,4,125,108,112,36,126,130,113,4,133,116,120,40,134,138,121,4,141,124,128,44,142,93,129,4,85,132,136,48,9,200,152,4,145,150,149,0,146,197,162,4,153,158,157,0,169,166,154,4,170,174,161,4,177,160,164,52,178,182,165,4,185,168,172,56,186,190,173,4,193,176,180,60,194,198,181,4,201,184,188,64,202,153,189,4,145,192,196,68,5,206,205,4,205,210,209,0,1,214,213,4,213,218,217,0];
  var input = [4,32,2,4,0,28,12,4,5,10,9,0,6,25,22,4,13,18,17,0,29,26,14,4,30,13,21,4,5,20,24,8,1,56,40,4,33,38,37,0,34,53,50,4,41,46,45,0,57,54,42,4,58,41,49,4,33,48,52,12];
  for (var i = 0; i < 256 + input.length; ++i)
    mem[i] = i < 256 ? 0 : input[i - 256];

  var len = lib.reduce(2, input.length);

  console.log("len:", len);

  var output = [];
  for (var i = 0; i < len; ++i)
    output[i] = mem[i + 256];
  console.log(JSON.stringify(output.slice(-10)));

  //console.log(lib);
  //console.log(lib.f(4));
})();


//console.log(helloWasm);

//(async () => {
	//const imports = {imports: {i: arg => console.log(arg)}};
	//const instantiated = await WebAssembly.instantiate(helloWasm, imports);
	
	//console.log(instantiated.instance.exports.e("af"))
//})();

//correct 
//[4,32,2,4,0,28,12,4,5,10,9,0,6,25,22,4,13,18,17,0,29,26,14,4,30,13,21,4,5,20,24,8,1,34,33,4,33,38,37,0]
//[4,32,12,6,0,28,12,4,5,10,9,0,2,14,13,7,13,18,17,0,48,13,14,5,52,13,21,5,32,20,24,10,28,34,40,4,33,38,37,0,44,49,13,10,40,50,21,8,20,50,13,4,24,42,46,4]

//got
//[4,32,2,4,0,28,12,4,5,10,9,0,6,25,22,4,13,18,17,0,29,26,14,4,30,13,21,4,5,20,24,8,1,34,33,4,33,38,37,0]
//[4,32,0,4,0,28,12,4,5,10,9,0,6,25,22,4,13,18,17,0,29,26,14,4,30,13,21,4,5,20,24,8,1,34,33,4,33,38,37,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
