import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import "./App.css";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import RequireAuth from "./auth/RequireAuth";
import Layout from "./components/Layout";
import Login from "./views/Login";
import Forgotpass from "./views/Forgotpass";
import Home from "./views/Home";
import Profile from "./views/Profile";

// Profile still uses its own role names; map our account types onto them.
const ProfileRoute = () => {
  const { account } = useAuth();
  if (!account) return null;
  return <Profile username={account.email} role={account.type === "STAFF" ? "Staff" : "Parent"} />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<Forgotpass />} />

            {/* Signed-in only */}
            <Route element={<RequireAuth />}>
              <Route path="/home" element={<Home />} />
              <Route path="/profile" element={<ProfileRoute />} />
            </Route>

            <Route path="*" element={<Navigate to="/home" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
