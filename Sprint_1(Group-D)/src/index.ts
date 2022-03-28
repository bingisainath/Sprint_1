import "dotenv/config";

import Mongo from "./services/mongo";
import Server from "./services/server";


(async ()=>{
    try{
        await Mongo.connect();
        await new Server().start();
    }catch(error){
        console.log(error)
        process.exit();
    }
})();