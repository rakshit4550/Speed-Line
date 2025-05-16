import React, { useState, useEffect, useRef } from "react";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import Header from "../../components/admin/Header";

function AdminHome() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null); // Reference for user icon + dropdown

  const handleLogout = () => {
    console.log("Logged out");
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full h-full">
      <Header />
      {/* body */}
      <div className="grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-4 mt-[40px] text-center gap-[25px] mx-[70px]">
        <Link
          to="/whitelabel"
          className="bg-white  border shadow-xl p-[30px]  text-black  box rounded-lg  font-bold text-[35px] cursor-pointer"
        >
          WHITE LABEL
        </Link>
        <Link
          to="/proofs"
          className="bg-white  border shadow-xl p-[30px]  text-black  box rounded-lg  font-bold text-[35px] cursor-pointer"
        >
          PROOF TYPE
        </Link>
        <Link to="/sports" className="bg-white  border shadow-xl p-[30px]  text-black  box rounded-lg  font-bold text-[35px] cursor-pointer ">
          ADD SPORT
        </Link>
        <Link 
        to="/market"
        className="bg-white  border shadow-xl p-[30px]  text-black  box rounded-lg  font-bold text-[35px] cursor-pointer">
          MARKET ADD
        </Link>
        <div className="bg-white  border shadow-xl p-[30px]  text-black  box rounded-lg  font-bold text-[35px] cursor-pointer">
          MEMBER
        </div>
        <Link 
        to="/clients"
        className="bg-white  border shadow-xl p-[30px]  text-black  box rounded-lg  font-bold text-[35px] cursor-pointer">
        Clients
        </Link>
      </div>
    </div>
  );
}

export default AdminHome;
