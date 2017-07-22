// This is fully inlined version of abstract-algorithm.js. It works directly
// on arrays and performs garbage collection. It is much faster.

function reduce(net) {
  var B, x, y, z, a, b, m, M, v, V, N, L;
  N = collect(net);
  B = 0xFFFFFFFC;
  m = N.mem;
  M = N.mem.length;
  L = M;
  v = [net.ptr];
  V = 1;
  while (V > 0) {
    V = V - 1;
    x = v[V];
    y = m[x];
    x = m[y];
    if (m[x & B | 3] & 3 === 3)
      continue;
    if ((x & 3) === 0 && (y & 3) === 0 && (y & B) !== (x & B)) {
      z = m[y + (m[y & B | 3] & 3)];
      if ((m[y & B | 3] & B) === (m[x & B | 3] & B)) {
        a = m[y & B | 1]; b = m[x & B | 1]; m[a] = b; m[b] = a;
        a = m[y & B | 2]; b = m[x & B | 2]; m[a] = b; m[b] = a;
      } else {
        M += 16;
        m[M - 15] = M -  7;
        m[M - 14] = M -  3;
        m[M - 11] = M -  6;
        m[M - 10] = M -  2;
        m[M -  7] = M - 15;
        m[M -  6] = M - 11;
        m[M -  3] = M - 14;
        m[M -  2] = M - 10;
        m[M - 13] = m[y & B | 3] & B;
        m[M -  9] = m[y & B | 3] & B;
        m[M -  5] = m[x & B | 3] & B;
        m[M -  1] = m[x & B | 3] & B;
        a = m[x & B | 1]; b = M - 4*4; m[b] = a; m[a] = b;
        a = m[x & B | 2]; b = M - 3*4; m[b] = a; m[a] = b;
        a = m[y & B | 1]; b = M - 2*4; m[b] = a; m[a] = b;
        a = m[y & B | 2]; b = M - 1*4; m[b] = a; m[a] = b;
      }
      v[V++] = m[z];
    } else if ((x & 3) === 0) {
      m[x & B | 3] = m[x & B | 3] | 3;
      v[V++] = m[x | 2];
      v[V++] = m[x | 1];
    } else {
      m[x & B | 3] = m[x & B | 3] & B | (x & 3);
      v[V++] = m[x & B | 0];
    }
  }
  N.ptr = m[N.ptr];
  m[N.ptr] = N.ptr;
  return collect(N);
}

function collect(net) {
  var B = 0xFFFFFFFC;
  var old = net.mem;
  var neo = [];
  var idx = {};
  var vis = [net.ptr];
  while (vis.length > 0) {
    var x = vis.pop();
    if (idx[x & B] === undefined) {
      idx[x & B] = neo.length;
      neo.push(old[x & B | 0], old[x & B | 1], old[x & B | 2], old[x & B | 3]);
      vis.push(old[x & B | 0], old[x & B | 1], old[x & B | 2]);
    }
  }
  for (var i = 0; i < neo.length; i += 4) {
    neo[i + 0] = idx[neo[i + 0] & B] | neo[i + 0] & 3;
    neo[i + 1] = idx[neo[i + 1] & B] | neo[i + 1] & 3;
    neo[i + 2] = idx[neo[i + 2] & B] | neo[i + 2] & 3;
    neo[i + 3] = neo[i + 3] & B;
  }
  return {mem: neo, ptr: i[net.ptr & B] | (net.ptr & 3)};
}

module.exports = {
  reduce: reduce,
  collect: collect
}
