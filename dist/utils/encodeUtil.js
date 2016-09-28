"use strict";
function encode(data, type) {
    if ([String, Number, Boolean].indexOf(type) !== -1) {
        return data;
    }
    else {
        return data.toJson();
    }
}
exports.encode = encode;
function decode(data, type) {
    if ([String, Number, Boolean].indexOf(type) !== -1) {
        return data;
    }
    else {
        return (new type).fromJson(data);
    }
}
exports.decode = decode;
//# sourceMappingURL=encodeUtil.js.map