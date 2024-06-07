import axios from "axios";
import { NextFunction, Request, Response } from "express";
import config from "../app/config";

export async function authCheck(req: Request, res: Response, next: NextFunction) {
    // console.log(req.headers.email);

    if (req.headers.email) {
        const email = req.headers.email as string;

        try {
            const response = await axios.get(config.GOOGLE_SHEETS_ADMIN_CSV_URL as string);
            const csvText = response.data;

            const rows = csvText.split(/\r?\n/).map((row: string) => row.split(','));

            const authInfo: { [key: string]: string } = {};

            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                if (row.length >= 3) {
                    const key = row[0]?.trim();
                    const value = row[2]?.trim();
                    if (key && value) {
                        authInfo[key] = value;
                    }
                }
            }

            if (authInfo[email]) {
                req.GOOGLE_SHEETS_URL = authInfo[email];
                // console.log(authInfo);

                next();
            } else {
                res.status(409).json({
                    message: 'Unauthorized'
                });
            }
        } catch (error) {
            res.status(500).json({
                message: 'Internal Server Error'
            });
        }
    } else {
        res.status(409).json({
            message: 'Unauthorized'
        });
    }
}