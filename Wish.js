import mongoose from 'mongoose'


const wishSchema = new mongoose.Schema({
  
    name:{
        type:String
        
    },
    price:{
        type:Number

    },
    img:{
        type:String
    },
    category:{
        type:String
    },
    amount:{
        type:Number
    },
    
    
    
    

},{timestamps:true})



const Wish = mongoose.model('Wish', wishSchema)

export default Wish
