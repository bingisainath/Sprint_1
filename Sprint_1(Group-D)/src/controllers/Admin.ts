
import mongoose from "mongoose";
import users, { Iuser } from "../models/users";


export default class CtrlAdmin{

    /**
     * Authentication of Admin
     * @param email 
     * @param password 
     * @returns 
     */
    static async Admin_Auth(email:string,password:string) {

        const Admin ={email: "admin@gmail.com",
        password :"Admin123"}
        //const Admin = await users.findOne({ email }).lean();

        if(Admin.email==email)
        {
            if(Admin.password==password) return Admin;
            else throw new Error("password doesn't match");
        }
        else throw new Error("user doesn't exists");

    }


}