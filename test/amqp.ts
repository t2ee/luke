import {
    decorators,
    Server,
    Client,
    providers,
} from '../dist';

const {
    RemoteService,
    RemoteMethod,
} = decorators;
const {
    AMQPProvider,
} = providers;

import * as chai from 'chai';

const Sleep = ms => new Promise<void>(resolve => setTimeout(resolve, ms));

@RemoteService('Test')
class ITestService {
    @RemoteMethod()
    async echo(message: string): Promise<string> { return null;}

    @RemoteMethod()
    async add(a: number, b: number): Promise<number> { return null;}

    @RemoteMethod()
    async error() {}

    @RemoteMethod()
    async broadcast(msg: string) {}
}


class TestService extends ITestService {
    async echo(message: string) {
        return message;
    }
    async add(a: number, b: number) {
        await Sleep(100);
        return a + b;
    }
    async error() {
        throw 'Error';
    }
}


let server: Server;
let client: Client;
let testClient: ITestService;

const clientAmqp = new AMQPProvider(process.env.AMQP, 'test');
const serverAmqp = new AMQPProvider(process.env.AMQP, 'test');

describe('test', () => {
    before((done) => {
        (async () => {
            server = new Server(serverAmqp);
            server.register(TestService);
            server.start();
            await Sleep(1000);
            client = new Client(clientAmqp);
            testClient = client.getClient(ITestService);
        })().catch(done).then(done);
    });
    it('should echo back correctly', done => {
        testClient.echo('hello')
            .then((res) => {
                chai.assert(res, 'hello');
                done();
            })
            .catch(done);
    });
    it('should add numbers', done => {
        testClient.add(1, 2)
            .then((res) => {
                chai.assert(res.toString(), '3');
                done();
            })
            .catch(done);
    });
    it('should catch error', done => {
        testClient.error()
            .catch(e => {
                chai.assert.equal(e, 'Error');
                done();
            })
    });
});
