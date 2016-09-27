import Provider from './abstract/Provider';
export default class RemoteClient {
    private queue;
    private provider;
    private broadcastHandler;
    constructor(provider: Provider);
    getClient<T>(Service: new () => T): T;
    private fetchResult();
}
