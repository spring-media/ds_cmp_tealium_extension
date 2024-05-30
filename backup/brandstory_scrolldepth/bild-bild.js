//GET CLEAN S_PPV COOKIE STRING + Scrolldepth Value
function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
        var mycookie = c.substring(name.length, c.length);
      return mycookie.split(",")[1]
    }
  }
  return "";
}
   var scrollArray = [];
    document.addEventListener("scroll", function scrollDepth(){
      var s_ppv = getCookie("s_ppv");
  
      var sd = parseInt(s_ppv);
if(scrollArray[scrollArray.length-1] === sd){
  sd = sd+1;
}

 let myRNr = false;
  if(sd <= 100 && !myRNr) {
        if(sd === 50 || sd === 75 || sd===100  ){
            myRNr = true;
            scrollArray.push(sd),
            utag.link({
                "event_name": "scroll depth", 
                "event_action" : "view" +sd, 
                "page_platform" : utag.data.page_platform,
                adobe_pageName : utag.data.adobe_pageName
            }, null, [10]);
         //   utag.track("link", null, [206], {"event_name": "testScrolltiefe", "event_data" : "view" +sd})
            console.log("sdvalue" + sd);
            // var myRNr = 1;
            //sd=+1;s
            //document.removeEventListener("scroll", scrollDepth);
    
}

else{}
}
    sd=sd+1; 
    return true;
    });
 
    
