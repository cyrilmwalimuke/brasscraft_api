import mongoose from 'mongoose'

// Define the schema for a cart item
const cartItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  img: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  id: {
    type: Number,
    required: true,
  
  },
  


});

// Define the schema for the cart
const OrderSchema = new mongoose.Schema({
  userRef: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  cartItems: {
    type: [cartItemSchema],
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  deliveryFee: {
    type: Number,
    required: true
  },
  pickUpStation: {
    type: String,
    required: true
  },
  

  
});

// Create the Cart model from the schema
const Order = mongoose.model('Order', OrderSchema);
export default Order
