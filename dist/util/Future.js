"use strict";
class Future extends Promise {
    constructor(type, handler) {
        super(handler);
        this.type = type;
    }
    getType() {
        return this.type;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Future;
//# sourceMappingURL=Future.js.map