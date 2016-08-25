export default class RemoteClient {
    private transport;
    private encode;
    private client;
    private queue;
    connect(hostname: string, port: number): void;
    register<T>(service: new () => T): T;
    private handleResponse(payload);
    private handleError(payload);
}
