Dave_js.DateFormat = function DateFormat(fmt, dateBuilder) {
  var getDateObject, format, converter;

  //use the Date constructor if no dateBuilder was set
  getDateObject = (typeof dateBuilder == "function") ?
      dateBuilder : Date;

  //make sure format is an array
  format = [].concat(fmt);
  
  //create a function that will convert the date to a formated string
  converter = (function toString(date) {
    var
      code, code_i, result = "",
      formatters = Dave_js.DateFormat.prototype;
    
    //convert the raw date to a Date object if needed
    if(date.getTime !== Date.prototype.getTime){
      date = new getDateObject(date);
    }
    
    //cycle through the format array
    for(code_i = 0; code_i < format.length; code_i++){
      code = format[code_i];
      result =
        result +
        (typeof formatters[code] == 'function' ?
        formatters[code](date) : code);
    }

    return result;
  });

  //add an accessor that will return the internal date object
  converter.toDateObject = getDateObject;

  return converter;
};

Dave_js.DateFormat.prototype.days = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];
Dave_js.DateFormat.prototype.months = [
  'January', 'February', 'March',     'April',   'May',      'June',
  'July',    'August',   'September', 'October', 'November', 'December'
];
Dave_js.DateFormat.prototype.yy = function yy(date){
  return date.getUTCFullYear() % 2000;
};
Dave_js.DateFormat.prototype.yyyy = function yyyy(date){
  return date.getUTCFullYear();
};
Dave_js.DateFormat.prototype.mm = function mm(date){
  var month = date.getUTCMonth() + 1;
  return (month < 10 ? "0" : "") + month;
};
Dave_js.DateFormat.prototype.MM = function MM(date){
  return this.months[date.getUTCMonth()];
};
Dave_js.DateFormat.prototype.dd = function dd(date){
  var day = date.getUTCDate() + 1;
  return (day < 10 ? "0" : "") + day;
};
Dave_js.DateFormat.prototype.doy = function doy(date){
  var
    //find out how many milliseconds have elapsed since the start of the year
    ms = date - new Date(date.getUTCFullYear(), 0, 0),

    //convert ms to full days that have elapsed
    day = (ms / 86400000) >> 0,

    //get zeros for paddings
    zeros = day < 10 ? "00" : day < 100 ? "0" : "";

  return zeros + day;
};
Dave_js.DateFormat.prototype.dow = function dow(date){
  var day = date.date.getUTCDay() + 1;

  return (day < 10 ? "0" : "") + day;
};
Dave_js.DateFormat.prototype.DOW = function DOW(date){
  return this.days[date.getUTCDay()];
};
Dave_js.DateFormat.prototype.DD = function DD(date){
  return Dave_js.DateFormat.prototype.DOW(date);
};
Dave_js.DateFormat.prototype.hr = function hr(date){
  var hours = date.getUTCHours();
  hours -= (hours > 12 ? 12 : 0);
  return (hours < 10 ? "0" : "") + hours;
};
Dave_js.DateFormat.prototype.ampm = function ampm(date){
  var hours = date.getUTCHours();
  return  hours > 12 ? 'am' : 'pm';
};
Dave_js.DateFormat.prototype.AMPM = function AMPM(date){
  var hours = date.getUTCHours();
  return  hours > 12 ? 'AM' : 'PM';
};
Dave_js.DateFormat.prototype.HR = function HR(date){
  var hours = date.getUTCHours();
  return (hours < 10 ? "0" : "") + hours;
};
Dave_js.DateFormat.prototype.m = function m(date){
  var min = date.getUTCMinutes();
  return (min < 10 ? "0" : "") + min;
};
Dave_js.DateFormat.prototype.s = function s(date){
  var sec = date.getUTCSeconds();
  return (sec < 10 ? "0" : "") + sec;
};
Dave_js.DateFormat.prototype.ms = function ms(date){
  var milli = date.getUTCMilliseconds();
  return (milli < 10 ? "0" : "") + milli;
};