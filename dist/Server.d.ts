import Provider from './abstract/Provider';
export default class Server {
    private services;
    private provider;
    private runner;
    constructor(provider: Provider);
    register<T>(Service: new () => T): void;
    setConcurrency(concurrency: number): void;
    isRunning(): boolean;
    stop(): void;
    start(): void;
    private runTask();
}
