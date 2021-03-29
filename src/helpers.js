function isSet(obj) {
  if (
    obj &&
    obj != "null" &&
    obj != undefined &&
    obj !== "" &&
    obj != "[]" &&
    obj != [] &&
    obj != {} &&
    obj !== "" &&
    obj !== "undefined"
  ) {
    if (typeof obj != "undefined") {
      return true;
    }
  }
  return false;
}
module.exports = {
  isSet,
};
