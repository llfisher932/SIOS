import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "./AuthContext";

const RequireAuth = () => {
  const { account, loading } = useAuth();
  const location = useLocation();

  // Wait for the session check so a refresh doesn't bounce signed-in users.
  if (loading) return null;

  if (!account) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
};

export default RequireAuth;
