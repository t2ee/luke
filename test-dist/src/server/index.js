"use strict";
const Debugger = require('debug');
const symbol_1 = require('../symbol');
const Transport_1 = require('../net/Transport');
const Encode_1 = require('../net/Encode');
const Util_1 = require('../net/Util');
const Kalm = require('kalm-j');
const debug = Debugger('server');
class RemoteServer {
    constructor(port) {
        this.services = {};
        this.transport = Transport_1.default.TCP;
        this.encode = Encode_1.default.JSON;
        this.clients = [];
        this.port = port;
    }
    register(service) {
        const prototype = service.prototype;
        const name = prototype[symbol_1.NAME];
        debug(`Registering ${name}`);
        this.services[name] = {
            klass: service,
            instance: new service(),
        };
    }
    start() {
        this.server = new Kalm.Server({
            port: this.port,
            adapter: Util_1.default.transportToString(this.transport),
            encoder: Util_1.default.encodeToString(this.encode),
            channels: {
                onRequest: this.handleRequest.bind(this),
            },
        });
        this.server.on('connection', this.handleConnect.bind(this));
    }
    handleConnect(client) {
        this.clients.push(client);
    }
    handleRequest(payload, reply, channel) {
        debug('Received', payload);
        const { callId, params, method, service, } = payload;
        const Service = this.services[service];
        if (Service) {
            if (Service.instance[method]) {
                Service.instance[method](...params)
                    .then(response => {
                    channel._client.send('onResponse', {
                        callId,
                        response,
                    });
                    debug('Responsed', {
                        callId,
                        response,
                    });
                })
                    .catch(response => {
                    channel._client.send('onError', {
                        callId,
                        response,
                    });
                    debug('Errored', {
                        callId,
                        response,
                    });
                });
            }
        }
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RemoteServer;
//# sourceMappingURL=index.js.map