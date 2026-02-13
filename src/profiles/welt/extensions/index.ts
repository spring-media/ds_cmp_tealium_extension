import { googleExtension, googleExtensionConversion, googleExtensionPropens } from "./googleExtensionFuncs"

        Object.defineProperty(global, "sessionStorage", { value: {getItem:()=>{return 'justATest'}}});

(function(a = {}, b = {}){
  googleExtension(a, b)
  googleExtensionPropens(a, b)
  googleExtensionConversion(a, b)
  console.log(a, b)
  
})()