const Client = require("../models/Client");
const Chatbot = require("../models/Chatbot");
const Invite = require("../models/Invitation");
const User = require("../models/User");
const utils = require("../utils/utils.js");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const Explorer = require("../models/Explorer");

const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');



async function sendEmail(toEmail, token, clientNr, ) {
   // Create a transporter object using the default SMTP transport
   let transporter = nodemailer.createTransport({
       host: "smtp.titan.email",  // Replace with your SMTP host
       port: 587,               // Common port for SMTP
       secure: false,           // true for 465, false for other ports
       auth: {
           user: "steven@code-latam.com",  // Your SMTP username
           pass: "Peluche01"      // Your SMTP password
       }
   });

   // Setup email data with unicode symbols
   let mailOptions = {
       from: "NOREPLY", // Sender address
       to: toEmail,  // List of receivers
       subject: 'Invitation to join ' + clientNr + ' in the GWOCU STUDIO',                      // Subject line
       text: `You are invited to join our workspace. Please use the following link to accept the invitation: https://yourdomain.com/accept-invite?token=${token}`,
       html: `<strong>You are invited to join our platform.</strong><br><a href="https://yourdomain.com/accept-invite?token=${token}">Click here to accept the invitation</a>`
   };

   // Send mail with defined transport object
   try {
       let info = await transporter.sendMail(mailOptions);
      return true;
   } catch (error) {
       return false;
   }
}



function verifyToken(token) {
   try {
       // Verify the token using the same secret key
       const decoded = jwt.verify(token, process.env.INVITE_SECRET_KEY);
       return decoded;  // Returns the decoded payload if the token is valid
   } catch (error) {
       // Log the error which could be due to expiration or invalid token
       console.error('Invalid or expired token:', error.message);
       return null;  // Return null if the token is invalid or expired
   }
}




//Invite user

router.post("/invite", async (request, res) => {
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

      if (!req.body.toEmail)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse," toEmail is a required field",req.body.apiPublicKey));
       return
      } 
 
      if (!req.body.chatbotKey)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"chatbotKey is a required field",req.body.apiPublicKey));
       return
      } 


      if (!req.body.explorers)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"explorers is a required field",req.body.apiPublicKey));
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
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"A user with this email already exists. Can't be invited again",req.body.apiPublicKey));
        return
       } 

       

       const secretKey = process.env.INVITE_SECRET_KEY ;
       // Data payload to include in the JWT
       const payload = req.body ;
       
       // Options for the JWT expires in 5 days
       const options = { expiresIn: '5d' };
       
       // Generate a JWT
       const token = jwt.sign(payload, secretKey, options);
       console.log(token);
 
   try 
   {
 
     var chatbot = await Chatbot.findOne({ chatbotKey: req.body.chatbotKey, clientNr: req.body.clientNr })
     if (chatbot) // we found a chatbot so we can create an invite for it
     {
      const filter = {
         chatbotKey: req.body.chatbotKey,
         email: req.body.toEmail
       };
       
       const update = {
         $set: {
           chatbotKey: req.body.chatbotKey, // Included in $set for clarity and completeness
           email: req.body.toEmail,           // Included in $set for clarity and completeness
           explorers: req.body.explorers
         }
       };
       
       const options = {
         new: true, // Ensures that the returned document is the new version
         upsert: true // Creates a new document if no existing document matches the filter
       };
       
      
       const sendresult = await sendEmail(req.body.toEmail, token, req.body.clientNr);
       if (!sendresult)
         {
            res.status(403).json(utils.Encryptresponse(req.encryptresponse,"Failed to send invite email.",req.body.apiPublicKey))
            
            return
         }

      const invite = await Invite.findOneAndUpdate(filter, update, options);
      res.status(200).json(invite);
       
     } 
    else { res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No chatbot found to add this invite to.",req.body.apiPublicKey));}
   } 
   
    catch (err) {
       res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An Internal Server error ocurred",req.body.apiPublicKey));
     }
   
 });

 router.post("/verifytoken", async (request, res) => {
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
 
 
   if (!req.body.token)
      {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"ClientNr is a required field",req.body.apiPublicKey));
      return
      }  

      const result = verifyToken()
      if (result()) 
      {
         res.status(200).json(result) 
      }       
      else 
      { 
         res.status(401).json(utils.Encryptresponse(req.encryptresponse,"Token not valid or expired",req.body.apiPublicKey));
      }

   
 });






//delete user
router.post("/delete", async (request, res) => {
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

     if (!req.body.chatbotKey)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"chatbotKey is a required field",req.body.apiPublicKey));
      return
     } 

     if (!req.body.email)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"email is a required field",req.body.apiPublicKey));
      return
     } 

   try {
    var invite = await Invite.findOneAndDelete({ $and: [{ chatbotKey: req.body.chatbotKey }, { email: req.body.email }] });
    if (!invite)
    {
    res.status(404).json(utils.Encryptresponse(req.encryptresponse,"Invite not found and not deleted",req.body.apiPublicKey));
    }
    else
    {
      res.status(200).json(utils.Encryptresponse(req.encryptresponse,"user has been deleted",req.body.apiPublicKey));
    }
   }
  catch (err) {
    res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
    }
});

// Get user one user
router.post("/queryall", async (request, res) => {

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
 
      if (!req.body.chatbotKey)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"chatbotKey is a required field",req.body.apiPublicKey));
       return
      } 


     
       
  try {
    
    const invitations = await Invite.find({ chatbotKey: req.body.chatbotKey });
    if (!invitations) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No invitations found for this workspace",req.body.apiPublicKey))}
    else {res.status(200).json(invitations) }
    }
    catch (err) {
      res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
  }
});





module.exports = router;
