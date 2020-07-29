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
  function skip_space() {
    while (indx < code.length && /[ \n]/.test(code[indx])) {
      ++indx;
    }
  }
  function read_name() {
    var name = "";
    while (indx < code.length && /[a-zA-Z0-9]/.test(code[indx])) {
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
  function read_term() {
    skip_space();
    var head = code[indx++];
    switch (head) {
      case "(":
        var func = read_term();
        var argm = read_term();
        var skip = read_char(")");
        return App(func, argm);
      case "λ":
        var name = read_name();
        var skip = read_char(".");
        var body = read_term();
        return Lam(name, body);
      default:
        var tail = read_name();
        return Var(head + tail);
    }
  }
  return read_term();
};

module.exports = {Var, Lam, App, show, read};
