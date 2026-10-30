import { Paper } from "@mui/material";
import FormResult from "../components/formTemplate/FormResult"
import { getAllForms, createFormTemplate} from "../api/api";
import type { FormTemplate } from "../api/api";
import { useState, useEffect } from "react";


const FormTemplateList = () => {
    const [templates, setTemplates] = useState<FormTemplate[]>([]);
    const [loading, setLoading] = useState(true);

     useEffect(() => {

        const getForms = async () => {
            try {
                const data = await getAllForms();
                console.log("Full API response:", data);
                console.log("First template:", data[0]);
                console.log("First template ID:", data[0]?.id);
                setTemplates(data);

            } catch (error) {
                console.error("Error retrieving forms:", error);

            } finally {
                setLoading(false);
            }
        };

        getForms();

    }, []);
    
    const createForm = async () =>{
        try {
            const newForm = await createFormTemplate({title:"New Form", description:"New Description"});
                
            setTemplates(prevTemplates => [...prevTemplates, newForm]);
        } catch (error) {
            console.error("Error creating form:", error);        
        }
    }

    if(loading){
        return <p>Loading...</p>
    }
    

    return(
        
            <div className = "pageDiv-column">
                <h1>All Form Templates</h1>
                <button onClick={createForm}>Create a Form</button>
                    <Paper
                    variant="outlined"
                    sx={{
                        width: "100%",
                        maxWidth: 800,
                        p: { xs: 3, sm: 4 },
                        borderRadius: 2,
                        flexShrink: 0,
                        boxShadow: "0 1px 3px rgba(31, 28, 26, 0.06)",}}>

                        <div className = "pageDiv">
                            {templates.map((template =>(
                                
                                <FormResult 
                                    key={template.id}
                                    id={template.id} 
                                    title={template.title} 
                                    description={template.description}
                                    created={template.createdAt}
                                    edited={template.editedAt}
                                ></FormResult>
                                
                            )))}

                        </div>


                    </Paper>
            </div>
            
        
    )
}
  


export default FormTemplateList;