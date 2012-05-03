Dave_js.message = function(width, height){
   var self = this;
   var onclickHolder;
   
   //add a new hidden div to the body that will contain the message
   var bodyEl = document.getElementsByTagName("body")[0];
   var box = document.createElement("div");
   box.id = "daveMessageBox";
   box.hidden = true;
   box.style.position = "absolute";
   if(height && width){
      box.style.width = width + "px";
      box.style.height = height + "px";
   }
   bodyEl.appendChild( box );
   
   //add a button that will rehide the message box
   var closeButton = document.createElement("button");
   closeButton.id = "daveMessageClose";
   closeButton.innerHTML = "X";
   closeButton.onclick = self.hideMessage;
   box.appendChild( closeButton );
   
   self.showMessage = function(message, x, y){
      if(!x){x = 0;}
      if(!y){y = 0;}
      
      box.style.top = y + "px";
      box.style.left = x + "px";
      
      box.appendChild( document.createTextNode(message) );
      
      box.hidden = false;
      
      //add onclick listener to the body
      onclickHolder = bodyEl.onclick;
      bodyEl.onclick = self.hideMessage;
   }
   
   self.hideMessage = function(e){
      var target = (e && e.target) || (event && event.srcElement);
      
      //dont hide if clicking the message itself
      if(target.id != "daveMessageBox"){
         box.hidden = true;
         bodyEl.onclick = onclickHolder;
      } 
   }
}


