
import {Schema,model} from "mongoose";
import {IMovies} from "./Movies";
import {ITheater} from "./Theater";
import {Iuser} from "./users";

//Interface for Tickets
export interface ITickets{
    _id:string,
    user_id:string,
    Movie_Details: IMovies | string,
    Cinema_Details: ITheater | string,
    User_Details: Iuser | string,
    No_Of_Tickets:number
}

//Schema for Tickets
const schema = new Schema({
    user_id:{
        type:String,
        required:true,
    },
    Movie_Details:{
        type: Schema.Types.ObjectId,
        ref: "Movies",
        required:true,
    },
    Cinema_Details:{
        type: Schema.Types.ObjectId,
        ref: "Theater",
        required:true,
    },
    User_Details:{
        type: Schema.Types.ObjectId,
        ref: "users",
        required:true,
    },
    No_Of_Tickets:{
        type:Number,
        required:true,
    }
    
})

//Exports the Tickets model
export default model("Tickets",schema);

