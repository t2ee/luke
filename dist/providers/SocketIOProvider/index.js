"use strict";
const _1 = require('../../abstract/');
const PromisedQueue_1 = require('../../utils/PromisedQueue');
const SocketIO = require('socket.io');
const SocketIOClient = require('socket.io-client');
class SocketIOProvider extends _1.Provider {
    constructor(portOrHost) {
        super();
        this.requestQueue = new PromisedQueue_1.default();
        this.responseQueue = new PromisedQueue_1.default();
        this.serverClientMap = {};
        if (typeof (portOrHost) === 'number') {
            this.server = SocketIO();
            this.server.listen(portOrHost);
            this.server.on('connection', client => {
                client.on('request', (callId, serviceName, methodName, params) => {
                    const req = new _1.Request();
                    req.callId = callId;
                    req.serviceName = serviceName;
                    req.methodName = methodName;
                    req.params = params;
                    this.requestQueue.enqueue(req);
                    this.serverClientMap[callId] = client;
                });
                client.on('disconnect', () => {
                });
            });
        }
        else {
            this.client = SocketIOClient(portOrHost);
            this.client.on('response', (callId, responseType, response) => {
                const res = new _1.Response();
                res.callId = callId;
                res.responseType = responseType;
                res.response = response;
                this.responseQueue.enqueue(res);
            });
        }
    }
    getRequest() {
        return this.requestQueue.dequeue();
    }
    respondRequest(res) {
        const client = this.serverClientMap[res.callId];
        if (client) {
            client.emit('response', res.callId, res.responseType, res.response);
            delete this.serverClientMap[res.callId];
        }
        return;
    }
    sendRequest(req) {
        this.client.emit('request', req.callId, req.serviceName, req.methodName, req.params);
        return;
    }
    getResponse() {
        return this.responseQueue.dequeue();
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SocketIOProvider;
//# sourceMappingURL=index.js.map