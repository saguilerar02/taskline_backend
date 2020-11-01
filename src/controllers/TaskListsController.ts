import { Request, Response } from 'express';
import { responseErrorMaker } from '../handlers/ErrorHandler';
import { ITaskList } from '../models/lists/LIST/ITaskList';
import TaskList from '../models/lists/LIST/TaskList';

export const saveTaskList = async function (request: Request, res: Response) {

    if (request.body && Object.keys(request.body).length > 0) {
        try {
            let t = new TaskList(request.body);
            if (await t.save()) {
                res.status(201).send({ list:t,msg: "La lista se ha guardado con éxito" });
            } else {
                res.status(500).send({ msg: "Ha ocurrido un error al intentar guardar la Lista, inténtelo de nuevo más  tarde" });
            }

        } catch (err) {
            if (err.name === "ValidationError") {
                res.status(422).send(responseErrorMaker(err));
            } else {
                res.status(500).send({ error: err.message });
            }
        }
    } else {
        res.status(400).send("Bad Request: petición inválida");
    }

};

export const deleteOneTaskList = async function (request: Request, res: Response) {

    if (request.params["id"] && request.params["id"].length > 0) {
        try {

            let t = await TaskList.findOne({_id:request.params["id"], createdBy:request.body.createdBy});
            if (t) {
                if ( await t.remove()) {
                    res.status(200).send({ msg: "La lista se ha borrado con éxito" });
                } else {
                    res.status(500).send({ msg: "No se ha podido borrar la lista, intentelo de nuevo más tarde" });
                }
            } else {
                res.status(404).send({ msg: "La lista especificada no se encontró" });
            }
        } catch (err) {
            res.status(500).send({ msg: "Ha ocurrido un error al intentar eliminar la Lista, inténtelo de nuevo más  tarde" });
        }
    } else {
        res.status(400).send("Bad Request: petición inválida");
    }
};


export const updateTaskList = async function (req: Request, res: Response) {

    if (req.body && Object.keys(req.body).length > 0 && req.params["id"]) {
        try {

            let t = await TaskList.findById(req.params["id"]);
            if(t){
               let updated = await t.updateOne(req.body,{runValidators:true});
                if (updated && updated.nModified>0) {
                    res.status(200).send({msg: "La lista se ha actualizado con éxito" });
                } else {
                    res.status(404).send({ error: "Ha ocurrido un error inesperado, intentelo de nuevo más tarde" });
                }
            }
        } catch (err) {
            if (err.name === "ValidationError") {
                res.status(422).send(responseErrorMaker(err));
            } else {
                res.status(500).send({ error: "Ha ocurrido un error inesperado, intentelo de nuevo más tarde" });
                console.error(err);
            }
        }
    } else {
        res.status(400).send("Bad Request: petición inválida");
    }
}

export const getUserLists = async function (req: Request, res: Response) {

    if(req.body.createdBy){
        try {
            let lists:ITaskList[]|null;
            lists = await TaskList.find({ createdBy: req.body.createdBy});
    
            if (lists && lists.length > 0) {
                res.status(200).send({ lists: lists });
            } else {
                res.status(404).send({ msg: "Aún no has creado ninguna lista" });
            }
        } catch (err) {
    
            res.status(500).send({ msg: 'Algo salió mal, intentelo de nuevo más tarde' });
            console.error(err);
        }
    }else{
        res.status(400).send("Bad Request: petición inválida");
    }
   
}