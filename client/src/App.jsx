// import { BrowserRouter, Route, Routes } from "react-router-dom";
// import "./App.css";
// import Login from "./pages/user/Login";
// import AdminHome from "./pages/admin/AdminHome";
// import Whitelabel from "./pages/admin/Whitelabel";

// import SportsManagement from "./pages/admin/SportsManagement";
// import ProofType from "./pages/admin/ProofType";
// import MarketManager from "./pages/admin/market";
// import ClientForm from "./pages/admin/Client";

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Admin Routes */}
//         <Route path="/admin" element={<Login />}></Route>
//         <Route path="/adminhome" element={<AdminHome />} />
//         <Route path="/whitelabel" element={<Whitelabel />} />
//         <Route path="/proofs" element={<ProofType/>} />
//         <Route path="/sports" element={<SportsManagement />} />
//         <Route path="/market" element={<MarketManager />} />
//         <Route path="/client" element={<ClientForm />} />
       
//         {/* user Routes */}
//         <Route path="/" element={<Login />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;


import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store'; // Adjust path if store.js is elsewhere
import Login from './pages/user/Login';
import AdminHome from './pages/admin/AdminHome';
import Whitelabel from './pages/admin/Whitelabel';
import SportsManagement from './pages/admin/SportsManagement';
import ProofType from './pages/admin/ProofType';
import MarketManager from './pages/admin/market';
import ClientForm from './pages/admin/Client';


function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* User Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<Login />} />

          {/* Admin Routes */}
          <Route
            path="/adminhome"
            element={
                <AdminHome />
            }
          />
          <Route
            path="/whitelabel"
            element={
                <Whitelabel />
            }
          />
          <Route
            path="/proofs"
            element={
                <ProofType />
            }
          />
          <Route
            path="/sports"
            element={
                <SportsManagement />
            }
          />
          <Route
            path="/market"
            element={
                <MarketManager />
            }
          />
          <Route
            path="/clients"
            element={
                <ClientForm />
            }
          />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;