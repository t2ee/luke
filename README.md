[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

#Luke
> A RPC framework for typescript, with the simplest way to setup.


##Example
```
import {
	RemoteService,
	RemoteMethod
	RemoteServer,
	RemoteClient,
} from '@t2ee/luke';

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

let server = new RemoteServer(6001); // listen on port 6001
server.register(ITestService);
server.start()
// tada! server is now running.

let client = new RemoveClient();
client.connect('0.0.0.0', 6001);

const testClient = client.getClient(ITestService);

// now let's here some echoooooooos!
(async () => {
	const message = await testClient.echo('hello world');
	console.log(message);
})().catch(e => console.log(e));


```

[npm-image]: https://img.shields.io/npm/v/@t2ee/luke.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@t2ee/luke
[travis-image]: https://img.shields.io/travis/t2ee/luke/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/t2ee/luke
[coveralls-image]: https://img.shields.io/coveralls/t2ee/luke/master.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/t2ee/luke?branch=master
