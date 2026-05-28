import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import AppRoutes from "./routes";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        {/* <Navbar /> */}
        <div className="main-content">
            <ToastContainer position="top-right" autoClose={2000} />
          <AppRoutes />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;