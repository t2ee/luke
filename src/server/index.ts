import * as Debugger from 'debug';
import {
    NAME,
    METHOD,
} from '../symbol';
import Transport from '../net/Transport';
import Encode from '../net/Encode';
import NetUtil from '../net/Util';
import * as Kalm from 'kalm-j';

const debug = Debugger('server');

export default class RemoteServer {
    private services: {[key :string] : any} = {};
    private transport: Transport = Transport.TCP;
    private encode: Encode = Encode.JSON;
    private port: number;
    private server: Kalm.Server;
    private clients: Array<Kalm.Client> = [];

    constructor(port: number) {
        this.port = port;
    }

    register<T>(service: new () => T) {
        const prototype = service.prototype;
        const name = prototype[NAME];
        debug(`Registering ${name}`);
        this.services[name] = {
            klass: service,
            instance: new service(),
        };
    }

    broadcast(payload) {
        this.server.broadcast('onBroadcast', payload);
    }

    start(): void {

        this.server = new Kalm.Server({
            port: this.port,
            adapter: NetUtil.transportToString(this.transport),
            encoder: NetUtil.encodeToString(this.encode),
            channels: {
                onRequest: this.handleRequest.bind(this),
            },
        });
        this.server.on('connection', this.handleConnect.bind(this));
    }

    private handleConnect(client: Kalm.Client) {
        this.clients.push(client);
    }

    private handleRequest(payload, reply, channel: Kalm.Channel) {
        debug('Received', payload)
        const {
            callId,
            params,
            method,
            service,
        } = payload;
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
