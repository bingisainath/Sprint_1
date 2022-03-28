import {Schema,model} from "mongoose"

//interface for Movies
export interface IMovies{
    _id:string,
    name:string,
    ShowTime:string,
}

//schema for movies
const schema = new Schema({
    name:{
        type:String,
        required:true,
    },
    ShowTime:{
        type:String,
        required:true,
    }

})

//Exports the Movie model
export default model<IMovies>("Movies",schema);