import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import Register from "../pages/Register.jsx";
import Login from "../pages/Login.jsx";
import Chat from "../pages/Chat.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chat"  element={ <ProtectedRoute> <Chat /> </ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;