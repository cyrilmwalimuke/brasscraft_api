import mongoose from 'mongoose'


const visitorSchema = new mongoose.Schema({
  
    visitorCount:{
        type:Number,
        default:0
        
    },
    name:{
        type:String
    }
    
    

},{timestamps:true})



const Visitor = mongoose.model('Visitor', visitorSchema)

export default Visitor
