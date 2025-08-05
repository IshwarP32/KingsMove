import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";

const ProtectedRoute = ({ children }) => {
  const { userInfo, loading } = useContext(UserContext);

  if (loading) return null; // or show spinner

  return userInfo ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
