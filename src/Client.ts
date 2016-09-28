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
import Serializable from './Serializable';
import * as encodeUtil from './utils/encodeUtil';

import {
    Json,
    PrimitiveType,
} from './utils';

export default class RemoteClient {
    private queue: { [key: string]: {
        d: Q.Deferred<any>
        service: string,
        method: string,
    }} = {};
    private provider: Provider;
    private broadcastHandler: (payload) => any;
    private prototypes: { [key: string]: any } = {};

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
        this.prototypes[name] = prototype[SERVICE_METHODS];

        const result = new Service();
        const methods = Object.keys(prototype[SERVICE_METHODS])
        for (const key of methods) {
            const method = prototype[SERVICE_METHODS][key];
            result[key] = async (...params) => {
                const request = new Request();
                request.serviceName = name;
                request.methodName = key;
                request.params = params.map((p, i) => encodeUtil.encode(p, method.paramTypes[i]));
                request.callId = generateUUID();
                const d = Q.defer<any>();
                await this.provider.sendRequest(request);
                this.queue[request.callId] = {
                    d,
                    method: key,
                    service: name,
                };
                return d.promise;
            }
        }
        return result;
    }

    private async fetchResult(): Promise<void> {
        const response: Response = await this.provider.getResponse();
        const callId = response.callId
        if (this.queue[callId]) {
            const r = this.queue[callId];
            const type = response.responseType;
            if (type === 'success') {
                const returnType = this.prototypes[r.service][r.method].returnType;
                r.d.resolve(encodeUtil.decode(response.response, returnType));
            } else if (type === 'error'){
                r.d.reject(response.response);
            }
        }
    }
}
