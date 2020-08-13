const Var = (name)       => ({ctor: "Var", name});
const Lam = (name, body) => ({ctor: "Lam", name, body});
const App = (func, argm) => ({ctor: "App", func, argm});

// Stringifies a λ-term.
function show(term) {
  switch (term.ctor) {
    case "Var":
      return term.name;
    case "Lam":
      var name = term.name;
      var body = show(term.body);
      return "λ" + name + "." + body;
    case "App":
      var func = show(term.func);
      var argm = show(term.argm);
      return "(" + func + " " + argm + ")";
  }
};

// Parses a λ-term. The syntax used is `λx.body` for lambdas and `(f x)` for
// applications. Example: `λt. (λf. λx. (f (f x)) λk. k)` for a tuple of the
// church nat 2 and the identity function.
function read(code) {
  var indx = 0;
  var code = code.split("\n").map(x => x.replace(/\/\/.*/gm,"")).join("\n");
  function skip_space() {
    while (indx < code.length && /[ \n]/.test(code[indx])) {
      ++indx;
    }
  }
  function read_name() {
    var name = "";
    while (indx < code.length && /[a-zA-Z0-9_!]/.test(code[indx])) {
      name += code[indx++];
    }
    return name;
  }
  function read_char(chr) {
    skip_space();
    if (indx === code.length || code[indx] !== chr) {
      throw "Expected '"+chr+"', found '"+(code[indx]||"<eof>")+"' at "+indx+".";
    }
    indx++;
  }
  var defs = {};
  function read_term(vars) {
    skip_space();
    var head = code[indx++];
    switch (head) {
      case "(": // app
        var term = read_term(vars);
        while (indx < code.length && !/^\s*\)/.test(code.slice(indx))) {
          term = App(term, read_term(vars));
        }
        var skip = read_char(")");
        return term;
      case "λ": // lam
        var name = read_name();
        var skip = read_char(".");
        var body = read_term(vars.concat([name]));
        return Lam(name, body);
      case "@": // let
        var name = read_name();
        var term = read_term(vars);
        var body = read_term(vars.concat([name]));
        return App(Lam(name, body), term);
      case "$": // def
        var name = read_name(vars);
        var term = read_term(vars);
        defs[name] = term;
        return read_term(vars);
      default:
        var name = head + read_name();
        if (vars.indexOf(name) !== -1) {
          return Var(name);
        } else if (defs[name]) {
          return defs[name];
        } else {
          return Var(name);
          //throw "Unbound variable: '"+name+"'.";
        }
    }
  }
  return read_term([]);
};

module.exports = {Var, Lam, App, show, read};
