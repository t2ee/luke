"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const _1 = require('../../abstract/');
const AMQP = require('amqplib');
const generateUUID_1 = require('../../utils/generateUUID');
const PromisedQueue_1 = require('../../utils/PromisedQueue');
class AmqpProvider extends _1.Provider {
    constructor(uri, topic) {
        super();
        this.serverCallIdMapping = {};
        this.clientResultQueue = new PromisedQueue_1.default();
        this.channel = this.connect(uri);
        this.topic = `topic:${topic}`;
        this.clientId = `client:${generateUUID_1.default()}`;
        this.startPollResponse();
    }
    connect(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield AMQP.connect(uri);
            connection.on('error', err => {
                throw err;
            });
            connection.on('close', err => {
                throw new Error('AMQP Client Closed');
            });
            return connection.createChannel();
        });
    }
    getRequest() {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = yield this.channel;
            yield channel.assertQueue(this.topic);
            channel.prefetch(1);
            const message = yield channel.get(this.topic);
            if (message) {
                const m = message;
                const args = JSON.parse(m.content.toString());
                const req = new _1.Request();
                req.callId = args[0];
                req.methodName = args[1];
                req.serviceName = args[2];
                req.params = args[3];
                this.serverCallIdMapping[req.callId] = {
                    clientId: m.properties.replyTo,
                    message: m,
                };
                return req;
            }
            else {
                return null;
            }
        });
    }
    respondRequest(res) {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = yield this.channel;
            const { clientId, message, } = this.serverCallIdMapping[res.callId];
            if (clientId) {
                yield channel.assertQueue(clientId);
                const args = [res.callId, res.responseType, res.response];
                yield channel.sendToQueue(clientId, new Buffer(JSON.stringify(args)));
                yield channel.ack(message);
                delete this.serverCallIdMapping[res.callId];
            }
        });
    }
    sendRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = yield this.channel;
            yield channel.assertQueue(this.topic);
            yield channel.assertQueue(this.clientId);
            const args = [req.callId, req.methodName, req.serviceName, req.params];
            yield channel.sendToQueue(this.topic, new Buffer(JSON.stringify(args)), {
                replyTo: this.clientId,
            });
        });
    }
    startPollResponse() {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = yield this.channel;
            yield channel.assertQueue(this.clientId);
            channel.consume(this.clientId, msg => {
                const args = JSON.parse(msg.content.toString());
                const res = new _1.Response();
                res.callId = args[0];
                res.responseType = args[1];
                res.response = args[2];
                this.clientResultQueue.enqueue(res);
            });
        });
    }
    getResponse() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.clientResultQueue.dequeue();
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AmqpProvider;
//# sourceMappingURL=index.js.map