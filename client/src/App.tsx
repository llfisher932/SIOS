import { useState } from "react";
import "./App.css";
import Login from "./views/Login";
import Profile from "./views/Profile";
import { AppBar, Divider, Toolbar, Typography } from "@mui/material";
import BrandMark from "./components/BrandMark";
import { brand } from "./theme";
import Forgotpass from "./views/Forgotpass";

function App() {
  const [view, setView] = useState("main");

  // Clears the session (server call goes here once the backend exists),
  // then returns the user to the sign-in screen.
  const handleLogout = async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    setView("login");
  };

  return (
    <div className="App">
      <AppBar position="static" elevation={0} sx={{ bgcolor: brand.black, borderBottom: `3px solid ${brand.red}` }}>
        <Toolbar sx={{ gap: 1.5, minHeight: { xs: 56 } }}>
          <BrandMark />
          <Typography component="span" sx={{ fontWeight: 700, fontSize: "1rem", letterSpacing: "0.04em" }}>
            SIOS
          </Typography>
          <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,0.2)", my: 2 }} />
          <Typography component="span" sx={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)" }}>
            Team Nitro MMA SEALTeam
          </Typography>
        </Toolbar>
      </AppBar>
      {view === "main" && <Selector setView={setView} />}
      {view === "login" && <Login />}
      {view === "forgotpass" && <Forgotpass />}
      {view === "profileParent" && <Profile username="testUser" role="Parent" onLogout={handleLogout}/>}
      {view === "profileStaff" && <Profile username="testUser" role="Staff" onLogout={handleLogout}/>}
      {view === "profileAdmin" && <Profile username="testUser" role="Admin" onLogout={handleLogout}/>}
      {view === "profileSuperAdmin" && <Profile username="testUser" role="SuperAdmin" onLogout={handleLogout}/>}
      {/* {view === "login" && <Login />}
      {view === "login" && <Login />} */}
    </div>
  );
}

const Selector = (props: { setView: (view: string) => void }) => {
  const { setView } = props;

  return (
    <div>
      <button onClick={() => setView("login")}>Login</button>
      <button onClick={() => setView("forgotpass")}>Forgot Password</button>
      <button onClick={() => setView("profileParent")}>ProfileParent</button>
      <button onClick={() => setView("profileStaff")}>ProfileStaff</button>
      <button onClick={() => setView("profileAdmin")}>ProfileAdmin</button>
      <button onClick={() => setView("profileSuperAdmin")}>ProfileSuperAdmin</button>
    </div>
  );
};

export default App;
