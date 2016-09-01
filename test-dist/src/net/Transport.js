"use strict";
var Transport;
(function (Transport) {
    Transport[Transport["IPC"] = 0] = "IPC";
    Transport[Transport["TCP"] = 1] = "TCP";
    Transport[Transport["UDP"] = 2] = "UDP";
    Transport[Transport["WS"] = 3] = "WS";
})(Transport || (Transport = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Transport;
//# sourceMappingURL=Transport.js.map