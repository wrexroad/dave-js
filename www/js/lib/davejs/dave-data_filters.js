/*
   Dave_js.data_filters is a collection of filters and data manipulation tools.
   This is a singleton and can not be instantiated 
   like most of of the Dave_js packages.
*/

Dave_js.data_filters = {
   //Moving Average Filter
   //Arguments:
   //   numOfPts: number of points in front of and behind the current point
   //             to average.
   //   dataSet:  Reference to array of points to filter
   //Output:
   //   Returns the filtered dataset
   movingAve : function(numOfSamples, dataSet){
      var out = [];
      var sum, negOff, posOff, cnt;

      for(var pt_i = 0; pt_i < dataSet.length; pt_i++){
         if(isNaN(+dataSet[pt_i])){continue;}

         sum = +dataSet[pt_i];
         cnt = 1;
         for(var offset = 1; offset < numOfSamples; offset++){
            negOff = pt_i - offset;
            posOff = pt_i + offset;

            if(negOff > 0 && !isNaN(dataSet[negOff])){
               sum += +dataSet[negOff];
               cnt++;
            }
            if(posOff < dataSet.length && !isNaN(dataSet[posOff])){
               sum += +dataSet[posOff];
               cnt++;
            }
         }
         out[pt_i] = sum / cnt;
      }
      return out;
   }
};