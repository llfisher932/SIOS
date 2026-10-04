import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "./AuthContext";

// Wraps routes that need a signed-in user. Sends everyone else to /login,
// remembering where they were headed so login can send them back.
const RequireAuth = () => {
  const { account } = useAuth();
  const location = useLocation();

  if (!account) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
};

export default RequireAuth;
