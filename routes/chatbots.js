const router = require("express").Router();
const Chatbot = require("../models/Chatbot");
const bcrypt = require("bcrypt");

//REGISTER
router.post("/register", async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const hashedchatbotKey = await bcrypt.hash(req.body.chatbotKey, salt);
  const hashedopenaiKey = await bcrypt.hash(req.body.openaiKey, salt);

  try {
    //create new Chatbot using chatbot model

    const newChatbot = new Chatbot({
    chatbotKey: hashedchatbotKey,
    openaiKey: hashedopenaiKey,
    name:  req.body.name,
    email:  req.body.email,
    public:  req.body.public,
    paid:  req.body.paid,
    enabled:  req.body.enabled,
    promptTemplate:  req.body.promptTemplate,
    idEnroller:  req.body.idEnroller,
    });

    

    //save chatbot and respond
    const chatbot = await newChatbot.save();
    res.status(200).json(chatbot);
  } catch (err) {
    res.status(500).json(err)
  }
});

// Get base config info for a chatbot

// Get base config info for one chatbot
router.post("/query", async (req, res) => {
  const chatbotKey = req.body.chatbotKey;
  const name = req.body.name;
  try {
    const chatbot = await Chatbot.findOne(({ $or: [{ chatbotKey: chatbotKey }, { name: name }] }))
    const { password, updatedAt, ...other } = chatbot._doc;
    res.status(200).json(other);
  } 
  catch (err) {
    res.status(500).json(err);
  }
});

// Get base config info for all chatbot
router.post("/queryall", async (req, res) => {
  
  try {
    const chatbots = await Chatbot.find();
    res.status(200).json(chatbots);
  } 
  catch (err) {
    res.status(500).json(err);
  }
});



//delete chatbot
router.post("/delete", async (req, res) => {
  const name = req.body.name;
    try {
      await Chatbot.findOneAndDelete({ $and: [{ chatbotKey: req.body.chatbotKey }, { name: name }] });
      res.status(200).json("Account has been deleted");
    } catch (err) {
      return res.status(500).json(err);
    }
  } );
  
 
  //update chatbot
router.post("/update", async (req, res) => {
  const name = req.body.name;
  const oldchatbotkey = req.body.chatbotKey;
    if (req.body.chatbotKey) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.chatbotKey = await bcrypt.hash(req.body.chatbotKey, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    if (req.body.openaiKey) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.openaiKey = await bcrypt.hash(req.body.openaiKey, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }

    try {
      
      const chatbot = await Chatbot.findOneAndUpdate({ $and: [{ chatbotKey: oldchatbotkey }, { name: name }] }, {
        $set: req.body,
      });
      res.status(200).json("Account has been updated");
    } catch (err) {
      return res.status(500).json(err);
    }
  } );




module.exports = router;