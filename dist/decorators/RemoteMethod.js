"use strict";
const symbols_1 = require('../symbols');
const Serializable_1 = require('../Serializable');
require('reflect-metadata');
function RemoteMethod(returnType) {
    return (target, key) => {
        const type = Reflect.getMetadata('design:returntype', target, key);
        const paramTypes = Reflect.getMetadata('design:paramtypes', target, key);
        if (type !== Promise) {
            throw new Error(`@RemoteMethod() can only decorate async functions`);
        }
        for (const paramType of paramTypes) {
            if ([Number, String, Boolean].indexOf(paramType) === -1 &&
                !(new paramType() instanceof Serializable_1.default)) {
                throw new Error(`@RemoteMethod() argument types can only be Number, String, Boolean, Serializable,  ${paramType.name} found`);
            }
        }
        target[symbols_1.SERVICE_METHODS] = target[symbols_1.SERVICE_METHODS] || {};
        target[symbols_1.SERVICE_METHODS][key] = target[symbols_1.SERVICE_METHODS][key] || {
            returnType,
            paramTypes,
        };
    };
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RemoteMethod;
//# sourceMappingURL=RemoteMethod.js.map