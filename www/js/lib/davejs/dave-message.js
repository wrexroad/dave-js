Dave_js.message = function(){
   var self = this;
   
   //add a new hidden div to the body that will contain the message
   var bodyEl = document.getElementsByTagName("body")[0];
   self.box = document.createElement("div");
   self.box.className = "daveMessageBox";
   self.box.hidden = true;
   self.box.style.position = "absolute";
   
   bodyEl.appendChild( self.box );
   
   //add a button that will rehide the message box
   var closeButton = document.createElement("button");
   closeButton.className = "daveMessageClose";
   closeButton.innerHTML = "X";
   closeButton.onclick = function(){self.hideMessage(self);};
   self.box.appendChild(closeButton);
   
   //add a dive to hold message content
   var messageDiv = document.createElement("div");
   self.box.appendChild(messageDiv);
   
   self.setSize = function(width, height){
      self.box.style.width = width + "px";
      self.box.style.height = height + "px";
   };
   
   self.showMessage = function(message, x, y){
      self.box.style.top = (y || 0) + "px";
      self.box.style.left = (x || 0) + "px";
      
      messageDiv.innerHTML = message;
      
      self.box.hidden = false;
   };
   
   self.hideMessage = function(messageBox){
      messageBox.box.hidden = true; 
   };
};


