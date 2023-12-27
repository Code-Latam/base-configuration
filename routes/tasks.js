const Client = require("../models/Client");
const Task = require("../models/Task");
const Link = require("../models/Link");
const utils = require("../utils/utils.js");
const router = require("express").Router();
const bcrypt = require("bcrypt");

function removeNodeConnections(nodeId, connections) {
   return connections.filter(connection => connection.source !== nodeId && connection.target !== nodeId);
}

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
 
   if (!req.body.taskId)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"taskId is a required field",req.body.apiPublicKey));
       return
      } 

   if (!req.body.name)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"name is a required field",req.body.apiPublicKey));
       return
      } 
      if (!req.body.description)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"description is a required field",req.body.apiPublicKey));
       return
      } 

      
 

      const client = await Client.findOne({ clientNr: req.body.clientNr })
      if (!client)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
        return
       } 
       
      const mytask = await Task.findOne({ clientNr: req.body.clientNr,explorerId: req.body.explorerId , taskId: req.body.taskId, workflowName:req.body.workflowName })
      if (mytask)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"A task object with this task ID allready exists for this clientNr, explorer Id and workflowName",req.body.apiPublicKey));
        return
       } 
 
   try 
   {
   
      const newTask = new Task(
         {
           clientNr: req.body.clientNr,
           explorerId: req.body.explorerId,
           workflowName:req.body.workflowName,
           taskId: req.body.taskId,
           name: req.body.name,
           description:req.body.description,
           complianceDescription:req.body.complianceDescription,
           apiName: req.body.apiName,
           x:req.body.x,
           y:req.body.y
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
    // first try to delete the task 
    var task = await Task.findOneAndDelete({ $and: [{ clientNr: req.body.clientNr }, { explorerId: req.body.explorerId },{workflowName:req.body.workflowName}, { taskId: req.body.taskId }] });
    if (!task)
    {
    res.status(404).json(utils.Encryptresponse(req.encryptresponse,"Task object not found and not deleted",req.body.apiPublicKey));
    }
    else
    {
      // now try to remove all the links associated with that node in the workflow

      // firts fetch the current links object for the workflow

      const mylink = await Link.findOne({ $and: [{ clientNr: req.body.clientNr }, { explorerId: req.body.explorerId },{workflowName:req.body.workflowName}] });

      const mylinksList = mylink.links;

      const myNewLinkList = removeNodeConnections( req.body.taskId,mylinksList);

      const myLinkUpdatebody = {
         clientnr: req.body.clientNr,
         explorerId: req.body.explorerId,
         workflowName: req.body.workflowName,
         links: myNewLinkList
      }

      const link = await Link.findOneAndUpdate({ $and: [{ clientNr: req.body.clientNr }, { explorerId: req.body.explorerId }, { workflowName: req.body.workflowName }] }, {
         $set: myLinkUpdatebody});

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
      res.status(418).json(utils.Encryptresponse(req.encryptresponse,"ClientNr is a required field",req.body.apiPublicKey));
      return
     }  

     if (!req.body.explorerId)
     {
      res.status(413).json(utils.Encryptresponse(req.encryptresponse,"explorerId is a required field",req.body.apiPublicKey));
      return
     } 

     if (!req.body.workflowName)
     {
      res.status(414).json(utils.Encryptresponse(req.encryptresponse,"workflowName is a required field",req.body.apiPublicKey));
      return
     } 


     if (!req.body.taskId)
     {
      res.status(415).json(utils.Encryptresponse(req.encryptresponse,"taskId is a required field",req.body.apiPublicKey));
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
