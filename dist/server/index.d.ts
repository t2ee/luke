export default class RemoteServer {
    private services;
    private transport;
    private encode;
    private port;
    private server;
    private clients;
    constructor(port: number);
    register<T>(service: new () => T): void;
    broadcast(payload: any): void;
    start(): void;
    private handleConnect(client);
    private handleRequest(payload, reply, channel);
}
