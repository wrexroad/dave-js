Dave_js.Converters = {
  default: function defaultConverter(val) {
    return val;
  },
  jsTimeToString: function jsTimeToString(ms) {
    return (new Date(ms)).toUTCString();
  },
  unixTimeToString: function unixTimeToString(sec) {
    return (new Date(sec * 1000)).toUTCString();
  }
};