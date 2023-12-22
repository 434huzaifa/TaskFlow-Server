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
        'http://localhost:5174',
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
async function run() {
    try {
        app.get("/backdor",logger,async(req,res)=>{
            try {
                let tasks=await Tasks.find()
                tasks.forEach(async (x,index)=>{
                    x.pos=index+1
                    // await x.save()
                    console.log(index+1);
                })
                res.send({msg:"Done"})
            } catch (error) {
                console.log(`The Error is${error.message}`);
            }
            
        })
        app.get("/tasks",logger,async(req,res)=>{
            let tasks=new Object()
            tasks.ongoing=await Tasks.where("status").equals("Ongoing").sort("pos").select(" -email")
            tasks.pending=await Tasks.where("status").equals("Pending").sort("pos").select(" -email")
            tasks.completed=await Tasks.where("status").equals("Completed").sort("pos").select(" -email")
            res.send(tasks)
        })
        app.put("/changepos",logger,async(req,res)=>{
            let data=req.body
            console.log(data);
            data.s_index=data.s_index.pos
            data.d_index=data.d_index.pos
            let task= await Tasks.findById(data.s_id)
            console.log(data.d_index);
            task.pos=data.d_index+1
            await task.save()
            if (data.s_index<data.d_index) {
                let tasksmover=await Tasks.where("pos").gt(data.s_index).lte(data.d_index)
                console.log(tasksmover.length);
                tasksmover.forEach(async(x,index)=>{
                    x.pos-=1
                    console.log(index,'taskmover');
                    await x.save()
                })
            }else{
                let tasksmover=await Tasks.where("pos").gte(data.d_index).lt(data.s_index)
                tasksmover.forEach(async(x,index)=>{
                    x.pos+=1
                    await x.save()
                })
            }
            
            res.send()

        })
        app.post('/task',logger,async(req,res)=>{
            console.log(req.body);
            res.send({msg:200})
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