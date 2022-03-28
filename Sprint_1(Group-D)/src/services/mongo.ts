import mogoose from "mongoose";


//Connecting the Mongodb sever
export default class Mongo{
    static async connect():Promise<boolean>{
        await mogoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB");
        return true;
    }
}