"use strict";
const symbols_1 = require('../symbols');
require('reflect-metadata');
function RemoteMethod() {
    return (target, key) => {
        const type = Reflect.getMetadata('design:returntype', target, key);
        const paramTypes = Reflect.getMetadata('design:paramtypes', target, key);
        target[symbols_1.SERVICE_METHODS] = target[symbols_1.SERVICE_METHODS] || {};
        target[symbols_1.SERVICE_METHODS][key] = target[symbols_1.SERVICE_METHODS][key] || {};
    };
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RemoteMethod;
//# sourceMappingURL=RemoteMethod.js.map