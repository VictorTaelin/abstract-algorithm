const Core = require("./core.js");
const Inet = require("./inet.js");
const Name = require("./name.js");

// Compiles a λ-term to an interaction net.
function compile(term) {
  var vars = {};
  function go(term, lams) {
    switch (term.ctor) {
      case "Lam":
        var self = Name.fresh();
        vars[self] = [];
        var lams = {...lams, [term.name]: self};
        var body = go(term.body, lams);
        if (vars[self].length === 0) {
          var varn = "-";
        } else {
          var varn = vars[self][0];
          for (var i = 1; i < vars[self].length; ++i) {
            dup1 = varn;
            dup2 = vars[self][i];
            varn = Name.fresh();
            lines.push("* "+varn+" "+dup1+" "+dup2);
          }
        };
        lines.push("- "+self+" "+varn+" "+body);
        return self;
      case "App":
        var self = Name.fresh();
        var func = go(term.func, lams);
        var argm = go(term.argm, lams);
        lines.push("- "+func+" "+argm+" "+self);
        return self;
      case "Var":
        var self = Name.fresh();
        var lamb = lams[term.name];
        vars[lams[term.name]].push(self);
        return self;
    }
  }
  var lines = [];
  var init = go(term, {});
  lines.push("- root "+init+" root");
  return lines.reverse().join("\n");
};

// Decompiles an interaction net back to a λ-term.
function decompile(inet) {
  function build_term(inet, ptr, vars, dup_exit) {
    if (inet[ptr.node].ctor === "Lam") {
      switch (ptr.slot) {
        case 0:
          var name = Name.rank(vars.length);
          vars.push({ptr: Inet.Ptr(ptr.node, 1), name});
          var body = build_term(inet, Inet.enter(inet, Inet.Ptr(ptr.node, 2)), vars, dup_exit);
          vars.pop();
          return Core.Lam(name, body);
        case 1:
          for (var indx = 0; indx < vars.length; ++indx) {
            var myvar = vars[vars.length - indx - 1];
            if (Inet.equal(myvar.ptr, ptr)) {
              return Core.Var(myvar.name);
            }
          }
        case 2:
          var argm = build_term(inet, Inet.enter(inet, Inet.Ptr(ptr.node, 1)), vars, dup_exit);
          var func = build_term(inet, Inet.enter(inet, Inet.Ptr(ptr.node, 0)), vars, dup_exit);
          return Core.App(func, argm);
      }
    } else {
      switch (ptr.slot) {
        case 0:
          var exit = dup_exit.pop();
          var term = build_term(inet, Inet.enter(inet, Inet.Ptr(ptr.node, exit)), vars, dup_exit);
          dup_exit.push(exit);
          return term;
        default:
          dup_exit.push(ptr.slot);
          var term = build_term(inet, Inet.enter(inet, Inet.Ptr(ptr.node, 0)), vars, dup_exit);
          dup_exit.pop();
          return term;
      }
    }
  };
  return build_term(inet, Inet.enter(inet, Inet.Ptr("0", 1)), [], []);
};

module.exports = {compile, decompile};
