Dave_js.DataStore = (function DataStoreFactory() {
  var sets = [];
  
  function DataStore() {
    this.id = sets.length;

    //initialize the data set
    sets[this.id] = {
      'name' : '',
      'vars' : {}
    };
  }

  DataStore.prototype.setName = function setName(name) {
    sets[this.id].name = name;
  };

  DataStore.prototype.addJSONData = function addJSONData(data) {
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

  DataStore.prototype.listVars = function listVars() {
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

  DataStore.prototype.hasVar = function hasVar(varName) {
    return sets[this.id].vars[varName] ? true : false;
  };

  DataStore.prototype.getVarData = function getVarData(varName) {
    return this.hasVar(varName) ? sets[this.id].vars[varName].data : null;
  };

  DataStore.prototype.getVarID = function getVarID(varName) {
    return this.hasVar(varName) ? sets[this.id].vars[varName].id : null;
  };

  DataStore.prototype.setVarID = function setVarID(varName, id) {
    if (this.hasVar(varName)) {
      sets[this.id].vars[varName].id = id;

      return true;
    } else {
      console.log(
        'Can not set variable ID. ' +
        'DataStore ' + this.id + ' does not contain ' + varName + '.'
      );

      return false;
    }
  };

  DataStore.prototype.destroy = function destroy() {
    delete sets[this.id];
  };

  return DataStore;
})();