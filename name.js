function fresh() {
  return rank((26 ** 7) + Math.random() * (26 ** 7));
};

function rank(num) {
  var str = "";
  var num = num + 1;
  while (num > 0) {
    str += String.fromCharCode(97 + (--num) % 26);
    num = Math.floor(num / 26);
  }
  return str;
};

module.exports = {fresh, rank};
