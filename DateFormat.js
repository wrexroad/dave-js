Dave_js.DateFormat = function dateFormatter(fmt){
  return {
    format: [].concat(fmt),
    getDate: function getDate(date) {
      var
        code,
        formatLength,
        result = "";
      
      //make sure date is a Date object
      date = new Date(date);

      //cycle through the format array 
      format = [].concat(format);
      while(format.length){
        code = format.pop();
        result += (typeof formatter[code] != 'function') ?
          this[code](date) : code;
      }
    }
  };
};
Dave_js.DateFormatter.prototype.days = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];
Dave_js.DateFormatter.prototype.months = [
  'January', 'February', 'March',     'April',   'May',      'June',
  'July',    'August',   'September', 'October', 'November', 'December'
];
Dave_js.DateFormatter.prototype.yy = function yy(date){
  return date.getUTCFullYear() % 2000;
};
Dave_js.DateFormatter.prototype.yyyy = function yyyy(date){
  return date.getUTCFullYear();
};
Dave_js.DateFormatter.prototype.mm = function mm(date){
  return date.getUTCMonth() + 1;
};
Dave_js.DateFormatter.prototype.MM = function MM(date){
  return this.months[date.getUTCMonth()];
};
Dave_js.DateFormatter.prototype.dd = function dd(date){
  return date.getUTCDate();
};
Dave_js.DateFormatter.prototype.doy = function doy(date){
  return date.getUTCDate();
};
Dave_js.DateFormatter.prototype.dow = function dow(date){
  return date.date.getUTCDay() + 1;
};
Dave_js.DateFormatter.prototype.DOW = function DOW(date){
  return this.days[date.getUTCDay()];
};
Dave_js.DateFormatter.prototype.DD = function DD(date){
  return this.days[date.getUTCDay()];
};
Dave_js.DateFormatter.prototype.hr = function hr(date){
  var hours = date.getUTCHours();
  return  hours - (hours > 12 ? 12 : 0);
};
Dave_js.DateFormatter.prototype.ampm = function ampm(date){
  var hours = date.getUTCHours();
  return  hours > 12 ? 'am' : 'pm';
};
Dave_js.DateFormatter.prototype.AMPM = function AMPM(date){
  var hours = date.getUTCHours();
  return  hours > 12 ? 'AM' : 'PM';
};
Dave_js.DateFormatter.prototype.HR = function HR(date){
  return date.getUTCHours();
};
Dave_js.DateFormatter.prototype.m = function m(date){
  return date.getUTCMinutes();
};
Dave_js.DateFormatter.prototype.s = function s(date){
  return date.getUTCSeconds();
};
Dave_js.DateFormatter.prototype.ms = function ms(date){
  return date.getUTCMilliseconds();
};