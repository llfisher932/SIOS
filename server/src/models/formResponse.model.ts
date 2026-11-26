import prisma from "../db.js";

export async function getFormResponseData(id: number){
    const formResponse = await prisma.formResponse.findUnique({
        where: {id},
        select: {
            title: true,
            status: true,
            assignedName: true,
            assignedAt: true,
            updatedAt: true,
            userID: true,
            formResponseQuestions: true
        }
    });
    if(!formResponse) {
        return null;
    }
    return {
        id,
        title: formResponse.title,
        status: formResponse.status,
        assignedName: formResponse.assignedName,
        assignedAt: formResponse.assignedAt,
        updatedAt: formResponse.updatedAt,
        userID: formResponse.userID,
        formResponseQuestions: formResponse.formResponseQuestions
    }
}

export async function deleteFormResponse(id: number) {
    try {
        const deletedFormResponse = await prisma.formResponse.delete({
            where: {id}
        });
        return deletedFormResponse;
    } catch(error) {
        return error;
    }
}