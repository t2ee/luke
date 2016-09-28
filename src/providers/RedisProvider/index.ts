import {
    Provider,
    Request,
    Response,
} from '../../abstract/';
import * as Redis from 'redis';
import generateUUID from '../../utils/generateUUID';
import PromisedQueue from '../../utils/PromisedQueue';
import Json from '../../utils/Json';

export default class RedisProvider extends Provider {
    private queue: string;
    private retryTimeout: number;
    private client: Redis.RedisClient;
    private clientId: string;
    private serverCallIdMapping: { [key: string]: string } = {};

    constructor(uri: string, queue: string, retryTimeout: number) {
        super();
        this.client = Redis.createClient(uri);
        this.queue = queue;
        this.retryTimeout = retryTimeout;
        this.clientId = generateUUID();
    }

    fetchWaitingList(): Promise<Array<string>> {
        return new Promise<Array<string>>((resolve, reject) => {
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
                if (err) return reject(err);
                if (!res) return resolve(null);
                resolve(res);
            })
        })
    }

    fetchPendingList(): Promise<Array<string>> {
        return new Promise<Array<string>>((resolve, reject) => {
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
                    if (err) return reject(err);
                    if (!res) return resolve(null);
                    resolve(res);
                });
        });
    }

    async getRequest(): Promise<Request> {
        let res = await this.fetchPendingList();
        if (!res) {
            res = await this.fetchWaitingList();
        }
        if (!res) return null;
        const req  = new Request();
        req.callId = res[1];
        req.serviceName = res[3];
        req.methodName = res[5];
        req.params = JSON.parse(res[7]);
        const clientId = res[13];
        this.serverCallIdMapping[req.callId] = clientId;
        return req;
    }

    respondRequest(res: Response): Promise<void> {
        const clientId = this.serverCallIdMapping[res.callId];
        const result = [];
        result.push('callId', res.callId);
        result.push('responseType', res.responseType);
        result.push('response', JSON.stringify(res.response));
        return new Promise<void>((resolve, reject) => {
            this.client
                .multi()
                .lrem(`pendingList:${this.queue}`, 0, res.callId)
                .del(`data:${this.queue}:${res.callId}`)
                .lpush(`resultList:${this.queue}:${clientId}`, res.callId)
                .hmset(`result:${this.queue}:${res.callId}`, result)
                .exec(err => {
                    if (err) return reject(err);
                    resolve();
                });
        });
    }

    sendRequest(req: Request): Promise<void> {
        const {
            callId,
            serviceName,
            methodName,
        } = req;
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
        return new Promise<void>((resolve, reject) => {
            this.client
                .multi()
                .lpush(`waitingList:${this.queue}`, callId)
                .hmset(`data:${this.queue}:${req.callId}`, data)
                .exec(err => {
                    if (err) return reject(err);
                    resolve();
                });
        });
    }

    async getResponse(): Promise<Response> {
        const result = await new Promise<Array<string>>((resolve, reject) => {
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
                if (err) return reject(err);
                if (!res) return resolve(null);
                resolve(res);
            });
        });
        if (!result) return null;
        const res = new Response();
        res.callId = result[1];
        res.responseType = result[3] as any;
        res.response = JSON.parse(result[5]);
        return res;
    }
}
