import {
    Provider,
    Request,
    Response,
} from '../../abstract/';
import generateUUID from '../../utils/generateUUID';
import PromisedQueue from '../../utils/PromisedQueue';
import Json from '../../utils/Json';
import * as SocketIO from 'socket.io';
import * as SocketIOClient from 'socket.io-client';


export default class SocketIOProvider extends Provider {
    private queue: string;
    private retryTimeout: number;
    private server: SocketIO.Server;
    private client: SocketIOClient.Socket;
    private requestQueue: PromisedQueue<Request> = new PromisedQueue<Request>();
    private responseQueue: PromisedQueue<Response> = new PromisedQueue<Response>();
    private serverClientMap: { [key: string]: SocketIO.Socket } = {};

    constructor(portOrHost: number | string) {
        super();
        if (typeof(portOrHost) === 'number') { // this is server
            this.server = SocketIO();
            this.server.listen(portOrHost as number);
            this.server.on('connection', client => {
                client.on('request', (callId, serviceName, methodName, params) => {
                    const req = new Request();
                    req.callId = callId;
                    req.serviceName = serviceName;
                    req.methodName = methodName;
                    req.params = params;
                    this.requestQueue.enqueue(req);
                    this.serverClientMap[callId] = client;
                });
                client.on('disconnect', () => {
                });
            })
        } else {
            this.client = SocketIOClient(portOrHost as string);
            this.client.on('response', (callId, responseType, response) => {
                const res = new Response();
                res.callId = callId;
                res.responseType = responseType;
                res.response = response;
                this.responseQueue.enqueue(res);
            });
        }
    }

    getRequest(): Promise<Request> {
        return this.requestQueue.dequeue();
    }

    respondRequest(res: Response): Promise<void> {
        const client = this.serverClientMap[res.callId];
        if (client) {
            client.emit('response', res.callId, res.responseType, res.response);
            delete this.serverClientMap[res.callId];
        }
        return;
    }

    sendRequest(req: Request): Promise<void> {
        this.client.emit('request', req.callId, req.serviceName, req.methodName, req.params);
        return;
    }

    getResponse(): Promise<Response> {
        return this.responseQueue.dequeue();
    }
}
