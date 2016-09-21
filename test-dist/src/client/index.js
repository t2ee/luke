"use strict";
const Debugger = require('debug');
const symbol_1 = require('../symbol');
const Transport_1 = require('../net/Transport');
const Encode_1 = require('../net/Encode');
const Util_1 = require('../net/Util');
const Kalm = require('kalm-j');
const Q = require('q');
const debug = Debugger('client');
class RemoteClient {
    constructor() {
        this.transport = Transport_1.default.TCP;
        this.encode = Encode_1.default.JSON;
        this.queue = {};
    }
    connect(hostname, port) {
        this.client = new Kalm.Client({
            hostname,
            port,
            adapter: Util_1.default.transportToString(this.transport),
            encoder: Util_1.default.encodeToString(this.encode),
            channels: {
                onResponse: this.handleResponse.bind(this),
                onError: this.handleError.bind(this),
                onBroadcast: this.handleBroadcast.bind(this),
            }
        });
    }
    getClient(service) {
        const prototype = service.prototype;
        const name = prototype[symbol_1.NAME];
        debug(`Retrieving ${name}`);
        const self = this;
        const result = new service();
        for (const key of Object.keys(prototype[symbol_1.METHOD])) {
            const method = prototype[symbol_1.METHOD][key];
            result[key] = function (...params) {
                const callId = Date.now() + '-' + Math.random().toString().substr(2);
                const payload = {
                    service: name,
                    method: key,
                    params,
                    callId,
                };
                const d = Q.defer();
                self.client.send('onRequest', payload);
                self.queue[callId] = d;
                return d.promise;
            };
        }
        return result;
    }
    setBroadcastHandler(handler) {
        this.broadcastHandler = handler;
    }
    handleResponse(payload) {
        debug('Received', payload);
        const { callId, response, } = payload;
        if (this.queue[callId]) {
            this.queue[callId].resolve(response);
        }
    }
    handleBroadcast(payload) {
        debug('Broadcast', payload);
        if (this.broadcastHandler) {
            this.broadcastHandler(payload);
        }
    }
    handleError(payload) {
        debug('Errored', payload);
        const { callId, response, } = payload;
        if (this.queue[callId]) {
            this.queue[callId].reject(response);
        }
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RemoteClient;
//# sourceMappingURL=index.js.map