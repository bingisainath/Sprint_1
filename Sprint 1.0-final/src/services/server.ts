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


//creating the  class server exporting
export default class server{

     //initializing teh express with app const
    app = express();


    //starting the express-server,mongo,middleware,routes & defRoutes
    async start(){
        console.log("Listening the Server")

        //listening the port
        this.app.listen(process.env.PORT)
        console.log(`Successfilly Connected the Server with Port ${process.env.PORT}`);
        
         //calling the middleware method where all middleware are present
        this.middleware()

        //calling the routes methods where all HTTP request are present
        this.routes()

        //calling the defroutes fro server testing
        this.defRoutes();
    }

    //middlewares
    middleware(){

        //bpdy-parser middleware for parsing the body data providing in postman
        this.app.use(bodyParser.urlencoded({ extended: false }))

        //session middleware 
        this.app.use(
            session({

                //providing the secret to store in cookie
                secret: process.env.SESSION_SECRET,
                resave: false,
                saveUninitialized: false,

                //storing the session in mongodb URL
                store: MongoStore.create({
                    mongoUrl: process.env.SESSION_USER_URL,
                }),

                //fixing age of cookie to 24hours
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

            //using try & catch for error handling
            try{
                //creating a schema for input validation
                const schema = Joi.object({
                    email: Joi.string().email().required(),
                    password: Joi.string().required(),
                })

                //validating the Joi schema provided
                const data = await schema.validateAsync(req.body);

                //calling the adminAuth function for authentication
                const admin = await CtrlAdmin.Admin_Auth(data.email,data.password);

                //creating a session for admin
                //@ts-ignore
                req.session.admin = admin;

                //sending the response to postman
                resp.status(200).send(admin.email);
                return admin;
            }catch(e){
                //sending the response to postman
                resp.status(500).send(e.message);
            }
        })


        //Creating a Movie by Admin
        this.app.post("/admin/create_movie",async(req,resp)=>{

            //using try & catch for error handling
            try{

                //checking the admin is authenticated or not by cookie saved in database
                if(req.session && req.session.admin){

                    //creating a schema for input validation
                    const schema = Joi.object({
                        name:Joi.string().required(),
                        ShowTime:Joi.any().required(),
                    })

                    //validating the Joi schema provided
                    await schema.validateAsync(req.body);
                
                    //calling the create function for creation of database
                    const data = await CtrlMovies.create(req.body);

                    //sending the response to postman
                    if(data) resp.status(200).send(data);
                    else throw Error("Invalid Movie Inputs")
                }else{
                    //sending the response to postman
                    resp.status(500).send("Admin Not Authenticated")
                }
            }catch(e){
                //sending the response to postman
                resp.status(500).send(e.message);
            }
        })



        //Creating a Cinema by Admin
        this.app.post("/admin/create_cinema", async(req,resp)=>{

            //using try & catch for error handling
            try{
                //@ts-ignore
                if(req.session && req.session.admin){

                //creating a schema for input validation
                const schema = Joi.object({
                    name:Joi.string().required(),
                    Location:Joi.string().required(),
                    Movie_Id:Joi.string().required(),
                    Seat_Availability:Joi.number().required()
                })

                //validating the Joi schema provided
                await schema.validateAsync(req.body);

                //storing the movie id in movie1
                const Movie1 = req.body.Movie_Id;

                //creating a data1 for replicate the movie schema 
                const data1 = {
                    ...req.body,
                    Movie:Movie1
                }

                //calling the create function for creation of database
                const data = await CtrlTheater.create(data1);

                //sending the response to postman
                resp.status(200).send(data);
                }else{
                    //sending the response to postman
                    resp.status(500).send("Admin Not Authenticated")
                }
            }catch(e){
                //sending the response to postman
                resp.status(500).send(e.message);
            }
        })



        //Creating the User Account By admin
        this.app.post("/admin/user/create", async(req,resp)=>{

            //using try & catch for error handling
            try{

                //checking the admin is authenticated or not by cookie saved in database
                if(req.session && req.session.admin){

                    //creating a schema for input validation
                    const schema = Joi.object({
                        name:Joi.string().required(),
                        email: Joi.string().email().required(),
                        password: Joi.string().required().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
                    })

                    //validating the Joi schema provided
                    const user = await schema.validateAsync(req.body);

                    //calling the create function for creation of database
                    const data =await  CtrlUser.create(req.body);
                    //sending the response to postman
                    resp.status(200).send(data.email)
                }else{
                    //sending the response to postman
                    resp.status(500).send("Admin Not Authenticated")
                }
            }catch(e){
                //sending the response to postman
                resp.status(500).send(e.message);
            }
        })


        //Getting All users registed
        this.app.get("/admin/get_users",async(req,resp)=>{

            //using try & catch for error handling
            try{

                //checking the admin is authenticated or not by cookie saved in database
                //@ts-ignore
                if(req.session && req.session.admin){

                    //finding all users from database
                    const data = await users.find()
                    //sending the response to postman
                    resp.status(200).send(data);
                }else{
                    //sending the response to postman
                    resp.status(500).send("Admin Not Authenticated")
                }
            }catch(e){
                //sending the response to postman
                resp.status(500).send(e.message);
            }
        })

        //getting all tickets by admin
        this.app.get("/admin/get_all_tickets",async(req,resp)=>{

            //using try & catch for error handling
            try{

                //checking the admin is authenticated or not by cookie saved in database
                if(req.session && req.session.admin){

                    //calling getAll method to get all tickets present in database
                    const tickets = await CtrlTickets.getAll();
                    //sending the response to postman
                    resp.status(200).send(tickets);
                }else{
                    //sending the response to postman
                    resp.status(200).send("Admin Authentication is Required")
                }
            }catch(e){
                //sending the response to postman
                resp.status(500).send(e.message);
            }
        })

        //Admin logout
        this.app.post("/admin/logout",async(req,resp)=>{
            //using try & catch for error handling
            try{
            //destroying or removing the session
            req.session.destroy(() => {});
            //sending the response to postman
            resp.status(200).send("Admin is logged out")
            }catch(e){
                //sending the response to postman
                resp.status(500).send(e.message)
            }
        })

        //User Authentication
        this.app.post("/user/auth",async(req,resp)=>{

            //using try & catch for error handling
            try{

                //creating a schema for input validation
                const schema = Joi.object({
                    email:Joi.string().email().required(),
                    password:Joi.string().required(),
                })


                //validating the Joi schema provided
                const data = await schema.validateAsync(req.body);

                //calling the userauth method for authentication
                const user = await CtrlUser.Auth_user(req.body.email,req.body.password);

                //creating a session for user
                //@ts-ignore
                req.session.user = user;
                //sending the response to postman
                resp.status(200).send(user.email)
            }catch(e){
                //sending the response to postman
                resp.status(500).send(e.message);
            }
            
        })

        //After user auth display of movies in sorted order and not expired 
        this.app.get("/user/get_movie_sorted",async (req,resp)=>{

            //using try & catch for error handling
            try{
                //creating a schema for input validation
                let schema = Joi.object({
                    sort:Joi.number().integer().default(1),
                    page: Joi.number().integer().default(0),
                    limit: Joi.number().integer().default(5),
                    filterBy:Joi.string().default("name")
                });

                //validating the Joi schema provided
                const data = await schema.validateAsync(req.query);

                //calling sortMovies function to get sorted movies data
                const result = await CtrlMovies.Sort_Movies(data.sort,data.limit,data.page,data.filterBy);

                //sending the response to postman
                resp.status(200).send(result);
            }catch(e){

                //sending the response to postman
                resp.status(500).send(e.message);
            }
        })

        //Get All Cinema With a Specific Movie(_id)
        this.app.get("/user/get_cinema",async(req,resp)=>{

            //using try & catch for error handling
            try{
                let Cinema_List;
                const Movie_Id = req.body.Id;

                //calling getCinema to get cinema by movieId
                Cinema_List = await CtrlTheater.get_Cinema(Movie_Id);

                //sending the response to postman
                resp.status(200).send(Cinema_List)
            }catch(e){
                resp.status(500).send(e.message);
            }
        })

        //getting the movies which are not expired
        this.app.get("/user/get_movies",async(req,resp)=>{

            //using try & catch for error handling
            try{
                let movie_List;

                //finding all movie in database which are not expired
                movie_List = await CtrlMovies.get_Movies_exp();

                //sending the response to postman
                resp.status(200).send(movie_List)
            }catch(e){
                //sending the response to postman
                resp.status(500).send(e.message);
            }
        })

        //Booking the Tickets
        this.app.post("/user/book_tickets", async(req,resp)=>{

            //using try & catch for error handling
            try{
            
                //checking the admin is authenticated or not by cookie saved in database
                //@ts-ignore
                if(req.session && req.session.user){
                    const Cinema_Id = req.body.Id;
                    const Tickets = req.body.Tickets;

                    //calling bookTickets function to book the tickets for specific movie
                    //@ts-ignore
                    const data = await CtrlTickets.Book_Tickets(Cinema_Id,Tickets,req.session.user._id);
                    resp.status(200).send(data);
                }else{
                    resp.status(500).send("User Not Authenticated")
                }
            }catch(e){
                resp.status(500).send(e.message);
            }
        })

        //getting tickets of authenticated User
        this.app.get("/user/get_tickets",async (req,resp)=>{

            //using try & catch for error handling
            try{
                //checking the admin is authenticated or not by cookie saved in database
                //@ts-ignore
                if(req.session && req.session.user){
                    //storing the user session id in id 
                    const id = req.session.user._id;

                    //getting all tickets booked by user
                    const data = await CtrlTickets.get_Tickets(id);

                    //sending the response to postman
                    resp.status(200).send(data)
                }else{
                    //sending the response to postman
                    resp.status(200).send("User Authentication is Required")
                }
            }catch(e){
                //sending the response to postman
                resp.status(500).send(e.message);
            }
        })



        //Getting a Movie Present in DataBase
        this.app.get("/user/get_all_cinema",async(req,resp)=>{

            //using try & catch for error handling
            try{

                //getting all theater data 
                const data = await CtrlTheater.get_All();

                //sending the response to postman
                resp.status(200).send(data);
            }catch(e){

                //sending the response to postman
                resp.status(200).send(e.message);
            }
        })

        //user Logout
        this.app.post("/user/logout",async(req,resp)=>{

            //using try & catch for error handling
            try{

                //destroying or removing the session
                req.session.destroy(() => {});

                //sending the response to postman
                resp.status(200).send("user is logged out")
            }catch(e){
                //sending the response to postman
                resp.status(500).send(e.message);
            }
        })



        //Getting a Specific Movie By _id
        this.app.get("/user/get_one_movie",async(req,resp)=>{

            //using try & catch for error handling
            try{

                //finding teh only specified movie by movie id
                const data = await CtrlMovies.FindOne(req.body.id);

                //sending the response to postman
                resp.status(200).send(data)
            }catch(e){
                resp.status(500).send(e.message);
            }
        })

        //Getting All Movies
        this.app.get("/user/get_all_movies",async(req,resp)=>{

            //using try & catch for error handling
            try{
                let Movie_List;

                //finding all movie in database
                Movie_List = await CtrlMovies.get_Movies();

                //sending the response to postman
                resp.status(200).send(Movie_List);
            }catch(e){

                //sending the response to postman
                resp.status(500).send(e.message);
            }
            
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


