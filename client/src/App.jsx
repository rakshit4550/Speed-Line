import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./pages/user/Login";
import AdminHome from "./pages/admin/AdminHome";
import Whitelabel from "./pages/admin/Whitelabel";

import SportsManagement from "./pages/admin/SportsManagement";
import ProofType from "./pages/admin/ProofType";
import MarketManager from "./pages/admin/market";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin" element={<Login />}></Route>
        <Route path="/adminhome" element={<AdminHome />} />
        <Route path="/whitelabel" element={<Whitelabel />} />
        <Route path="/proofs" element={<ProofType/>} />
        <Route path="/sports" element={<SportsManagement />} />
        <Route path="/market" element={<MarketManager />} />
       
        {/* user Routes */}
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
