Dave_js.DataStore.DataSet = (function DataSetFactory() {

  var sets = {};
    
  function DataSet(id, data, force) {
    if(!id){
      console.log(
        'No DataSet ID specified.'
      );
      
      return null;
    }

    if(
      Object.prototype.toString.call(data) !== '[object Array]' ||
      data.lenth === 0
    ){
      console.log(
        'Empty dataset.'
      );
      
      return null;
    }

    if(sets[id] && !force){
      console.log(
        'DataSet with ID "' + id + '" already exists. Set "force" to overwrite'
      );

      return null;
    }
    
    sets[id] = data.slice();
    
    this.id = id;
    
    return this;
  }


  //should be moved to DataStore
  DataSet.prototype.addJSONData = function addJSONData(d) {
    var
      var_i,
      data = sets[this.id].data;

    for(var_i in d){
      if(data.hasOwnProperty(var_i)){
        data[var_i] = d[var_i].slice(0);
      }
    }
  };

  //should be moved to DataStore
  DataSet.prototype.listVars = function listVars() {
    var
      var_i,
      vars = [],
      data = sets[this.id].data;

    for(var_i in data){
      if(data.hasOwnProperty(var_i)){
        vars.push(var_i);
      }
    }

    return vars;
  };

  //should be moved to DataStore
  DataSet.prototype.setIndependentVar = function setIndependentVar(varName) {
    sets[this.id].labels.indepVar = varName;
  };

  //should be moved to DataStore
  DataSet.prototype.setDependentVars = function setDependentVars() {
    sets[this.id].labels.depVars = [].concat(arguments);
  };
  
  //should be moved to DataStore
  DataSet.prototype.setTitle = function setTitle(title) {
    sets[this.id].labels.title = title;
  };
  
  //should be moved to DataStore
  Dave_js.DataSet.prototype.verify = function verify() {
    var
      dataSet = sets[this.id],
      labels = dataSet.lables,
      depVars = labels.depVars,
      indepVar = labels.indepVar,
      numOfPnts = dataSet.data[indepVar].length,
      var_i,
      depVarData;

    //test independent variable
    if (!indepVar) {
      console.log('DataSet.indepVar must be set.');

      return false;
    }
    if(!numOfPnts){
      console.log(
        'DataSet.' + indepVar + ' is listed as DataSet.indepVar, ' +
        'but does not exist.'
      );

      return false;
    }

    //test dependent variables
    if (depVars.length < 1) {
      console.log('No dependent variables listed in DataSet.depVars.');

      return false;
    } else {
      for (var_i = 0; var_i < depVars.length; var_i++) {
        depVarData = dataSet.data[depVars[var_i]];

        //make sure the specified variables are set
        if (!depVarData) {
          console.log(
            'DataSet.' + depVars[var_i] + ' is listed in DataSet.depVars, ' +
            'but does not exist.'
          );

          return false;
        }

        //make sure all the variables are the same length
        if(depVarData.length !== numOfPnts){
           console.log(
            'DataSet.' + depVars[var_i] + ' has a length of ' +
            depVarData.length + ' but DataSet.' + indepVar +
            ' has set the variable length to ' + numOfPnts + '.'
          );

          return false;
        }
      }
    }

    return true;
  };

  DataSet.prototype.destroy = function destroy() {
    delete sets[this.id];
  };

  return DataSet;
})();