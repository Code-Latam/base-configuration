const router = require("express").Router();
const Client = require("../models/Client");
const Chatbot = require("../models/Chatbot");
const User = require("../models/User");
const utils = require("../utils/utils.js");
const bcrypt = require("bcrypt");

//REGISTER New USER
router.post("/register", async (req, res) => {
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
  try 
  {
    //generate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    var chatbot = await Chatbot.findOne({ chatbotKey: req.body.chatbotKey })
    console.log(chatbot);
    if (chatbot) // we found a chatbot so we can create a user for it
    {
        //create new user
          const newUser = new User(
        {
          chatbotKey: req.body.chatbotKey,
          username: req.body.username,
          email: req.body.email,
          password:  hashedPassword
        });
        const user = await newUser.save();
        res.status(200).json(user);
      
    } 
   else { res.status(404).json("No chatbot found to add this user to.");}
  } 
  
   catch (err) {
      res.status(500).json("An Internal Server error ocurred")
    }
  
});

//LOGIN
router.post("/login", async (req, res) => {

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
    // find the user based on the email and the chatbotkey
    const user = await User.findOne({ $and: [ {chatbotKey: req.body.chatbotKey }, { email: req.body.email }] });
    if (!user)
    {
    res.status(404).json("User not found.");
    }
    else 
     {
    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if (!validPassword) 
      { res.status(401).json("Wrong email or password.") }
    else 
      { res.status(200).json(user)}
     }

    
  } catch (err) {
    res.status(500).json(err)
  }
});

module.exports = router;
