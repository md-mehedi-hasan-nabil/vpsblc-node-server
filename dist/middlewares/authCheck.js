"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authCheck = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../app/config"));
function authCheck(req, res, next) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(req.headers.email);
        if (req.headers.email) {
            const email = req.headers.email;
            try {
                const response = yield axios_1.default.get(config_1.default.GOOGLE_SHEETS_ADMIN_CSV_URL);
                const csvText = response.data;
                const rows = csvText.split(/\r?\n/).map((row) => row.split(','));
                const authInfo = {};
                for (let i = 3; i < rows.length; i++) {
                    const row = rows[i];
                    if (row.length >= 2) {
                        const email = (_a = row[4]) === null || _a === void 0 ? void 0 : _a.trim();
                        const password = (_b = row[5]) === null || _b === void 0 ? void 0 : _b.trim();
                        const sheets = (_c = row[6]) === null || _c === void 0 ? void 0 : _c.trim();
                        if (email && password) {
                            authInfo[email] = {
                                email,
                                password,
                                sheets
                            };
                        }
                    }
                }
                if (authInfo[email]) {
                    req.GOOGLE_SHEETS_URL = authInfo[email].sheets;
                    // console.log(authInfo);
                    next();
                }
                else {
                    res.status(409).json({
                        message: 'Unauthorized'
                    });
                }
            }
            catch (error) {
                res.status(500).json({
                    message: 'Internal Server Error'
                });
            }
        }
        else {
            res.status(409).json({
                message: 'Unauthorized'
            });
        }
    });
}
exports.authCheck = authCheck;
