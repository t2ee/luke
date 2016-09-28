"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const _1 = require('../../abstract/');
const Redis = require('redis');
const generateUUID_1 = require('../../utils/generateUUID');
class RedisProvider extends _1.Provider {
    constructor(uri, queue, retryTimeout) {
        super();
        this.serverCallIdMapping = {};
        this.client = Redis.createClient(uri);
        this.queue = queue;
        this.retryTimeout = retryTimeout;
        this.clientId = generateUUID_1.default();
    }
    fetchWaitingList() {
        return new Promise((resolve, reject) => {
            const now = Date.now();
            this.client.eval(`
                local id = redis.call("rpop", "waitingList:${this.queue}");
                if id == false then
                    return nil;
                end
                redis.call("hset", "data:${this.queue}:" .. id, "updatedAt", ${now});
                local task = redis.call("hgetall", "data:${this.queue}:" .. id);
                if (table.getn(task) == 0) then
                    return nil;
                end
                redis.call("lpush", "pendingList:${this.queue}", id);
                return task;
            `, 0, (err, res) => {
                if (err)
                    return reject(err);
                if (!res)
                    return resolve(null);
                resolve(res);
            });
        });
    }
    fetchPendingList() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const now = Date.now();
                this.client.eval(`
                    local ids = redis.call(
                            "sort",
                            "pendingList:${this.queue}",
                            "by", "data:${this.queue}:*->updatedAt",
                            "limit", "0", "1");
                    local id = ids[1];
                    if id == nil then
                        return nil;
                    end
                    local task = redis.call("hgetall", "data:${this.queue}:" .. id);
                    local length = table.getn(task)
                    local date = "";
                    for i = 1, length do
                        if task[i] == "updatedAt" then
                            date = task[i + 1];
                        end
                    end
                    if date then
                        if ${now} - tonumber(date) >= ${this.retryTimeout} then
                            redis.call("hset", "data:${this.queue}:" .. id, "updatedAt", ${now});
                            return task;
                        end
                    end
                    return nil;
                `, 0, (err, res) => {
                    if (err)
                        return reject(err);
                    if (!res)
                        return resolve(null);
                    resolve(res);
                });
            });
        });
    }
    getRequest() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield this.fetchPendingList();
            if (!res) {
                res = yield this.fetchWaitingList();
            }
            if (!res)
                return null;
            const req = new _1.Request();
            req.callId = res[1];
            req.serviceName = res[3];
            req.methodName = res[5];
            req.params = JSON.parse(res[7]);
            const clientId = res[13];
            this.serverCallIdMapping[req.callId] = clientId;
            return req;
        });
    }
    respondRequest(res) {
        const clientId = this.serverCallIdMapping[res.callId];
        const result = [];
        result.push('callId', res.callId);
        result.push('responseType', res.responseType);
        result.push('response', JSON.stringify(res.response));
        return new Promise((resolve, reject) => {
            this.client
                .multi()
                .lrem(`pendingList:${this.queue}`, 0, res.callId)
                .del(`data:${this.queue}:${res.callId}`)
                .lpush(`resultList:${this.queue}:${clientId}`, res.callId)
                .hmset(`result:${this.queue}:${res.callId}`, result)
                .exec(err => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }
    sendRequest(req) {
        const { callId, serviceName, methodName, } = req;
        const params = JSON.stringify(req.params);
        const now = Date.now();
        const item = {
            callId,
            serviceName,
            methodName,
            params,
            createdAt: now,
            updatedAt: now,
            clientId: this.clientId,
        };
        const data = [];
        for (const key in item) {
            data.push(key, item[key]);
        }
        return new Promise((resolve, reject) => {
            this.client
                .multi()
                .lpush(`waitingList:${this.queue}`, callId)
                .hmset(`data:${this.queue}:${req.callId}`, data)
                .exec(err => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }
    getResponse() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield new Promise((resolve, reject) => {
                const now = Date.now();
                this.client.eval(`
                local id = redis.call("rpop", "resultList:${this.queue}:${this.clientId}");
                if id == false then
                    return nil;
                end
                local task = redis.call("hgetall", "result:${this.queue}:" .. id);
                if (table.getn(task) == 0) then
                    return nil;
                end
                redis.call("del", "result:${this.queue}:" .. id);
                return task;
            `, 0, (err, res) => {
                    if (err)
                        return reject(err);
                    if (!res)
                        return resolve(null);
                    resolve(res);
                });
            });
            if (!result)
                return null;
            const res = new _1.Response();
            res.callId = result[1];
            res.responseType = result[3];
            res.response = JSON.parse(result[5]);
            return res;
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RedisProvider;
//# sourceMappingURL=index.js.map