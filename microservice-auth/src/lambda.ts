import { configure } from "@vendia/serverless-express";
import {AppDataSource} from "./db/data-source";
import app from "./app";

let serverlessExpressInstance: any;

// Fonction d'initialisation de la DB et du serveur
async function setup(event: any, context: any) {

    // 1. Gestion de la Base de Données (Singleton)
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        console.log("✅ Data Source initialisée (LAMBDA COLD START)");
    } else {
        console.log("♻️ Data Source déjà initialisée (LAMBDA WARM START)");
    }

    // 2. Configuration du wrapper Express
    serverlessExpressInstance = configure({ app });

    // 3. Exécution
    return serverlessExpressInstance(event, context);
}

// Le Handler exporté qu'AWS va appeler
export const handler = (event: any, context: any) => {
    // Si l'instance existe déjà (Warm Start), on l'utilise directement
    if (serverlessExpressInstance) {
        return serverlessExpressInstance(event, context);
    }

    // Sinon (Cold Start), on fait le setup
    return setup(event, context);
};