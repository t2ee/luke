"use strict";
const symbol_1 = require('./symbol');
const Debugger = require('debug');
require('reflect-metadata');
const debug = Debugger('decorator');
function RemoteService(name) {
    return (target) => {
        debug(`@RemoteService('${name}')`);
        target.prototype[symbol_1.NAME] = name;
    };
}
exports.RemoteService = RemoteService;
function RemoteMethod(name) {
    return (target, key) => {
        const type = Reflect.getMetadata('design:returntype', target, key);
        const paramTypes = Reflect.getMetadata('design:paramtypes', target, key);
        debug(`@RemoteMethod('${name}') on '${key}'`);
        target[symbol_1.METHOD] = target[symbol_1.METHOD] || {};
        target[symbol_1.METHOD][key] = target[symbol_1.METHOD][key] || {
            name,
            params: [],
            response: null,
        };
        target[symbol_1.METHOD][key].name = name;
        //target[METHOD][key].params = paramTypes;
    };
}
exports.RemoteMethod = RemoteMethod;
function RemoteParam(name) {
    return (target, key, index) => {
        const type = Reflect.getMetadata('design:paramtypes', target, key)[index];
        debug(`@RemoteParam('${name}') on '${key}[${index}]:${type}'`);
        target[symbol_1.METHOD] = target[symbol_1.METHOD] || {};
        target[symbol_1.METHOD][key] = target[symbol_1.METHOD][key] || {
            name: '',
            params: [],
            response: null,
        };
        target[symbol_1.METHOD][key].paramBindings[index] = {
            name,
            type,
        };
    };
}
exports.RemoteParam = RemoteParam;
function RemoteResponse(schema) {
    return (target, key) => {
        debug(`@RemoteResponse(${schema}) on '${key}'`);
        target[symbol_1.METHOD] = target[symbol_1.METHOD] || {};
        target[symbol_1.METHOD][key] = target[symbol_1.METHOD][key] || {
            name: '',
            params: [],
            response: null,
        };
        target[symbol_1.METHOD][key].response = schema;
    };
}
exports.RemoteResponse = RemoteResponse;
//# sourceMappingURL=decorator.js.map