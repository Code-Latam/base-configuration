const Client = require("../models/Client");
const Explorer = require("../models/Explorer");
const PromptTemplate = require("../models/PromptTemplate");
const Chatbot = require("../models/Chatbot");
const ChatbotExplorerRel = require("../models/ChatbotExplorerRel");
const Folder = require("../models/Folder");
const User = require("../models/User");
const Product = require("../models/Product");
const Workflow = require("../models/Workflow");
const Task = require("../models/Task");
const Link = require("../models/Link");
const CustomUserApi = require("../models/CustomUserApi");
const Api = require("../models/Api");
const Chathistory = require("../models/Chathistory");



const Yaml = require("../models/Yaml");
const utils = require("../utils/utils.js");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const { errorMonitor } = require("crawler");

function generateRandomString(length) {
   const characters = 'abcdefghijklmnopqrstuvwxyz';
   let result = '';
   for (let i = 0; i < length; i++) {
     const randomIndex = Math.floor(Math.random() * characters.length);
     result += characters[randomIndex];
   }
   return result;
 }

// Create workspace

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
 
      if (!req.body.explorerId)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"explorerId is a required field",req.body.apiPublicKey));
       return
      } 

      if (!req.body.email)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"email is a required field",req.body.apiPublicKey));
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
        res.status(402).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
        return
       } 
       
      const myexplorer = await Explorer.findOne({ clientNr: req.body.clientNr, explorerId: req.body.explorerId })
      if (myexplorer)
       {
        res.status(403).json(utils.Encryptresponse(req.encryptresponse,"An workspace object with this explorerId allready exists for this client",req.body.apiPublicKey));
        return
       } 

       const user = await User.findOne({ chatbotKey: req.body.chatbotKey, email: req.body.email });
       if (!user) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No user found for this chatbot and email combination",req.body.apiPublicKey))}
      

 // Create a new explorer for the workspace
   try 
   {

      if (!req.body.yaml)
      { // Yaml not provided, take default value

         const yaml = await Yaml.findOne({ yamlId: "1" });
         req.body.yaml = yaml.yaml ;

      }
   
      const newExplorer = new Explorer(
         {
           clientNr: req.body.clientNr,
           explorerId: req.body.explorerId,
           name: req.body.explorerId,
           description: "New Workspace " + req.body.explorerId,
           yaml: req.body.yaml,
         });
         const explorer = await newExplorer.save();
        
      }
   
    catch (err) {
       res.status(501).json(utils.Encryptresponse(req.encryptresponse,"An explorer for this workspace could not be created",req.body.apiPublicKey));
     }

     
 // create two new chatbots for the workspace
 // get some properties that are needed first    
 const prompttemplate = await PromptTemplate.findOne({ promptId: "1" });
 const myrandomstring = generateRandomString(10);
 const chatbotmaster = await Chatbot.findOne({ chatbotKey: req.body.chatbotKey})
 
 // create first chatbot
     try 
   {
     
    const mychatbotdesigner = {
      clientNr: req.body.clientNr,
      chatbotKey:  "designerchatbot" + myrandomstring,
      openaiKey: "No Key",
      descriptiveName:  "designer chatbot for workspace " + req.body.explorerId,
      name:  "designerchatbot" + myrandomstring,
      email:  req.body.email,
      initialPassword: "Password01",
      publicbot:  false,
      paid:  true,
      enabled:  true,
      isAdminModule: false,
      chatbotMaster: chatbotmaster.chatbotMaster,
      promptTemplate:  prompttemplate.promptTemplate || "",
      idEnroller:  req.body.email,
      }
      console.log("before new");
      console.log(mychatbotdesigner);
      const chatbotDesigner = new Chatbot(mychatbotdesigner);
      console.log("after new");
        
         
            const chatbot = await chatbotDesigner.save();
      }
   
    catch (err) {
       // if there was an error roll back previous step. Delete the explorer
       await Explorer.findOneAndDelete({ $and: [{ clientNr: req.body.clientNr }, { explorerId: req.body.explorerId }] });
       res.status(501).json(utils.Encryptresponse(req.encryptresponse,"An error occurred when creating the designer chatbot. Action rolled back",req.body.apiPublicKey));
       return
      }


      // create second chatbot
      try 
      {
   
      
            const chatbotreader = new Chatbot({
               clientNr: req.body.clientNr,
               chatbotKey:  "readerchatbot" + myrandomstring,
               openaiKey: "No Key",
               descriptiveName:  "reader chatbot for workspace " + req.body.explorerId,
               name:  "readerchatbot" + myrandomstring,
               email:  req.body.email,
               initialPassword: "Password01",
               publicbot:  false,
               paid:  true,
               enabled:  true,
               isAdminModule: false,
               chatbotMaster: chatbotmaster.chatbotMaster,
               promptTemplate:  prompttemplate.promptTemplate || "",
               idEnroller:  req.body.email,
               });
           
            
               const chatbot2 = await chatbotreader.save();
         }
      
       catch (err) {
          // if there was an error roll back previous step. 
          // - Delete the explorer
          await Explorer.findOneAndDelete({ $and: [{ clientNr: req.body.clientNr }, { explorerId: req.body.explorerId }] });
      
          // - Delete designer chatbot

          await Chatbot.findOneAndDelete(
            {
              $and: [        
                  { chatbotKey: "designerchatbot" + myrandomstring },
                  { clientNr: req.body.clientNr }
              ]
            });
   
          res.status(501).json(utils.Encryptresponse(req.encryptresponse,"An error occurred when creating the reader chatbot. Action rolled back",req.body.apiPublicKey));
          return
        }

        try{
            const chatbotExplorerRel = new ChatbotExplorerRel(
               {
                  clientNr: req.body.clientNr,
                  explorerId: req.body.explorerId,
                  chatbotKeyDesigner: "designerchatbot" + myrandomstring,
                  chatbotKeyReader: "readerchatbot" + myrandomstring

               }
            )
            await chatbotExplorerRel.save();

        }
        catch (err)
        {
            // if there was an error roll back previous step. 
           // - Delete the explorer
           await Explorer.findOneAndDelete({ $and: [{ clientNr: req.body.clientNr }, { explorerId: req.body.explorerId }] });
      
           // - Delete designer chatbot
 
           await Chatbot.findOneAndDelete(
             {
               $and: [        
                   { chatbotKey: "designerchatbot" + myrandomstring },
                   { clientNr: req.body.clientNr }
               ]
             });
          // - Delete reader chatbot
            await Chatbot.findOneAndDelete(
              {
                $and: [        
                    { chatbotKey: "readerchatbot" + myrandomstring },
                    { clientNr: req.body.clientNr }
                ]
              });
          res.status(501).json(utils.Encryptresponse(req.encryptresponse,"An error occurred when creating the relationship between the chatbots and workspace. Action rolled back",req.body.apiPublicKey));
          return
        }
// make folder structure for this explorerId
        try{
         const documentStructure = {
            clientNr: req.body.clientNr,
            explorerId: req.body.explorerId,
            items: {
              root: {
                index: "root",
                isFolder: true,
                children: ["MyFolders", "Unassigned"],
                data: "Root item"
              },
              Unassigned: {
                index: "Unassigned",
                isFolder: true,
                children: [],
                data: "Unassigned Apis"
              },
              MyFolders: {
                index: "MyFolders",
                isFolder: true,
                children: [],
                data: "MyFolders"
              },
            },
          };
      
          
      
          const newFolder = new Folder(documentStructure);
          await newFolder.save();
        }
        catch(err)
        {
              // if there was an error roll back previous step. 
              await Explorer.findOneAndDelete({ $and: [{ clientNr: req.body.clientNr }, { explorerId: req.body.explorerId }] });
      
              // - Delete designer chatbot
    
              await Chatbot.findOneAndDelete(
                {
                  $and: [        
                      { chatbotKey: "designerchatbot" + myrandomstring },
                      { clientNr: req.body.clientNr }
                  ]
                });
             // - Delete reader chatbot
               await Chatbot.findOneAndDelete(
                 {
                   $and: [        
                       { chatbotKey: "readerchatbot" + myrandomstring },
                       { clientNr: req.body.clientNr }
                   ]
                 });

          // - delete explorer chatbot relation

          await ChatbotExplorerRel.findOneAndDelete(
            {
              $and: [        
                  { explorerId: req.body.explorerId},
                  { clientNr: req.body.clientNr }
              ]
            });
   
          res.status(501).json(utils.Encryptresponse(req.encryptresponse,"An error occurred when creating the folder structure for the workspace. Action rolled back",req.body.apiPublicKey));
          return
        }
// add explorerId to array of explorers
        try {

        await User.findOneAndUpdate(
          { chatbotKey: req.body.chatbotKey, email: req.body.email },  // Query: matches documents based on chatbotKey only
          { $push: { explorers: { 
              name: req.body.explorerId, 
              designer: false, 
              owner: true, 
              reader: false 
            } } }  // Update: pushes a new object into the explorers array
      );


        }

        catch(err)
        {

           // if there was an error roll back previous step. 
           await Explorer.findOneAndDelete({ $and: [{ clientNr: req.body.clientNr }, { explorerId: req.body.explorerId }] });
      
           // - Delete designer chatbot
 
           await Chatbot.findOneAndDelete(
             {
               $and: [        
                   { chatbotKey: "designerchatbot" + myrandomstring },
                   { clientNr: req.body.clientNr }
               ]
             });
          // - Delete reader chatbot
            await Chatbot.findOneAndDelete(
              {
                $and: [        
                    { chatbotKey: "readerchatbot" + myrandomstring },
                    { clientNr: req.body.clientNr }
                ]
              });

       // - delete explorer chatbot relation

       await ChatbotExplorerRel.findOneAndDelete(
         {
           $and: [        
               { explorerId: req.body.explorerId},
               { clientNr: req.body.clientNr }
           ]
         });

      // delete folder structure

        await Folder.findOneAndDelete(
          {
            $and: [        
                { explorerId: req.body.explorerId},
                { clientNr: req.body.clientNr }
            ]
          });

         res.status(501).json(utils.Encryptresponse(req.encryptresponse,"An error occurred when creating the users explorer list for the workspace. Action rolled back",req.body.apiPublicKey));
         return
        }
   // everything was succesful return 200

   res.status(200).json(utils.Encryptresponse(req.encryptresponse,"Workspace created",req.body.apiPublicKey));
   return
 });

//update explorer


//delete workspace
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


  if (!req.body.clientNr)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"ClientNr is a required field",req.body.apiPublicKey));
      return
     }  

     if (!req.body.explorerId)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"explorerId is a required field",req.body.apiPublicKey));
      return
     } 

     if (!req.body.email)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"email is a required field",req.body.apiPublicKey));
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
       res.status(402).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      } 

     if (req.body.explorerId == "1") 
     {
      res.status(403).json(utils.Encryptresponse(req.encryptresponse,"The default workspace (1) canot be deleted",req.body.apiPublicKey));
      return
     }
      

      const user = await User.findOne({ chatbotKey: req.body.chatbotKey, email: req.body.email });
      if (!user) {
        res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No user found for this chatbot and email combination",req.body.apiPublicKey))
        return
      }
     


  
   try {
      
      await Explorer.findOneAndDelete({ $and: [{ clientNr: req.body.clientNr }, { explorerId: req.body.explorerId }] });
      
      const explorerchatrel = await ChatbotExplorerRel.findOne({ clientNr: req.body.clientNr, explorerId: req.body.explorerId });
      

      await Chatbot.findOneAndDelete(
        {
          $and: [        
              { chatbotKey: explorerchatrel.chatbotKeyDesigner },
              { clientNr: req.body.clientNr }
          ]
        });

      await Chathistory.deleteMany ({ chatbotKey: explorerchatrel.chatbotKeyDesigner });   

      await Chatbot.findOneAndDelete(
        {
          $and: [        
              { chatbotKey: explorerchatrel.chatbotKeyReader },
              { clientNr: req.body.clientNr }
          ]
        });

      await Chathistory.deleteMany ({ chatbotKey: explorerchatrel.chatbotKeyReader });

      await ChatbotExplorerRel.findOneAndDelete(
        {
          $and: [        
              { explorerId: req.body.explorerId},
              { clientNr: req.body.clientNr }
          ]
        });

      await Folder.findOneAndDelete(
        {
          $and: [        
              { explorerId: req.body.explorerId},
              { clientNr: req.body.clientNr }
          ]
        });

        await Product.deleteMany (
          {
            $and: [        
                { explorerId: req.body.explorerId},
                { clientNr: req.body.clientNr }
            ]
          });

        await Workflow.deleteMany (
          {
            $and: [        
                { explorerId: req.body.explorerId},
                { clientNr: req.body.clientNr }
            ]
          });

        await Task.deleteMany (
          {
            $and: [        
                { explorerId: req.body.explorerId},
                { clientNr: req.body.clientNr }
            ]
          });

        await Link.deleteMany (
          {
            $and: [        
                { explorerId: req.body.explorerId},
                { clientNr: req.body.clientNr }
            ]
          });

        await CustomUserApi.deleteMany (
          {
            $and: [        
                { explorerId: req.body.explorerId},
                { clientNr: req.body.clientNr }
            ]
          });

        await Api.deleteMany (
          {
            $and: [        
                { explorerId: req.body.explorerId},
                { clientNr: req.body.clientNr }
            ]
          });

          // remove explorerId from the explorer array of all users that have this chatbot

          await User.updateMany(
            { chatbotKey: req.body.chatbotKey },  // Query: specifies the documents by chatbotKey and email
            { $pull: { explorers: { name: req.body.explorerId } } }  // Update: removes objects from explorers where name matches explorerId
        );
        

   }
  catch (err) {
    res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
    return  
  }
  res.status(200).json(utils.Encryptresponse(req.encryptresponse,"Workspace deleted",req.body.apiPublicKey));
  return
});

router.post("/exist", async (request, res) => {

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

     if (!req.body.explorerId)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"explorerId is a required field",req.body.apiPublicKey));
      return
     } 

     

     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(402).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      } 

   try {
    const explorer = await Explorer.findOne({ $and: [{ clientNr: req.body.clientNr }, { explorerId: req.body.explorerId }] });
    if (!explorer)
    {
    res.status(404).json(utils.Encryptresponse(req.encryptresponse,"Explorer object not found",req.body.apiPublicKey));
    }
    else
    {
      res.status(200).json(utils.Encryptresponse(req.encryptresponse,"Explorer object has been found",req.body.apiPublicKey));
    }
   }
  catch (err) {
    res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
    }
});



module.exports = router;
