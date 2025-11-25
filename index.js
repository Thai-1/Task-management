const express = require("express");
const bodyParser = require("body-parser");
const database = require("./config/database");
const route = require("./api/v1/routes/index.route");
require("dotenv").config();


const routesApiVer1= require("./api/v1/routes/index.route")

database.connect();

const app = express();
const port = process.env.PORT;

//
app.use(bodyParser.json());

// Routes Version 1
routesApiVer1(app);


app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})