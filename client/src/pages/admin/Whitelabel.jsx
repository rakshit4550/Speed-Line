import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Header from "../../components/admin/Header";
import { FaPlus, FaEdit, FaTrash, FaEye, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import {
  fetchWhitelabels,
  fetchWhitelabelById,
  createWhitelabel,
  updateWhitelabel,
  deleteWhitelabel,
  clearSuccess,
  clearError,
} from "../../redux/whitelabel/whitelabelSlice";

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
    group: "",
    hexacode: "",
    whitelabelUrl: "",
    logo: null,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  
  // State for sorting and pagination
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [goToPage, setGoToPage] = useState(""); 
  const itemsPerPage = 10;

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

  // Handle success state
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
      group: "",
      hexacode: "",
      whitelabelUrl: "",
      logo: null,
    });
  }, []);

  const handleEdit = useCallback((whitelabel) => {
    setIsEditing(true);
    setCurrentId(whitelabel._id);
    setFormData({
      username: whitelabel.whitelabel_user || "",
      group: whitelabel.group || "",
      hexacode: whitelabel.hexacode || "",
      whitelabelUrl: whitelabel.url || "",
      logo: null,
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

  const handlePreview = useCallback(
    (id) => {
      dispatch(fetchWhitelabelById(id)).then(() => {
        setPreviewOpen(true);
      });
    },
    [dispatch]
  );

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  // Sorting function
  const handleSort = useCallback((key) => {
    setSortConfig((prev) => {
      let direction = "asc";
      if (prev.key === key && prev.direction === "asc") {
        direction = "desc";
      } else if (prev.key === key && prev.direction === "desc") {
        direction = null;
        key = null;
      }
      console.log(`Sorting by ${key || "none"} in ${direction || "none"} order`);
      return { key, direction };
    });
  }, []);

  // Filter and sort whitelabels
  const filteredAndSortedWhitelabels = useMemo(() => {
    console.log("Input whitelabels:", whitelabels);
    let result = [...whitelabels];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) =>
        [
          item.whitelabel_user?.toLowerCase().trim() || "",
          item.group?.toLowerCase().trim() || "",
          item.url?.toLowerCase().trim() || "",
        ].some((field) => field.includes(query))
      );
      console.log("Filtered results:", result);
    }

    // Apply sorting
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        let aValue, bValue;

        // Map fields to correct property names
        if (sortConfig.key === "whitelabel_user") {
          aValue = a.whitelabel_user || "";
          bValue = b.whitelabel_user || "";
        } else if (sortConfig.key === "group") {
          aValue = a.group || "";
          bValue = b.group || "";
        } else if (sortConfig.key === "url") {
          aValue = a.url || "";
          bValue = b.url || "";
        } else {
          aValue = a[sortConfig.key] || "";
          bValue = b[sortConfig.key] || "";
        }

        // Trim and ensure string conversion for consistent sorting
        aValue = String(aValue).trim().toLowerCase();
        bValue = String(bValue).trim().toLowerCase();

        // Debug the values being compared
        console.log(`Comparing ${sortConfig.key}: "${aValue}" vs "${bValue}"`);

        // Alphanumeric sorting with localeCompare
        if (sortConfig.direction === "asc") {
          return aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: "base" });
        } else {
          return bValue.localeCompare(aValue, undefined, { numeric: true, sensitivity: "base" });
        }
      });
      console.log("Sorted results:", result);
    }

    return result;
  }, [whitelabels, searchQuery, sortConfig]);

  // Pagination logic (only applied when no search query)
  const totalItems = filteredAndSortedWhitelabels.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const displayedWhitelabels = useMemo(() => {
    if (searchQuery.trim()) {
      // Show all filtered and sorted results when searching
      console.log("Displaying all filtered results:", filteredAndSortedWhitelabels);
      return filteredAndSortedWhitelabels;
    }
    // Apply pagination when not searching
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = filteredAndSortedWhitelabels.slice(startIndex, startIndex + itemsPerPage);
    console.log("Paginated results:", paginated);
    return paginated;
  }, [filteredAndSortedWhitelabels, currentPage, searchQuery]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setGoToPage(""); // Clear the input after navigating
    }
  };

  const handleGoToPage = useCallback(() => {
    const pageNumber = parseInt(goToPage, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      handlePageChange(pageNumber);
    } else {
      alert(`Please enter a valid page number between 1 and ${totalPages}`);
      setGoToPage("");
    }
  }, [goToPage, totalPages]);

  const handleGoToPageChange = useCallback((e) => {
    const value = e.target.value;
    // Allow only numbers
    if (/^\d*$/.test(value)) {
      setGoToPage(value);
    }
  }, []);

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
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search by Whitelabel, group, or URL"
              value={searchQuery}
              onChange={handleSearchChange}
              className="px-4.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition w-68"
            />
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

        {/* Search Results Count */}
        {!loading && searchQuery.trim() && (
          <div className="mb-4 text-gray-700">
            {totalItems} {totalItems === 1 ? "data found" : "data found"}
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
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("whitelabel_user")}
                  >
                    Whitelabel User
                    {sortConfig.key === "whitelabel_user" ? (
                      sortConfig.direction === "asc" ? (
                        <FaSortUp className="inline ml-1" />
                      ) : sortConfig.direction === "desc" ? (
                        <FaSortDown className="inline ml-1" />
                      ) : (
                        <FaSort className="inline ml-1" />
                      )
                    ) : (
                      <FaSort className="inline ml-1" />
                    )}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("group")}
                  >
                    WhatsApp Group
                    {sortConfig.key === "group" ? (
                      sortConfig.direction === "asc" ? (
                        <FaSortUp className="inline ml-1" />
                      ) : sortConfig.direction === "desc" ? (
                        <FaSortDown className="inline ml-1" />
                      ) : (
                        <FaSort className="inline ml-1" />
                      )
                    ) : (
                      <FaSort className="inline ml-1" />
                    )}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Color
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("url")}
                  >
                    URL
                    {sortConfig.key === "url" ? (
                      sortConfig.direction === "asc" ? (
                        <FaSortUp className="inline ml-1" />
                      ) : sortConfig.direction === "desc" ? (
                        <FaSortDown className="inline ml-1" />
                      ) : (
                        <FaSort className="inline ml-1" />
                      )
                    ) : (
                      <FaSort className="inline ml-1" />
                    )}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedWhitelabels && displayedWhitelabels.length > 0 ? (
                  displayedWhitelabels.map((item) => (
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
                        {item.whitelabel_user || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.group || "N/A"}
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
                          {item.url || "N/A"}
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

        {/* Pagination Controls (only shown when no search query) */}
        {!loading && !searchQuery.trim() && totalItems > itemsPerPage && (
          <div className="flex flex-col items-end mt-4 space-y-2">
            <div className="flex justify-between items-center w-full">
              <div>
                Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === page
                        ? "bg-[#00008B] text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
            {/* "Go to Page" Input and Button */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={goToPage}
                onChange={handleGoToPageChange}
                placeholder=""
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition w-24"
              />
              <button
                onClick={handleGoToPage}
                className="px-4 py-2 bg-[#00008B] text-white rounded-lg hover:bg-blue-900 transition"
              >
                Go
              </button>
            </div>
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
                  WhatsApp Group
                </label>
                <input
                  type="text"
                  name="group"
                  value={formData.group}
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
                  type="text"
                  name="whitelabelUrl"
                  value={formData.whitelabelUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo (Size: 902*271, Background: Transparent, ImageFile: .PNG)
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
        <div className="fixed inset-0 flex items-center justify-center bg-transparent">
          <div className="bg-white w-[50vh] border mt-[20px]">
            <header
              id="header"
              className="header-footer flex items-center h-22"
              style={{ backgroundColor: currentWhitelabel.hexacode }}
            >
              <img
                src={getImageUrl(currentWhitelabel.logo)}
                id="activeLogo"
                alt="Client Logo"
                className="h-[70px] pl-[20px]"
              />
            </header>
            <main className="pt-[20px]">
              <div className="flex justify-between font-bold text-[12px] leading-[1.5] pl-[12px] pr-[12px] pb-[10px]">
                <div>
                  <h2>Whitelabel User: {currentWhitelabel.whitelabel_user || "N/A"}</h2>
                  <h2>Group: {currentWhitelabel.group || "N/A"}</h2>
                </div>
                <div></div>
                <div></div>
              </div>
              <div className="h-[50vh]"></div>
            </main>
            <footer
              id="footer"
              style={{ backgroundColor: currentWhitelabel.hexacode }}
              className="header-footer flex items-center h-[50px]"
            >
              <div className="flex justify-between w-full">
                <a
                  href={currentWhitelabel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-50 hover:text-blue-600 hover:underline mt-[20px] ml-[20px] text-[15px]"
                >
                  {currentWhitelabel.url || "N/A"}
                </a>
                <div className="text-amber-50 hover:text-blue-600 hover:underline mt-[20px] mr-[20px] text-[15px]">
                  T&C Apply
                </div>
              </div>
            </footer>

            <div className="flex justify-end py-3 mr-2">
              <button
                onClick={() => setPreviewOpen(false)}
                className="hover:bg-gray-600 p-[10px] px-4 text-white rounded-lg bg-red-600 transition"
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

