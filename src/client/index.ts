import * as Debugger from 'debug';
import {
    NAME,
    METHOD,
} from '../symbol';
import Transport from '../net/Transport';
import Encode from '../net/Encode';
import NetUtil from '../net/Util';
import * as Kalm from 'kalm-j';
import * as Q from 'q';

const debug = Debugger('client');

export default class RemoteClient {
    private transport: Transport = Transport.TCP;
    private encode: Encode = Encode.JSON;
    private client: Kalm.Client;
    private queue: { [key: string]: Q.Deferred<any> } = {};
    private broadcastHandler: (payload) => any;

    connect(hostname: string, port: number) {
        this.client = new Kalm.Client({
            hostname,
            port,
            adapter: NetUtil.transportToString(this.transport),
            encoder: NetUtil.encodeToString(this.encode),
            channels: {
                onResponse: this.handleResponse.bind(this),
                onError: this.handleError.bind(this),
                onBroadcast: this.handleBroadcast.bind(this),
            }
        });
    }

    getClient<T>(service: new () => T): T {
        const prototype = service.prototype;
        const name = prototype[NAME];
        debug(`Retrieving ${name}`);

        const self = this;

        const result = new service();
        for (const key of Object.keys(prototype[METHOD])) {
            const method = prototype[METHOD][key];
            result[key] = function(...params) {
                const callId = Date.now() + '-' + Math.random().toString().substr(2);
                const payload = {
                    service: name,
                    method: key,
                    params,
                    callId,
                };
                const d = Q.defer<any>();
                self.client.send('onRequest', payload);
                self.queue[callId] = d;
                return d.promise;
            }
        }
        return result;
    }

    public setBroadcastHandler(handler: (payload) => any) {
        this.broadcastHandler = handler;
    }

    private handleResponse(payload) {
        debug('Received', payload);
        const {
            callId,
            response,
        } = payload;
        if (this.queue[callId]) {
            this.queue[callId].resolve(response);
        }
    }

    private handleBroadcast(payload) {
        debug('Broadcast', payload);
        if (this.broadcastHandler) {
            this.broadcastHandler(payload);
        }
    }

    private handleError(payload) {
        debug('Errored', payload);
        const {
            callId,
            response,
        } = payload;
        if (this.queue[callId]) {
            this.queue[callId].reject(response);
        }
    }
}
