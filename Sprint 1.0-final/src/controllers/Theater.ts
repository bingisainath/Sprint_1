import mongoose from "mongoose";
import Movies, { IMovies } from "../models/Movies";
import Theater,{ITheater} from "../models/Theater";
import { ITickets } from "../models/Tickets";
import moment from "moment";

export default class CtrlTheater{
    
    /**
     * Creating the Theater By Admin
     * @param body 
     * @returns 
     */
    static async create(body: any):Promise<ITheater>{
        const Theater1 = Theater.create(body);
        return Theater1;
    }


    /**
     * returing All Theaters Based On Movie(_id)
     * @param Movie_id 
     * @returns 
     */
    static async get_Cinema(Movie_id:string):Promise<ITheater[]>{

        return Theater.aggregate([
            {
                $match: { Movie_Id : (Movie_id)}
            }
        ]).exec();
    }


    /**
     * Finding one Theater Using (Theater)_id 
     * @param id 
     * @returns 
     */
    static async FindOne(id:string):Promise<ITheater>{
        console.log(id);
        const data = await Theater.aggregate([
            {
                $match: { _id : new mongoose.Types.ObjectId(id)}
            }
        ]).exec();
        const result = data[0];
        return result
    }

    /**
     * returing all the Theaters
     * @returns 
     */
    static async get_All():Promise<ITheater[]>{
        return await Theater.aggregate([
            {
                $lookup: {
                    from: "movies",
                    localField: "Movie",
                    foreignField: "_id",
                    as: "Movie"
                }
            }
        ]).exec()
    }


}