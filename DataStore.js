Dave_js.DataSet = (function DataSetFactory() {
  var sets = [];
  
  function DataSet() {
    this.id = sets.length;

    //initialize the data set
    sets[this.id] = {
      'name' : '',
      'vars' : {}
    };
  }

  DataSet.prototype.setName = function setName(name) {
    sets[this.id].name = name;
  };

  DataSet.prototype.addJSONData = function addJSONData(data) {
    var
      var_i,
      dataSetVars = sets[this.id].vars;

    for (var_i in data) {
      if (data.hasOwnProperty(var_i)) {
        dataSetVars[var_i] = {};
        dataSetVars[var_i].data = data[var_i].slice(0);
        dataSetVars[var_i].id = '';
      }
    }
  };

  DataSet.prototype.listVars = function listVars() {
    var
      var_i,
      vars = [],
      dataSetVars = sets[this.id].vars;

    for (var_i in dataSetVars) {
      if (dataSetVars.hasOwnProperty(var_i)) {
        vars.push(var_i);
      }
    }

    return vars;
  };

  DataSet.prototype.hasVar = function hasVar(varName) {
    return sets[this.id].vars[varName] ? true : false;
  };

  DataSet.prototype.getVarData = function getVarData(varName) {
    return this.hasVar(varName) ? sets[this.id].vars[varName].data : null;
  };

  DataSet.prototype.getVarID = function getVarID(varName) {
    return this.hasVar(varName) ? sets[this.id].vars[varName].id : null;
  };

  DataSet.prototype.setVarID = function setVarID(varName, id) {
    if (this.hasVar(varName)) {
      sets[this.id].vars[varName].id = id;

      return true;
    } else {
      console.log(
        'Can not set variable ID. ' +
        'DataSet ' + this.id + ' does not contain ' + varName + '.'
      );

      return false;
    }
  };

  DataSet.prototype.destroy = function destroy() {
    delete sets[this.id];
  };

  return DataSet;
})();