import React from "react";
// import myImage from "/home/krunal/cbtf-proof/src/app/img/1.jpg";

const Login = () => {
  return (
    <section className="bg-[#D8D8E8] dark:bg-[#1C2029]">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-[#FEFEFE] rounded-lg shadow-lg dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-[#10141E] border-[#c5d2db] dark:border-[#424753] border-solid border-[2px]">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="flex justify-center text-xl font-bold leading-tight tracking-tight text-[#52526c] md:text-2xl dark:text-[#ffffffb3]">
              Welcome Team
            </h1>
            <form className="space-y-4 md:space-y-6" action="#">
              <div>
                <label
                  htmlFor="userName"
                  className="block mb-2 text-sm font-medium text-[#52526c] dark:text-[#ffffffb3]"
                >
                  Username
                </label>
                <input
                  type="userName"
                  name="username"
                  id="userName"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-[#1C2029] dark:border-gray-600 dark:placeholder-gray-400 dark:text-[#ffffffb3] dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Enter Username"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-[#52526c] dark:text-[#ffffffb3]"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Enter Password"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-[#1C2029] dark:border-gray-600 dark:placeholder-gray-400 dark:text-[#ffffffb3] dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full text-black bg-[#D8D8E8] hover:bg-[#CECEEB] font-semibold hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 dark:text-[#ffffffb3] dark:bg-[#2f3646] hover:shadow-lg "
              >
                LOG IN
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
