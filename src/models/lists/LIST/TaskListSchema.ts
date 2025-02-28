import moment from "moment";
import { Schema } from "mongoose";
import Reminder from "../../reminders/Reminder";
import Task from "../../tasks/TASK/Task";
import { ITaskList } from "./ITaskList";



export const list_schema = new Schema(
    {
        name: {
            type:String,
            min:3,
            max:45,
            trim:true,
            required:[true, "The lists´s title is needed"]
        },
        tasks:[{
            type:String,
            ref:"Task",
            validate:{
                validator:
                    function(v:any[]){
                        return v.length>30?false:true
                    },
                message:"Only 5 task per list"
            }
            
        }],
        createdAt: {
            type:Date,
            default: moment().toDate()
        },
        createdBy:{
            type:String,
            ref:"User",
            required:true
        }   
    }
);


list_schema.pre<ITaskList>("remove",async function(next){

   
    let deletedTasks = await Task.deleteMany({_id: { $in: this.tasks } })
    let deletedtReminders = await Reminder.deleteMany({idTask: { $in: this.tasks } });
    console.log(deletedtReminders);
    if(deletedTasks && deletedTasks.ok  &&  deletedtReminders && deletedTasks.ok){
        next();
    }else{
        throw new Error("Something went wrong");
    }

})

