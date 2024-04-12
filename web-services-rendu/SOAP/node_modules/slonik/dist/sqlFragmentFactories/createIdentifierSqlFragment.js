"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIdentifierSqlFragment = void 0;
const errors_1 = require("../errors");
const escapeIdentifier_1 = require("../utilities/escapeIdentifier");
const createIdentifierSqlFragment = (token) => {
    const sql = token.names
        .map((identifierName) => {
        if (typeof identifierName !== 'string') {
            throw new errors_1.InvalidInputError('Identifier name array member type must be a string.');
        }
        return (0, escapeIdentifier_1.escapeIdentifier)(identifierName);
    })
        .join('.');
    return {
        sql,
        values: [],
    };
};
exports.createIdentifierSqlFragment = createIdentifierSqlFragment;
//# sourceMappingURL=createIdentifierSqlFragment.js.map