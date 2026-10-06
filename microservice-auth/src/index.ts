import {AppDataSource} from "./db/data-source";
import app from "./app";
import {config} from "./config";

AppDataSource.initialize()
    .then(() => {
        console.log("✅ Data Source initialisée (LOCAL)");

        // 2. On lance le serveur
        app.listen(config.port, () => {
            console.log(`🚀 Serveur lancé sur http://localhost:${config.port}`);
        });
    })
    .catch((err) => {
        console.log(config.db.host, config.db.user, config.db.password);
        console.error("❌ Erreur lors de l'init de la DB:", err);
    });
