import prisma from "../db.js";

export type FormTemplateView = {
    formID: number;
    title: string;
    description: string;
}

export async function getFormTemplateData(id: number)
{
    const formTemplate = await prisma.formTemplate.findUnique(
        {
            where: {id},
            select:{
                title:true,
                description:true,
                createdAt:true,
                editedAt:true
            }
        }
    );
    if(!formTemplate)
    {
        return null;
    }
    return{
        id,
        title: formTemplate.title,
        description: formTemplate.description,
        createdAt: formTemplate.createdAt,
        editedAt: formTemplate.editedAt,
    }
}

export async function getAllFormTemplates()
{
    const formTemplates = await prisma.formTemplate.findMany(
        {
            select:{
                id:true,
                title:true,
                description:true,
                createdAt:true,
                editedAt:true
            }
        }
    );
    
    return formTemplates;
}

export async function setFormTemplateData(id: number, title: string, description: string)
{
    const updatedFormTemplate = await prisma.formTemplate.update(
        {
            where: {id},
            data:{
                title: title,
                description: description
            }
        }
    );
    return updatedFormTemplate;
}

export async function createFormTemplate()
{
    const newFormTemplate = await prisma.formTemplate.create(
        {
            data:{
                title: "Form Title",
                description: "Form Description"
            }
        }
    );
    return newFormTemplate;
}

export async function deleteFormTemplate(id: number)
{
    try{
        const deletedFormTemplate = await prisma.formTemplate.delete(
            {
                where: {id}
            }
        );
        return deletedFormTemplate;
    }
    catch(error)
    {
        return error;
    }
}