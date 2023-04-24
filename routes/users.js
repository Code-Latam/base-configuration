const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");

//update user
router.post("/update", async (req, res) => {
  const client = await Client.findOne({ clientNr: req.body.clientNr })
    if (!client)
     {
      res.status(401).json("client number does not exist");
      return
     }  
  try {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
    const user = await User.findOneAndUpdate({ $and: [{ chatbotKey: req.body.chatbotKey }, { email: req.body.email }] }, {
    $set: req.body});
    if (!user) {res.status(404).json("User has not been updated. Not found!")}
    else { res.status(200).json("User has been updated.") }
  } catch (err) {
    res.status(500).json(err);
  }
} );

//delete user
router.post("/delete", async (req, res) => 
{
  const client = await Client.findOne({ clientNr: req.body.clientNr })
    if (!client)
     {
      res.status(401).json("client number does not exist");
      return
     }  
   try {
    var user = await User.findOneAndDelete({ $and: [{ chatbotKey: req.body.chatbotKey }, { email: req.body.email }] });
    if (!user)
    {
    res.status(404).json("user not found and not deleted");
    }
    else
    {
      res.status(200).json("user has been deleted");
    }
   }
  catch (err) {
      return res.status(500).json(err);
    }
});

// Get user one user
router.post("/query", async (req, res) => {
  const client = await Client.findOne({ clientNr: req.body.clientNr })
    if (!client)
     {
      res.status(401).json("client number does not exist");
      return
     }  
  try {
    
    const users = await User.findOne({ chatbotKey: req.body.chatbotKey, username: req.body.username });
    if (!users) {res.status(404).json("No user found for this chatbot and name combination")}
    else {res.status(200).json(users) }
    }
    catch (err) {
    res.status(500).json(err);
  }
});


// Get all users for a chatbot
router.post("/queryall", async (req, res) => {
  const client = await Client.findOne({ clientNr: req.body.clientNr })
    if (!client)
     {
      res.status(401).json("client number does not exist");
      return
     }  
  try {
    
    const users = await User.find({ chatbotKey: req.body.chatbotKey });
    if (!users) {res.status(404).json("No users found for this chatbot")}
    else {res.status(200).json(users) }
    }
    catch (err) {
    res.status(500).json(err);
  }
});




//get friends
router.get("/friends/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const friends = await Promise.all(
      user.followings.map((friendId) => {
        return User.findById(friendId);
      })
    );
    let friendList = [];
    friends.map((friend) => {
      const { _id, username, profilePicture } = friend;
      friendList.push({ _id, username, profilePicture });
    });
    res.status(200).json(friendList)
  } catch (err) {
    res.status(500).json(err);
  }
});

//follow a user

router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("user has been followed");
      } else {
        res.status(403).json("you allready follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant follow yourself");
  }
});

//unfollow a user

router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("user has been unfollowed");
      } else {
        res.status(403).json("you dont follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant unfollow yourself");
  }
});

module.exports = router;
