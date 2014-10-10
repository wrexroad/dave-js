/*
AjaxDataConnector defines how DaveJS will collect the data it is meant to plot.
This is a very simple module just meant to demonstrate how to write a custom 
data collector for DaveJS. However its use is not required.
*/

Dave_js.AjaxDataConnector = function AjaxDataConnector() {
  //default settings
  this.settings = {
    'url': 'das',

    //dataFormat can be 'json' or 'table'.
    //if 'table' is set, a 'tableOpts' must also be set.
    'dataFormat': 'json',

    //Set the delimiter for ASCII table columns
    'tableOpts': {
      'delim': ',', //column delimiter
      'header': true, //is there is a title line to use for variable names?
      'commentChar': '#' //lines starting with this character will be ignored
    }
  };

  return this;
};

Dave_js.AjaxDataConnector.prototype.config = function config(s) {
  var opt;

  for (opt in s) {
    if (s[opt] !== null) {
      this.settings[opt] = s[opt];
    }
  }
  
  return (function buildSettingsHash(string) {
    var
      hash = 0,
      charCode,
      char_i;
  
    for (char_i = 0; char_i < string.length; char_i++) {
      charCode = string.charCodeAt(char_i);
      hash = ((hash << 5) - hash) + charCode;
      hash = hash & hash;
    }

    return hash;
  })(JSON.stringify(this.settings));

};

Dave_js.AjaxDataConnector.prototype.fetchData = function fetchData(callback) {
  var
    response,
    dataFormat = this.settings.dataFormat,
    path = this.settings.url,
    qs = this.settings.qs,
    self = this,
    param,
    xhr;

  if (!path) {
    console.log("No URL set for AjaxDataConnector");
    return;
  }
  
  if (qs) {
    path += '?';
    for (param in qs) {
      if (qs.hasOwnProperty(param)) {
        path += param + '=' + qs[param] + '&';
      }
    }

    //add a random number to make sure we get fresh data
    path += Math.random();
  }

  xhr = new XMLHttpRequest();
  xhr.open('GET', path, true);
  xhr.onreadystatechange = function onreadystatechange(){
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {

        //make sure the data are in json format
        if ((dataFormat + '').toLowerCase() == 'table') {
          response = self.processTableData(xhr.response);
        } else if ((dataFormat + '').toLowerCase() == 'json') {
          response = xhr.response;
        } else {
          response = xhr.response;
          console.log('Unknown data format was specified: ' + dataFormat);
        }
        
        //run any callback function if it was provided
        if (typeof callback === 'function') {
          callback(response);
        }

      } else {
        console.log(
          'Could not load data from ' + this.settings.url + ' : ' + xhr.status
        );
      }
    }
  };

  xhr.send();
};

/*
this should no longer be used

Dave_js.AjaxDataConnector.prototype.getDataField = function getDataField() {
  var
    arg,
    args = Array.prototype.slice.call(arguments, 0),
    argLength = arguments.length,
    result,
    argChain = [];

  if (argLength === 0) {return;}
  
  result = this.data;

  while ((arg = args.shift())) {
    argChain.push(arg);

    if (result[arg]) {
      result = result[arg];
    } else {
      console.log("Could not follow full reference chain:");
      console.log('[' + argChain.join('][') + ']');
      console.log('DataStore contents:');
      console.log(this.data);
      break;
    }
  }

  return result;
};
*/

Dave_js.AjaxDataConnector.prototype.processTableData = function processTableData(d){
  var
    line,
    lines = d.split('\n'),
    lineNumber,
    field_i,
    fields = [],
    fieldNames = [],
    tableOpts = this.settings.tableOpts,
    data = {};

  if(!lines){
    console.log('Empty dataset from ' + this.settings.url);
    return false;
  }

  if (tableOpts.delim === '') {
    console.log('No table delimiter set. Can\'t process data');
    return false;
  }

  //Get column names and initialize arrays
  fields = (tableOpts.header ? lines.shift() : lines[0]).split(tableOpts.delim);

  if (tableOpts.header) {
    for(field_i = 0; field_i < fields.length; field_i++){
      fieldNames[field_i] = fields[field_i];
      data[fieldNames[field_i]] = [];
    }
  } else {
    for (field_i = 0; field_i < fields.length; field_i++) {
      fieldNames[field_i] = 'var' + field_i;
      data[fieldNames[field_i]] = [];
    }
  }
  
  lineNumber = 0;
  while ((line = lines.shift())) {
    if (line.charAt(0) !== tableOpts.commentChar){
      fields = line.split(tableOpts.delim);
    }

    for(field_i = 0; field_i < fieldNames.length; field_i++){
      data[fieldNames[field_i]].push(fields[field_i]);
    }

    lineNumber++;
  }
  
  if(data.ERROR){
    console.error('Error while accessing data:');
    console.error('\t' + data.ERROR.join(' '));

    return false;
  }

  return data;
};