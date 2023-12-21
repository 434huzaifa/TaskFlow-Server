require('dotenv').config();
const express = require('express')
const cors = require('cors');
const jwt = require("jsonwebtoken")
const cookie_pares = require("cookie-parser")
const mongoose = require('mongoose');
const moment = require("moment")

const app = express()
const port = process.env.PORT || 5353
app.use(cookie_pares())
app.use(express.json());
app.use(cors({
    origin: [
        'http://localhost:5173',
    ],
    credentials: true
}));

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@saaddb.bmj48ga.mongodb.net/SurveySphere?retryWrites=true&w=majority`
mongoose.connect(uri)