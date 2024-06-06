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



async function sendEmail(toEmail, token, clientNr, url, chatbotKey) {
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

   const svgContent =`
    <svg xmlns="http://www.w3.org/2000/svg" name="svg-container-graph-0" style="height: 400px; width: 650px;"><defs><marker class="marker" id="marker-small" viewBox="0 -5 10 10" refX="0" refY="0" markerWidth="6" markerHeight="6" orient="auto" fill="#d3d3d3"><path d="M0,-5L10,0L0,5"/></marker><marker class="marker" id="marker-small-highlighted" viewBox="0 -5 10 10" refX="0" refY="0" markerWidth="6" markerHeight="6" orient="auto" fill="#03A062"><path d="M0,-5L10,0L0,5"/></marker><marker class="marker" id="marker-medium" viewBox="0 -5 10 10" refX="0" refY="0" markerWidth="6" markerHeight="6" orient="auto" fill="#d3d3d3"><path d="M0,-5L10,0L0,5"/></marker><marker class="marker" id="marker-medium-highlighted" viewBox="0 -5 10 10" refX="0" refY="0" markerWidth="6" markerHeight="6" orient="auto" fill="#03A062"><path d="M0,-5L10,0L0,5"/></marker><marker class="marker" id="marker-large" viewBox="0 -5 10 10" refX="0" refY="0" markerWidth="6" markerHeight="6" orient="auto" fill="#d3d3d3"><path d="M0,-5L10,0L0,5"/></marker><marker class="marker" id="marker-large-highlighted" viewBox="0 -5 10 10" refX="0" refY="0" markerWidth="6" markerHeight="6" orient="auto" fill="#03A062"><path d="M0,-5L10,0L0,5"/></marker></defs><g id="graph-0-graph-container-zoomable" transform="translate(-65,-40.39999999999998) scale(1.2)" style="transition-duration: 0s;"><g><path class="link" d="M98.1895012889572,76.57986131857938 A0,0 0 0,1 98.27435650440913,104.75351372668236" marker-end="url(#marker-small)" id="TLLE,TISC" style="stroke-width: 2; stroke: rgb(211, 211, 211); opacity: 1; fill: none; cursor: pointer; stroke-dasharray: 0; stroke-dashoffset: 0; stroke-linecap: butt;"/></g><g><path class="link" d="M98.29038494287569,131.91310992788402 A0,0 0 0,1 98.11093592337885,163.58706739649045" marker-end="url(#marker-small)" id="TISC,TZJJ" style="stroke-width: 2; stroke: rgb(211, 211, 211); opacity: 1; fill: none; cursor: pointer; stroke-dasharray: 0; stroke-dashoffset: 0; stroke-linecap: butt;"/></g><g><path class="link" d="M105.57855967618558,183.30977647965412 A158.20656713576906,158.20656713576906 0 0,1 263.75692308783226,186.29695462928595" marker-end="url(#marker-small)" id="TZJJ,TSDW" style="stroke-width: 2; stroke: rgb(211, 211, 211); opacity: 1; fill: none; cursor: pointer; stroke-dasharray: 0; stroke-dashoffset: 0; stroke-linecap: butt;"/></g><g><path class="link" d="M283.36607613179297,194.2464852984301 A0,0 0 0,1 283.5820764095922,244.25360756931147" marker-end="url(#marker-small)" id="TSDW,TOXR" style="stroke-width: 2; stroke: rgb(211, 211, 211); opacity: 1; fill: none; cursor: pointer; stroke-dasharray: 0; stroke-dashoffset: 0; stroke-linecap: butt;"/></g><g class="node" cx="98.33332824707031" cy="124.33332824707031" id="TISC" transform="translate(98.33332824707031,124.33332824707031)" style="touch-action: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0);"><path cursor="pointer" opacity="1" d="M7.978845608028654,0A7.978845608028654,7.978845608028654,0,1,1,-7.978845608028654,0A7.978845608028654,7.978845608028654,0,1,1,7.978845608028654,0" fill="blue" stroke="none" stroke-width="1.5"/><text dx="15.5" dy=".35em" fill="#03A062" font-size="12" font-weight="normal" opacity="1">Select Payment Method</text></g><g class="node" cx="98.16667175292969" cy="68.99999237060547" id="TLLE" transform="translate(98.16667175292969,68.99999237060547)" style="touch-action: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0);"><path cursor="pointer" opacity="1" d="M7.978845608028654,0A7.978845608028654,7.978845608028654,0,1,1,-7.978845608028654,0A7.978845608028654,7.978845608028654,0,1,1,7.978845608028654,0" fill="#03A062" stroke="none" stroke-width="1.5"/><text dx="15.5" dy=".35em" fill="#03A062" font-size="12" font-weight="normal" opacity="1">Display Payment Form</text></g><g class="node" cx="283.6666488647461" cy="263.8333282470703" id="TOXR" transform="translate(283.6666488647461,263.8333282470703)" style="touch-action: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0);"><path cursor="pointer" opacity="1" d="M7.978845608028654,0A7.978845608028654,7.978845608028654,0,1,1,-7.978845608028654,0A7.978845608028654,7.978845608028654,0,1,1,7.978845608028654,0" fill="#03A062" stroke="none" stroke-width="1.5"/><text dx="15.5" dy=".35em" fill="#03A062" font-size="12" font-weight="normal" opacity="1">Display Result</text></g><g class="node" cx="283.33333587646484" cy="186.66665267944336" id="TSDW" transform="translate(283.33333587646484,186.66665267944336)" style="touch-action: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0);"><path cursor="pointer" opacity="1" d="M7.978845608028654,0A7.978845608028654,7.978845608028654,0,1,1,-7.978845608028654,0A7.978845608028654,7.978845608028654,0,1,1,7.978845608028654,0" fill="#03A062" stroke="none" stroke-width="1.5"/><text dx="15.5" dy=".35em" fill="#03A062" font-size="12" font-weight="normal" opacity="1">Handle Notification</text></g><g class="node" cx="98.00000762939453" cy="183.16665649414062" id="TZJJ" transform="translate(98.00000762939453,183.16665649414062)" style="touch-action: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0);"><path cursor="pointer" opacity="1" d="M7.978845608028654,0A7.978845608028654,7.978845608028654,0,1,1,-7.978845608028654,0A7.978845608028654,7.978845608028654,0,1,1,7.978845608028654,0" fill="blue" stroke="none" stroke-width="1.5"/><text dx="15.5" dy=".35em" fill="#03A062" font-size="12" font-weight="normal" opacity="1">Process Payment</text></g></g></svg>
  `;


   const htmlBody = `
   <html>
     <head>
       <title>Welcome!</title>
     </head>
     <body>
       <h1>Welcome to ${clientNr} on Gwocu</h1>
       <p>You are invited to join the GWOCU Studio platform. Please find your login details below:</p>
       <ul>
         <li>Client Number: ${clientNr}</li>
         <li>Chatbot Key: ${chatbotKey}</li>
         <li>Email: ${toEmail}</li>
         <li>Password: [Password you set during the acceptance of the invitation]</li>
       </ul>
       <p>Click <a href="${url}?token=${token}">here</a> to accept your invitation and set your password. The invitation will expire in 5 days.</p>
       </body>
   </html>
 `;

   // Setup email data with unicode symbols
   let mailOptions = {
      from: '"GWOCU Studio" <steven@code-latam.com>', // Sender address
      to: toEmail,  // List of receivers
      subject: 'Gwocu',  // Subject line
      text: `You are invited to join our workspace.`,
      html: htmlBody
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
      
      if (!req.body.url)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"url is a required field",req.body.apiPublicKey));
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
       
      
       const sendresult = await sendEmail(req.body.toEmail, token, req.body.clientNr, req.body.url, req.body.chatbotKey);
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

      const result = verifyToken(req.body.token)
      if (result) 
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
