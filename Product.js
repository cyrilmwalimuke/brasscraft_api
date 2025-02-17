import mongoose from 'mongoose'


const productSchema = new mongoose.Schema({
  
    name:{
        type:String
        
    },
    price:{
        type:Number

    },
    category:{
        type:String
    },
    amount:{
        type:Number,
        default:1
    },
    imageUrls:{
        type:Array
    }
    
    

},{timestamps:true})



const Product = mongoose.model('Product', productSchema)

export default Product
