const router = require("express").Router();
const Client = require("../models/Client");
const Chatbot = require("../models/Chatbot");
const User = require("../models/User");
const utils = require("../utils/utils.js");
const bcrypt = require("bcrypt");

//REGISTER New USER
router.post("/register", async (request, res) => {
  const req = await utils.getDecodedBody(request);

  if (!req.endtoendPass)
     {
      res.status(401).json(utils.Encryptresponse(req.encryptresponse,"End to end encryption required or end to end encryption not correct",req.body.apiPublicKey));
      return
     }  

  if (!req.gwokenPass)
     {
      res.status(401).json(utils.Encryptresponse(req.encryptresponse,"Gwoken required or GWOKEN calculation not correct",req.body.apiPublicKey));
      return
     }  


  if (!req.body.clientNr)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"ClientNr is a required field",req.body.apiPublicKey));
      return
     }  

     if (!req.body.chatbotKey)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"chatbotKey is a required field",req.body.apiPublicKey));
      return
     } 
     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      } 
      
      const user = await User.findOne({ chatbotKey: req.body.chatbotKey, email: req.body.email })
     if (user)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"A user with this email allready exists for this chatbot",req.body.apiPublicKey));
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
          password:  hashedPassword,
          groups: req.body.groups,
          explorers: req.body.explorers,
        });
        const user = await newUser.save();
        res.status(200).json(user);
      
    } 
   else { res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No chatbot found to add this user to.",req.body.apiPublicKey));}
  } 
  
   catch (err) {
      res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An Internal Server error ocurred",req.body.apiPublicKey));
    }
  
});

//LOGIN
router.post("/login", async (request, res) => {

  const req = await utils.getDecodedBody(request);

  if (!req.endtoendPass)
     {
      res.status(401).json(utils.Encryptresponse(req.encryptresponse,"End to end encryption required or end to end encryption not correct",req.body.apiPublicKey));
      return
     }  

  if (!req.gwokenPass)
     {
      res.status(401).json(utils.Encryptresponse(req.encryptresponse,"Gwoken required or GWOKEN calculation not correct",req.body.apiPublicKey));
      return
     }  


  if (!req.body.clientNr)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"ClientNr is a required field",req.body.apiPublicKey));
      return
     }  
  if (!req.body.appname)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"appname is a required field",req.body.apiPublicKey));
      return
     }   

     if (req.body.explorer)
     {
      var targetExplorer = [req.body.explorer]
     } 
     else
      { var targetExplorer = []}
     
      

  if (!req.body.chatbotKey)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"chatbotKey is a required field",req.body.apiPublicKey));
      return
     } 
     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      }  

  try {


    // find the user based on the email and the chatbotkey
    const user = await User.findOne({ $and: [ {chatbotKey: req.body.chatbotKey }, { email: req.body.email }] });
    if (!user)
    {
    res.status(404).json(utils.Encryptresponse(req.encryptresponse,"User not found.",req.body.apiPublicKey));
    }
    else 
    {
      const validPassword = await bcrypt.compare(req.body.password, user.password)
      if (!validPassword) 
      { 
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"Wrong email or password.",req.body.apiPublicKey)) 
      }
      else 
      { 
        // now check if access to the application is granted
        console.log("USER VALIDATED, CHECKING APP ACCESS RIGHTS");
        console.log(req.body.appname);
        console.log(user.groups);
        console.log(user.explorers);
        console.log(targetExplorer);
        if (utils.hasAccessRights(req.body.appname, user.groups, user.explorers, targetExplorer))
          {
          res.status(200).json(utils.Encryptresponse(req.encryptresponse,user,req.body.apiPublicKey))
          }
        else
          {
          res.status(401).json(utils.Encryptresponse(req.encryptresponse,"User has no access to this application.",req.body.apiPublicKey)) 
          }
      }
    }
    
  } catch (err) {
    res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An Internal unspecified error occured",req.body.apiPublicKey));
  }
});

module.exports = router;
