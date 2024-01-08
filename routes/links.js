const Client = require("../models/Client");
const Task = require("../models/Task");
const Api = require("../models/Api");
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
       
      const mylink = await Link.findOne({ clientNr: req.body.clientNr,explorerId: req.body.explorerId , workflowName:req.body.workflowName })
      if (mylink)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"A link object with this clientNr, explorer Id and workflowName allready exists",req.body.apiPublicKey));
        return
       } 
 
   try 
   {
   
      const newLink = new Link(
         {
           clientNr: req.body.clientNr,
           explorerId: req.body.explorerId,
           workflowName:req.body.workflowName,
           links: req.body.links,
         });
         const link = await newLink.save();
         res.status(200).json(link);
      }
   
    catch (err) {
       res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An Internal Server error ocurred",req.body.apiPublicKey));
     }
   
 });

//update link
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


     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      }  
      const mylink = await Link.findOne({ clientNr: req.body.clientNr, explorerId: req.body.explorerId, workflowName: req.body.workflowName})
      if (!mylink)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"A link object with this clientNr, explorerId, workflowName does not exist. Unable to update",req.body.apiPublicKey));
        return
       } 


  try {

    const link = await Link.findOneAndUpdate({ $and: [{ clientNr: req.body.clientNr }, { explorerId: req.body.explorerId }, { workflowName: req.body.workflowName }] }, {
    $set: req.body});
    if (!link) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"The link object has not been updated. Not found!",req.body.apiPublicKey))}
    else { res.status(200).json(utils.Encryptresponse(req.encryptresponse,"Link object has been updated.",req.body.apiPublicKey)) }
  } catch (err) {
    res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey));
  }
} );


//delete link
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
     const mylink = await Link.findOne({ clientNr: req.body.clientNr, explorerId:req.body.explorerId, workflowName:req.body.workflowName  })
      if (!mylink)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"An link object with this clientNr, explorerId, workflowName does not exist. Unable to delete",req.body.apiPublicKey));
        return
       } 
      
   try {
    var link = await Link.findOneAndDelete({ $and: [{ clientNr: req.body.clientNr }, { explorerId: req.body.explorerId },{workflowName:req.body.workflowName}] });
    if (!link)
    {
    res.status(404).json(utils.Encryptresponse(req.encryptresponse,"Link object not found and not deleted",req.body.apiPublicKey));
    }
    else
    {
      res.status(200).json(utils.Encryptresponse(req.encryptresponse,"Link object has been deleted",req.body.apiPublicKey));
    }
   }
  catch (err) {
    res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
    }
});

// Query one workflow for its links
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


     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      } 
     const mylink = await Link.findOne({ clientNr: req.body.clientNr, explorerId:req.body.explorerId ,workflowName: req.body.workflowName })
      if (!mylink)
       {
        res.status(404).json(utils.Encryptresponse(req.encryptresponse,"A link object with this workfloName does not exist. Unable to fetch",req.body.apiPublicKey));
        return
       } 
  try {
    
    const links = await Link.findOne({ clientNr: req.body.clientNr, explorerId: req.body.explorerId, workflowName:req.body.workflowName });
    if (!links) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No link object found for this clientNr, explorerId and workflowName combination",req.body.apiPublicKey))}
    else {res.status(200).json(links) }
    }
    catch (err) {
      res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
  }
});

router.post("/querysourcesandtargets", async (request, res) => {

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
     const mylink = await Link.findOne({ clientNr: req.body.clientNr, explorerId:req.body.explorerId ,workflowName: req.body.workflowName })
      if (!mylink)
       {
        res.status(404).json(utils.Encryptresponse(req.encryptresponse,"A link object with this workfloName does not exist. Unable to fetch",req.body.apiPublicKey));
        return
       } 
  try {
    
    const link = await Link.findOne({ clientNr: req.body.clientNr, explorerId: req.body.explorerId, workflowName:req.body.workflowName });
    if (!link) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No link object found for this clientNr, explorerId and workflowName combination",req.body.apiPublicKey))}
    else 
    {
      const linksList = link.links
      // now construct an array of sources and of targets
      
      const sources = [];
      const targets = [];

      linksList.forEach(obj => {
      sources.push(obj.source);
      targets.push(obj.target);
      });

      res.status(200).json({sources: sources, targets: targets}) 
    }
    }
    catch (err) {
      res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
  }
});

// Query one workflow for all of its links, get all the apis
router.post("/queryorderedapi", async (request, res) => {

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
      const mylink = await Link.findOne({ clientNr: req.body.clientNr, explorerId:req.body.explorerId ,workflowName: req.body.workflowName })
       if (!mylink)
        {
         res.status(404).json(utils.Encryptresponse(req.encryptresponse,"A link object with this workfloName does not exist. Unable to fetch",req.body.apiPublicKey));
         return
        } 
   try {
     
     const link = await Link.findOne({ clientNr: req.body.clientNr, explorerId: req.body.explorerId, workflowName:req.body.workflowName });
     if (!link) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No link object found for this clientNr, explorerId and workflowName combination",req.body.apiPublicKey))}
     else 
     
     {
      // first order the tasks in an array
      const taskNames = findOrder(link);
      console.log("TAKNAMES");
      console.log(taskNames);
      // Now make an array of the assoicated api names
      const apiNamesArray = [];
      for (const taskName of taskNames) {
         const taskData = await Task.findOne({ clientNr: req.body.clientNr, explorerId:req.body.explorerId, taskId:taskName, workflowName:req.body.workflowName })
         if (taskData) {
           apiNamesArray.push(taskData.apiName);
         }
       }
       const apiObjectsArray = [];

       for (const apiName of apiNamesArray) {
         if (apiName === "") {
           apiObjectsArray.push({});
         } else {
           const apiData = await Api.findOne({ clientNr: req.body.clientNr, name: apiName });
           if (apiData) {
             apiObjectsArray.push(apiData);
           }
         }
       }

      res.status(200).json(utils.Encryptresponse(req.encryptresponse,apiObjectsArray,req.body.apiPublicKey)) 
     }
   }
     catch (err) {
       res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
   }




   function findOrder(link) {
      // Create a map to store the tasks and their dependencies
      const taskMap = new Map();
      
      // Populate the taskMap with tasks and their dependencies
      for (const linkObj of link.links) {
          const source = linkObj.source;
          const target = linkObj.target;
          
          if (!taskMap.has(source)) {
              taskMap.set(source, { task: source, dependencies: [] });
          }
          
          if (!taskMap.has(target)) {
              taskMap.set(target, { task: target, dependencies: [] });
          }
          
          taskMap.get(target).dependencies.push(source);
      }
      
      const result = [];
      const visited = new Set();
      const visiting = new Set();
      let hasCycle = false;
      
      function visit(task) {
          if (visiting.has(task)) {
              hasCycle = true;
          }
          if (!visited.has(task) && !hasCycle) {
              visiting.add(task);
              for (const dependency of taskMap.get(task).dependencies) {
                  visit(dependency);
              }
              visiting.delete(task);
              visited.add(task);
              result.push(task);
          }
      }
      
      for (const task of taskMap.keys()) {
          visit(task);
      }
      
      if (hasCycle) {
          return "Cycle detected, cannot determine order.";
      } else {
          return result;
      }
  }
  
  

 });



module.exports = router;
