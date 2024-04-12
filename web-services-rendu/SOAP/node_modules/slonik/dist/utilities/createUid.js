"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUid = void 0;
const node_crypto_1 = require("node:crypto");
const createUid = () => {
    return (0, node_crypto_1.randomUUID)().split('-', 1)[0];
};
exports.createUid = createUid;
//# sourceMappingURL=createUid.js.map