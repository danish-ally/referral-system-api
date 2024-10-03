const express = require('express');
const app = express();
app.disable("x-powered-by");
const { port } = require("./common/config/key");
require('dotenv').config() ;
const cors = require('cors');
const connectDB = require('./common/config/db');
const referralLinkRoutes = require('./referral-link/routes/referralLinkRoutes');
const PlanRoute = require('./Plan/routes/PlanRoutes')
const externalRoutes = require("./External/routes/ExternalRoutes");
const InfluencerRoute = require('./Influencer/route/InfluencerRoute');
const ReferredStudent = require('./Referred-student/routes/referredStudentRoutes');
const StudentPlanMapping = require('./StudentPlanMapping/routes/studentPlanMappingroutes');
const planlog = require('./log/route/planLogRoute');
const LeadRoute = require('./Lead/route/leadRoutes');

// basic actions
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//swaggerImport
const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerJSDocs = YAML.load("./api.yaml");

// Routes
app.use("/api/v1/external",externalRoutes);
app.use("/api/v1/referral-link", referralLinkRoutes);
app.use("/api/v1/plan", PlanRoute);
app.use("/api/v1/referred-student", ReferredStudent);
app.use("/api/v1/studentplanmapping", StudentPlanMapping);
app.use("/api/v1/lead", LeadRoute);


// Swagger
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerJSDocs));

// Database  configuration goes here
connectDB();


app.use("/api/v1/influencer", InfluencerRoute)
app.use("/api/v1/log", planlog)



//starting server
app.listen(port, () => {
    console.log(`Server Running on ${port} ✅`);
    console.log("You can have Api docs from here ➡️  http://localhost:9006/api-docs/ and after clicking on this link select HTTP")
});


module.exports = app;
