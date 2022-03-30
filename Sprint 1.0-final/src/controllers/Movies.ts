import mongoose from "mongoose";
import Movies, { IMovies } from "../models/Movies";
import moment from "moment";
import Theater from "../models/Theater";

export default class CtrlMovies{
    
    /**
     * creating the User
     * @param body 
     * @returns 
     */
    static async create(body:any):Promise<IMovies>{
        const Movie = Movies.create(body);
        return Movie;
    }


    /**
     * Returns all the Movies
     * @returns 
     */
    static async get_Movies():Promise<IMovies[]>{
       /* return await Movies.aggregate([
            {
                $lookup: {
                    from: "movies",
                    localField: "Movie",
                    foreignField: "_id",
                    as: "Movie"
                }
            },
        ]).exec()*/
        return await Movies.find();
    }


    /**
     * Find the Single Movie based on MovieId(_id)
     * @param id 
     * @returns 
     */
    static async FindOne(id:string):Promise<IMovies>{
        const data = await Movies.aggregate([
            {
                $match: { _id : new mongoose.Types.ObjectId(id)}
            },
        ]).exec();
        const result = data[0]; 
        return result;
    }


    /**
     * returing the Sorted movies based name and ShowTime and limiting the data using limit and page
     * @param sort 
     * @param limit 
     * @param page 
     * @param filterBy 
     * @returns 
     */
    static async Sort_Movies(sort:number,limit,page,filterBy):Promise<IMovies[]>{
       let sorted_data;
       const now =  moment().format("YYYY-MM-DDTHH:MM") ;

        //Dynamic variable allocation for parameter filterBy
        var sort1 = { $sort: {} }
        sort1["$sort"][filterBy] = sort
        sorted_data = Movies.aggregate([
            {
                $match: { ShowTime: {$gt: now} }
            },
            sort1,
            {
                $skip: page * limit,
            },
            {
                $limit: limit,
            },
        ]).exec()
        return sorted_data;
    }


    /**
     * getting movies only which are Not expired
     * @returns 
     */
    static async get_Movies_exp(){
        const now =  moment().format("YYYY-MM-DDTHH:MM") ;
        return await Movies.aggregate([
            {
                $match: { ShowTime: {$gt: now} }
            }
        ]).exec()
    }
}