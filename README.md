[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

#Luke
> A RPC framework for typescript, with the simplest way to setup.


##Example
```
import {
	Server,
	Client,
  decorators,
  providers,
} from '@t2ee/luke';
const {
  RemoteMethod,
  RemoteService,
} = decorators;
const {
  AMQPProvider,
} = providers;

//provider for luke.
const provider = new AMQPProvider('amqp://localhost:5672');


// this is the definition shared by both server and client.

@RemoteService('Test')
class ITestService {
    @RemoteMethod()
    async echo(message: string): Promise<string> { return null;}
}


// this is the real implementation of the service
class TestService extends ITestService {
    async echo(message: string) {
        return `You've said ${message}`;
    }
}

const server = new Server(provider); // listen on port 6001
server.register(ITestService);
server.start()
// tada! server is now running.

const client = new Client(provider);

const testClient = client.getClient(ITestService);

// now let's hear some echoooooooos!
(async () => {
	const message = await testClient.echo('hello world');
	console.log(message);
})().catch(e => console.log(e));



```

##Providers
###AMQPProvider(uri: string, topic: string)
###RedisProvider(uri: string, topic: string, retryTimeout: number)
###SocketIOProvider(socketOrPort: number | string)

##API

###Client

####constructor(provider: Provider)
> constructor, takes an provider implementation

####getClient<T>(service: new () => T): T
> Wrap the service with hooks, returns the client that are callable



###Server

####constructor(provider: Provider)
> constructor, takes an provider implementation

####register<T>(service: new () => T): void
> Register an interface

####start(): void
> Start listening

####stop(): void
> Stop listening

####isRunning(): boolean
> If service is running

####setConcurrency(concurrency: number): void
> Set concurrency of running task runners.


###abstract Serializable<T>
> abstract class, data other than number, string, boolean that pass through the interfaces,
must be children of Serializable.

```
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
```

####abstract toJson(): utils.Json
> return Json result

####abstract fromJson(data: utils.Json): T
> return parsed instance



##Plans

 - [ ] TcpProvider
 - [ ] UdpProvider


[npm-image]: https://img.shields.io/npm/v/@t2ee/luke.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@t2ee/luke
[travis-image]: https://img.shields.io/travis/t2ee/luke/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/t2ee/luke
[coveralls-image]: https://img.shields.io/coveralls/t2ee/luke/master.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/t2ee/luke?branch=master
