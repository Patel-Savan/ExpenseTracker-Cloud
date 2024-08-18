import React, { useEffect } from "react";
import { useAuthContext } from "../AuthContext/AuthContext";
import { Outlet, Navigate } from "react-router-dom";
import { toast } from "react-toastify";

const PrivateRoutes = () => {
  const { isLoggedIn } = useAuthContext();

  useEffect(() => {
    if(!isLoggedIn){
      toast.error("Please Login First")
    }
  },[isLoggedIn])
  return isLoggedIn ? <Outlet /> : <Navigate to="/login"/>;
};

export default PrivateRoutes;
