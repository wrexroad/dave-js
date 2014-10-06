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

  DataStore.prototype.addJSONData = function addJSONData(jsonData, index) {
    var
      var_i, pnt_i, length, keyedData, varData, indexData, key, num,
      numberData,
      dataSetVars = sets[this.id].vars;

    jsonData = jsonData || {};

    indexData = jsonData[index].slice() || [];
    
    for (var_i in jsonData) {
      if (jsonData.hasOwnProperty(var_i)) {
        varData = jsonData[var_i] || [];
        length = varData.length;

        //create a hash of data points whose keys are the index variable
        keyedData = {};
        numberData = [];
        for (pnt_i = 0; pnt_i < length; pnt_i++) {
          key = indexData[pnt_i];
          if (key === "" || (typeof key != "string" && typeof key != "number")){
            //if there is no index, just use the order in which the data arrived
            key = indexData[pnt_i] = pnt_i;
          }

          keyedData[key] = varData[pnt_i];

          //figure out if this is a max or minimum point
          num = Dave_js.Utils.forceNumber(keyedData[key]);
          if(!isNaN(num)){
            numberData.push(num);
          }
        }

        //save the indexed data and some statistics to the DataStore object
        dataSetVars[var_i] = {
          data: keyedData,
          keys: indexData,
          length: indexData.length,
          min: Math.min.apply(null, numberData),
          max: Math.max.apply(null, numberData)
        };
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

  DataStore.prototype.getVar = function getVar(varName) {
    return this.hasVar(varName) ? sets[this.id].vars[varName] : null;
  };

  DataStore.prototype.destroy = function destroy() {
    delete sets[this.id];
  };

  return DataStore;
})();