"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const dist_1 = require('../dist');
const { RemoteService, RemoteMethod, } = dist_1.decorators;
const { AMQPProvider, } = dist_1.providers;
const chai = require('chai');
const Sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
class Person extends dist_1.Serializable {
    fromJson(json) {
        this.name = json['name'];
        this.age = json['age'];
        return this;
    }
    toJson() {
        return {
            name: this.name,
            age: this.age,
        };
    }
}
let ITestService = class ITestService {
    echo(message) {
        return __awaiter(this, void 0, void 0, function* () { return null; });
    }
    add(a, b) {
        return __awaiter(this, void 0, void 0, function* () { return null; });
    }
    error() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    testSerialize(person) {
        return __awaiter(this, void 0, void 0, function* () { return null; });
    }
};
__decorate([
    RemoteMethod(String), 
    __metadata('design:type', Function), 
    __metadata('design:paramtypes', [String]), 
    __metadata('design:returntype', Promise)
], ITestService.prototype, "echo", null);
__decorate([
    RemoteMethod(Number), 
    __metadata('design:type', Function), 
    __metadata('design:paramtypes', [Number, Number]), 
    __metadata('design:returntype', Promise)
], ITestService.prototype, "add", null);
__decorate([
    RemoteMethod(), 
    __metadata('design:type', Function), 
    __metadata('design:paramtypes', []), 
    __metadata('design:returntype', Promise)
], ITestService.prototype, "error", null);
__decorate([
    RemoteMethod(Person), 
    __metadata('design:type', Function), 
    __metadata('design:paramtypes', [Person]), 
    __metadata('design:returntype', Promise)
], ITestService.prototype, "testSerialize", null);
ITestService = __decorate([
    RemoteService('Test'), 
    __metadata('design:paramtypes', [])
], ITestService);
class TestService extends ITestService {
    echo(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return message;
        });
    }
    add(a, b) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Sleep(100);
            return a + b;
        });
    }
    error() {
        return __awaiter(this, void 0, void 0, function* () {
            throw 'Error';
        });
    }
    testSerialize(person) {
        return __awaiter(this, void 0, void 0, function* () {
            chai.assert(person.name, 'test');
            chai.assert.equal(person.age, 0);
            person.age = 42;
            return person;
        });
    }
}
let server;
let client;
let testClient;
const clientAmqp = new AMQPProvider(process.env.AMQP, 'test');
const serverAmqp = new AMQPProvider(process.env.AMQP, 'test');
describe('test', () => {
    before((done) => {
        (() => __awaiter(this, void 0, void 0, function* () {
            server = new dist_1.Server(serverAmqp);
            server.register(TestService);
            server.start();
            yield Sleep(1000);
            client = new dist_1.Client(clientAmqp);
            testClient = client.getClient(ITestService);
        }))().catch(done).then(done);
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
        });
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
    });
});
//# sourceMappingURL=amqp.js.map