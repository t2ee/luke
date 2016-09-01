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
const src_1 = require('../src');
const chai = require('chai');
const Sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
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
};
__decorate([
    src_1.RemoteMethod('echo'), 
    __metadata('design:type', Function), 
    __metadata('design:paramtypes', [String]), 
    __metadata('design:returntype', Promise)
], ITestService.prototype, "echo", null);
__decorate([
    src_1.RemoteMethod('add'), 
    __metadata('design:type', Function), 
    __metadata('design:paramtypes', [Number, Number]), 
    __metadata('design:returntype', Promise)
], ITestService.prototype, "add", null);
__decorate([
    src_1.RemoteMethod('error'), 
    __metadata('design:type', Function), 
    __metadata('design:paramtypes', []), 
    __metadata('design:returntype', Promise)
], ITestService.prototype, "error", null);
ITestService = __decorate([
    src_1.RemoteService('Test'), 
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
}
let server;
let client;
let testClient;
describe('test', () => {
    before((done) => {
        (() => __awaiter(this, void 0, void 0, function* () {
            server = new src_1.RemoteServer(9090);
            server.register(TestService);
            server.start();
            yield Sleep(1000);
            client = new src_1.RemoteClient();
            client.connect('0.0.0.0', 9090);
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
});
//# sourceMappingURL=index.js.map