require('dotenv').config();
const path = require("path");
const express = require("express");
const userRouter = require("./routes/userRoute");
const db = require('./db');

// Sets up the process.env file for use

const app = express();
const PORT = process.env.PORT || 3000;

// implements built-in api to accept and parse form data (content-type: application/x-www-form-urlencoded)
// implemtns built-in api to parse content-type: application/json
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// uses native path package to get the absolute path to the "public". Then sends it to the client. 
//app.use(express.static(path.join (__dirname, './view/public')));

// uses the routes specified in the routes.js file.
app.use('/api/user', userRouter);
app.get('/*', (req, res) => res.send('defualt page')); 


app.listen(PORT, ()=> console.log(`listening of PORT ${PORT}`));