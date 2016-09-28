"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const symbols_1 = require('./symbols');
const Request_1 = require('./abstract/Request');
const Q = require('q');
const generateUUID_1 = require('./utils/generateUUID');
const ThresholdedRunner_1 = require('./utils/ThresholdedRunner');
const encodeUtil = require('./utils/encodeUtil');
class RemoteClient {
    constructor(provider) {
        this.queue = {};
        this.prototypes = {};
        this.provider = provider;
        (new ThresholdedRunner_1.default(0, 50, 5, 1, this.fetchResult.bind(this))).start();
    }
    getClient(Service) {
        const prototype = Service.prototype;
        const name = prototype[symbols_1.SERVICE_NAME];
        this.prototypes[name] = prototype[symbols_1.SERVICE_METHODS];
        const result = new Service();
        const methods = Object.keys(prototype[symbols_1.SERVICE_METHODS]);
        for (const key of methods) {
            const method = prototype[symbols_1.SERVICE_METHODS][key];
            result[key] = (...params) => __awaiter(this, void 0, void 0, function* () {
                const request = new Request_1.default();
                request.serviceName = name;
                request.methodName = key;
                request.params = params.map((p, i) => encodeUtil.encode(p, method.paramTypes[i]));
                request.callId = generateUUID_1.default();
                const d = Q.defer();
                yield this.provider.sendRequest(request);
                this.queue[request.callId] = {
                    d,
                    method: key,
                    service: name,
                };
                return d.promise;
            });
        }
        return result;
    }
    fetchResult() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.provider.getResponse();
            if (!response)
                return false;
            const callId = response.callId;
            if (this.queue[callId]) {
                const r = this.queue[callId];
                const type = response.responseType;
                if (type === 'success') {
                    const returnType = this.prototypes[r.service][r.method].returnType;
                    r.d.resolve(encodeUtil.decode(response.response, returnType));
                }
                else if (type === 'error') {
                    r.d.reject(response.response);
                }
                return true;
            }
            return false;
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RemoteClient;
//# sourceMappingURL=Client.js.map