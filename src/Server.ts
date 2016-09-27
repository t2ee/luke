import {
    SERVICE_NAME,
    SERVICE_METHODS,
} from './symbols';
import Provider from './abstract/Provider';
import Response from './abstract/Response';
import Request from './abstract/Request';
import ThresholdedRunner from './utils/ThresholdedRunner';

export default class Server {
    private services: {[key :string] : any} = {};
    private provider: Provider;
    private runner: ThresholdedRunner;

    constructor(provider: Provider) {
        this.provider = provider;
        this.runner = new ThresholdedRunner(
            0,
            100,
            10,
            1,
            this.runTask.bind(this)
        );
    }

    public register<T>(Service: new () => T) {
        const prototype = Service.prototype;
        const name = prototype[SERVICE_NAME];
        this.services[name] = {
            Class: Service,
            instance: new Service(),
        };
    }

    public setConcurrency(concurrency: number): void {
        this.runner.stop();
        this.runner = new ThresholdedRunner(
            0,
            100,
            10,
            concurrency,
            this.runTask
        );
    }

    public isRunning(): boolean {
        return this.runner.isRunning();
    }

    public stop(): void {
        this.runner.stop();
    }

    public start(): void {
        this.runner.start();
    }

    private async runTask(): Promise<boolean> {
        const request: Request = await this.provider.getRequest();
        if (!request) return false;
        const {
            callId,
            methodName,
            serviceName,
            params
        } = request;
        const Service = this.services[serviceName];
        const response = new Response();
        response.callId = callId;
        if (Service) {
            if (Service.instance[methodName]) {
                try {
                    const result = await Service.instance[methodName](...params);
                    response.response = result;
                    response.responseType = 'success';
                } catch (e) {
                    response.response = e.message || e;
                    response.callId = callId;
                    response.responseType = 'error';
                }
                this.provider.respondRequest(response);
            }
        }
        return true;
    }
}
