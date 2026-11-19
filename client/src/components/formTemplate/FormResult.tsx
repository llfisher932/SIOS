import { Paper } from "@mui/material";
import { Link } from "react-router";

type FormResultProps = {
    id: number;
    title: string;
    description: string;
    created: string;
    edited: string;
};

const FormResult = ({id, title, description, created, edited}:FormResultProps) => {
    return (
        <Link to={`/formTemplateManager/${id}`} style={{textDecoration:"none"}}>
            <Paper
                variant="elevation"
                sx={{
                    width: "100%",
                    height: 150,
                    maxWidth: 200,
                    p: { xs: 3,  },
                    
                    borderRadius: 2,
                    flexShrink: 0,
                    boxShadow: "0 1px 3px rgba(31, 28, 26, 0.06)",
                    backgroundColor: "#D9D9D9"}}>
                
                <div className = "pageDiv-column" style={{rowGap:0, justifyContent:"left", alignItems:"normal"}}>
                <h3 style={{margin:0}}>{title}</h3>
                <p style={{margin:0}}>{description}</p>
                <p style={{margin:0, fontSize:10}}><i>Created: {new Date(created).toLocaleDateString()}</i></p>
                <p style={{margin:0, fontSize:10}}><i>Last Edited: {new Date(edited).toLocaleDateString()}</i></p>

                </div>

            </Paper>
        </Link>
    );
}

export default FormResult;