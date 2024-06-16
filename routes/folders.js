const Client = require("../models/Client");
const Folder = require("../models/Folder");
const Api = require("../models/Api");
const utils = require("../utils/utils.js");
const folderutils = require("../utils/folderutils.js");
const router = require("express").Router();
const bcrypt = require("bcrypt");

// register explorer

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
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"clientNr is a required field",req.body.apiPublicKey));
       return
      } 

      if (!req.body.explorerId)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"explorerId is a required field",req.body.apiPublicKey));
       return
      }    
      
      if (!req.body.items)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"items is a required field",req.body.apiPublicKey));
       return
      } 
 

      const client = await Client.findOne({ clientNr: req.body.clientNr })
      if (!client)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"clientNr does not exist",req.body.apiPublicKey));
        return
       } 
   try 
   {
   
      const newFolder = new Folder(
         {
           clientNr: req.body.clientNr,
           explorerId: req.body.explorerId,
           items: req.body.items
         });
         const folder = await newFolder.save();
         res.status(200).json(utils.Encryptresponse(req.encryptresponse,folder,req.body.apiPublicKey));

      }
   
    catch (err) {
       res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An Internal Server error ocurred",req.body.apiPublicKey));
     }
   
 });

//update explorer
router.post("/update", async (request, res) => {

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


if (!req.body.items)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"items is a required field",req.body.apiPublicKey));
       return
      } 

  try {

    const folder = await Folder.findOneAndUpdate({ clientNr: req.body.clientNr, explorerId: req.body.explorerId }, {
    $set: req.body});
    if (!folder) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"The folder object has not been updated. Not found!",req.body.apiPublicKey))}
    else { res.status(200).json(utils.Encryptresponse(req.encryptresponse,"folder object has been updated.",req.body.apiPublicKey)) }
  } catch (err) {
    res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey));
  }
} );


//delete folder
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
  

     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"clientNr does not exist",req.body.apiPublicKey));
       return
      } 
      
   try {
    var folder = await Folder.findOneAndDelete({  clientNr: req.body.clientNr, explorerId: req.body.explorerId  }, { _id: 0 });
    if (!folder)
    {
    res.status(404).json(utils.Encryptresponse(req.encryptresponse,"folder object not found and not deleted",req.body.apiPublicKey));
    }
    else
    {
      res.status(200).json(utils.Encryptresponse(req.encryptresponse,"folder object has been deleted",req.body.apiPublicKey));
    }
   }
  catch (err) {
    res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
    }
});


router.post("/query", async (request, res) => {

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
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"clientNr does not exist",req.body.apiPublicKey));
       return
      } 
  try {
    
    const folders = await Folder.findOne({ clientNr: req.body.clientNr, explorerId: req.body.explorerId}, { _id: 0 });
    if (!folders) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No folder object found for this clientNr and explorerId combination",req.body.apiPublicKey))}
    else 
    {
      res.status(200).json(utils.Encryptresponse(req.encryptresponse,folders,req.body.apiPublicKey));
      
    }
    }
    catch (err) {
      res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
  }
});


router.post("/sync", async (request, res) => {

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
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"clientNr does not exist",req.body.apiPublicKey));
        return
       } 
   try {
     var items;
     const folders = await Folder.findOne({ clientNr: req.body.clientNr, explorerId: req.body.explorerId}, { _id: 0 });
     if (!folders) 
     { // no folders found. Create the folders

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
       items = documentStructure.items
     }
     else
     {
        items = folders.items
     }


     // // fetch apis and sync the folder structure with them
     var myNewItems = items
     const Apis = await Api.find({ clientNr: req.body.clientNr, explorerId: req.body.explorerId});
     if (Apis)
      {
         Apis.forEach(api => {
            const apiName = api.name;
            const apifound = folderutils.findApiInFolder(items, apiName);
            if (!apifound)
            {
               myNewItems = folderutils.addChildToFolder(apiName, "Unassigned", myNewItems );
            }
        
          });
      }

      console.log("MY NEW ITEMS");
      console.log(myNewItems);
      await Folder.findOneAndUpdate({clientNr:req.body.clientNr, explorerId: req.body.explorerId}, { $set: { items: myNewItems } })
      res.status(200).json(utils.Encryptresponse(req.encryptresponse,"SYNC COMPLETED",req.body.apiPublicKey))

     }
     catch (err) {
       res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
   }
 });

 
 


module.exports = router;
