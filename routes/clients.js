const Client = require("../models/Client");
const Folder = require("../models/Folder");
const utils = require("../utils/utils.js");
const router = require("express").Router();
const bcrypt = require("bcrypt");

const dotenv = require("dotenv");



//update client
router.post("/update", async (req, res) => {

  const SECRET_KEY = process.env.SECRET_KEY
  if (req.body.secretKey!= SECRET_KEY)
    { 
      res.status(404).json("Invalid secret key")
      return
    }
  try {
    if (req.body.password)
    {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
    } 
    if (req.body.clientToken)
    {
    const salt2 = await bcrypt.genSalt(10);
    req.body.clientToken = await bcrypt.hash(req.body.clientToken, salt2);
    }

    const client = await Client.findOneAndUpdate({ clientNr: req.body.clientNr }, {
    $set: req.body});
    if (!client) {res.status(404).json("Client has not been updated. Not found!")}
    else { res.status(200).json("Client has been updated.") }
  } catch (err) {
    res.status(500).json("An internal server error ocurred. Please check your fields")
  }
} );

//delete client
router.post("/delete", async (req, res) => {

  const SECRET_KEY = process.env.SECRET_KEY ;
  if (req.body.secretKey!= SECRET_KEY)
  { 
    res.status(404).json("Invalid secret key")
    return
  }

   try {
    var client = await Client.findOneAndDelete({ clientNr: req.body.clientNr  });
    if (!client)
    {
    res.status(404).json("Client not found and not deleted");
    }
    else
    {
      res.status(200).json("Client has been deleted");
    }
   }
  catch (err) {
    res.status(500).json("An internal server error ocurred. Please check your fields")
    }
});

// Get client one client
router.post("/query", async (req, res) => {

  const SECRET_KEY = process.env.SECRET_KEY ;
  if (req.body.secretKey!= SECRET_KEY)
  { 
    res.status(404).json("Invalid secret key")
    return
  }
  try {
    
    const client = await Client.findOne({ clientNr: req.body.clientNr });
    if (!client) {res.status(404).json("No client found")}
    else {res.status(200).json(client) }
    }
    catch (err) {
      res.status(500).json("An internal server error ocurred. Please check your fields")
  }
});


// Get all clients
router.post("/queryall", async (req, res) => {

  const SECRET_KEY = process.env.SECRET_KEY ;
  if (req.body.secretKey!= SECRET_KEY)
  { 
    res.status(404).json("Invalid secret key")
    return
  }
  if (req.body.secretKey!= SECRET_KEY)
    { 
      res.status(404).json("Invalid secret key")
      return
    }
  try {
    
    const clients = await Client.find();
    if (!clients) {res.status(404).json("No clients found")}
    else {res.status(200).json(clients) }
    }
    catch (err) {
      res.status(500).json("An internal server error ocurred. Please check your fields")
  }
});



router.post("/register", async (req, res) => {
 console.log("WE ARE IN REGISTER APUI");
  const salt = await bcrypt.genSalt(10);
  const hashedpassword = await bcrypt.hash(req.body.password, salt);

  const salt2 = await bcrypt.genSalt(10);
  const hashedclienttoken = await bcrypt.hash(req.body.clientToken, salt2);
  

  
  const SECRET_KEY = process.env.SECRET_KEY ;
  if (req.body.secretKey!= SECRET_KEY)
  { 
    res.status(404).json("Invalid secret key")
    return
  }

  var client = await Client.findOne({ clientNr: req.body.clientNr  });
    if (client)
    {
    res.status(404).json("Client allready exists");
    return
    }

  try {

    
   //create new client using client model

    const newClient = new Client({
    clientNr: req.body.clientNr,
    clientToken: req.body.clientToken,
    clientname: req.body.clientname,
    email:  req.body.email,
    password:  hashedpassword,
    gwoken:req.body.gwoken,
    endtoend:req.body.endtoend,
    logo: req.body.logo,
    url: req.body.url
    });

    //save client and
    const client = await newClient.save();  

    // create folders to store APIS for client
    const documentStructure = {
      clientNr: req.body.clientNr,
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
    console.log("hello1");
    try {
      const folder = await newFolder.save();
      console.log('Folder created:', folder);
    } catch (error) {
      console.error('Error creating folder:', error);
    }


    res.status(200).json(client);
  } catch (err) {
     res.status(500).json("An internal server error ocurred. Please check your fields")
  }
});


module.exports = router;
