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
const Response_1 = require('./abstract/Response');
const ThresholdedRunner_1 = require('./utils/ThresholdedRunner');
const encodeUtil = require('./utils/encodeUtil');
class Server {
    constructor(provider) {
        this.services = {};
        this.provider = provider;
        this.runner = new ThresholdedRunner_1.default(0, 100, 10, 1, this.runTask.bind(this));
    }
    register(Service) {
        const prototype = Service.prototype;
        const name = prototype[symbols_1.SERVICE_NAME];
        this.services[name] = {
            Class: Service,
            instance: new Service(),
        };
    }
    setConcurrency(concurrency) {
        this.runner.stop();
        this.runner = new ThresholdedRunner_1.default(0, 100, 10, concurrency, this.runTask);
    }
    isRunning() {
        return this.runner.isRunning();
    }
    stop() {
        this.runner.stop();
    }
    start() {
        this.runner.start();
    }
    runTask() {
        return __awaiter(this, void 0, void 0, function* () {
            const request = yield this.provider.getRequest();
            if (!request)
                return false;
            const { callId, methodName, serviceName, params } = request;
            const Service = this.services[serviceName];
            const response = new Response_1.default();
            response.callId = callId;
            if (Service) {
                if (Service.instance[methodName]) {
                    const method = Service.Class.prototype[symbols_1.SERVICE_METHODS][methodName];
                    try {
                        const args = params.map((p, i) => encodeUtil.decode(p, method.paramTypes[i]));
                        const result = yield Service.instance[methodName](...args);
                        response.response = encodeUtil.encode(result, method.returnType);
                        response.responseType = 'success';
                    }
                    catch (e) {
                        console.log(e);
                        response.response = e.message || e;
                        response.callId = callId;
                        response.responseType = 'error';
                    }
                    this.provider.respondRequest(response);
                }
            }
            return true;
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Server;
//# sourceMappingURL=Server.js.map