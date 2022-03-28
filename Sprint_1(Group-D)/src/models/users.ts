import {Schema,model} from "mongoose";

//Interface for User
export interface Iuser{
    _id: string,
    name:string,
    email:string,
    password:string
}

//Schema For User
const schema = new Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    }
})

//Exports the user model
export default model<Iuser>('users', schema);