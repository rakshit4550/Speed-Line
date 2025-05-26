import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { createMarket, updateMarket, getMarketById, getAllMarkets, deleteMarket, clearMessages } from '../../redux/market/marketSlice';
import Header from '../../components/admin/Header';

const MarketManager = () => {
  const dispatch = useDispatch();
  // Fallback for undefined state.market
  const marketState = useSelector((state) => state.market || {});
  const { markets = [], selectedMarket = null, loading = false, error = null, successMessage = null } = marketState;

  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({ marketName: '' });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewMarket, setPreviewMarket] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [goToPage, setGoToPage] = useState(""); // State for "Go to Page" input
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const itemsPerPage = 10;

  // Fetch markets on mount
  useEffect(() => {
    dispatch(getAllMarkets());
  }, [dispatch]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      handleReset();
      setIsEditing(false);
      setCurrentId(null);
    }
  }, [open]);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, dispatch]);

  // Clear preview market when preview modal closes
  useEffect(() => {
    if (!previewOpen) {
      setPreviewMarket(null);
    }
  }, [previewOpen]);

  // Update form data when selectedMarket changes
  useEffect(() => {
    if (selectedMarket) {
      setFormData({ marketName: selectedMarket.marketName });
    } else {
      setFormData({ marketName: '' });
    }
  }, [selectedMarket]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!formData.marketName.trim()) {
        dispatch(setError('Market name is required'));
        return;
      }
      if (isEditing) {
        dispatch(updateMarket({ id: currentId, marketData: formData })).then((result) => {
          if (result.meta.requestStatus === 'fulfilled') {
            setOpen(false);
            dispatch(getAllMarkets());
          }
        });
      } else {
        dispatch(createMarket(formData)).then((result) => {
          if (result.meta.requestStatus === 'fulfilled') {
            setOpen(false);
            dispatch(getAllMarkets());
          }
        });
      }
    },
    [dispatch, isEditing, currentId, formData]
  );

  const handleReset = useCallback(() => {
    setFormData({ marketName: '' });
  }, []);

  const handleEdit = useCallback(
    (market) => {
      setIsEditing(true);
      setCurrentId(market._id);
      dispatch(getMarketById(market._id));
      setOpen(true);
    },
    [dispatch]
  );

  const handleDelete = useCallback(
    (id) => {
      if (window.confirm('Are you sure you want to delete this market?')) {
        dispatch(deleteMarket(id));
      }
    },
    [dispatch]
  );

  const handlePreview = useCallback(
    (market) => {
      setPreviewMarket(market);
      setPreviewOpen(true);
    },
    []
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
    setCurrentPage(1); // Reset to first page on sort
  }, []);

  // Filter and sort markets
  const filteredAndSortedMarkets = useMemo(() => {
    console.log("Input markets:", markets);
    let result = [...markets];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) =>
        item.marketName?.toLowerCase().trim().includes(query)
      );
      console.log("Filtered results:", result);
    }

    // Apply sorting
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key] || "";
        let bValue = b[sortConfig.key] || "";

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
  }, [markets, searchQuery, sortConfig]);

  // Pagination logic
  const totalItems = filteredAndSortedMarkets.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const displayedMarkets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = filteredAndSortedMarkets.slice(startIndex, startIndex + itemsPerPage);
    console.log("Paginated results:", paginated);
    return paginated;
  }, [filteredAndSortedMarkets, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setGoToPage(""); // Clear the input after navigating
    }
  };

  // Handle "Go to Page" functionality
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

  return (
    <>  
      <Header/>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Market Management</h1>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search by Market Name"
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
              Add Market
            </button>
          </div>
        </div>

        {/* Error Messages */}
        {(error || successMessage) && (
          <div
            className={`border px-4 py-3 rounded mb-4 ${
              error ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700'
            }`}
          >
            {error || successMessage}
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

        {/* Markets List */}
        {!loading && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("marketName")}
                  >
                    Market Name
                    {sortConfig.key === "marketName" ? (
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
                  <th className="px-6 py-3 flex justify-end mr-[40px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedMarkets && displayedMarkets.length > 0 ? (
                  displayedMarkets.map((market) => (
                    <tr key={market._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{market.marketName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex justify-end mr-[30px]">
                        <button
                          onClick={() => handlePreview(market)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                          title="Preview"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleEdit(market)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(market._id)}
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
                    <td colSpan="2" className="px-6 py-4 text-center text-gray-500">
                      No markets found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalItems > itemsPerPage && (
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

        {/* Edit/Add Modal */}
        {open && (
          <div className="fixed inset-0 flex items-center justify-center bg-transparent  bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-xl">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                {isEditing ? 'Edit Market' : 'Add Market'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Market Name</label>
                  <input
                    type="text"
                    name="marketName"
                    value={formData.marketName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
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
                      {isEditing ? 'Update' : 'Submit'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {previewOpen && previewMarket && (
          <div className="fixed inset-0 flex items-center justify-center bg-transparent">
            <div className="bg-white w-[50vh] border mt-[20px]">
              <header
                id="header"
                className="header-footer flex items-center h-22"
                style={{ backgroundColor: '#00008B' }}
              >
                <h2 className="text-white text-xl font-bold pl-[20px]">{previewMarket.marketName}</h2>
              </header>
              <main className="pt-[20px]">
                <div className="font-bold text-[12px] leading-[1.5] pl-[12px] pr-[12px] pb-[10px]">
                  <h3>Market Name: {previewMarket.marketName}</h3>
                </div>
                <div className="h-[50vh]"></div>
              </main>
              <footer
                id="footer"
                style={{ backgroundColor: '#00008B' }}
                className="header-footer flex items-center h-[50px]"
              >
                <div className="flex justify-between w-full">
                  <span className="text-amber-50 mt-[20px] ml-[20px] text-[15px]">
                    Market ID: {previewMarket._id}
                  </span>
                  <span className="text-amber-50 mt-[20px] mr-[20px] text-[15px]">T&C Apply</span>
                </div>
              </footer>
              <div className="flex justify-between py-3 mr-2">
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="hover:bg-gray-600 p-[10px] px-4 text-black rounded-lg bg-red-600 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MarketManager;