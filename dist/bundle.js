"use strict";

// src/profiles/welt/extensions/googleExtensionFuncs.ts
var googleExtension = (a, b) => {
  b["a_rand"] = Math.random() * 1e13;
};
var googleExtensionPropens = (a, b) => {
  b["google_propens"] = sessionStorage.getItem("google_prop");
};
var googleExtensionConversion = (a, b) => {
  if (typeof b["cp.utag_main_va"] != "undefined" && b["cp.utag_main_va"].toString().toLowerCase() == "false".toLowerCase() && typeof b["page_isPremium"] != "undefined" && b["page_isPremium"].toString().toLowerCase() == "true".toLowerCase()) {
    b["gps_userEvent"] = "paywall";
  }
};

// src/profiles/welt/extensions/index.ts
Object.defineProperty(global, "sessionStorage", { value: { getItem: () => {
  return "justATest";
} } });
(function(a = {}, b = {}) {
  googleExtension(a, b);
  googleExtensionPropens(a, b);
  googleExtensionConversion(a, b);
  console.log(a, b);
})();
