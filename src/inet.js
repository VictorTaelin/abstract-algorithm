const Name = require("./name.js");

const New = (ctor, kind) => ({ctor, port: [null, null, null], kind: kind||{}});
const Ptr = (node, slot) => ({ctor: "Ptr", node, slot});

// Stringifies an interaction net.
// The syntax used denotes one node per line. A line starts with "-" for a Lam
// node, and "+" for a Let node. It is followed by 3 write names. Example:
// - a b b
// - a c c
// Represents a net with two nodes connected by their main ports:
//     __________
//    |    a    |
//   / \       / \
//  |'''|     |'''|
//  |___|     |___|
//    b         c
function show(inet) {
  var text = "";
  var numb = 0;
  var link = {};
  for (var node in inet) {
    text += inet[node].ctor === "Lam" ? "- " : "+ ";
    for (var slot = 0; slot < 3; ++slot) {
      var self_id = node+"-"+slot;
      if (equal(inet[node].port[slot], Ptr(node, slot))) {
        text += "- ";
      } else {
        var neig_id = inet[node].port[slot].node+"-"+inet[node].port[slot].slot;
        if (link[neig_id]) {
          text += link[neig_id] + " ";
        } else {
          link[self_id] = Name.rank(numb++);
          text += link[self_id] + " ";
        }
      }
    }
    text += "\n";
  };
  return text.slice(0,-1);
};

// Parses a string as an interaction net.
function read(code) {
  var lines = code.split("\n").filter(x => x !== "");
  var link = {};
  var inet = {};
  for (var node = 0; node < lines.length; ++node) {
    var node = String(node);
    var kind = lines[node][0];
    var vars = lines[node].slice(2).split(" ");
    inet[node] = New(kind === "-" ? "Lam" : kind === "+" ? "Let" : Name.fresh());
    for (var slot = 0; slot < 3; ++slot) {
      var name = vars[slot];
      if (name === "-") {
        inet[node].port[slot] = Ptr(node, slot);
      } else if (!link[name]) {
        link[name] = Ptr(node, slot);
      } else {
        inet[node].port[slot] = link[name];
        inet[link[name].node].port[link[name].slot] = Ptr(node, slot);
      }
    }
  };
  return inet;
};

// Are two pointers the same?
function equal(a, b) {
  return b !== null && a.node === b.node && a.slot === b.slot;
}

// Gets the other side of a pointer
function enter(inet, ptr) {
  if (inet[ptr.node] !== null) {
    //console.log(inet, ptr.node);
    return inet[ptr.node].port[ptr.slot];
  } else {
    return null;
  }
};

// Links two ports
function link(inet, a_ptr, b_ptr) {
  if (a_ptr) {
    inet[a_ptr.node].port[a_ptr.slot] = b_ptr;
  }
  if (b_ptr) {
    inet[b_ptr.node].port[b_ptr.slot] = a_ptr;
  }
}

// Unlinks a port (neighbor will point to itself)
function unlink(inet, a_ptr) {
  var b_ptr = enter(inet, a_ptr);
  if (equal(a_ptr, enter(inet, b_ptr))) {
    inet[a_ptr.node].port[a_ptr.slot] = a_ptr;
    inet[b_ptr.node].port[b_ptr.slot] = b_ptr;
  }
}

// Applies the annihilate rewrite rule
function annihilate(inet, a, b) {
  var a_dest1 = enter(inet, Ptr(a, 1));
  var b_dest1 = enter(inet, Ptr(b, 1));
  link(inet, a_dest1, b_dest1);
  var a_dest2 = enter(inet, Ptr(a, 2));
  var b_dest2 = enter(inet, Ptr(b, 2));
  link(inet, a_dest2, b_dest2);
}

// Applies the commute rewrite rule
function commute(inet, a, b) {
  var p = Name.fresh();
  var q = Name.fresh();
  var r = Name.fresh();
  var s = Name.fresh();
  inet[p] = New(inet[b].ctor, inet[b].kind);
  inet[q] = New(inet[b].ctor, inet[b].kind);
  inet[r] = New(inet[a].ctor, inet[a].kind);
  inet[s] = New(inet[a].ctor, inet[a].kind);
  link(inet, Ptr(r, 1), Ptr(p, 1));
  link(inet, Ptr(s, 1), Ptr(p, 2));
  link(inet, Ptr(r, 2), Ptr(q, 1));
  link(inet, Ptr(s, 2), Ptr(q, 2));
  link(inet, Ptr(p, 0), enter(inet, Ptr(a, 1)));
  link(inet, Ptr(q, 0), enter(inet, Ptr(a, 2)));
  link(inet, Ptr(r, 0), enter(inet, Ptr(b, 1)));
  link(inet, Ptr(s, 0), enter(inet, Ptr(b, 2)));
}

// Applies a single pairwise rewrite
function rewrite(inet, a, b) {
  if (inet[a].ctor === inet[b].ctor) {
    annihilate(inet, a, b);
  } else {
    commute(inet, a, b);
  }
  // Makes sure there aren't leftover pointers to rewritten nodes
  for (var i = 0; i < 3; i++) {
    unlink(inet, Ptr(a, i));
    unlink(inet, Ptr(b, i));
  }
  // Deletes rewritten nodes
  delete inet[a];
  delete inet[b];
};

// Reduces a net to normal form lazily
// Returns number of rewrites
function reduce(inet) {
  var warp = [];
  var exit = [];
  var next = enter(inet, Ptr("0", 1));
  var prev = null;
  var back = null;
  var rwts = 0;
  while (next.node !== "0" || warp.length > 0) {
    next = next.node === "0" ? enter(inet, warp.pop()) : next;
    prev = enter(inet, next);
    if (next.slot === 0 && prev.slot === 0) {
      back = enter(inet, Ptr(prev.node, exit.pop()));
      rewrite(inet, prev.node, next.node);
      next = enter(inet, back);
      ++rwts;
    } else if (next.slot === 0) {
      warp.push(Ptr(next.node, 2));
      next = enter(inet, Ptr(next.node, 1));
    } else {
      exit.push(next.slot);
      next = enter(inet, Ptr(next.node, 0));
    }
  }
  return rwts;
}

module.exports = {
  New,
  Ptr,
  show,
  read,
  equal,
  enter,
  link,
  unlink,
  rewrite,
  reduce,
};
