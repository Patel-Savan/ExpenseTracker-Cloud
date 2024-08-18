import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  REGISTER,
  LOGIN,
  LOGOUT,
  GET_RESET_PASSWORD_CODE,
  CHANGE_PASSWORD
} from "./action";
import reducer from "./reducer";
import { backendURL } from "../config/backendURL";
import { createContext, useReducer, useContext } from "react";

const initialState = {
  isLoggedIn: false,
  user: null
};

const actionURLs = {
  REGISTER_URL: "register",
  LOGIN_URL: "login",
  GET_RESET_PASSWORD_CODE_URL: "reset-password",
  CHANGE_PASSWORD_URL: "change-password"
};
const AppContext = createContext();

const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();

  const Register = async (userData) => {
    console.log(`${backendURL}/${actionURLs.REGISTER_URL}`)
    await axios
      .post(`${backendURL}/${actionURLs.REGISTER_URL}`, userData)
      .then((response) => {
        console.log(response);
        toast.success(
          "User Registration Successful. Keep Subscribe from your email and keep the Subscription Window Open for some time."
        );
        dispatch({
          type: REGISTER
        });
        navigate("/login")
      })
      .catch((error) => {
        console.log(error);
        toast.error(error.response.data.body);
      });
  };
  const Login = async (userData) => {
    await axios
      .post(`${backendURL}/${actionURLs.LOGIN_URL}`, userData)
      .then((response) => {
        console.log(response);
        toast.success("Login Successful");
        dispatch({
          type: LOGIN,
          payload: response.data
        });
        navigate("/add-expense");
      })
      .catch((error) => {
        console.log(error);
        toast.error(error.response.data);
      });
  };

  const Logout = () => {
    dispatch({
      type: LOGOUT
    });

    navigate("/login");
  };

  const GetResetPasswordCode = async (userData) => {
    await axios
      .post(`${backendURL}/${actionURLs.GET_RESET_PASSWORD_CODE_URL}`, userData)
      .then((response) => {
        console.log(response);
        toast.success(
          "We sent you a Password Reset Code. Use it to Change your Password"
        );
        dispatch({
          type: GET_RESET_PASSWORD_CODE,
          payload: response.data
        });

        navigate("/change-password");
      })
      .catch((error) => {
        console.log(error);
        toast.error(error.response.data);
      });
  };

  const ChangePassword = async (userInput) => {
    await axios
      .post(`${backendURL}/${actionURLs.CHANGE_PASSWORD_URL}`, userInput)
      .then((response) => {
        console.log(response);
        toast.success("Successfully Changed Password");
        dispatch({
          type: CHANGE_PASSWORD,
          payload: response.data
        });

        navigate("/login");
      })
      .catch((error) => {
        console.log(error);
        toast.error(error.response.data);
      });
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        Register,
        Login,
        Logout,
        GetResetPasswordCode,
        ChangePassword
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

const useAuthContext = () => {
  return useContext(AppContext);
};

export { useAuthContext, AuthContextProvider };
