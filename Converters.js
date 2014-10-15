Dave_js.Converters = {
  default: function defaultConverter(val, sigFigs) {
    var num = +val;
    
    return num < 1000 ?
      val :
      (sigFigs ? num.toExponential(sigFigs) : num.toExponential());
  },
  jsTimeToString: function jsTimeToString(ms) {
    return (new Date(ms)).toUTCString();
  },
  unixTimeToString: function unixTimeToString(sec) {
    return (new Date(sec * 1000)).toUTCString();
  }
};