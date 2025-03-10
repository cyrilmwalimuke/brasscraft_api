import express from 'express'
import mongoose from 'mongoose'
import axios from 'axios'
import cors from 'cors'
import Order from './order.js'
import User from './User.js'
import { errorHandler } from './error.js'
import jwt from 'jsonwebtoken';
import Product from './Product.js'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'


dotenv.config()


const PORT = process.env.PORT || 10000;
const app = express()

app.use(express.json())
app.use(cors())




mongoose.connect(process.env.MONGO_URL).then(()=>console.log("connected to mongodb")).catch((err)=>console.log(err))


let token
console.log(token)

app.get('/',(req,res)=>{
  res.json("app is running fine")
})

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







app.post('/sign-up', async (req,res,next)=>{
  const {email,password} = req.body
  const newUser = new User({email,password})
  try {
     await newUser.save()
      res.json('new user created')
      console.log("new user created")
      
  } catch (error) {
      next(errorHandler(409,'user already exists!'))
  }

})

app.post('/login',async(req,res,next)=>{
  const {email} = req.body
try {
  const validUser = await User.findOne({email})
  if (!validUser) return next(errorHandler(404, 'User not found!'));
  const token =jwt.sign({id:validUser._id},process.env.JWT_SECRET)
  const {password:pass,...rest} = validUser._doc
  res.cookie('access_token',token,{httpOnly:true}).status(200).json(rest)
} catch (error) {
  console.log(error)
  
}
})


const generateBasicAuthToken = () => {
  return "Basic " + Buffer.from(process.env.PAYHERO_URL).toString("base64");
};

app.post('/pay-hero',async(req,res)=>{
  const { amount, phone_number, channel_id, external_reference } = req.body;
  console.log(req.body)
  

  const PAYHERO_API_URL = "https://backend.payhero.co.ke/api/v2/payments";
const CALLBACK_URL = "https://your-ngrok-url.ngrok-free.app/callback";
  try {
   const response = await axios.post(
    PAYHERO_API_URL,
    {
      amount: parseFloat(amount),
      phone_number,
      channel_id,
      provider: "m-pesa",
      external_reference,
      callback_url: CALLBACK_URL,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: generateBasicAuthToken(),
      },
    }
  );

  res.json({ success: true, data: response.data });
} catch (error) {
  console.error("Payment Error:", error.response ? error.response.data : error.message);
  res.json({
    success: false,
    message: error.response ? error.response.data : "Payment request failed",
  });
}


}

)





app.post('/add-product',async (req,res)=>{
  const {name,price,category,imageUrls}=req.body;
  const product = new Product({name,price,category,imageUrls});
  await product.save();
  res.json("new product created")
})

app.get('/get', async(req,res)=>{
  const products = await Product.find({});
  res.json(products)
})


app.post("/forgot-password-email",async(req,res)=>{
  const {email} = req.body
  console.log(email)

  const user = await User.findOne({email})
  if(!user){
    res.json('no user found')
    return 
    
  }
  token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
console.log(token)
  const resetLink = ` https://8d88-102-222-145-127.ngrok-free.app/forgot-password-2/${token}`;
  console.log(resetLink)

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "cyrilmwalimuke@gmail.com", // Replace with your Gmail email
      pass: process.env.NODEMAILER_PASS, // Replace with your App Password
    },
  });
  
  // Email options
  const mailOptions = {
    from: "okwomicyril@gmail.com",
    to: email,
    subject: "Password Reset",
    
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link is valid for 1 hour.</p>`,
   
    
  };
  
  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
res.json('check out your email to proceed')


})



app.post("/forgot-password-2/:token", async (req, res) => {
  const { token} = req.params;
  const { newPassword } = req.body;

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  console.log(user)
  if (!user) return res.status(400).json({ message: "Invalid token" });
  user.password = newPassword;
  await user.save();

 
});

// newsletter
app.post("/newsletter",async(req,res)=>{
  const {email} = req.body
  console.log(email)



  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "cyrilmwalimuke@gmail.com", // Replace with your Gmail email
      pass: process.env.NODEMAILER_PASS, // Replace with your App Password
    },
  });
  
  // Email options
  const mailOptions = {
    from: "okwomicyril@gmail.com",
    to: email,
    subject: "Welcome to BrassCraft – You're In!",
    
    html: `<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to BrassCraft</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #d4af37;
        }
        p {
            color: #555;
            font-size: 16px;
            line-height: 1.5;
        }
        .btn {
            background-color: #d4af37;
            color: #fff;
            text-decoration: none;
            padding: 12px 20px;
            font-size: 18px;
            border-radius: 5px;
            display: inline-block;
            margin-top: 15px;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #888;
        }
    </style>
</head>
<body>

    <div class="container">
        <h1>Welcome to BrassCraft! 🎉</h1>
        <p>Thank you for subscribing! You’re now part of our exclusive circle, where you'll receive:</p>
        <ul style="text-align: left; padding: 0 20px; color: #555; font-size: 16px;">
            <li>✨ First access to new jewelry collections</li>
            <li>💎 Exclusive subscriber-only offers</li>
            <li>🎨 Styling tips and inspiration</li>
        </ul>
        <p>We can’t wait to share our latest designs with you!</p>
        <a href="https://brasscraft.com/shop" class="btn">Explore Our Collection</a>
        
        <p class="footer">
            If you ever wish to unsubscribe, you can do so anytime <a href="#">here</a>.
        </p>
    </div>

</body>
</html>`,
   
    
  };
  
  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });



})




app.listen(PORT,()=>{console.log("app is running on port 10000")

})
