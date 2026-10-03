
import {
  Box,
  Button,
  Divider,
  Paper,
  
} from "@mui/material";


type ProfileProps = {
    username: string;
    role: string;
}

const Profile = ({username, role}: ProfileProps) => {

    let actions;
    switch(role){
        case "SuperAdmin":
            actions = (
                <div>
                    <Button>Approve Student Survey Data</Button>
                    <Button>Manage User Accounts</Button>
                    <Button>Access Student Data/Trends</Button>
                    <Button>Manage Forms/Surveys</Button>
                    <Button>View Parent Account Info</Button>
                    <Button>Manage Student Records</Button>
                    <Button>Manage Student Data</Button>
                    <Button>Update Student Attendance</Button>
                </div>
            )
            break;
        case "Admin":
            actions = (
                <div>
                    <Button>Manage Forms/Surveys</Button>
                    <Button>View Parent Account Info</Button>
                    <Button>Manage Student Records</Button>
                    <Button>Manage Student Data</Button>
                    <Button>Update Student Attendance</Button>
                </div>
            )
            break;
        case "Staff":
            actions = (
                <div>
                    <Button>Update Student Attendance</Button>
                </div>
            )
            break;
        default: //parent
            actions = (
                <div>
                    <Button>Update Contact Info</Button>
                    <Button>View Student Info</Button>
                </div>
            )
            break;
    }

  return (
    <div>
        <Box sx={{ minHeight: "50vh", display: "flex", flexDirection: "column", bgcolor: "background.default" }}>
            <Box
            component="main"
            sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", px: 2, py: 4 
            }}>
                <Paper
                variant="outlined"
                sx={{
                    width: "100%",
                    maxWidth: 900,
                    p: { xs: 3, sm: 4 },
                    borderRadius: 2,
                    boxShadow: "0 1px 3px rgba(31, 28, 26, 0.06)",
                }}>
                    <h1>Hello, {username}!</h1>
                    <Paper elevation={2}
                    sx={{
                        borderRadius: 2,
                        padding: { sm: 2 }
                    }}>
                        <h2>Actions</h2>
                        <p>Role: {role}</p>
                        <Divider sx={{ mt: 3, mb: 2 }} />
                        {actions}
                    </Paper>
                    
                    <br></br>

                    <Paper elevation={2}
                    sx={{
                        borderRadius: 2,
                        padding: { sm: 2 }
                    }}>
                        <h2>Tasks</h2>
                        <Divider sx={{ mt: 3, mb: 2 }} />
                        <p>There are no tasks to complete at this time</p>
                    </Paper>
                    
                </Paper>
            </Box>
        </Box>
    </div>
    
  );
};

export default Profile;
