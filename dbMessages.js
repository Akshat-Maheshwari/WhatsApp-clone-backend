const mongoose = require('mongoose')

const messageSchema=new mongoose.Schema({
  name:String,
  message:String,
  timeStamp:String
})

export default mongoose.model('Message',messageSchema)
