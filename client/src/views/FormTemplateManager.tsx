import { Paper, TextField } from "@mui/material";
import { getFormTemplate, updateFormTemplate} from "../api/api";
import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { Link } from "react-router";

const FormTemplateManager = () =>{
    const {id} = useParams();

    const formID = Number(id);

    
    const [loading, setLoading] = useState(true);
    
         useEffect(() => {
    
            const getForm = async () => {
                try {
                    const data = await getFormTemplate(formID);
                    
                
                    
                    setFormTitle(data.title);
                    setFormDescription(data.description);
    
                } catch (error) {
                    console.error("Error retrieving forms:", error);
    
                } finally {
                    setLoading(false);
                }
            };
    
            getForm();
    
        }, [formID]);

        const [formTitle, setFormTitle] = useState('');
        const [formDescription, setFormDescription] = useState('');

        const updateForm = async () => {
                try {
                    
                    await updateFormTemplate(formID, {title: formTitle, description: formDescription});
                    
                
                    
    
                } catch (error) {
                    console.error("Error retrieving forms:", error);
    
                } finally {
                    setLoading(false);
                }
            };

        if(loading){
            return (<p>Loading...</p>)
        }

    return(
        <div className = "pageDiv-column" >
            <h1>Manage Form Template</h1>
            <div className="pageDiv">
                <label>Title:</label>
                <TextField defaultValue={formTitle} onChange={(event) => setFormTitle(event.target.value)} ></TextField>
                
            </div>
            <div className="pageDiv">
                <label>Description:</label>
                <TextField defaultValue={formDescription} id="" onChange={(event) => setFormDescription(event.target.value)}></TextField>
                
            </div>
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
                            <h1 style={{color:"#D9D9D9"}}>Coming Soon...</h1>

                        </div>


                    </Paper>
                <button onClick={updateForm}>Save</button>
                <Link to="/formTemplates">Return to Form List</Link>
            </div>
    );

}

export default FormTemplateManager;