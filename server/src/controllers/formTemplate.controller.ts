import type { Request, Response } from "express";
import * as formTemplateModel from "../models/formTemplate.model.js"

export async function getFormTemplateData(req: Request, res: Response)
{
    const id = Number(req.params.id);
    try{
        const formTemplateData = await formTemplateModel.getFormTemplateData(id)
        res.status(200).json(formTemplateData);
        if (!formTemplateData) {
            res.status(404).json({ error: "Form template not found" });
            return;
        }
    }
    catch(error)
    {
        res.status(500).json({error});
    }
}
export async function getAllFormTemplates(_req: Request, res: Response)
{
    try{
        const formTemplateData = await formTemplateModel.getAllFormTemplates()
        res.status(200).json(formTemplateData);
    }
    catch(error)
    {
        res.status(500).json({error: error instanceof Error ? error.message : String(error)});
    }
}

export async function setFormTemplateData(req: Request, res: Response)
{
    const id = Number(req.params.id);
    const { title, description } = req.body;
    try{
        const updatedFormTemplateData = await formTemplateModel.setFormTemplateData(id, title, description)
        res.status(200).json(updatedFormTemplateData);
    }
    catch(error)
    {
        res.status(500).json({error});
    }
}

export async function createFormTemplate(req: Request, res: Response)
{
    try{
        const newFormTemplateData = await formTemplateModel.createFormTemplate()
        res.status(200).json(newFormTemplateData);
    }
    catch(error)
    {
        res.status(500).json({error});
    }
}

export async function deleteFormTemplate(req: Request, res: Response)
{
    const id = Number(req.params.id);
    try{
        const formTemplateData = await formTemplateModel.deleteFormTemplate(id)
        res.status(200).json({message: "Sucessfully deleted the form!"});
    }
    catch(error)
    {
        res.status(500).json({error});
    }
}