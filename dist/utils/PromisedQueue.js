"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const Q = require('q');
class PromisedQueue {
    constructor() {
        this.queue = [];
        this.list = [];
    }
    enqueue(item) {
        const d = this.queue.shift();
        if (d) {
            return d.resolve(item);
        }
        this.list.push(item);
    }
    dequeue() {
        return __awaiter(this, void 0, void 0, function* () {
            const item = this.list.shift();
            if (item) {
                return item;
            }
            const d = Q.defer();
            this.queue.push(d);
            return d.promise;
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PromisedQueue;
//# sourceMappingURL=PromisedQueue.js.map