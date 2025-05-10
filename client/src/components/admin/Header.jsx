import React, { useState, useEffect, useRef } from "react";
import { FaUser } from "react-icons/fa";
const Header = () => {
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
    <>
      {/* heder */}
      <div className="!w-full bg-[#00008B] flex justify-between  sm:h-[90px] relative">
        <span className="text-white text-[25px] p-[10px] font-bold mt-2">
          HELOO TURBOMAIN ADMIN
        </span>
        <div className="relative" ref={menuRef}>
          <span
            className="text-white font-bold my-[25px] border flex flex-col justify-center mr-4 rounded-full cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <FaUser className="m-2 text-[20px]" />
          </span>
          {isMenuOpen && (
            <div className=" right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <ul className="py-1">
                <li
                  className="px-4 py-2 text-gray-800 hover:bg-gray-200 cursor-pointer"
                  onClick={handleLogout}
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
