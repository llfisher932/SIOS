import type { Request, Response } from "express";
import * as formResponseModel from "../models/formResponse.model.js"

export async function getFormResponse(req: Request, res: Response) {
    const id = Number(req.params.id);
    try{
        const formTemplateData = await formResponseModel.getFormResponseData(id)
        res.status(200).json(formTemplateData);
        if (!formTemplateData) {
            res.status(404).json({ error: "Form response not found" });
            return;
        }
    }
    catch(error)
    {
        res.status(500).json({error});
    }
}

export async function deleteFormResponse(req: Request, res: Response) {
    const id = Number(req.params.id);
    try{
        const formTemplateData = await formResponseModel.deleteFormResponse(id)
        res.status(200).json({message: "Sucessfully deleted form response!"});
    }
    catch(error)
    {
        res.status(500).json({error});
    }
}