require('dotenv').config();
const express = require('express')
const cors = require('cors');
const jwt = require("jsonwebtoken")
const cookie_pares = require("cookie-parser")
const mongoose = require('mongoose');
const moment = require("moment");
const {Tasks}=require("./Schema");
const app = express();
const port = process.env.PORT || 5353;
app.use(cookie_pares());
app.use(express.json());
app.use(cors({
    origin: [
        'http://localhost:5173',
    ],
    credentials: true
}));

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@saaddb.bmj48ga.mongodb.net/TaskFlow?retryWrites=true&w=majority`;
mongoose.connect(uri);

async function logger(req, res, next) {
    let date = new Date()
    console.log(date.toLocaleString("en-US"), ":", req.method, ":", req.url);
    next()
}

const isThisToken = async (req, res, next) => {
    const token = req?.cookies?.tasky;
    if (!token) {
        return res.status(401).send({ message: "Unauthorized" })
    }
    jwt.verify(token, process.env.TOKEN, (error, decoded) => {
        if (error) {
            return res.status(401).send({ message: "Unauthorized" })
        }
        req.user = decoded
        next()
    })
}

const taskData = [
    {
        email: 'user1@example.com',
        title: 'Task 1',
        details: 'Details for Task 1',
        expire: new Date('2023-12-31T12:00:00'), // Include time (12:00 PM)
        priority: 'High',
    },
    {
        email: 'user2@example.com',
        title: 'Task 2',
        details: 'Details for Task 2',
        status: 'Completed',
        expire: new Date('2023-11-15T15:30:00'), // Include time (3:30 PM)
        priority: 'Normal',
    },
    {
        email: 'user3@example.com',
        title: 'Task 3',
        details: 'Details for Task 3',
        expire: new Date('2023-10-01T08:45:00'), // Include time (8:45 AM)
        priority: 'Low',
    },
    {
        email: 'user1@example.com',
        title: 'Task 4',
        details: 'Details for Task 4',
        status: 'In Progress',
        expire: new Date('2024-02-28T18:00:00'), // Include time (6:00 PM)
        priority: 'High',
    },
    {
        email: 'user2@example.com',
        title: 'Task 5',
        details: 'Details for Task 5',
        expire: new Date('2023-09-20T10:00:00'), // Include time (10:00 AM)
        priority: 'Normal',
    },
    {
        email: 'user3@example.com',
        title: 'Task 6',
        details: 'Details for Task 6',
        expire: new Date('2023-11-30T14:20:00'), // Include time (2:20 PM)
        priority: 'Low',
    },
];



async function run() {
    try {
        app.get("/backdor",logger,async(req,res)=>{
            taskData.forEach(async element => {
                let task=await Tasks.create(element)
            });
            console.log("Done");
        })
        app.post('/jsonwebtoken', logger, async (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.TOKEN, { expiresIn: '1h' })
            res.cookie('tasky', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
            }).send({ success: true })
        })
        app.post('/logout', logger, isThisToken, async (req, res) => {
            res.clearCookie('tasky', { maxAge: 0, sameSite: "none", secure: true, httpOnly: true }).send({ success: true })
        })
} catch (e) {
        console.log(`The Error is:${e.message}`);
        return
    }
}
run().catch(console.dir);
app.get('/', (req, res) => { res.send("Backend Running") });
app.listen(port, () => { console.log(`Server Started at ${port}`) });