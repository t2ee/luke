"use strict";
const symbols_1 = require('../symbols');
function RemoteService(name) {
    return (target) => {
        target.prototype[symbols_1.SERVICE_NAME] = name;
    };
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RemoteService;
//# sourceMappingURL=RemoteService.js.map