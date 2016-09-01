"use strict";
const Transport_1 = require('../net/Transport');
const Encode_1 = require('../net/Encode');
class Util {
    static transportToString(transport) {
        switch (transport) {
            case Transport_1.default.IPC:
                return 'ipc';
            case Transport_1.default.TCP:
                return 'tcp';
            case Transport_1.default.UDP:
                return 'udp';
            case Transport_1.default.WS:
                return 'ws';
        }
    }
    static encodeToString(encode) {
        switch (encode) {
            case Encode_1.default.JSON:
                return 'json';
            case Encode_1.default.MSG_PACK:
                return 'msg_pack';
        }
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Util;
//# sourceMappingURL=Util.js.map