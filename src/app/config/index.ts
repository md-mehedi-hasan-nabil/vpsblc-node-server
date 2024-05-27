import dotenv from "dotenv";
import path from "path"

dotenv.config({
    path: path.join(process.cwd(), '.env')
})

export default {
    PORT: process.env.PORT,
    GOOGLE_SHEETS_CSV_URL: process.env.GOOGLE_SHEETS_CSV_URL,
    ORIGIN_URL: process.env.ORIGIN_URL
}