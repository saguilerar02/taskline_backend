import moment from "moment";
import { Schema } from "mongoose";
import { ITaskList } from "../../lists/LIST/ITaskList";
import TaskList from "../../lists/LIST/TaskList";
import Reminder from "../../reminders/Reminder";
import { options } from "./DiscriminatorOptions";
import { ITask } from "./ITask";


const REMINDERS = 5;
const CONTRIBUTORS = 10;

export const task_schema = new Schema(
    {
        goal: {
            type:String,
            minlength:3,
            maxlength:75,
            trim:true,
            required:[true, "La tarea necesita un titulo"]
        },
        description:{
            type:String,
            minlength:3,
            maxlength:255,
            trim:true
        },
        createdAt: {
            type:Date,
            default:moment().toDate()
        },
        archivementDateTime: {
            type:Date,
            required:true
        },
        idTasklist:{
            type:String,
            ref:"TaskList"
        },
        createdBy:{
            type:String,
            ref:"User",
            required:true
        },
        status: {
            type:String,
            enum:["PENDING","COMPLETED","FAIL"],
            required:true,
            default:"PENDING"
        },
        reminders:{
            type:[String],
            ref:"Reminder",
            required:true,
            
        },
        contributors:{
            type:[String],
            ref:"User",
            required:true
        }
    },options
);

task_schema.index({archivementDateTime: 1, createdBy: 1,  },{unique: true, backgorund:true});

task_schema.pre<ITask>("save",async function (next) {
    
    if(this.idTasklist){
        let tl:ITaskList|null= await TaskList.findById(this.idTasklist);
        if(tl){
            tl.tasks.push(this.id);
            if(await tl.save()){
                next();
            }else{
                throw new Error("Algo salió mal") ;
            }
        }else{
            throw new Error("TaskList not found") ;     
        }
    }else{
        throw new Error("TaskList id is null or empty");   
    }
    
});

task_schema.pre<ITask>("remove",async function (next) {

    if(this.idTasklist){
        let tl = await TaskList.findOneAndUpdate({"_id":this.idTasklist},{ '$pull': { 'tasks': this._id } })
        if(tl){
            if(this.reminders && this.reminders.length>0){
                let deleted = await Reminder.deleteMany({ _id: { $in: this.reminders } });
                if(deleted && deleted.deletedCount && deleted.deletedCount>0){
                    next()
                }else{
                    throw new Error("No se ha podido borrar los reminders");
                }
            }
            next();
        }else{
            throw new Error("TaskList not found");     
        }
    }else{
        throw new Error("TaskList id is null or empty");   
    }
    
});

task_schema.pre<ITask>("validate",function(next){

    if(this.contributors.length<0 || this.contributors.length>CONTRIBUTORS){
        throw new Error("Solo puedes compartir la tarea con 10 personas");
    }
    if(this.reminders.length<0 || this.reminders.length>REMINDERS){
        throw new Error("Solo puedes asignar 5 reminders a la misma tarea, solo puedes añadir "+(REMINDERS-this.reminders.length)+" más");
    }
    if(moment(this.createdAt).diff(this.archivementDateTime, "minutes")>-120){
        throw new Error("La fecha de finalización debe ser como mínimo de 2 horas en el futuro");
    }else{
        next();
    }
    
})