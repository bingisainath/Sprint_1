import { any, string } from "joi";
import {Schema,model} from "mongoose"
import {generate} from "shortid";
import  { IMovies } from "./Movies"

//Interface for Theater
export interface ITheater{
    _id:string,
    name:string,
    Location:string,
    Movie_Id:string,
    Seat_Availability:number,
    Movie : object
}

//Schema for Theater
const schema = new Schema({
    name:{
        type:String,
        required:true,
        index:true,
    },
    Location:{
        type:String,
        required:true,
        index:true,
    },
    Movie_Id:{
        type:String,
        required:true,
    },
    Seat_Availability:{
        type:Number,
        required:true,
    },
    Movie: {
        type: Schema.Types.ObjectId,
        ref:"Movies",
        required:true
    }
})

//Exports the Theater model
export default model<ITheater>("Theater",schema);