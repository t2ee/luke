import {
    Provider,
    Request,
    Response,
} from '../../abstract/';
import * as AMQP from 'amqplib';
import generateUUID from '../../utils/generateUUID';
import PromisedQueue from '../../utils/PromisedQueue';
import * as Q from 'q';


export default class AmqpProvider extends Provider {
    private channel: Promise<AMQP.Channel>;
    private topic: string;
    private clientId: string;
    private serverCallIdMapping: { [key: string]: { clientId: string, message: AMQP.Message }} = {};
    private clientResultQueue: PromisedQueue<Response> = new PromisedQueue<Response>();

    constructor(uri: string, topic: string) {
        super();
        this.channel = this.connect(uri);
        this.topic = `topic:${topic}`;
        this.clientId = `client:${generateUUID()}`;
        this.startPollResponse();
    }

    private async connect(uri: string): Promise<AMQP.Channel> {
        const connection = await AMQP.connect(uri);
        connection.on('error', err => {
            throw err;
        });
        connection.on('close', err => {
            throw new Error('AMQP Client Closed');
        });
        return connection.createChannel();
    }

    async getRequest(): Promise<Request> {
        const channel = await this.channel;
        await channel.assertQueue(this.topic);
        channel.prefetch(1);
        const message = await channel.get(this.topic);
        if (message) {
            const m = message as AMQP.Message;
            const args = JSON.parse(m.content.toString());
            const req = new Request();
            req.callId = args[0];
            req.methodName = args[1];
            req.serviceName = args[2];
            req.params = args[3];
            this.serverCallIdMapping[req.callId] = {
                clientId: m.properties.replyTo,
                message: m,
            };
            return req;
        } else {
            return null;
        }
    }

    async respondRequest(res: Response): Promise<void> {
        const channel = await this.channel;
        const {
            clientId,
            message,
        } = this.serverCallIdMapping[res.callId];
        if (clientId) {
            await channel.assertQueue(clientId);
            const args = [res.callId, res.responseType, res.response];
            await channel.sendToQueue(clientId, new Buffer(JSON.stringify(args)));
            await channel.ack(message);
            delete this.serverCallIdMapping[res.callId];
        }
    }

    async sendRequest(req: Request): Promise<void> {
        const channel = await this.channel;
        await channel.assertQueue(this.topic);
        await channel.assertQueue(this.clientId);
        const args = [req.callId, req.methodName, req.serviceName, req.params];
        await channel.sendToQueue(
            this.topic,
            new Buffer(JSON.stringify(args)),
            {
                replyTo: this.clientId,
            }
        );
    }

    private async startPollResponse() {
        const channel = await this.channel;
        await channel.assertQueue(this.clientId);
        channel.consume(this.clientId, msg => {
            const args = JSON.parse(msg.content.toString());
            const res = new Response();
            res.callId = args[0];
            res.responseType = args[1];
            res.response = args[2];
            this.clientResultQueue.enqueue(res);
        });
    }

    async getResponse(): Promise<Response> {
        return this.clientResultQueue.dequeue();
    }
}
