import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Header from "../../components/admin/Header";
import { FaPlus, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import {
  fetchWhitelabels,
  fetchWhitelabelById,
  createWhitelabel,
  updateWhitelabel,
  deleteWhitelabel,
  clearSuccess,
  clearError,
} from "../../redux/whitelabel/whitelabelSlice";

// Constants for API and placeholder
const API_BASE_URL = "http://localhost:2030";
const DEFAULT_PLACEHOLDER = "/placeholder-logo.png";

const Whitelabel = () => {
  const dispatch = useDispatch();
  const { whitelabels, currentWhitelabel, loading, error, success, message } =
    useSelector((state) => state.whitelabel);

  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    user: "",
    hexacode: "",
    whitelabelUrl: "",
    logo: null,
  });

  // Preview state
  const [previewOpen, setPreviewOpen] = useState(false);

  // Fetch whitelabels on mount
  useEffect(() => {
    dispatch(fetchWhitelabels());
  }, [dispatch]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      handleReset();
      setIsEditing(false);
      setCurrentId(null);
    }
  }, [open]);

  // Handle success state to close modal and refresh list
  useEffect(() => {
    if (success) {
      setOpen(false);
      dispatch(fetchWhitelabels());
      setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
    }
  }, [success, dispatch]);

  // Clear errors
  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError());
      }, 3000);
    }
  }, [error, dispatch]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, logo: file }));
    }
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      const formattedData = {
        ...formData,
        hexacode: formData.hexacode.startsWith("#")
          ? formData.hexacode
          : `#${formData.hexacode}`,
      };

      if (isEditing) {
        dispatch(updateWhitelabel({ id: currentId, formData: formattedData }));
      } else {
        dispatch(createWhitelabel(formData));
      }
    },
    [dispatch, isEditing, currentId, formData]
  );

  const handleReset = useCallback(() => {
    setFormData({
      username: "",
      user: "",
      hexacode: "",
      whitelabelUrl: "",
      logo: null,
    });
  }, []);

  const handleEdit = useCallback((whitelabel) => {
    setIsEditing(true);
    setCurrentId(whitelabel._id);
    setFormData({
      username: whitelabel.whitelabel_user,
      user: whitelabel.user,
      hexacode: whitelabel.hexacode,
      whitelabelUrl: whitelabel.url,
      logo: null, // Cannot pre-fill file input
    });
    setOpen(true);
  }, []);

  const handleDelete = useCallback(
    (id) => {
      if (window.confirm("Are you sure you want to delete this whitelabel?")) {
        dispatch(deleteWhitelabel(id));
      }
    },
    [dispatch]
  );

  // Handle preview click by fetching data from backend
  const handlePreview = useCallback(
    (id) => {
      dispatch(fetchWhitelabelById(id)).then(() => {
        setPreviewOpen(true);
      });
    },
    [dispatch]
  );

  // Memoized image URL formatter
  const getImageUrl = useMemo(() => {
    return (logoPath) => {
      if (!logoPath) {
        return DEFAULT_PLACEHOLDER;
      }
      if (logoPath.startsWith("http://") || logoPath.startsWith("https://")) {
        return logoPath;
      }
      const formattedPath = logoPath.startsWith("/")
        ? logoPath.substring(1)
        : logoPath;
      return `${API_BASE_URL}/${formattedPath}`;
    };
  }, []);

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Whitelabel Management</h1>
          <button
            onClick={() => setOpen(true)}
            className="bg-[#00008B] text-white cursor-pointer p-[10px] px-[20px] rounded-2xl text-[16px] font-bold flex justify-center items-center"
          >
            <span className="font-bold text-lg mr-1">
              <FaPlus />
            </span>
            Add Whitelabel
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {typeof error === "string" ? error : "An error occurred"}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00008B]"></div>
          </div>
        )}

        {/* Whitelabel List */}
        {!loading && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Logo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Whitelabel User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Color
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {whitelabels && whitelabels.length > 0 ? (
                  whitelabels.map((item) => (
                    <tr key={item._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/whitelabel/${item._id}`}>
                          <img
                            src={getImageUrl(item.logo)}
                            alt="logo"
                            className="h-12 w-12 object-contain rounded"
                          />
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.whitelabel_user}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.user}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="h-6 w-6 rounded-full mr-2"
                            style={{ backgroundColor: item.hexacode }}
                          ></div>
                          {item.hexacode}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {item.url}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex">
                        <button
                          onClick={() => handlePreview(item._id)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                          title="Preview"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No whitelabels found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit/Add Modal */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-xl">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              {isEditing ? "Edit Whitelabel" : "Add Whitelabel"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Whitelabel User
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User
                </label>
                <input
                  type="text"
                  name="user"
                  value={formData.user}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hexacode (Color)
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    name="hexacode"
                    value={formData.hexacode}
                    onChange={handleChange}
                    placeholder="#000000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                  <input
                    type="color"
                    value={formData.hexacode || "#000000"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hexacode: e.target.value,
                      }))
                    }
                    className="ml-2 h-10 w-10 border-0 p-0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Whitelabel URL
                </label>
                <input
                  type="url"
                  name="whitelabelUrl"
                  value={formData.whitelabelUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo
                </label>
                <input
                  type="file"
                  name="logo"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  required={!isEditing}
                />
                {isEditing && (
                  <p className="text-sm text-gray-500 mt-1">
                    Leave empty to keep the current logo
                  </p>
                )}
              </div>
              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                >
                  Reset
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-800 transition"
                  >
                    {isEditing ? "Update" : "Submit"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewOpen && currentWhitelabel && (
        <div className="fixed inset-0 flex items-center justify-center bg-transparent ">
          {/* main pages */}
          <div className="bg-white w-[50vh] border mt-[20px] ">
            <header
              id="header"
              className="header-footer flex items-center h-22 "
              style={{ backgroundColor: currentWhitelabel.hexacode }}
            >
              <img
                src={getImageUrl(currentWhitelabel.logo)}
                id="activeLogo"
                alt="Client Logo"
                className="h-[70px] pl-[20px]"
              />
              {/* <select id="logoSelector"></select> */}
            </header>
            {/* Main Content */}
            <main className="pt-[20px]">
              <div className="flex justify-between font-bold text-[12px] leading-[1.5] pl-[12px] pr-[12px] pb-[10px]">
                <div className="">
                  <h2>whitelabel user: {currentWhitelabel.user}</h2>
                  <h2>User: {currentWhitelabel.user}</h2>
                </div>
                <div className="">
                  <h2></h2>
                </div>
                <div>
                  <h2></h2>
                  <h2></h2>
                  <h2></h2>
                </div>
              </div>
              <div className="h-[50vh]"></div>
            </main>
            <footer
              id="footer"
              style={{ backgroundColor: currentWhitelabel.hexacode }}
              className="header-footer flex items-center h-[50px]"
            >
              <div className="flex justify-between">
                <a
                  href={currentWhitelabel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className=" text-amber-50 hover:text-blue-600 hover:underline mt-[20px] ml-[20px] text-[15px]"
                >
                  {currentWhitelabel.url}
                </a>
                <div className="text-amber-50 hover:text-blue-600 hover:underline mt-[20px]  ml-[170px] text-[15px]">
                  T&c Apply
                </div>
              </div>
            </footer>

            <div className="flex justify-between py-3 mr-2 ">
              {/* <div className="col-span-2 text-gray-500 text-sm ml-2">
                {currentWhitelabel.createdAt
                  ? new Date(currentWhitelabel.createdAt).toLocaleString()
                  : "N/A"}
              </div> */}
              <button
                onClick={() => setPreviewOpen(false)}
                className=" hover:bg-gray-600 p-[10px] px-4 text-black rounded-lg text-end  bg-red-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Whitelabel;
