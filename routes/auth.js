const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

//REGISTER
router.post("/register", async (req, res) => {
  try {
    //generate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);


    //create new user

    const newUser = new User({
      chatbotKey: req.body.chatbotKey,
      username: req.body.username,
      email: req.body.email,
      password:  hashedPassword,
      isAdmin: req.body.isAdmin,
    });

    

    //save user and respond
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err)
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  try {
    // find the user based on the email and the chatbotkey
    const user = await User.findOne({ $and: [{ chatbotKey: req.body.chatbotKey }, { email: req.body.email }] });
    if (!user)
    {
    res.status(404).json("user not found");
    }
    else 
     {
    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if (!validPassword) 
      { res.status(400).json("wrong password") }
    else 
      { res.status(200).json(user)}
     }

    
  } catch (err) {
    res.status(500).json(err)
  }
});

module.exports = router;
