const mongo = require("mongoose")
const taskSchema = new mongo.Schema({
    email: {
        type: String,
        lowercase: true
    },
    title: String,
    details: String,
    status: {
        type: String,
        default: "Pending",
    },
    expire: {
        type: Date
    },
    priority: {
        type: String,
        default: "Normal"
    },
    pos: Number,
}, {
    timestamps: true
})

taskSchema.pre("save", async function (next) {
    if (this.pos == null || this.pos == undefined) {
        let size = await (await Tasks.find().countDocuments())
       this.pos=size+1
    }

    next()
})
const Tasks = mongo.model("Tasks", taskSchema)

module.exports = {
    Tasks: Tasks
}