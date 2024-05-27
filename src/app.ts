import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import axios from "axios";
import config from "./app/config";
import { Disbursement, RecentDisbursement } from "./types";

const app = express();

app.set('view engine', 'ejs')

app.use(express.json());
app.use(cors());
app.use(morgan('tiny'));


app.get("/client-info", async function (req: Request, res: Response, next: NextFunction) {
    try {
        const response = await axios.get(config.GOOGLE_SHEETS_CSV_URL as string);

        const csvText = response.data

        const rows = csvText.split(/\r?\n/).map((row: string) => row.split(','));

        const clientInfo: { [key: string]: string } = {};

        let inClientInfoSection = false;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            // Check if we are inside the Client Information section
            if (row[0]?.trim() === 'Client Information') {
                inClientInfoSection = true;
                continue;
            }

            // Break the loop if we have exited the Client Information section
            if (inClientInfoSection && row[0]?.trim() === 'VPSBLC Information') {
                break;
            }

            // Process rows within the Client Information section
            if (inClientInfoSection && row[0]?.trim() !== '') {
                const key = row[0]?.trim().replace(/:$/, '');
                const value = row[1]?.trim() || '';
                clientInfo[key] = value;
            }
        }

        res.status(200).json(clientInfo)

    } catch (error) {
        next(error)
    }
})

app.get("/vpsblc-info", async function (req: Request, res: Response, next: NextFunction) {
    try {
        const response = await axios.get(config.GOOGLE_SHEETS_CSV_URL as string);
        const csvText = response.data

        const rows = csvText.split(/\r?\n/).map((row: string) => row.split(','));

        const VPSBLCInformation: { [key: string]: string } = {};

        let inVPSBLCInformationSection = false;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            if (row[0]?.trim() === 'VPSBLC Information') {
                inVPSBLCInformationSection = true;
                continue;
            }

            if (inVPSBLCInformationSection && row[0]?.trim() === 'Growth Analytics Chart') {
                break;
            }

            if (inVPSBLCInformationSection && row[0]?.trim() !== '') {
                const key = row[0]?.trim().replace(/:$/, '');
                let value = ""
                if (key === "VPSBLC Purchase Price") {
                    value = row.slice(1, row.length - 6)?.join(" ")?.trim()?.replace("\"", "")?.replace("\"", "") || '';
                }
                else if (key === "VPSBLC Face Value") {
                    value = row.slice(1, row.length - 8).join(" ")?.trim()?.replace("\"", "")?.replace("\"", "") || '';
                }
                else {
                    value = row[1]?.trim() || '';
                }

                VPSBLCInformation[key] = value;
            }
        }

        res.status(200).json(VPSBLCInformation)

    } catch (error) {
        next(error)
    }
})

app.get("/disbursement-overview", async function (req: Request, res: Response, next: NextFunction) {
    try {
        const response = await axios.get(config.GOOGLE_SHEETS_CSV_URL as string);
        const csvText = response.data
        const rows = csvText.split(/\r?\n/).map((row: string) => row.split(','));

        const disbursementOverview: { [key: string]: string } = {};

        let isDisbursementOverviewSection = false;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            if (row[0]?.trim() === 'Disbursement Overview') {
                isDisbursementOverviewSection = true;
                continue;
            }

            if (isDisbursementOverviewSection && row[0]?.trim() !== '') {
                const key = row[0]?.trim().replace(/:$/, '');
                let value = ""

                if ((key === "Next Disbursement") || (key === "Next Disbursement Amount") || (key === "Earnings to Date")) {

                    value = row.slice(1, row.length).join(" ").trim().replace(/""/g, '"').replace(/"\$/g, '$').replace(/"\B/g, '') || '';
                } else {
                    value = row[1]?.trim().replace(/""/g, '"').replace(/"\$/g, '$').replace(/"\B/g, '') || '';
                }

                disbursementOverview[key] = value;
            }
        }

        if (disbursementOverview["username"]) {
            delete disbursementOverview["username"]
        }

        if (disbursementOverview["password"]) {
            delete disbursementOverview["password"]
        }

        if (disbursementOverview["login"]) {
            delete disbursementOverview["login"]
        }

        res.status(200).json(disbursementOverview)

    } catch (error) {
        next(error)
    }
})

app.get("/growth-analytics-chart", async function (req: Request, res: Response, next: NextFunction) {
    try {
        const response = await axios.get(config.GOOGLE_SHEETS_CSV_URL as string);
        const csvText = response.data
        const rows = csvText.split(/\r?\n/).map((row: string) => row.split(','));

        const obj = {
            dollar_scale: (rows[21] as []).slice(1, rows[21].length).join('').replace(/""/g, '"').replace(/"\$/g, '$').replace(/"\B/g, ''),
            monthly_scale: (rows[22] as []).slice(1, rows[21].length).join('')
        }

        res.status(200).json(obj)

    } catch (error) {
        next(error)
    }
})

app.get("/disbursement-info", async function (req: Request, res: Response, next: NextFunction) {
    try {
        const response = await axios.get(config.GOOGLE_SHEETS_CSV_URL as string);
        const csvText = response.data
        const rows = csvText.split(/\r?\n/).map((row: string) => row.split(','));

        const data: string[][] = []

        for (let i = 4; i <= 13; i++) {
            data.push(rows[i].slice(3))
        }

        const disbursements: Disbursement[] = [];

        data.forEach((row) => {
            const disbursement = row[0];
            const dateString = row[1].replace(/"/g, '') + row[2].replace(/"/g, '');
            const date = dateString;
            const amount = row[4];
            const url = row[5];

            disbursements.push({
                disbursement,
                date_paid: date,
                disbursements_paid: "",
                disbursements_expected: amount,
                blockchain_tx_url: url
            });
        });

        res.json(disbursements)

    } catch (error) {
        next(error)
    }
})

app.get("/recent-disbursements", async function (req: Request, res: Response, next: NextFunction) {
    try {
        const response = await axios.get(config.GOOGLE_SHEETS_CSV_URL as string);
        const csvText = response.data
        const rows = csvText.split(/\r?\n/).map((row: string) => row.split(','));

        const data: string[][] = [
            rows[18].slice(3),
            rows[19].slice(3)
        ];

        const disbursements: RecentDisbursement[] = [];

        for (let i = 0; i < data.length; i++) {
            const mostRecentDisbursement = data[i][0];
            const disbursementTitle = data[i][1]

            const datePaid = new Date((data[i][2] + data[i][3]))

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

app.post("/login", async function (req: Request, res: Response, next: NextFunction) {
    try {
        interface Credentials {
            username: string;
            password: string;
        }

        const response = await axios.get(config.GOOGLE_SHEETS_CSV_URL as string);

        const csvText = response.data

        const rows = csvText.split(/\r?\n/).map((row: string) => row?.split(','));

        const { username, password } = req.body as Credentials;

        if (!username && !password) {
            return res.status(500).json({
                success: false,
                messgae: "Login information is required"
            })
        }

        const data: string[][] = [
            rows[30],
            rows[31]
        ]

        const credentials: Partial<Credentials> = {};

        data.forEach(row => {
            const key = row[0]?.trim();
            const value = row[1]?.trim();

            if (key && value) {
                credentials[key as keyof Credentials] = value;
            }
        });

        if (!(username === credentials.username) || !(password === credentials.password)) {
            return res.status(500).json({
                success: false,
                messgae: "Username or password is not correct"
            })
        }

        res.status(200).json({
            username,
            success: true,
            message: "Login successful"
        })

    } catch (error) {
        next(error)
    }
})

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