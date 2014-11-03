Dave_js.DateFormat = function DateFormat(fmt, dateBuilder) {

  //use the Date constructor if no dateBuilder was set
  var getDateObject = (typeof dateBuilder == "function") ?
      dateBuilder : Date;

  //make sure format is an array
  var format = [].concat(fmt);
  
  return (function toDateString(date) {
      var
        code, code_i, result = "",
        formatters = Dave_js.DateFormat.prototype;
      
      //convert the raw date to a Date object
      date = new getDateObject(date);

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
  return date.getUTCMonth() + 1;
};
Dave_js.DateFormat.prototype.MM = function MM(date){
  return this.months[date.getUTCMonth()];
};
Dave_js.DateFormat.prototype.dd = function dd(date){
  return date.getUTCDate();
};
Dave_js.DateFormat.prototype.doy = function doy(date){
  //find out how many milliseconds have elapsed since the start of the year
  var ms = date - new Date(date.getFullYear(), 0, 0);

  //convert ms to full days that have elapsed
  return Math.floor(ms / 86400000);
};
Dave_js.DateFormat.prototype.dow = function dow(date){
  return date.date.getUTCDay() + 1;
};
Dave_js.DateFormat.prototype.DOW = function DOW(date){
  return this.days[date.getUTCDay()];
};
Dave_js.DateFormat.prototype.DD = function DD(date){
  return this.days[date.getUTCDay()];
};
Dave_js.DateFormat.prototype.hr = function hr(date){
  var hours = date.getUTCHours();
  return  hours - (hours > 12 ? 12 : 0);
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
  return date.getUTCHours();
};
Dave_js.DateFormat.prototype.m = function m(date){
  return date.getUTCMinutes();
};
Dave_js.DateFormat.prototype.s = function s(date){
  return date.getUTCSeconds();
};
Dave_js.DateFormat.prototype.ms = function ms(date){
  return date.getUTCMilliseconds();
};