const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const bcrypt = require("bcrypt");
const MongoStore = require("connect-mongo");


//routes
router.get('/sign-up', async (req, res) =>{
    res.render('auth/sign-up.ejs')
})

router.post("/sign-up", async (req, res) => {
    const userInDatabase = await User.findOne({ username: req.body.username });
    //check of unique UserID
    if (userInDatabase) {
        return res.send("Username already taken.");
    }
    //check if two password inputs are the same
    if (req.body.password !== req.body.confirmPassword) {
        return res.send("Password and Confirm Password must match");
    }
    //encrypt password using bcrypt
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    req.body.password = hashedPassword;
    //create users
    const user = await User.create(req.body);

});

router.get("/sign-in", (req, res) => {
    res.render("auth/sign-in.ejs");
});

router.post("/sign-in", async (req, res) => {
    const userInDatabase = await User.findOne({ username: req.body.username });
    //Validates username
    if (!userInDatabase) {
        return res.send("Login failed. Please try again.");
    }
    //checks validity of password
    const validPassword = bcrypt.compareSync(
        req.body.password,
        userInDatabase.password
    );
    if (!validPassword) {
        return res.send("Login failed. Please try again.");
    }

    req.session.user = {
        username: userInDatabase.username,
    };
    
    //once authenticated redirect user to home page
    req.session.save(() => {
        res.redirect("/");
    });    

});

router.get("/sign-out", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });    
  });
  
    

module.exports = router;