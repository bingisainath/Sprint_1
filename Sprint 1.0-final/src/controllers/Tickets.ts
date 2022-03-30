import moment from "moment";
import mongoose from "mongoose";
import Movies from "../models/Movies";
import Theater from "../models/Theater";
import Tickets ,{ITickets} from "../models/Tickets";
import users from "../models/users";
import CtrlMovies from "./Movies";
import Movie from "./Movies"
import CtrlTheater from "./Theater";
import CtrlUser from "./users";

export default class CtrlTickets{
    

    /**
     * Booking the Tickets based Cinema_Id
     * @param Cinema_Id 
     * @param Ticket 
     * @param user 
     * @returns 
     */
    static async Book_Tickets(Cinema_Id,Ticket,user):Promise<ITickets>{
        const Cinema = await CtrlTheater.FindOne(Cinema_Id);
        let out_Ticket;
        //@ts-ignore
        const Movie_id = Cinema.Movie_Id
        const seats = Cinema.Seat_Availability
        if(seats>=Ticket){
            const Present_seat = seats - Ticket;
            const data1 = await Theater.updateOne({_id: Cinema._id}, {$set:{Seat_Availability:Present_seat}}, {new: true})
            const data ={
                user_id:user,
                Movie_Details:new mongoose.Types.ObjectId(Movie_id),
                Cinema_Details:new mongoose.Types.ObjectId(Cinema_Id),
                User_Details:new mongoose.Types.ObjectId(user),
                No_Of_Tickets:Ticket,
            }
            out_Ticket =  await Tickets.create(data)
            return out_Ticket;
        }else{
            throw Error("Seats are Not Avaliable")
        }
        
    }


    /**
     * returing All Tickets
     * @returns 
     */
    static async getAll():Promise<ITickets[]>{
        return await Tickets.aggregate([
            {
                $lookup: {
                    from: "movies",
                    localField: "Movie_Details",
                    foreignField: "_id",
                    as: "Movie_Details"
                }
            },
            {
                $lookup: {
                    from: "theaters",
                    localField: "Cinema_Details",
                    foreignField: "_id",
                    as: "Cinema_Details"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "User_Details",
                    foreignField: "_id",
                    as: "User_Details"
                },
            },
        ]).exec()
    }


    /**
     * Returns The Tickets for a Authenticated User
     * @param id 
     * @returns 
     */
    static async get_Tickets(id:string):Promise<ITickets[]>{ 
        console.log(id);
        const now =  moment().format("YYYY-MM-DDTHH:MM") ;
        console.log(now);
        const data =  await Tickets.aggregate([
            {
                $match:{ user_id :(id)
                }
            },
            {
                $lookup: {
                    from: "movies",
                    'let' : {movieId : "$Movie_Details"},
                    pipeline: [
                        {
                            $match:{
                                $expr:{
                                   $and :[{"$gt":["$ShowTime",now]},{$eq: ["$_id","$$movieId"]}] ,
                                },
                            }
                        }
                    ],
                    as: "Movie_Details"
                }
            },
            {
                $lookup: {
                    from: "theaters",
                    localField: "Cinema_Details",
                    foreignField: "_id",
                    as: "Cinema_Details"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "User_Details",
                    foreignField: "_id",
                    as: "User_Details"
                },
            },
        ]).exec();
        const data1 = data.filter(element=>{
                return element.Movie_Details.length>0;
        })
        return data1
    }
}