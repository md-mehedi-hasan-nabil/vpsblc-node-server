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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const axios_1 = __importDefault(require("axios"));
const authCheck_1 = require("./middlewares/authCheck");
const config_1 = __importDefault(require("./app/config"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('tiny'));
app.get("/client-info", authCheck_1.authCheck, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //  const response = await axios.get(config.GOOGLE_SHEETS_CSV_URL as string);
            const response = yield axios_1.default.get(req === null || req === void 0 ? void 0 : req.GOOGLE_SHEETS_URL);
            const csvText = response.data;
            const rows = csvText.split(/\r?\n/).map((row) => row.split(','));
            const data = [];
            const clientInfo = {};
            for (let i = 4; i < 12; i++) {
                data.push(rows[i].slice(0, 2));
            }
            data.forEach((row) => {
                var _a, _b;
                const key = (_a = row[0]) === null || _a === void 0 ? void 0 : _a.trim().replace(/:$/, '');
                const value = ((_b = row[1]) === null || _b === void 0 ? void 0 : _b.trim()) || '';
                clientInfo[key] = value;
            });
            res.status(200).json(clientInfo);
        }
        catch (error) {
            next(error);
        }
    });
});
app.get("/vpsblc-info", authCheck_1.authCheck, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(req === null || req === void 0 ? void 0 : req.GOOGLE_SHEETS_URL);
            const csvText = response.data;
            const rows = csvText.split(/\r?\n/).map((row) => row.split(','));
            const VPSBLCInformation = {};
            const data = [];
            for (let i = 18; i <= 22; i++) {
                data.push(rows[i].slice(0, 3));
            }
            data.forEach((row) => {
                var _a, _b, _c, _d, _e;
                const key = (_a = row[0]) === null || _a === void 0 ? void 0 : _a.trim().replace(/:$/, '');
                const value = ((_e = (_d = (_c = (_b = row.slice(1, row.length)) === null || _b === void 0 ? void 0 : _b.join(" ")) === null || _c === void 0 ? void 0 : _c.trim()) === null || _d === void 0 ? void 0 : _d.replace("\"", "")) === null || _e === void 0 ? void 0 : _e.replace("\"", "")) || '';
                VPSBLCInformation[key] = value;
            });
            res.status(200).json(VPSBLCInformation);
        }
        catch (error) {
            next(error);
        }
    });
});
app.get("/disbursement-overview", authCheck_1.authCheck, function (req, res, next) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(req === null || req === void 0 ? void 0 : req.GOOGLE_SHEETS_URL);
            const csvText = response.data;
            const rows = csvText.split(/\r?\n/).map((row) => row.split(','));
            const disbursementOverview = {};
            const data = [];
            for (let i = 19; i <= 21; i++) {
                data.push(rows[i]);
            }
            // console.log(data)
            for (let i = 0; i < data.length; i++) {
                const position = data[i].findIndex(el => el.includes("Next Disbursement:") || el.includes("Next Disbursement Amount: ") || el.includes("Earnings to Date:"));
                if (0 < position) {
                    const key = (_a = data[i][position]) === null || _a === void 0 ? void 0 : _a.trim().replace(":", "");
                    const value = data[i].splice(position + 1, 2).toString().replace(/^"(.*)"$/, '$1');
                    disbursementOverview[key] = value;
                }
            }
            res.status(200).json(disbursementOverview);
        }
        catch (error) {
            next(error);
        }
    });
});
app.get("/growth-analytics-info", authCheck_1.authCheck, function (req, res, next) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(req === null || req === void 0 ? void 0 : req.GOOGLE_SHEETS_URL);
            const csvText = response.data;
            const rows = csvText.split(/\r?\n/).map((row) => row.split(','));
            const data = [];
            const analyticsInfo = {};
            for (let i = 26; i <= 29; i++) {
                data.push((_a = rows[i]) === null || _a === void 0 ? void 0 : _a.slice(0, 3));
            }
            data.forEach((row, index) => {
                var _a, _b, _c, _d, _e, _f;
                const key = (_a = data[index][0]) === null || _a === void 0 ? void 0 : _a.replace(":", "");
                const value = (_f = (_e = (_d = (_c = (_b = data[index]) === null || _b === void 0 ? void 0 : _b.slice(1, 3)) === null || _c === void 0 ? void 0 : _c.join(',')) === null || _d === void 0 ? void 0 : _d.replace('"', "")) === null || _e === void 0 ? void 0 : _e.replace('"', "")) === null || _f === void 0 ? void 0 : _f.replace(',', "");
                analyticsInfo[key] = value;
            });
            res.status(200).json(analyticsInfo);
        }
        catch (error) {
            next(error);
        }
    });
});
app.get("/disbursement-info", authCheck_1.authCheck, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(req === null || req === void 0 ? void 0 : req.GOOGLE_SHEETS_URL);
            const csvText = response.data;
            const rows = csvText.split(/\r?\n/).map((row) => row.split(','));
            const data = [];
            for (let i = 5; i < 14; i++) {
                data.push(rows[i].slice(3));
            }
            const disbursements = [];
            data.forEach((row) => {
                const disbursement = row[0];
                const dateString = row[1].replace(/"/g, '') + row[2].replace(/"/g, '');
                const date = dateString;
                const disbursements_paid = row[3];
                const amount = row[4];
                const line_chart = row[5];
                const url = row[6];
                disbursements.push({
                    disbursement,
                    date_paid: date,
                    disbursements_paid,
                    disbursements_expected: amount,
                    line_chart,
                    blockchain_tx_url: url
                });
            });
            res.json(disbursements);
        }
        catch (error) {
            next(error);
        }
    });
});
app.get("/recent-disbursements", authCheck_1.authCheck, function (req, res, next) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(req === null || req === void 0 ? void 0 : req.GOOGLE_SHEETS_URL);
            const csvText = response.data;
            const rows = csvText.split(/\r?\n/).map((row) => row.split(','));
            const data = [
                rows[24].slice(3),
                rows[25].slice(3)
            ];
            const disbursements = [];
            for (let i = 0; i < data.length; i++) {
                const mostRecentDisbursement = data[i][0];
                const disbursementTitle = data[i][1];
                const datePaid = (_a = ((data[i][2] + data[i][3]))) === null || _a === void 0 ? void 0 : _a.replace("\"", "").replace("\"", "");
                const amountPaid = ("$" + data[i][4] + data[i][5]).replace(/[^0-9.-]+/g, '') || 0;
                const blockchainTxUrl = ((_b = data[i][6]) === null || _b === void 0 ? void 0 : _b.trim()) || '';
                disbursements.push({
                    most_recent_disbursement: mostRecentDisbursement,
                    disbursement_title: disbursementTitle,
                    date_paid: datePaid,
                    amount_paid: amountPaid,
                    blockchain_tx_url: blockchainTxUrl
                });
            }
            res.status(200).json(disbursements);
        }
        catch (error) {
            next(error);
        }
    });
});
app.get("/recent-trades", authCheck_1.authCheck, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(req === null || req === void 0 ? void 0 : req.GOOGLE_SHEETS_URL);
            const csvText = response.data;
            const rows = csvText.split(/\r?\n/).map((row) => row.split(','));
            const recentTrades = [];
            const data = [];
            for (let i = 33; i <= 36; i++) {
                data.push(rows[i].slice(0, 7));
            }
            for (let i = 0; i < data.length; i++) {
                const no = data[i][0];
                const date = data[i][1];
                const asset = data[i][2];
                const position = data[i][3];
                const pnl = data[i][4];
                const growth = data[i][5];
                const obj = {
                    no, date, asset, position, pnl, growth
                };
                recentTrades.push(obj);
            }
            res.status(200).json(recentTrades);
        }
        catch (error) {
            next(error);
        }
    });
});
app.get("/disbursement-cycle", authCheck_1.authCheck, function (req, res, next) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(req === null || req === void 0 ? void 0 : req.GOOGLE_SHEETS_URL);
            const csvText = response.data;
            const rows = csvText.split(/\r?\n/).map((row) => row.split(','));
            const data = rows[39];
            const key = "Disbursement Completed";
            const value = ((_a = data[1]) === null || _a === void 0 ? void 0 : _a.trim()) || '';
            res.status(200).json({ [key]: value });
        }
        catch (error) {
            next(error);
        }
    });
});
app.post("/login", function (req, res, next) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: "Login information is required"
                });
            }
            const response = yield axios_1.default.get(config_1.default.GOOGLE_SHEETS_ADMIN_CSV_URL);
            const csvText = response.data;
            const rows = csvText.split(/\r?\n/).map((row) => row.split(','));
            const authInfo = {};
            for (let i = 3; i < rows.length; i++) {
                const row = rows[i];
                if (row.length >= 2) {
                    const email = (_a = row[4]) === null || _a === void 0 ? void 0 : _a.trim();
                    const password = (_b = row[5]) === null || _b === void 0 ? void 0 : _b.trim();
                    if (email && password) {
                        authInfo[email] = {
                            email,
                            password
                        };
                    }
                }
            }
            const sheets_email = (_c = authInfo[email]) === null || _c === void 0 ? void 0 : _c.email;
            const sheets_password = (_d = authInfo[email]) === null || _d === void 0 ? void 0 : _d.password;
            if (!(sheets_email === (email === null || email === void 0 ? void 0 : email.trim()) && sheets_password === (password === null || password === void 0 ? void 0 : password.trim()))) {
                return res.status(400).json({
                    success: false,
                    message: "Username or password is not correct"
                });
            }
            res.status(200).json({
                email,
                success: true,
                message: "Login successful"
            });
        }
        catch (error) {
            next(error);
        }
    });
});
app.get("/", function (req, res) {
    res.json({
        message: "Hello"
    });
});
app.use(function (err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }
    res.status(500);
    res.json({ error: err });
});
exports.default = app;
/**
 *

function doGet() {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = doc.getSheetByName("Template")
  const values = sheet.getDataRange().getValues()

  const client_info = {}
  client_info["first_name"] = values[4][1];
  client_info["last_name"] = values[5][1];
  client_info["tx_code"] = values[6][1];
  client_info["ERC20_wallet_address"] = values[7][1];
  client_info["ERC20_wallet_address_verigied"] = values[8][1];
  client_info["sales_purchase_agreement"] = values[9][1];
  client_info["memorandum_understanding"] = values[10][1];
  client_info["VPSBLC_NFT"] = values[11][1];

  const vpsblc_information = {};
  vpsblc_information["vpsblc_purchase_price"] = values[14][1];
  vpsblc_information["vpsblc_face_value"] = values[15][1];
  vpsblc_information["vpsblc_purchase_status"] = values[16][1];
  vpsblc_information["vpsblc_funding_status"] = values[17][1];
  vpsblc_information["trace_status"] = values[18][1];

  const growth_analytics_chart = {};
  growth_analytics_chart["dollar_scale"] = values[21][1]
  growth_analytics_chart["monthly_scale"] = values[22][1]

  const disbursement_overview = {};
  disbursement_overview["next_disbursement"] = values[25][1];
  disbursement_overview["next_disbursement_amount"] = values[26][1];
  disbursement_overview["earnings_to_date"] = values[27][1];

  const disbursement_info = []
  for (let r = 4; r < 16; r++) {
    const row = {};
    row["disbursement"] = values[r][3];
    row["date_paid"] = values[r][4];
    row["disbursements_paid"] = values[r][5];
    row["disbursements_expected"] = values[r][6];
    row["blockchain_tx_url"] = values[r][7];

    disbursement_info.push(row)
  }

  const recent_disbursements = []
  for (let r = 18; r < 20; r++) {
    const row = {};
    row["most_recent_disbursement"] = values[r][3];
    row["disbursement_title"] = values[r][4];
    row["date_paid"] = values[r][5];
    row["amount_paid"] = values[r][6];
    row["blockchain_tx_url"] = values[r][7];

    recent_disbursements.push(row)
  }

  return ContentService.createTextOutput(JSON.stringify({
    client_info,
    vpsblc_information,
    growth_analytics_chart,
    disbursement_overview,
    disbursement_info,
    recent_disbursements,
  })).setMimeType(ContentService.MimeType.JSON);
}



 */ 
