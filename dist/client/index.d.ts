export default class RemoteClient {
    private transport;
    private encode;
    private client;
    private queue;
    private broadcastHandler;
    connect(hostname: string, port: number): void;
    getClient<T>(service: new () => T): T;
    setBroadcastHandler(handler: (payload) => any): void;
    private handleResponse(payload);
    private handleBroadcast(payload);
    private handleError(payload);
}
