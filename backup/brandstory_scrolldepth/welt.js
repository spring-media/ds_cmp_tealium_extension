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
    if (c.indexOf(name) == 0) {
        var mycookie = c.substring(name.length, c.length);
      return mycookie.split(",")[1]
    }
  }
  return "";
}
   var scrollArray = [];
    window.addEventListener("scroll", function(){
      var s_ppv = getCookie("s_ppv");
  
      var sd = parseInt(s_ppv);
if(scrollArray[scrollArray.length-1] === sd){
  sd = sd+1;
}

var existingCookie = document.cookie.match(/cmp_cv_list=([a-zA-z0-9_,-]*)/)?.pop() || '';
var isAdobeConsentGiven = (existingCookie.indexOf('adobe_analytics') >= 0);
 
  if(sd <= 100 && !myRNr  && isAdobeConsentGiven) {
        if(sd === 50 || sd === 75 || sd===100  ){
            // Remove all myRNr conditions
            var myRNr = true;
            scrollArray.push(sd),            
            utag.link({
              "event_name": "scroll depth", 
              "event_action" : "view" +sd, 
              "page_platform" : utag.data.page_platform, 
              adobe_pageName : utag.data.adobe_pageName, 
              // Remove extra params below
              "page_escenicId" : utag.data.page_escenicId, 
              "page_type": utag.data.page_type, 
              "page_sectionPath":utag.data.page_sectionPath
            // Check domain and add the tags from enum/object
            // Check for subdomains for eg gluckstree.bild.de
            }, null, [206]);

         //   utag.track("link", null, [206], {"event_name": "testScrolltiefe", "event_data" : "view" +sd})
            console.log("sdvalue" + sd);
            // var myRNr = 1;
            //sd=+1;s
    
}

}
    sd=sd+1;
    return true;
    });
 
    
