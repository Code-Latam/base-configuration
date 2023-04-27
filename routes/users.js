const Client = require("../models/Client");
const User = require("../models/User");
const utils = require("../utils/utils.js");
const router = require("express").Router();
const bcrypt = require("bcrypt");

//update user
router.post("/update", async (req, res) => {

  if (!utils.gwokenCorrect(req.body, req.body.gwoken))
  {
  res.status(401).json("gwoken verification failed. Please check you gwoken calculation.");
  return
  }
  const client = await Client.findOne({ clientNr: req.body.clientNr })
    if (!client)
     {
      res.status(401).json("client number does not exist");
      return
     }  
  try {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
    const user = await User.findOneAndUpdate({ $and: [{ chatbotKey: req.body.chatbotKey }, { email: req.body.email }] }, {
    $set: req.body});
    if (!user) {res.status(404).json("User has not been updated. Not found!")}
    else { res.status(200).json("User has been updated.") }
  } catch (err) {
    res.status(500).json("An internal server error ocurred. Please check your fields")
  }
} );

//delete user
router.post("/delete", async (req, res) => {
  if (!utils.gwokenCorrect(req.body, req.body.gwoken))
  {
  res.status(401).json("gwoken verification failed. Please check you gwoken calculation.");
  return
  }
  const client = await Client.findOne({ clientNr: req.body.clientNr })
    if (!client)
     {
      res.status(401).json("client number does not exist");
      return
     }  
   try {
    var user = await User.findOneAndDelete({ $and: [{ chatbotKey: req.body.chatbotKey }, { email: req.body.email }] });
    if (!user)
    {
    res.status(404).json("user not found and not deleted");
    }
    else
    {
      res.status(200).json("user has been deleted");
    }
   }
  catch (err) {
    res.status(500).json("An internal server error ocurred. Please check your fields")
    }
});

// Get user one user
router.post("/query", async (req, res) => {

  if (!utils.gwokenCorrect(req.body, req.body.gwoken))
  {
  res.status(401).json("gwoken verification failed. Please check you gwoken calculation.");
  return
  }
  const client = await Client.findOne({ clientNr: req.body.clientNr })
    if (!client)
     {
      res.status(401).json("client number does not exist");
      return
     }  
  try {
    
    const users = await User.findOne({ chatbotKey: req.body.chatbotKey, username: req.body.username });
    if (!users) {res.status(404).json("No user found for this chatbot and name combination")}
    else {res.status(200).json(users) }
    }
    catch (err) {
      res.status(500).json("An internal server error ocurred. Please check your fields")
  }
});


// Get all users for a chatbot
router.post("/queryall", async (req, res) => {

  if (!utils.gwokenCorrect(req.body, req.body.gwoken))
  {
  res.status(401).json("gwoken verification failed. Please check you gwoken calculation.");
  return
  }
  const client = await Client.findOne({ clientNr: req.body.clientNr })
    if (!client)
     {
      res.status(401).json("client number does not exist");
      return
     }  
  try {
    
    const users = await User.find({ chatbotKey: req.body.chatbotKey });
    if (!users) {res.status(404).json("No users found for this chatbot")}
    else {res.status(200).json(users) }
    }
    catch (err) {
      res.status(500).json("An internal server error ocurred. Please check your fields")
  }
});


module.exports = router;
