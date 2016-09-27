import {
    SERVICE_NAME,
    SERVICE_METHODS,
} from './symbols';
import Provider from './abstract/Provider';
import Response from './abstract/Response';
import Request from './abstract/Request';
import * as Q from 'q';
import generateUUID from './utils/generateUUID';
import ThresholdedRunner from './utils/ThresholdedRunner';
import PromisedQueue from './utils/PromisedQueue';

import {
    Json,
    PrimitiveType,
} from './utils';

export default class RemoteClient {
    private queue: { [key: string]: Q.Deferred<any> } = {};
    private provider: Provider;
    private broadcastHandler: (payload) => any;
    constructor(provider: Provider) {
        this.provider = provider;
        (new ThresholdedRunner(
            0,
            10,
            1,
            1,
            this.fetchResult.bind(this)
        )).start();
    }

    getClient<T>(Service: new () => T): T {
        const prototype = Service.prototype;
        const name = prototype[SERVICE_NAME];

        const result = new Service();
        const methods = Object.keys(prototype[SERVICE_METHODS])
        for (const key of methods) {
            const method = prototype[SERVICE_METHODS][key];
            result[key] = async (...params) => {
                const request = new Request();
                request.serviceName = name;
                request.methodName = key;
                request.params = params;
                request.callId = generateUUID();
                const d = Q.defer<any>();
                await this.provider.sendRequest(request);
                this.queue[request.callId] = d;
                return d.promise;
            }
        }
        return result;
    }

    private async fetchResult(): Promise<void> {
        const response: Response = await this.provider.getResponse();
        const callId = response.callId
        if (this.queue[callId]) {
            const d = this.queue[callId];
            const type = response.responseType;
            if (type === 'success') {
                d.resolve(response.response);
            } else if (type === 'error'){
                d.reject(response.response);
            }
        }
    }
}
