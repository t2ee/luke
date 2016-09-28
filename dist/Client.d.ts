import Provider from './abstract/Provider';
export default class RemoteClient {
    private queue;
    private provider;
    private broadcastHandler;
    private prototypes;
    constructor(provider: Provider);
    getClient<T>(Service: new () => T): T;
    private fetchResult();
}
