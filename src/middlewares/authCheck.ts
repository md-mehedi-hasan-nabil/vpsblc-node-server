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

            const authInfo: { [key: string]: Record<string, string> } = {};
        
            for (let i = 3; i < rows.length; i++) {
                const row = rows[i];
    
                if (row.length >= 2) {
                    const email = row[4]?.trim();
                    const password = row[5]?.trim();
                    const sheets = row[6]?.trim();
    
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
                req.GOOGLE_SHEETS_URL = authInfo[email].sheets
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