const Client = require("../models/Client");
const Workflow = require("../models/Workflow");
const Task = require("../models/Task");
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

      if (!req.body.productName)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"productNameame is a required field",req.body.apiPublicKey));
       return
      } 

      if (!req.body.name)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"name is a required field",req.body.apiPublicKey));
       return
      } 

      if (!req.body.description)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"Description is a required field",req.body.apiPublicKey));
       return
      } 
 

      const client = await Client.findOne({ clientNr: req.body.clientNr })
      if (!client)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
        return
       } 
       
      const myworkflow = await Workflow.findOne({ clientNr: req.body.clientNr, explorerId: req.body.explorerId , productName: req.body.productName, name: req.body.name })
      if (myworkflow)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"A workflow object with this name allready exists for this client, explorer Id and productName",req.body.apiPublicKey));
        return
       } 
 
   try 
   {
   
      const newWorkflow = new Workflow(
         {
           clientNr: req.body.clientNr,
           explorerId: req.body.explorerId,
           productName: req.body.productName,
           name: req.body.name,
           description: req.body.description,
         });
         const workflow = await newWorkflow.save();
         res.status(200).json(workflow);
      }
   
    catch (err) {
       res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An Internal Server error ocurred",req.body.apiPublicKey));
     }
   
 });

//update Workflow
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

     if (!req.body.productName)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"productName is a required field",req.body.apiPublicKey));
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
      const myworkflow = await Workflow.findOne({ clientNr: req.body.clientNr, explorerId: req.body.explorerId, name: req.body.name })
      if (!myworkflow)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"A workflow object with this clientNr, explorerId and name does not exist. Unable to update",req.body.apiPublicKey));
        return
       } 


  try {

    const workflow = await Workflow.findOneAndUpdate({ $and: [{ clientNr: req.body.clientNr }, { explorerId: req.body.explorerId },{ productName: req.body.productName },{ name: req.body.name } ] }, {
    $set: req.body});
    if (!workflow) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"The workflow object has not been updated. Not found!",req.body.apiPublicKey))}
    else { res.status(200).json(utils.Encryptresponse(req.encryptresponse,"Workflow object has been updated.",req.body.apiPublicKey)) }
  } catch (err) {
    res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey));
  }
} );


//delete workflow
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

     if (!req.body.productName)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"productName is a required field",req.body.apiPublicKey));
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
     const myworkflow = await Workflow.findOne({ clientNr: req.body.clientNr, explorerId:req.body.explorerId,productName: req.body.productName ,name: req.body.name })
      if (!myworkflow)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"A Workflow object with this clientNr, explorerId. productName and name does not exist. Unable to delete",req.body.apiPublicKey));
        return
       } 
      
   try {
    var workflow = await Workflow.findOneAndDelete({ $and: [{ clientNr: req.body.clientNr }, { explorerId: req.body.explorerId }, { productName: req.body.productName },{ name: req.body.name }] });
    if (!workflow)
    {
    res.status(404).json(utils.Encryptresponse(req.encryptresponse,"Workflow object not found and not deleted",req.body.apiPublicKey));
    }
    else
    {
      res.status(200).json(utils.Encryptresponse(req.encryptresponse,"Workflow object has been deleted",req.body.apiPublicKey));
    }
   }
  catch (err) {
    res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
    }
});

// Query one Workflow
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

     if (!req.body.productName)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"productName is a required field",req.body.apiPublicKey));
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
     const myworkflow = await Workflow.findOne({ clientNr: req.body.clientNr, explorerId:req.body.explorerId ,productName: req.body.productName, name: req.body.name })
      if (!myworkflow)
       {
        res.status(404).json(utils.Encryptresponse(req.encryptresponse,"An Workflow object with this name does not exist. Unable to fetch",req.body.apiPublicKey));
        return
       } 
  try {
    
    const workflow = await Workflow.findOne({ clientNr: req.body.clientNr, explorerId: req.body.explorerId, productName: req.body.productName, name: req.body.name });
    if (!workflow) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No workflow object found for this clientNr, explorerId, productName and name combination",req.body.apiPublicKey))}
    else {res.status(200).json(workflow) }
    }
    catch (err) {
      res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
  }
});


// Query all workflows given clientNr, explorerId and productName
router.post("/queryallgivenproduct", async (request, res) => {

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

     if (!req.body.productName)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"productName is a required field",req.body.apiPublicKey));
      return
     } 

 
      const client = await Client.findOne({ clientNr: req.body.clientNr })
      if (!client)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
        return
       } 
   try {
     
     const workflows = await Workflow.find({ clientNr: req.body.clientNr,exploreId: req.body.explorerId, productName: req.body.productName});
     if (!workflows) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No Workflow object found for this clientNr, explorerId and productName combination",req.body.apiPublicKey))}
     else {res.status(200).json(workflows) }
     }
     catch (err) {
       res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
   }
 });


 // query all workflows given clientNr and explorerId 
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


     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      } 
  try {
    
    const workflows = await Workflow.find({ clientNr: req.body.clientNr,exploreId: req.body.explorerId});
    if (!workflows) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No Workflow object found for this clientNr, explorerId combination",req.body.apiPublicKey))}
    else {res.status(200).json(workflows) }
    }
    catch (err) {
      res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
  }
});


 router.post("/queryallgraphs", async (request, res) => {

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
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
        return
       } 
   try {
     
     const workflows = await Workflow.find({ clientNr: req.body.clientNr,explorerId: req.body.explorerId});

     if (!workflows) 
      {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No Workflow object found for this clientNr",req.body.apiPublicKey))
      return
      }
     const mygraph = [];

     const fetchNodesForWorkflow = async (workflow) => {
      const tasks = await Task.find({ clientNr: req.body.clientNr,exploreId: req.body.explorerId, workflowName: workflow.name }); // Modify this query as needed
      if (!tasks)
      { 
        return []
      }
      else
      {
      return tasks;
      }
    };

    const fetchLinksForWorkflow = async (workflow) => {
      const links = await Link.findOne(
        { clientNr: req.body.clientNr, explorerId: req.body.explorerId, workflowName: workflow.name }
      );
      if (!links)
      { 

        return {
          links:[]
        }
      }
      else
      {
      return links;
      }
    };
    
     
    for (const workflow of workflows)
     {  
         const myworkflow = 
         {
            name: workflow.name,
            description: workflow.description,
            nodes:[],
            links:[]
         }
         console.log("workflow:")
        console.log(workflow);
         const tasks = await fetchNodesForWorkflow(workflow);
         const mynodes = []

         tasks.forEach((task) =>
            {
            const myNodeObject = { 
              "id": task.taskId, 
              "label": task.name,
              "description": task.description,
              "apiName": task.apiName
            }
            mynodes.push(myNodeObject);
            });

         const links = await fetchLinksForWorkflow(workflow);
         myworkflow.nodes = mynodes; // Populate the nodes array
         myworkflow.links = links.links; // Populate the nodes array
         mygraph.push(myworkflow);

         
    };

    res.status(200).json(utils.Encryptresponse(req.encryptresponse,mygraph,req.body.apiPublicKey))
     }
     catch (err) {
       res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
   }
 });



 router.post("/queryallgraphsgivenproduct", async (request, res) => {

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

    if (!req.body.productName)
    {
     res.status(412).json(utils.Encryptresponse(req.encryptresponse,"productName is a required field",req.body.apiPublicKey));
     return
    } 


     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      } 
  try {
    
    const workflows = await Workflow.find({ clientNr: req.body.clientNr,explorerId: req.body.explorerId, productName: req.body.productName});

    if (!workflows) 
     {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No Workflow object found for this clientNr, explorerId and productName",req.body.apiPublicKey))
     return
     }
    const mygraph = [];

    const fetchNodesForWorkflow = async (workflow) => {
     const tasks = await Task.find({ clientNr: req.body.clientNr,exploreId: req.body.explorerId, workflowName: workflow.name }); // Modify this query as needed
     if (!tasks)
     { 
       return []
     }
     else
     {
     return tasks;
     }
   };

   const fetchLinksForWorkflow = async (workflow) => {
     const links = await Link.findOne(
       { clientNr: req.body.clientNr, explorerId: req.body.explorerId, workflowName: workflow.name }
     );
     if (!links)
     { 

       return {
         links:[]
       }
     }
     else
     {
     return links;
     }
   };
   
    
   for (const workflow of workflows)
    {  
        const myworkflow = 
        {
           name: workflow.name,
           description: workflow.description,
           nodes:[],
           links:[]
        }
        console.log("workflow:")
       console.log(workflow);
        const tasks = await fetchNodesForWorkflow(workflow);
        const mynodes = []

        tasks.forEach((task) =>
           {
           const myNodeObject = { 
             "id": task.taskId, 
             "label": task.name,
             "description": task.description,
             "apiName": task.apiName
           }
           mynodes.push(myNodeObject);
           });

        const links = await fetchLinksForWorkflow(workflow);
        myworkflow.nodes = mynodes; // Populate the nodes array
        myworkflow.links = links.links; // Populate the nodes array
        mygraph.push(myworkflow);

        
   };

   res.status(200).json(utils.Encryptresponse(req.encryptresponse,mygraph,req.body.apiPublicKey))
    }
    catch (err) {
      res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
  }
});




router.post("/queryonegraph", async (request, res) => {

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

    if (!req.body.productName)
    {
     res.status(412).json(utils.Encryptresponse(req.encryptresponse,"productName is a required field",req.body.apiPublicKey));
     return
    } 

    if (!req.body.name)
    {
     res.status(412).json(utils.Encryptresponse(req.encryptresponse,"name of the workflow is a required field",req.body.apiPublicKey));
     return
    } 


     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      } 
  try {
    
    const workflows = await Workflow.find({ clientNr: req.body.clientNr,explorerId: req.body.explorerId, productName: req.body.productName, name: req.body.name});

    if (!workflows) 
     {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No Workflow object found for this clientNr, explorerId and productName",req.body.apiPublicKey))
     return
     }
    const mygraph = [];

    const fetchNodesForWorkflow = async (workflow) => {
     const tasks = await Task.find({ clientNr: req.body.clientNr,exploreId: req.body.explorerId, workflowName: workflow.name }); // Modify this query as needed
     if (!tasks)
     { 
       return []
     }
     else
     {
     return tasks;
     }
   };

   const fetchLinksForWorkflow = async (workflow) => {
     const links = await Link.findOne(
       { clientNr: req.body.clientNr, explorerId: req.body.explorerId, workflowName: workflow.name }
     );
     if (!links)
     { 

       return {
         links:[]
       }
     }
     else
     {
     return links;
     }
   };
   
    
   for (const workflow of workflows)
    {  
        const myworkflow = 
        {
           name: workflow.name,
           description: workflow.description,
           nodes:[],
           links:[]
        }
        console.log("workflow:")
       console.log(workflow);
        const tasks = await fetchNodesForWorkflow(workflow);
        const mynodes = []

        tasks.forEach((task) =>
           {
           const myNodeObject = { 
             "id": task.taskId, 
             "label": task.name,
             "description": task.description,
             "apiName": task.apiName
           }
           mynodes.push(myNodeObject);
           });

        const links = await fetchLinksForWorkflow(workflow);
        myworkflow.nodes = mynodes; // Populate the nodes array
        myworkflow.links = links.links; // Populate the nodes array
        mygraph.push(myworkflow);

        
   };

   res.status(200).json(utils.Encryptresponse(req.encryptresponse,mygraph,req.body.apiPublicKey))
    }
    catch (err) {
      res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
  }
});

module.exports = router;
