const Client = require("../models/Client");
const router = require("express").Router();
const bcrypt = require("bcrypt");

const dotenv = require("dotenv");



//update client
router.post("/update", async (req, res) => {
  const SECRET_KEY = process.env.SECRET_KEY
  if (req.body.secretKey!= SECRET_KEY)
    { 
      res.status(404).json("Invalid secret key")
      return
    }
  try {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
    const client = await Client.findOneAndUpdate({ clientNr: req.body.clientNr }, {
    $set: req.body});
    if (!client) {res.status(404).json("Client has not been updated. Not found!")}
    else { res.status(200).json("Client has been updated.") }
  } catch (err) {
    res.status(500).json(err);
  }
} );

//delete client
router.post("/delete", async (req, res) => 
{
  const SECRET_KEY = process.env.SECRET_KEY ;
  if (req.body.secretKey!= SECRET_KEY)
  { 
    res.status(404).json("Invalid secret key")
    return
  }

   try {
    var client = await Client.findOneAndDelete({ clientNr: req.body.clientNr  });
    if (!client)
    {
    res.status(404).json("Client not found and not deleted");
    }
    else
    {
      res.status(200).json("Client has been deleted");
    }
   }
  catch (err) {
      return res.status(500).json(err);
    }
});

// Get client one client
router.post("/query", async (req, res) => {
  const SECRET_KEY = process.env.SECRET_KEY ;
  if (req.body.secretKey!= SECRET_KEY)
  { 
    res.status(404).json("Invalid secret key")
    return
  }
  try {
    
    const client = await Client.findOne({ clientNr: req.body.clientNr });
    if (!client) {res.status(404).json("No client found")}
    else {res.status(200).json(client) }
    }
    catch (err) {
    res.status(500).json(err);
  }
});


// Get all clients
router.post("/queryall", async (req, res) => {
  const SECRET_KEY = process.env.SECRET_KEY ;
  if (req.body.secretKey!= SECRET_KEY)
  { 
    res.status(404).json("Invalid secret key")
    return
  }
  if (req.body.secretKey!= SECRET_KEY)
    { 
      res.status(404).json("Invalid secret key")
      return
    }
  try {
    
    const clients = await Client.find();
    if (!clients) {res.status(404).json("No clients found")}
    else {res.status(200).json(clients) }
    }
    catch (err) {
    res.status(500).json(err);
  }
});



router.post("/register", async (req, res) => {
  // const salt = await bcrypt.genSalt(10);
  // const hashedchatbotKey = await bcrypt.hash(req.body.chatbotKey, salt);
  // const hashedopenaiKey = await bcrypt.hash(req.body.openaiKey, salt);

  
  const SECRET_KEY = process.env.SECRET_KEY ;
  if (req.body.secretKey!= SECRET_KEY)
  { 
    res.status(404).json("Invalid secret key")
    return
  }

  try {

    
   //create new Chatbot using chatbot model

    const newClient = new Client({
    clientNr: req.body.clientNr,
    clientToken: req.body.clientToken,
    clientname: req.body.clientname,
    email:  req.body.email,
    password:  req.body.password
    });

    //save chatbot and
    const client = await newClient.save();  

    res.status(200).json(client);
  } catch (err) {
     res.status(500).json("An internal server error ocurred. Please check your fields")
  }
});


module.exports = router;
