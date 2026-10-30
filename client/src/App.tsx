import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import "./App.css";
import { AuthProvider } from "./auth/AuthContext";
import RequireAuth from "./auth/RequireAuth";
import Layout from "./components/Layout";
import Login from "./views/Login";
import Forgotpass from "./views/Forgotpass";
import Forgotpassreset from "./views/Forgotpassreset";
import Home from "./views/Home";
import ProfileSearch from "./views/ProfileSearch";
import ProfileDetail from "./views/ProfileDetail";
import FormTemplateList from "./views/FormTemplateList"
import FormTemplateManager from "./views/FormTemplateManager";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<Forgotpass />} />
            <Route path="/reset-password" element={<Forgotpassreset />} />

            {/* Signed-in only */}
            <Route element={<RequireAuth />}>
              <Route path="/home" element={<Home />} />
              <Route path="/profile" element={<ProfileDetail />} />
              <Route path="/profiles" element={<ProfileSearch />} />
              <Route path="/profiles/:id" element={<ProfileDetail />} />

              <Route path="/formTemplates" element={<FormTemplateList />} />
              <Route path="/formTemplateManager" element={<FormTemplateManager />} />
              <Route path="/formTemplateManager/:id" element={<FormTemplateManager />} />

            </Route>

            <Route path="*" element={<Navigate to="/home" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
