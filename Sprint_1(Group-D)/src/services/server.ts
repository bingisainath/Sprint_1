import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser"
import MongoStore from "connect-mongo";
import Joi, { string } from "joi";
import session from "express-session";
import CtrlAdmin from "../controllers/Admin";
import CtrlUser from "../controllers/users";
import CtrlMovie from "../controllers/Movies";
import CtrlTheater from "../controllers/Theater";
import CtrlTickets from "../controllers/Tickets";
import CtrlMovies from "../controllers/Movies";
import Movies from "../models/Movies";
import users from "../models/users";


export default class server{
    app = express();


    //Starting the express and mongodb
    async start(){
        console.log("Listening the Server")
        this.app.listen(process.env.PORT)
        console.log(`Successfilly Connected the Server with Port ${process.env.PORT}`);
        this.middleware()
        this.routes()
        this.defRoutes();
    }

    //middlewares
    middleware(){
        this.app.use(bodyParser.urlencoded({ extended: false }))
        this.app.use(
            session({
                secret: process.env.SESSION_SECRET,
                resave: false,
                saveUninitialized: false,
                store: MongoStore.create({
                    mongoUrl: process.env.SESSION_USER_URL,
                }),
                cookie: {
                    maxAge : 24 * 60 * 60 * 1000,
                },

            })
        )
    }

    //Http routes for user and Admin
    routes(){
        
        //Authenticating the Admin
        this.app.post("/admin/auth", async (req,resp)=>{
            const schema = Joi.object({
                email: Joi.string().email().required(),
                password: Joi.string().required(),
            })
            await schema.validateAsync(req.body);

            const admin = await CtrlAdmin.Admin_Auth(req.body.email,req.body.password);

            //@ts-ignore
            req.session.admin = admin;
            resp.status(200).send(admin.email);
            return admin;
        })


        //Creating a Movie by Admin
        this.app.post("/admin/create_movie",async(req,resp)=>{
            if(req.session && req.session.admin){
                const schema = Joi.object({
                    name:Joi.string().required(),
                    ShowTime:Joi.any().required(),
                })
                await schema.validateAsync(req.body);
            
                const data = await CtrlMovies.create(req.body);
                if(data) resp.status(200).send(data);
                else throw Error("Invalid Movie Inputs")
            }else{
                resp.status(500).send("Admin Not Authenticated")
            }
        })



        //Creating a Cinema by Admin
        this.app.post("/admin/create_cinema", async(req,resp)=>{
            //@ts-ignore
            if(req.session && req.session.admin){
            const schema = Joi.object({
                name:Joi.string().required(),
                Location:Joi.string().required(),
                Movie_Id:Joi.string().required(),
                Seat_Availability:Joi.number().required()
            })
            await schema.validateAsync(req.body);
            const Movie1 = req.body.Movie_Id;
            const data1 = {
                ...req.body,
                Movie:Movie1
            }
            const data = await CtrlTheater.create(data1);
            if(data) resp.status(200).send(data);
            else throw Error("Invalid Movie Inputs")
            }else{
                resp.status(500).send("Admin Not Authenticated")
            }
        })



        //Creating the User Account By admin
        this.app.post("/admin/user/create", async(req,resp)=>{
            if(req.session && req.session.admin){
                const schema = Joi.object({
                    name:Joi.string().required(),
                    email: Joi.string().email().required(),
                    password: Joi.string().required().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
                })
                const user = await schema.validateAsync(req.body);
                const data =await  CtrlUser.create(req.body);
                resp.status(200).send(data.email)
            }else{
                resp.status(500).send("Admin Not Authenticated")
            }
        })


        //Getting All users registed
        this.app.get("/admin/get_users",async(req,resp)=>{
            //@ts-ignore
            if(req.session && req.session.admin){
                const data = await users.find()
                resp.status(200).send(data);
            }else{
                resp.status(500).send("Admin Not Authenticated")
            }
        })

        //getting all tickets by admin
        this.app.get("/admin/get_all_tickets",async(req,resp)=>{
            if(req.session && req.session.admin){
                const tickets = await CtrlTickets.getAll();
                resp.status(200).send(tickets);
            }else{
                resp.status(200).send("Admin Authentication is Required")
            }
        })

        //Admin logout
        this.app.post("/admin/logout",async(req,resp)=>{
            req.session.destroy(() => {});
            resp.status(200).send("Admin is logged out")
        })

        //User Authentication
        this.app.post("/user/auth",async(req,resp)=>{
            const schema = Joi.object({
                email:Joi.string().email().required(),
                password:Joi.string().required(),
            })

            const data = await schema.validateAsync(req.body);
            const user = await CtrlUser.Auth_user(req.body.email,req.body.password);
            //@ts-ignore
            req.session.user = user;
            resp.status(200).send(user.email)
            //return user;
            
        })

        //After user auth display of movies in sorted order and not expired 
        this.app.get("/user/get_movie_sorted",async (req,resp)=>{
            // asc(name,date),desc(name,date),
            let schema = Joi.object({
                sort:Joi.number().required(),
                page: Joi.number().integer().default(0),
                limit: Joi.number().integer().default(5),
                filterBy:Joi.string().required()
            });
            const data = await schema.validateAsync(req.query);
            const result = await CtrlMovies.Sort_Movies(data.sort,data.limit,data.page,data.filterBy);
            resp.status(200).send(result);
        })

        //Get All Cinema With a Specific Movie(_id)
        this.app.get("/user/get_cinema",async(req,resp)=>{
            let Cinema_List;
            const Movie_Id = req.body.Id;
            Cinema_List = await CtrlTheater.get_Cinema(Movie_Id);
            resp.status(200).send(Cinema_List)
        })

        //Booking the Tickets
        this.app.post("/user/book_tickets", async(req,resp)=>{
            
            //@ts-ignore
            if(req.session && req.session.user){
                const Cinema_Id = req.body.Id;
                const Tickets = req.body.Tickets;
                //@ts-ignore
                const data = await CtrlTickets.Book_Tickets(Cinema_Id,Tickets,req.session.user._id);
                resp.status(200).send(data);
            }else{
                resp.status(500).send("User Not Authenticated")
            }
        })

        //getting tickets of auth User
        this.app.get("/user/get_tickets",async (req,resp)=>{
            //@ts-ignore
            if(req.session && req.session.user){
                const id = req.session.user._id;
                const data = await CtrlTickets.get_Tickets(id);
                resp.status(200).send(data)
            }else{
                resp.status(200).send("User Authentication is Required")
            }
        })



        //Getting a Movie Present in DataBase
        this.app.get("/user/get_all_cinema",async(req,resp)=>{
            const data = await CtrlTheater.get_All();
            resp.status(200).send(data);
        })

        //user Logout
        this.app.post("/user/logout",async(req,resp)=>{
            req.session.destroy(() => {});
            resp.status(200).send("user is logged out")
        })



        //Getting a Specific Movie By _id
        this.app.get("/user/get_one_movie",async(req,resp)=>{
            const data = await CtrlMovies.FindOne(req.body.id);
            resp.status(200).send(data)
        })

        //Getting All Movies
        this.app.get("/user/get_all_movies",async(req,resp)=>{
            let Movie_List;
            Movie_List = await CtrlMovies.get_Movies();
            resp.status(200).send(Movie_List);
            
        })

        //getting the movies which are not expired
        this.app.get("/user/get_movies",async(req,resp)=>{
            let movie_List;
            movie_List = await CtrlMovies.get_Movies_exp();
            resp.status(200).send(movie_List)
        })


    }

    defRoutes() {
        // check if server running
        this.app.all("/", (req, resp) => {
            resp.status(200).send({ success: true, message: "Server is working" });
        });

        this.app.all("*", (req, resp) => {
            resp.status(404).send({ success: false, message: `given route [${req.method}] ${req.path} not found` });
        });
    }
}


