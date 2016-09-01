export default class RemoteClient {
    private transport;
    private encode;
    private client;
    private queue;
    connect(hostname: string, port: number): void;
    getClient<T>(service: new () => T): T;
    private handleResponse(payload);
    private handleError(payload);
}
