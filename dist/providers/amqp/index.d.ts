import { Provider, Request, Response } from '../../abstract/';
export default class AmqpProvider extends Provider {
    private channel;
    private topic;
    private clientId;
    private serverCallIdMapping;
    private clientResultQueue;
    constructor(uri: string, topic: string);
    private connect(uri);
    getRequest(): Promise<Request>;
    respondRequest(res: Response): Promise<void>;
    sendRequest(req: Request): Promise<void>;
    private startPollResponse();
    getResponse(): Promise<Response>;
}
