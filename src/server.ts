import app from "./app";
import config from "./app/config";

main().catch(err => console.log(err));

async function main() {
    try {

        app.listen(config.PORT, () => {
            console.log(`Server is listening on port ${config.PORT}`)
        })
    } catch (error) {
        console.error(error)
    }
}
