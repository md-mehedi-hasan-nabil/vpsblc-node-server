import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import axios from "axios";
import config from "./app/config";

const app = express();

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

            // console.log(row)

            if (inVPSBLCInformationSection && row[0]?.trim() !== '') {
                const key = row[0]?.trim().replace(/:$/, '');
                let value = ""
                if (key === "VPSBLC Purchase Price") {
                    value = row.slice(1, row.length - 6).join(" ").trim() || '';
                }
                else if (key === "VPSBLC Face Value") {
                    value = row.slice(1, row.length - 8).join(" ").trim() || '';
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
                    value = row.slice(1, row.length).join(" ").trim() || '';
                } else {
                    value = row[1]?.trim() || '';
                }

                disbursementOverview[key] = value;
            }
        }

        res.status(200).json(disbursementOverview)

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
    res.render('error', { error: err })
})

export default app;
