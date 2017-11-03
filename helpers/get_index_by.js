module.exports = function (arr, name, value) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i][name] == value) {
        return i;
    }
  }
  return -1;
}