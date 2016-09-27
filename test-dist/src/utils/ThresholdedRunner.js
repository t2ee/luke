"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const sleep = ms => new Promise(r => setTimeout(r, ms));
class ThresholdedRunner {
    constructor(min, max, step, concurrency, task) {
        this.min = min;
        this.max = max;
        this.step = step;
        this.concurrency = concurrency;
        this.task = task;
        this.running = false;
        this.wait = min;
    }
    isRunning() {
        return this.running;
    }
    start() {
        this.running = true;
        for (let i = 0; i < this.concurrency; i++) {
            this.run();
        }
    }
    stop() {
        this.running = false;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            while (this.running) {
                let result = yield this.task();
                if (result) {
                    this.wait = 0;
                }
                else {
                    this.wait = Math.min(this.max, this.wait + this.step);
                    yield sleep(this.wait);
                }
            }
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ThresholdedRunner;
//# sourceMappingURL=ThresholdedRunner.js.map