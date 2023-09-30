const Client = require("../models/Client");
const Link = require("../models/Link");
const utils = require("../utils/utils.js");
const router = require("express").Router();
const bcrypt = require("bcrypt");

// register Task

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
   if (!req.body.workflowName)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"workflowName is a required field",req.body.apiPublicKey));
       return
      } 
 
   if (!req.body.linkId)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"linkId is a required field",req.body.apiPublicKey));
       return
      } 

      if (!req.body.links)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"links is a required object field",req.body.apiPublicKey));
       return
      } 



      const client = await Client.findOne({ clientNr: req.body.clientNr })
      if (!client)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
        return
       } 
       
      const mylink = await Link.findOne({ clientNr: req.body.clientNr,explorerId: req.body.explorerId , linkId: req.body.linkId, workflowName:req.body.workflowName })
      if (mylink)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"A link object with this linkId allready exists for this clientNr, explorer Id and workflowName",req.body.apiPublicKey));
        return
       } 
 
   try 
   {
   
      const newLink = new Link(
         {
           clientNr: req.body.clientNr,
           explorerId: req.body.explorerId,
           workflowName:req.body.workflowName,
           linkId: req.body.linkId,
           links: req.body.links,
         });
         const link = await newLink.save();
         res.status(200).json(link);
      }
   
    catch (err) {
       res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An Internal Server error ocurred",req.body.apiPublicKey));
     }
   
 });

//update task
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

     if (!req.body.workflowName)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"workflowName is a required field",req.body.apiPublicKey));
      return
     } 

     if (!req.body.taskId)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"taskId is a required field",req.body.apiPublicKey));
      return
     } 

     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      }  
      const mytask = await Task.findOne({ clientNr: req.body.clientNr, explorerId: req.body.explorerId, workflowName: req.body.workflowName, taskId: req.body.taskId })
      if (!mytask)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"A task object with this clientNr, explorerId, workflowName and taskId does not exist. Unable to update",req.body.apiPublicKey));
        return
       } 


  try {

    const task = await Task.findOneAndUpdate({ $and: [{ clientNr: req.body.clientNr }, { explorerId: req.body.explorerId }, { taskId: req.body.taskId }, { workflowName: req.body.workflowName }] }, {
    $set: req.body});
    if (!task) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"The task object has not been updated. Not found!",req.body.apiPublicKey))}
    else { res.status(200).json(utils.Encryptresponse(req.encryptresponse,"Task object has been updated.",req.body.apiPublicKey)) }
  } catch (err) {
    res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey));
  }
} );


//delete task
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

     if (!req.body.workflowName)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"workflowName is a required field",req.body.apiPublicKey));
      return
     } 

   

     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      } 
     const mytask = await Task.findOne({ clientNr: req.body.clientNr, explorerId:req.body.explorerId, workflowName:req.body.workflowName ,taskId: req.body.taskId })
      if (!mytask)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"An task object with this clientNr, explorerId, workflowName and taskId does not exist. Unable to delete",req.body.apiPublicKey));
        return
       } 
      
   try {
    var task = await Task.findOneAndDelete({ $and: [{ clientNr: req.body.clientNr }, { explorerId: req.body.explorerId },{workflowName:req.body.workflowName}, { taskId: req.body.taskId }] });
    if (!task)
    {
    res.status(404).json(utils.Encryptresponse(req.encryptresponse,"Task object not found and not deleted",req.body.apiPublicKey));
    }
    else
    {
      res.status(200).json(utils.Encryptresponse(req.encryptresponse,"Task object has been deleted",req.body.apiPublicKey));
    }
   }
  catch (err) {
    res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
    }
});

// Query one task
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

     if (!req.body.workflowName)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"workflowName is a required field",req.body.apiPublicKey));
      return
     } 


     if (!req.body.taskId)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"taskId is a required field",req.body.apiPublicKey));
      return
     } 

     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      } 
     const mytask = await Task.findOne({ clientNr: req.body.clientNr, explorerId:req.body.explorerId ,workflowName: req.body.workflowName,taskId: req.body.taskId })
      if (!mytask)
       {
        res.status(404).json(utils.Encryptresponse(req.encryptresponse,"A task object with this task ID does not exist. Unable to fetch",req.body.apiPublicKey));
        return
       } 
  try {
    
    const tasks = await Task.findOne({ clientNr: req.body.clientNr, explorerId: req.body.explorerId, workflowName:req.body.workflowName ,taskId: req.body.taskId });
    if (!tasks) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No task object found for this clientNr, explorerId and taskId combination",req.body.apiPublicKey))}
    else {res.status(200).json(tasks) }
    }
    catch (err) {
      res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
  }
});


// Query all workflows
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

     if (!req.body.workflowName)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"workflowName is a required field",req.body.apiPublicKey));
      return
     } 

 
      const client = await Client.findOne({ clientNr: req.body.clientNr })
      if (!client)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
        return
       } 
   try {
     
     const tasks = await Task.find({ clientNr: req.body.clientNr, explorerId: req.body.explorerId , workflowName:req.body.workflowName});
     if (!tasks) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No task object found for this clientNr, explorerId and workflowName",req.body.apiPublicKey))}
     else {res.status(200).json(tasks) }
     }
     catch (err) {
       res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
   }
 });


module.exports = router;
