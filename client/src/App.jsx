import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./pages/user/Login";
import AdminHome from "./pages/admin/AdminHome";
import Whitelabel from "./pages/admin/Whitelabel";
<<<<<<< HEAD
import ProofManagement from "./pages/admin/Markettype";
import SportsManagement from "./pages/admin/SportsManagement";
=======
import ProofType from "./pages/admin/ProofType";
>>>>>>> 78da85c57eb085160a6a5a59b1918f2381aa3733

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin" element={<Login />}></Route>
        <Route path="/adminhome" element={<AdminHome />} />
        <Route path="/whitelabel" element={<Whitelabel />} />
<<<<<<< HEAD
        <Route path="/proofs" element={<ProofManagement />} />
        <Route path="/sports" element={<SportsManagement />} />
=======
        <Route path="/proofs" element={<ProofType />} />
>>>>>>> 78da85c57eb085160a6a5a59b1918f2381aa3733
        {/* user Routes */}
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
