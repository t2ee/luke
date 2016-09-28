import {
    decorators,
    Server,
    Client,
    providers,
    Serializable,
    utils,
} from '../dist';

const {
    RemoteService,
    RemoteMethod,
} = decorators;
const {
    SocketIOProvider,
} = providers;

import * as chai from 'chai';

const Sleep = ms => new Promise<void>(resolve => setTimeout(resolve, ms));

class Person extends Serializable<Person> {
    name: string;
    age: number;
    fromJson(json: utils.Json): Person {
        this.name = json['name'] as string;
        this.age = json['age'] as number;
        return this;
    }
    toJson(): utils.Json {
        return {
            name: this.name,
            age: this.age,
        };
    }
}

@RemoteService('Test')
class ITestService {
    @RemoteMethod(String)
    async echo(message: string): Promise<string> { return null;}

    @RemoteMethod(Number)
    async add(a: number, b: number): Promise<number> { return null;}

    @RemoteMethod()
    async error() {}

    @RemoteMethod(Person)
    async testSerialize(person: Person): Promise<Person> { return null;}
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
    async testSerialize(person: Person): Promise<Person> {
        chai.assert(person.name, 'test');
        chai.assert.equal(person.age, 0);
        person.age = 42;
        return person;
    }
}


let server: Server;
let client: Client;
let testClient: ITestService;

const clientAmqp = new SocketIOProvider('ws://127.0.0.1:8008');
const serverAmqp = new SocketIOProvider(8008);

describe('socket.io', () => {
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
    it('should properly handle Serializable', done => {
        const person = new Person();
        person.name = 'test';
        person.age = 0;
        testClient.testSerialize(person)
            .then(p => {
                chai.assert(p.name, 'test');
                chai.assert.equal(p.age, 42);
                done();
            })
            .catch(done);
    })
});
