import "dotenv/config";

import Mongo from "./services/mongo";
import Server from "./services/server";

//creating anonymous function 
(async ()=>{
    try{

        //calling the start method on mongo.ts
        await Mongo.connect();

        //stating the server by calling the start method in server
        await new Server().start();
    }
    //if anything goes wrong print the error
    catch(error){
        console.log(error)
        process.exit();
    }
})();