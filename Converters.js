Dave_js.Converters = {
  default: function defaultConverter(val) {
    return val;
  },
  jsTimeToString: function jsTimeToString(ms) {
    return (new Date(ms)).toDateString();
  },
  unixTimeToString: function unixTimeToString(sec) {
    return (new Date(sec * 1000)).toDateString();
  }
};