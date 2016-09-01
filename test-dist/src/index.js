"use strict";
require('source-map-support/register');
const decorator_1 = require('./decorator');
exports.RemoteService = decorator_1.RemoteService;
exports.RemoteMethod = decorator_1.RemoteMethod;
const server_1 = require('./server');
exports.RemoteServer = server_1.default;
const client_1 = require('./client');
exports.RemoteClient = client_1.default;
//# sourceMappingURL=index.js.map