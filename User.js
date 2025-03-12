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






const userSchema = new mongoose.Schema({
  
    email:{
        type:String
        
    },
    password:{
        type:String

    },
    contact:{
        type:String
    },
    wishItems: {
        type: [wishSchema],
        required: true
      },
    

},{timestamps:true})



const User = mongoose.model('User', userSchema)

export default User
