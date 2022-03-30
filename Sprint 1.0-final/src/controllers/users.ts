import mongoose from "mongoose";
import users, { Iuser } from "../models/users";


export default class CtrlUser{
    
    /**
     * creating a User
     * @param body 
     * @returns 
     */
    static async create(body: any):Promise<Iuser>{
        const user = users.create(body);
        return user;
    }

    /**
     * Finding a single user By User_id
     * @param id 
     * @returns 
     */
    static async FindOne(id:string):Promise<Iuser>{
        
        const user = await users.aggregate([
            {
                $match: { _id : new mongoose.Types.ObjectId(id)}
            }
        ]).exec();
        const result = user[0];
        return result;
    }

    /**
     * Authentication the user
     * @param email 
     * @param password 
     * @returns 
     */
    static async Auth_user(email,password): Promise<Iuser>{
        const user = await users.findOne({email}).lean()
        if(user){
            if(password===user.password){
                console.log(user);
                return user;
            }
            else throw new Error("password doesn't match");
        }
        else throw new Error("user doesn't exists");
    }
}