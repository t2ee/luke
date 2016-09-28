"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const Encoder_1 = require('../../abstract/Encoder');
const Request_1 = require('../../abstract/Request');
const Response_1 = require('../../abstract/Response');
class JSONEncoder extends Encoder_1.default {
    encodeRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const arr = [];
            arr.push(req.callId);
            arr.push(req.methodName);
            arr.push(req.serviceName);
            arr.push(req.params);
            return new Buffer(JSON.stringify(arr));
        });
    }
    decodeRequest(buf) {
        return __awaiter(this, void 0, void 0, function* () {
            const req = new Request_1.default();
            const json = JSON.parse(buf.toString());
            req.callId = json[0];
            req.methodName = json[1];
            req.serviceName = json[2];
            req.params = json[3];
            return req;
        });
    }
    encodeReponse(res) {
        return __awaiter(this, void 0, void 0, function* () {
            const arr = [];
            arr.push(res.callId);
            arr.push(res.responseType);
            arr.push(res.response);
            return new Buffer(JSON.stringify(arr));
        });
    }
    decodeResponse(buf) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = new Response_1.default();
            const json = JSON.parse(buf.toString());
            res.callId = json[0];
            res.responseType = json[1];
            res.response = json[2];
            return res;
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = JSONEncoder;
//# sourceMappingURL=index.js.map