const mongo =require("mongoose")
const taskSchema=new mongo.Schema({
    email:{
        type:String,
        unique:true,
        lowercase:true
    },
    title:String,
    details:String,
    status:{
        type:String,
        default:"Pending",
    },
    expire:{
        type:Date
    },
    priority:{
        type:String,
        default:"Normal"
    }
},{
    timestamps:true
})  

const Tasks=mongo.model("Tasks",taskSchema)

module.exports={
    Tasks:Tasks
}