Dave_js.Converters = {
  default: function defaultConverter(val, sigFigs) {
    var num = +val;
    
    return num < 1000 ?
      val : num.toPrecision(sigFigs || (val + '').length);
  },
  jsTime: function jsTime(ms) {
    return (new Date(ms));
  },
  unixTime: function unixTime(sec) {
    return (new Date(sec * 1000));
  }
};