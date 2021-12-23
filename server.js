//Require
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const Pusher = require("pusher");



//App config
const app = express()
const port = process.env.PORT || 9000

app.use(express.json())
app.use(cors())

//DB config
const connection_url="mongodb+srv://akshat-admin:Sbi%402019@cluster0.niydb.mongodb.net/whatsappDB";
mongoose.connect(connection_url)

const pusher = new Pusher({
  appId: "1320476",
  key: "9071e1e45399ef2cbfe7",
  secret: "e27bc0355726dae3b217",
  cluster: "ap2",
  useTLS: true
});


const messageSchema=new mongoose.Schema({
  name:String,
  message:String,
  timeStamp:String,
  received:Boolean
})

const Message = mongoose.model('Message',messageSchema)
const db = mongoose.connection;
db.once("open", ()=>{
  console.log("DB connected");

  const msgCollection = db.collection("messages");
  const changeStream = msgCollection.watch();
  changeStream.on("change",(change)=>{
    if(change.operationType === "insert"){
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted",{
        name:messageDetails.name,
        message: messageDetails.message,
        timeStamp: messageDetails.timeStamp,
        received: messageDetails.received
      })
    }else{
      console.log("Error triggering pusher")
    }
  })
})

app.get("/",(req,res)=>{
  res.send("Hello World");
})
app.post("/messages/new", (req,res)=>{
  const dbmessage = req.body;
  Message.create(dbmessage,(err, data)=>{
    if(err) res.send(err)
    else res.send(data)
  })
})
app.get("/messages/sync",(req,res)=>{
  Message.find((err,data)=>{
    if(err) res.send(err)
    else res.send(data)
  })
})


//Listen
app.listen(port,()=>{
  console.log(`Server is up and running on localhost:${port}`)
})
