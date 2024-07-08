const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const session = require('express-session');
const MongoStore = require("connect-mongo");


dotenv.config();

//contollers
const authController = require("./controllers/auth.js");


//constants
const app = express();

// Set the port from environment variable or default to 3000
const port = process.env.PORT ? process.env.PORT : "3000";


// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(morgan('dev'));

app.use(session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
      }),
    })
);

app.get('/', async (req, res) => {
    res.render('index.ejs', {
        user: req.session.user,
      })
});

//Authenitication
app.use("/auth", authController);

app.get("/vip-lounge", (req, res) => {
    if (req.session.user) {
      res.send(`Welcome to the party ${req.session.user.username}.`);
    } else {
      res.send("Sorry, no guests allowed.");
    }
  });


//connect to mongoDB
const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('connected')
        app.listen(port, () => {
            console.log(`Server connected on port: ${port}`)
        })               
    } catch (error) {
        console.log(error)         
    }
}

connect()

// app.listen(port, () => {
//   console.log(`The express app is ready on port ${port}!`);
// });
