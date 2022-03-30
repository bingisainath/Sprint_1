import mogoose from "mongoose";


//Connecting the Mongodb sever
export default class Mongo{

    //creating a local function connect to connect to mongodb database
    static async connect():Promise<boolean>{

        //calling connect default function in mongoose
        await mogoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB");
        return true;
    }
}