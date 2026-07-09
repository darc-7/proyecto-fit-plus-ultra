import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; 

export default function AuthRedirect() {
  const { user, role, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && role) {
      navigate("/", { replace: true });
    }
  }, [user, role, loading, navigate]);

  return null;
}