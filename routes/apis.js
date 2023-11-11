const Client = require("../models/Client");
const Api = require("../models/Api");
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
 

      if (!req.body.name)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"name is a required field",req.body.apiPublicKey));
       return
      } 

 

      const client = await Client.findOne({ clientNr: req.body.clientNr })
      if (!client)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
        return
       } 
       
      const mytask = await Task.findOne({ clientNr: req.body.clientNr,explorerId: req.body.explorerId , taskId: req.body.taskId })
      if (mytask)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"A task object with this task ID allready exists for this client and explorer Id",req.body.apiPublicKey));
        return
       } 
 
   try 
   {
   
      const newTask = new Task(
         {
           clientNr: req.body.clientNr,
           explorerId: req.body.explorerId,
           taskId: req.body.taskId,
           name: req.body.name,
           apiId: req.body.apiId,
           parentTasks: req.body.parentTasks,
           childrenTasks: req.body.childrenTasks
         });
         const task = await newTask.save();
         res.status(200).json(task);
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


     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      }  
      const mytask = await Task.findOne({ clientNr: req.body.clientNr, explorerId: req.body.explorerId, taskId: req.body.taskId })
      if (!mytask)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"A task object with this task ID does not exist. Unable to update",req.body.apiPublicKey));
        return
       } 


  try {

    const task = await Task.findOneAndUpdate({ $and: [{ clientNr: req.body.clientNr }, { taskId: req.body.taskId }] }, {
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


     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      } 
     const mytask = await Task.findOne({ clientNr: req.body.clientNr, explorerId:req.body.explorerId,taskId: req.body.taskId })
      if (!mytask)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"An task object with this task ID does not exist. Unable to delete",req.body.apiPublicKey));
        return
       } 
      
   try {
    var task = await Task.findOneAndDelete({ $and: [{ clientNr: req.body.clientNr }, { taskId: req.body.taskId }] });
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

     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      } 
  try {
    
    const api = await Api.findOne({ clientNr: req.body.clientNr, name: req.body.name });
    if (!api) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No API object found for this clientNr and name combination",req.body.apiPublicKey))}
    else {res.status(200).json(api) }
    }
    catch (err) {
      res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
  }
});


// Query one explorer
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


      const client = await Client.findOne({ clientNr: req.body.clientNr })
      if (!client)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
        return
       } 
   try {
     
     const Apis = await Api.find({ clientNr: req.body.clientNr});
     if (!Apis) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No API objects found for this clientNr",req.body.apiPublicKey))}
     else {res.status(200).json(Apis) }
     }
     catch (err) {
       res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
   }
 });


module.exports = router;
