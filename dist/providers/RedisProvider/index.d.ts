import { Provider, Request, Response } from '../../abstract/';
export default class RedisProvider extends Provider {
    private queue;
    private retryTimeout;
    private client;
    private clientId;
    private serverCallIdMapping;
    constructor(uri: string, queue: string, retryTimeout: number);
    fetchWaitingList(): Promise<Array<string>>;
    fetchPendingList(): Promise<Array<string>>;
    getRequest(): Promise<Request>;
    respondRequest(res: Response): Promise<void>;
    sendRequest(req: Request): Promise<void>;
    getResponse(): Promise<Response>;
}
