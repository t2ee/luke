import {
    RemoteServer,
    RemoteClient,
    RemoteService,
    RemoteMethod,
} from '../src';
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


let server: RemoteServer;

class TestService extends ITestService {
    async echo(message: string) {
        return message;
    }
    async add(a: number, b: number) {
        await Sleep(100);
        return a + b;
    }
    async broadcast(msg: string) {
        server.broadcast('hello');

    }
    async error() {
        throw 'Error';
    }
}


let client: RemoteClient;
let testClient: ITestService;

describe('test', () => {
    before((done) => {
        (async () => {
            server = new RemoteServer(9090);
            server.register(TestService);
            server.start();
            await Sleep(1000);
            client = new RemoteClient();
            client.connect('0.0.0.0', 9090);
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
    it('should broadcast', done => {
        client.setBroadcastHandler(payload => {
            chai.assert.equal(payload, 'hello');
            done();
        });
        testClient.broadcast('hello');
    })
});
