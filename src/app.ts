import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import axios from "axios";
import { Disbursement, RecentDisbursement } from "./types";
import { authCheck } from "./middlewares/authCheck";
import config from "./app/config";

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('tiny'));


app.get("/client-info", authCheck, async function (req: Request, res: Response, next: NextFunction) {
    try {
        //  const response = await axios.get(config.GOOGLE_SHEETS_CSV_URL as string);
        const response = await axios.get(req?.GOOGLE_SHEETS_URL as string);

        const csvText = response.data

        const rows = csvText.split(/\r?\n/).map((row: string) => row.split(','));

        const data: string[][] = []
        const clientInfo: { [key: string]: string } = {};

        for (let i = 4; i < 12; i++) {
            data.push(rows[i].slice(0, 2))
        }

        data.forEach((row) => {
            const key = row[0]?.trim().replace(/:$/, '');
            const value = row[1]?.trim() || '';
            clientInfo[key] = value;
        });

        res.status(200).json(clientInfo)

    } catch (error) {
        next(error)
    }
})

app.get("/vpsblc-info", authCheck, async function (req: Request, res: Response, next: NextFunction) {
    try {
        const response = await axios.get(req?.GOOGLE_SHEETS_URL as string);
        const csvText = response.data

        const rows = csvText.split(/\r?\n/).map((row: string) => row.split(','));

        const VPSBLCInformation: { [key: string]: string } = {};
        const data: string[][] = []

        for (let i = 18; i <= 22; i++) {
            data.push(rows[i].slice(0, 3))
        }

        data.forEach((row) => {
            const key = row[0]?.trim().replace(/:$/, '');
            const value = row.slice(1, row.length)?.join(" ")?.trim()?.replace("\"", "")?.replace("\"", "") || ''

            VPSBLCInformation[key] = value;
        });

        res.status(200).json(VPSBLCInformation)

    } catch (error) {
        next(error)
    }
})

app.get("/disbursement-overview", authCheck, async function (req: Request, res: Response, next: NextFunction) {
    try {
        const response = await axios.get(req?.GOOGLE_SHEETS_URL as string);
        const csvText = response.data
        const rows = csvText.split(/\r?\n/).map((row: string) => row.split(','));

        const disbursementOverview: { [key: string]: string } = {};

        const data: string[][] = []

        for (let i = 19; i <= 21; i++) {
            data.push(rows[i])
        }

        // console.log(data)

        for (let i = 0; i < data.length; i++) {
            const position = data[i].findIndex(el => el.includes("Next Disbursement:") || el.includes("Next Disbursement Amount: ") || el.includes("Earnings to Date:"))

            if (0 < position) {
                const key = data[i][position]?.trim().replace(":", "")
                const value = data[i].splice(position + 1, 2).toString().replace(/^"(.*)"$/, '$1')

                disbursementOverview[key] = value;
            }
        }

        res.status(200).json(disbursementOverview)

    } catch (error) {
        next(error)
    }
})

app.get("/growth-analytics-info", authCheck, async function (req: Request, res: Response, next: NextFunction) {
    try {
        const response = await axios.get(req?.GOOGLE_SHEETS_URL as string);
        const csvText = response.data
        const rows = csvText.split(/\r?\n/).map((row: string) => row.split(','));

        const data: string[][] = []
        const analyticsInfo: { [key: string]: string } = {};

        for (let i = 26; i <= 29; i++) {
            data.push(rows[i]?.slice(0, 3))
        }

        data.forEach((row, index) => {
            const key = data[index][0]?.replace(":", "");
            const value = data[index]?.slice(1, 3)?.join(',')?.replace('"', "")?.replace('"', "")?.replace(',', "")
            analyticsInfo[key] = value
        })

        res.status(200).json(analyticsInfo)

    } catch (error) {
        next(error)
    }
})

app.get("/disbursement-info", authCheck, async function (req: Request, res: Response, next: NextFunction) {
    try {
        const response = await axios.get(req?.GOOGLE_SHEETS_URL as string);
        const csvText = response.data
        const rows = csvText.split(/\r?\n/).map((row: string) => row.split(','));

        const data: string[][] = []

        for (let i = 4; i < 14; i++) {
            data.push(rows[i].slice(3))
        }

        const disbursements: Disbursement[] = [];

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

        res.json(disbursements)

    } catch (error) {
        next(error)
    }
})

app.get("/recent-disbursements", authCheck, async function (req: Request, res: Response, next: NextFunction) {
    try {
        const response = await axios.get(req?.GOOGLE_SHEETS_URL as string);
        const csvText = response.data
        const rows = csvText.split(/\r?\n/).map((row: string) => row.split(','));

        const data: string[][] = [
            rows[24].slice(3),
            rows[25].slice(3)
        ];

        const disbursements: RecentDisbursement[] = [];

        for (let i = 0; i < data.length; i++) {
            const mostRecentDisbursement = data[i][0];
            const disbursementTitle = data[i][1]

            const datePaid = ((data[i][2] + data[i][3]))?.replace("\"", "").replace("\"", "")

            const amountPaid = ("$" + data[i][4] + data[i][5]).replace(/[^0-9.-]+/g, '') || 0

            const blockchainTxUrl = data[i][6]?.trim() || '';

            disbursements.push({
                most_recent_disbursement: mostRecentDisbursement,
                disbursement_title: disbursementTitle,
                date_paid: datePaid,
                amount_paid: amountPaid,
                blockchain_tx_url: blockchainTxUrl
            });
        }

        res.status(200).json(disbursements)

    } catch (error) {
        next(error)
    }
})

app.get("/recent-trades", authCheck, async function (req: Request, res: Response, next: NextFunction) {
    try {
        const response = await axios.get(req?.GOOGLE_SHEETS_URL as string);
        const csvText = response.data
        const rows = csvText.split(/\r?\n/).map((row: string) => row.split(','));

        const recentTrades: Record<string, string>[] = []

        const data: string[][] = []

        for (let i = 33; i <= 36; i++) {
            data.push(rows[i].slice(0, 7));
        }

        for (let i = 0; i < data.length; i++) {
            const no = data[i][0]
            const date = data[i][1]
            const asset = data[i][2]
            const position = data[i][3]
            const pnl = data[i][4]
            const growth = data[i][5]

            const obj = {
                no, date, asset, position, pnl, growth
            }

            recentTrades.push(obj)
        }

        res.status(200).json(recentTrades)

    } catch (error) {
        next(error)
    }
})

app.get("/disbursement-cycle", authCheck, async function (req: Request, res: Response, next: NextFunction) {
    try {
        const response = await axios.get(req?.GOOGLE_SHEETS_URL as string);
        const csvText = response.data
        const rows = csvText.split(/\r?\n/).map((row: string) => row.split(','));

        const data: string[] = rows[39]


        const key = "Disbursement Completed";
        const value = data[1]?.trim() || '';

        res.status(200).json({ [key]: value })

    } catch (error) {
        next(error)
    }
})

app.post("/login", async function (req: Request, res: Response, next: NextFunction) {
    try {
        interface Credentials {
            email: string;
            password: string;
        }

        const { email, password } = req.body as Credentials;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Login information is required"
            });
        }

        const response = await axios.get(config.GOOGLE_SHEETS_ADMIN_CSV_URL as string);
        const csvText = response.data;

        const rows = csvText.split(/\r?\n/).map((row: string) => row.split(','));

        const authInfo: { [key: string]: Record<string, string> } = {};

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (row.length >= 2) {
                const email = row[0]?.trim();
                const password = row[1]?.trim();

                if (email && password) {
                    authInfo[email] = {
                        email,
                        password
                    };
                }
            }
        }

        const sheets_email = authInfo[email]?.email;
        const sheets_password = authInfo[email]?.password;

        if (!(sheets_email === email?.trim() && sheets_password === password?.trim())) {
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

    } catch (error) {
        next(error);
    }
});

app.get("/", function (req: Request, res: Response) {
    res.json({
        message: "Hello"
    })
})

app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
    if (res.headersSent) {
        return next(err)
    }

    res.status(500)
    res.json({ error: err })
})

export default app;



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