import express from 'express'
import mongoose from 'mongoose'
import axios from 'axios'
import cors from 'cors'
import Order from './order.js'
import User from './User.js'
import { errorHandler } from './error.js'
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
import IntaSend from "intasend-node";
import Product from './Product.js'


dotenv.config()

const intasend = new IntaSend("ISPubKey_live_48e76b14-a0d7-463e-abd5-edca9a3a8c07", "ISSecretKey_live_58f1dcd9-9769-49ea-bc94-90f0d300cf3f", true);

const INTA_SEND_API_KEY = "ISSecretKey_live_58f1dcd9-9769-49ea-bc94-90f0d300cf3f" ;
const INTA_SEND_API_URL = "https://api.intasend.com/v1/checkout/";

const app = express()

app.use(express.json())
app.use(cors())

let token
let basicAuthToken




mongoose.connect('mongodb+srv://cyrilmwalimuke:Kr9KySKT0aUfZlNc@brasscraft.3iys1.mongodb.net/?retryWrites=true&w=majority&appName=brasscraft').then(()=>console.log("connected to mongodb")).catch((err)=>console.log(err))


app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
    });
  });

app.post('/create-order',(req,res)=>{
    const {
        userRef,
        amount,
        cartItems,
        total,
        firstName,
        lastName,
        address,
        contact,
        deliveryFee,
        pickUpStation,



    } = req.body
    res.status(200).json("new order created")
    // console.log(req.body)
    

    const newOrder = new Order(
        {  

       userRef,
        amount,
        cartItems,
        total,
        firstName,
        lastName,
        address,
        contact,
        deliveryFee,
        pickUpStation,
    })
    try {
        newOrder.save()
        res.status(201).json("order saved succesfully")
        
    } catch (error) {
        
    }
})



app.get('/orders',async(req,res)=>{
    const allOrders  = await Order.find({})
    // console.log(allOrders)
    res.status(200).json(allOrders)
    // console.log(allOrders)
})
app.post('/create-user',(req,res)=>{
    const {firstName,lastName}= req.body
    const newUser = new User({firstName,lastName})
    try {
        newUser.save()
        res.status(201).json("new user created successfully")
        // console.log(newUser)
        
    } catch (error) {
        // console.log(error)
        
    }


})



const generateToken =async(res,req,next) =>{
  const secret = "VGG6SG6SK3QhKKyvpNC0p60VTVTAden9NiN7jWKsqZyclptmhOmL1ZHYTixe8zrg";
  const consumer = "eRFLuwLACviRoaB0lp4YSqtxzoQy0QzM1zAEYAfYLlJrmD5e";
  const auth = new Buffer.from(`${consumer}:${secret}`).toString("base64");
  await axios
    .get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          authorization: `Basic ${auth}`,
        },
      }
    )
    .then((data) => {
      token = data.data.access_token;
      // console.log(data.data);
      // console.log(token)
      next();
    })
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err.message);
    });



}

app.post("/stkPush",generateToken, async(req,res)=>{
  const shortCode = 174379;
  const phone = req.body.phone.substring(1);
  const amount = req.body.amount;
  console.log(phone,amount)
  const passkey ="bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
  const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

  const date = new Date();
  const timestamp =
    date.getFullYear() +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    ("0" + date.getDate()).slice(-2) +
    ("0" + date.getHours()).slice(-2) +
    ("0" + date.getMinutes()).slice(-2) +
    ("0" + date.getSeconds()).slice(-2);
  const password = new Buffer.from(shortCode + passkey + timestamp).toString(
    "base64"
  );
  const data = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: `254${phone}`,
    PartyB: 174379,
    PhoneNumber: `254${phone}`,
    CallBackURL: "https://mydomain.com/path",
    AccountReference: "Mpesa Test",
    TransactionDesc: "Testing stk push",
  };

  await axios
    .post(url, data, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
    .then((data) => {
      console.log(data.data);
      res.status(201).json(data.data);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err.message);
    });
})



app.post('/sign-up', async (req,res,next)=>{
  const {email,password} = req.body
  const newUser = new User({email,password})
  try {
     await newUser.save()
      res.json('new user created')
      
  } catch (error) {
      next(errorHandler(409,'user already exists!'))
  }

})

app.post('/login',async(req,res,next)=>{
  const {email} = req.body
try {
  const validUser = await User.findOne({email})
  if (!validUser) return next(errorHandler(404, 'User not found!'));
  const token =jwt.sign({id:validUser._id},process.env.JWTSECRET)
  const {password:pass,...rest} = validUser._doc
  res.cookie('access_token',token,{httpOnly:true}).status(200).json(rest)
} catch (error) {
  console.log(error)
  
}
})



app.post("/stkpushquery", generateToken, async (req, res) => {
  const CheckoutRequestID = req.body.CheckoutRequestID;
  console.log(CheckoutRequestID)

  const date = new Date();
  const timestamp =
    date.getFullYear() +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    ("0" + date.getDate()).slice(-2) +
    ("0" + date.getHours()).slice(-2) +
    ("0" + date.getMinutes()).slice(-2) +
    ("0" + date.getSeconds()).slice(-2);
  const shortCode = 174379;
  const passkey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";

  const password = new Buffer.from(shortCode + passkey + timestamp).toString(
    "base64"
  );

  await axios

    .post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query",
      {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: CheckoutRequestID,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((responce) => {
      res.status(200).json(responce.data);
    })
    .catch((err) => {
      console.log(err.message);
      res.status(400).json(err);
    });
});


app.post('/add-product',async (req,res)=>{
  const {name,price,category,imageUrls}=req.body;
  const product = new Product({name,price,category});
  await product.save();
  res.json("new product created")
})

app.get('/get', async(req,res)=>{
  const products = await Product.find({});
  res.json(products)
})






app.listen(3000,()=>{console.log("app is running on port 3000")

})
