import "./App.css";
import { AuthContextProvider } from "./AuthContext/AuthContext";
import Router from "./Routes/Router";

function App() {
  return (
    <>
      <AuthContextProvider>
        <Router />
      </AuthContextProvider>
    </>
  );
}

export default App;
