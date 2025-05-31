// import React, { useState, useEffect, useCallback } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { FaPlus, FaEdit, FaTrash, FaEye } from "react-icons/fa";
// import {
//   fetchProofs,
//   createProof,
//   updateProof,
//   deleteProof,
//   setEditingProof,
//   clearEditingProof,
//   setError,
// } from "../../redux/proofType/proofTypeSlice";
// import Header from "../../components/admin/Header";
// import DOMPurify from "dompurify";

// const API_BASE_URL = "http://localhost:2030";

// const ProofManager = () => {
//   const dispatch = useDispatch();
//   const { proofs, status, error, editingProof } = useSelector((state) => state.proof);

//   const [open, setOpen] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [currentId, setCurrentId] = useState(null);
//   const [formData, setFormData] = useState({ type: "", content: "" });
//   const [previewOpen, setPreviewOpen] = useState(false);
//   const [previewProof, setPreviewProof] = useState(null);

//   useEffect(() => {
//     if (status === "idle") {
//       dispatch(fetchProofs());
//     }
//   }, [status, dispatch]);

//   useEffect(() => {
//     if (!open) {
//       handleReset();
//       setIsEditing(false);
//       setCurrentId(null);
//     }
//   }, [open]);

//   useEffect(() => {
//     if (error) {
//       setTimeout(() => {
//         dispatch(setError(null));
//       }, 3000);
//     }
//   }, [error, dispatch]);

//   useEffect(() => {
//     if (!previewOpen) {
//       setPreviewProof(null);
//       dispatch(clearEditingProof());
//     }
//   }, [previewOpen, dispatch]);

//   useEffect(() => {
//     if (editingProof) {
//       setFormData({ type: editingProof.type, content: editingProof.content });
//     } else {
//       setFormData({ type: "", content: "" });
//     }
//   }, [editingProof]);

//   const handleChange = useCallback((e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   }, []);

//   const handleSubmit = useCallback(
//     (e) => {
//       e.preventDefault();
//       if (!formData.type || !formData.content) {
//         dispatch(setError("Type and content are required"));
//         return;
//       }
//       if (isEditing) {
//         dispatch(updateProof({ id: currentId, proofData: formData })).then((result) => {
//           if (result.meta.requestStatus === "fulfilled") {
//             setOpen(false);
//             dispatch(fetchProofs());
//           }
//         });
//       } else {
//         dispatch(createProof(formData)).then((result) => {
//           if (result.meta.requestStatus === "fulfilled") {
//             setOpen(false);
//             dispatch(fetchProofs());
//           }
//         });
//       }
//     },
//     [dispatch, isEditing, currentId, formData]
//   );

//   const handleReset = useCallback(() => {
//     setFormData({ type: "", content: "" });
//   }, []);

//   const handleEdit = useCallback(
//     (proof) => {
//       setIsEditing(true);
//       setCurrentId(proof._id);
//       dispatch(setEditingProof(proof));
//       setOpen(true);
//     },
//     [dispatch]
//   );

//   const handleDelete = useCallback(
//     (id) => {
//       if (window.confirm("Are you sure you want to delete this proof?")) {
//         dispatch(deleteProof(id));
//       }
//     },
//     [dispatch]
//   );

//   const handlePreview = useCallback((proof) => {
//     setPreviewProof(proof);
//     setPreviewOpen(true);
//   }, []);

//   return (
//     <>
//       <Header />
//       <div className="container mx-auto px-4 py-8">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold">Proof Management</h1>
//           <button
//             onClick={() => setOpen(true)}
//             className="bg-[#00008B] text-white cursor-pointer p-[10px] px-[20px] rounded-2xl text-[16px] font-bold flex justify-center items-center"
//           >
//             <span className="font-bold text-lg mr-1">
//               <FaPlus />
//             </span>
//             Add Proof
//           </button>
//         </div>

//         {/* Error Messages */}
//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//             {typeof error === "string" ? error : "An error occurred"}
//           </div>
//         )}

//         {/* Loading State */}
//         {status === "loading" && (
//           <div className="flex justify-center my-8">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00008B]"></div>
//           </div>
//         )}

//         {/* Proofs List */}
//         {status !== "loading" && (
//           <div className="bg-white shadow-md rounded-lg overflow-hidden">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Prrof Type
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Proof Content
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {proofs && proofs.length > 0 ? (
//                   proofs.map((proof) => (
//                     <tr key={proof._id}>
//                       <td className="px-6 py-4 whitespace-nowrap">{proof.type}</td>
//                       <td className="px-6 py-4">
//                         <div
//                           dangerouslySetInnerHTML={{
//                             __html: DOMPurify.sanitize(proof.content),
//                           }}
//                         />
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex">
//                         <button
//                           onClick={() => handlePreview(proof)}
//                           className="text-blue-600 hover:text-blue-900 mr-4"
//                           title="Preview"
//                         >
//                           <FaEye />
//                         </button>
//                         <button
//                           onClick={() => handleEdit(proof)}
//                           className="text-indigo-600 hover:text-indigo-900 mr-4"
//                           title="Edit"
//                         >
//                           <FaEdit />
//                         </button>
//                         <button
//                           onClick={() => handleDelete(proof._id)}
//                           className="text-red-600 hover:text-red-900"
//                           title="Delete"
//                         >
//                           <FaTrash />
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
//                       No proofs found
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {/* Edit/Add Modal */}
//         {open && (
//           <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-50 z-50">
//             <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-xl">
//               <h2 className="text-2xl font-semibold text-gray-800 mb-6">
//                 {isEditing ? "Edit Proof" : "Add Proof"}
//               </h2>
//               <form onSubmit={handleSubmit} className="space-y-5">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                    Prrof Type
//                   </label>
//                   <input
//                     type="text"
//                     name="type"
//                     value={formData.type}
//                     onChange={handleChange}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                    Proof Content(Accept Only HTML Code)
//                   </label>
//                   <textarea
//                     name="content"
//                     value={formData.content}
//                     onChange={handleChange}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
//                     rows="4"
//                     required
//                   />
//                 </div>
//                 <div className="flex justify-between items-center pt-4">
//                   <button
//                     type="button"
//                     onClick={handleReset}
//                     className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
//                   >
//                     Reset
//                   </button>
//                   <div className="flex gap-3">
//                     <button
//                       type="button"
//                       onClick={() => setOpen(false)}
//                       className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-800 transition"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-800 transition"
//                     >
//                       {isEditing ? "Update" : "Submit"}
//                     </button>
//                   </div>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//         {/* Preview Modal */}
//         {previewOpen && previewProof && (
//           <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//             <div className="bg-white w-[50vh] border rounded-lg mt-[20px] shadow-xl">
//               <header
//                 id="header"
//                 className="header-footer flex items-center h-22"
//                 style={{ backgroundColor: "#00008B" }}
//               >
//                 <h2 className="text-white text-xl font-bold pl-[20px]">
//                   {previewProof.type}
//                 </h2>
//               </header>
//               <main className="pt-[20px] pb-[20px]">
//                 <div className="font-bold text-[12px] leading-[1.5] pl-[12px] pr-[12px]">
//                   <h3>Type: {previewProof.type}</h3>
//                   <div
//                     className="mt-2"
//                     dangerouslySetInnerHTML={{
//                       __html: DOMPurify.sanitize(previewProof.content),
//                     }}
//                   />
//                 </div>
//                 <div className="h-[50vh]"></div>
//               </main>
//               <footer
//                 id="footer"
//                 style={{ backgroundColor: "#00008B" }}
//                 className="header-footer flex items-center h-[50px]"
//               >
//                 <div className="flex justify-between w-full">
//                   <span className="text-amber-50 mt-[20px] mr-[20px] text-[15px]">
//                     T&C Apply
//                   </span>
//                 </div>
//               </footer>
//               <div className="flex justify-end py-3 mr-2">
//                 <button
//                   onClick={() => setPreviewOpen(false)}
//                   className="bg-red-600 text-white p-[10px] px-4 rounded-lg hover:bg-gray-600 transition"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default ProofManager;


import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaPlus, FaEdit, FaTrash, FaEye, FaSortUp, FaSortDown, FaSort, FaFilter } from "react-icons/fa";
import {
  fetchProofs,
  createProof,
  updateProof,
  deleteProof,
  setEditingProof,
  clearEditingProof,
  setError,
} from "../../redux/proofType/proofTypeSlice";
import Header from "../../components/admin/Header";
import DOMPurify from "dompurify";

const API_BASE_URL = "http://localhost:2030";

const ProofManager = () => {
  const dispatch = useDispatch();
  const { proofs, status, error, editingProof } = useSelector((state) => state.proof);

  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({ type: "", content: "" });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewProof, setPreviewProof] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  const [gotoPage, setGotoPage] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterData, setFilterData] = useState({ type: "", content: "" });
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchProofs({ page: currentPage, limit: entriesPerPage, sort: sortConfig.key, order: sortConfig.direction, search: searchTerm }));
    }
  }, [status, dispatch, currentPage, entriesPerPage, sortConfig, searchTerm]);

  useEffect(() => {
    if (!open) {
      handleReset();
      setIsEditing(false);
      setCurrentId(null);
    }
  }, [open]);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(setError(null));
      }, 3000);
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (!previewOpen) {
      setPreviewProof(null);
      dispatch(clearEditingProof());
    }
  }, [previewOpen, dispatch]);

  useEffect(() => {
    if (editingProof) {
      setFormData({ type: editingProof.type, content: editingProof.content });
    } else {
      setFormData({ type: "", content: "" });
    }
  }, [editingProof]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!formData.type || !formData.content) {
        dispatch(setError("Type and content are required"));
        return;
      }
      if (isEditing) {
        dispatch(updateProof({ id: currentId, proofData: formData })).then((result) => {
          if (result.meta.requestStatus === "fulfilled") {
            setOpen(false);
            dispatch(fetchProofs({ page: currentPage, limit: entriesPerPage, sort: sortConfig.key, order: sortConfig.direction, search: searchTerm }));
          }
        });
      } else {
        dispatch(createProof(formData)).then((result) => {
          if (result.meta.requestStatus === "fulfilled") {
            setOpen(false);
            dispatch(fetchProofs({ page: currentPage, limit: entriesPerPage, sort: sortConfig.key, order: sortConfig.direction, search: searchTerm }));
          }
        });
      }
    },
    [dispatch, isEditing, currentId, formData, currentPage, entriesPerPage, sortConfig, searchTerm]
  );

  const handleReset = useCallback(() => {
    setFormData({ type: "", content: "" });
  }, []);

  const handleEdit = useCallback(
    (proof) => {
      setIsEditing(true);
      setCurrentId(proof._id);
      dispatch(setEditingProof(proof));
      setOpen(true);
    },
    [dispatch]
  );

  const handleDelete = useCallback(
    (id) => {
      if (window.confirm("Are you sure you want to delete this proof?")) {
        dispatch(deleteProof(id)).then(() => {
          dispatch(fetchProofs({ page: currentPage, limit: entriesPerPage, sort: sortConfig.key, order: sortConfig.direction, search: searchTerm }));
        });
      }
    },
    [dispatch, currentPage, entriesPerPage, sortConfig, searchTerm]
  );

  const handlePreview = useCallback((proof) => {
    setPreviewProof(proof);
    setPreviewOpen(true);
  }, []);

  const requestSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setGotoPage("");
    }
  };

  const handleEntriesPerPageChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
    setGotoPage("");
  };

  const handleJumpToPage = () => {
    const pageNum = parseInt(gotoPage, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setGotoPage("");
    } else {
      alert(`Please enter a valid page number between 1 and ${totalPages}`);
      setGotoPage("");
    }
  };

  const resetFilters = () => {
    setFilterData({ type: "", content: "" });
    setSearchTerm("");
    setCurrentPage(1);
    setFilterOpen(false);
  };

  // Update totalEntries and totalPages based on fetchProofs response
  useEffect(() => {
    if (status === "succeeded" && proofs.total) {
      setTotalEntries(proofs.total);
      setTotalPages(proofs.totalPages);
    }
  }, [proofs, status]);

  const getPageNumbers = () => {
    const maxPagesToShow = 3;
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Filtered proofs (client-side filtering for content)
  const filteredProofs = useMemo(() => {
    let filtered = proofs.proofs || [];
    if (filterData.type) {
      filtered = filtered.filter((proof) =>
        proof.type.toLowerCase().includes(filterData.type.toLowerCase())
      );
    }
    if (filterData.content) {
      filtered = filtered.filter((proof) =>
        proof.content.toLowerCase().includes(filterData.content.toLowerCase())
      );
    }
    return filtered;
  }, [proofs, filterData]);

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 flex">
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${filterOpen ? "mr-80" : "mr-0"}`}>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Proof Management</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setFilterOpen(true)}
                className="bg-[#FFA500] text-white cursor-pointer p-[10px] px-[20px] rounded-2xl text-[16px] font-bold flex justify-center items-center"
              >
                <FaFilter className="mr-2" />
                Filter
              </button>
              <button
                onClick={resetFilters}
                className="bg-gray-500 text-white cursor-pointer p-[10px] px-[20px] rounded-2xl text-[16px] font-bold flex justify-center items-center"
              >
                Reset Filters
              </button>
              <button
                onClick={() => setOpen(true)}
                className="bg-[#00008B] text-white cursor-pointer p-[10px] px-[20px] rounded-2xl text-[16px] font-bold flex justify-center items-center"
              >
                <span className="font-bold text-lg mr-1">
                  <FaPlus />
                </span>
                Add Proof
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-4 flex items-center space-x-4">
            <input
              type="text"
              placeholder="Quick search by type or content..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          {/* Error Messages */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {typeof error === "string" ? error : "An error occurred"}
            </div>
          )}

          {/* Loading State */}
          {status === "loading" && (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00008B]"></div>
            </div>
          )}

          {/* Proofs List */}
          {status !== "loading" && (
            <div className="bg-white shadow-md rounded-lg overflow-hidden overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      { key: "type", label: "Proof Type" },
                      { key: "content", label: "Proof Content" },
                      { key: "createdAt", label: "Created At" },
                      { key: "actions", label: "Actions" },
                    ].map((header) => (
                      <th
                        key={header.key}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => header.key !== "actions" && requestSort(header.key)}
                      >
                        <div className="flex items-center">
                          {header.label}
                          {header.key !== "actions" && (
                            <span className="ml-2">
                              {sortConfig.key === header.key ? (
                                sortConfig.direction === "asc" ? (
                                  <FaSortUp />
                                ) : (
                                  <FaSortDown />
                                )
                              ) : (
                                <FaSort className="text-gray-300" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProofs && filteredProofs.length > 0 ? (
                    filteredProofs.map((proof) => (
                      <tr key={proof._id}>
                        <td className="px-6 py-4 whitespace-nowrap">{proof.type}</td>
                        <td className="px-6 py-4">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(proof.content),
                            }}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(proof.createdAt).toLocaleDateString("en-GB")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex">
                          <button
                            onClick={() => handlePreview(proof)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                            title="Preview"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleEdit(proof)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(proof._id)}
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
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                        No proofs found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
                {Math.min(currentPage * entriesPerPage, totalEntries)} of {totalEntries} entries
              </span>
              <select
                value={entriesPerPage}
                onChange={handleEntriesPerPageChange}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                {[10, 25, 50, 100].map((num) => (
                  <option key={num} value={num}>
                    {num} entries
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 border border-gray-300 rounded-lg text-sm ${
                    currentPage === page ? "bg-blue-500 text-white" : "bg-white text-gray-700"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={gotoPage}
                  onChange={(e) => setGotoPage(e.target.value)}
                  placeholder="Go to page"
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleJumpToPage}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                >
                  Go
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Sidebar */}
        {filterOpen && (
          <div className="fixed top-0 right-0 h-full w-80 bg-white p-6 shadow-lg z-50 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Advanced Filter</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Proof Type</label>
                <input
                  type="text"
                  name="type"
                  value={filterData.type}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Proof Content</label>
                <input
                  type="text"
                  name="content"
                  value={filterData.content}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setFilterOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setFilterOpen(false);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Edit/Add Modal */}
        {open && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-xl">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                {isEditing ? "Edit Proof" : "Add Proof"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proof Type
                  </label>
                  <input
                    type="text"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proof Content (Accept Only HTML Code)
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    rows="4"
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
                      {isEditing ? "Update" : "Submit"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {previewOpen && previewProof && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white w-[50vh] border rounded-lg mt-[20px] shadow-xl">
              <header
                id="header"
                className="header-footer flex items-center h-22"
                style={{ backgroundColor: "#00008B" }}
              >
                <h2 className="text-white text-xl font-bold pl-[20px]">
                  {previewProof.type}
                </h2>
              </header>
              <main className="pt-[20px] pb-[20px]">
                <div className="font-bold text-[12px] leading-[1.5] pl-[12px] pr-[12px]">
                  <h3>Type: {previewProof.type}</h3>
                  <div
                    className="mt-2"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(previewProof.content),
                    }}
                  />
                </div>
                <div className="h-[50vh]"></div>
              </main>
              <footer
                id="footer"
                style={{ backgroundColor: "#00008B" }}
                className="header-footer flex items-center h-[50px]"
              >
                <div className="flex justify-between w-full">
                  <span className="text-amber-50 mt-[20px] mr-[20px] text-[15px]">
                    T&C Apply
                  </span>
                </div>
              </footer>
              <div className="flex justify-end py-3 mr-2">
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="bg-red-600 text-white p-[10px] px-4 rounded-lg hover:bg-gray-600 transition"
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

export default ProofManager;