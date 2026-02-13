"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const googleExtensionFuncs_1 = require("./googleExtensionFuncs");
Object.defineProperty(global, "sessionStorage", { value: { getItem: function() { return 'justATest'; } } });
(function(a, b) {
    if (a === void 0) { a = {}; }
    if (b === void 0) { b = {}; }
    (0, googleExtensionFuncs_1.googleExtension)(a, b);
    (0, googleExtensionFuncs_1.googleExtensionPropens)(a, b);
    (0, googleExtensionFuncs_1.googleExtensionConversion)(a, b);
    console.log(a, b);
})();
