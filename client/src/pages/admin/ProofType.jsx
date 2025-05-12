import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaPlus, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import {
  fetchProofByType,
  fetchAllProofs,
  updateProof,
  deleteProof,
  setPreview,
  clearError,
} from "../../redux/proofType/proofTypeSlice";

const DEFAULT_PLACEHOLDER = "/placeholder.png";

const ProofType = () => {
  const dispatch = useDispatch();
  const { proofs, preview, error, loading } = useSelector(
    (state) => state.proofType
  );

  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProof, setCurrentProof] = useState(null);
  const [formData, setFormData] = useState({
    user: "",
    proofType: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const proofTypes = [
    "Technical Malfunction",
    "Odds Manipulating Or Odds Hedging",
    "Live Line and Ground Line",
    "Live Line Betting",
  ];

  // Fetch proofs with retry
  useEffect(() => {
    let retries = 3;
    const fetchData = async () => {
      try {
        await dispatch(fetchAllProofs()).unwrap();
      } catch (err) {
        if (retries > 0) {
          retries -= 1;
          setTimeout(fetchData, 2000);
        } else {
          console.error("Failed to fetch proofs after retries:", err);
        }
      }
    };
    fetchData();
  }, [dispatch]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      handleReset();
      setIsEditing(false);
      setCurrentProof(null);
    }
  }, [open]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!formData.user || !formData.proofType) {
        alert("Please fill in all fields");
        return;
      }
      if (isEditing && currentProof) {
        dispatch(
          updateProof({
            type: currentProof.type,
            user: currentProof.user,
            notes: prompt("Enter new notes:") || currentProof.notes,
          })
        );
      } else {
        dispatch(
          fetchProofByType({ type: formData.proofType, user: formData.user })
        );
      }
      setOpen(false);
    },
    [dispatch, isEditing, currentProof, formData]
  );

  const handleReset = useCallback(() => {
    setFormData({
      user: "",
      proofType: "",
    });
  }, []);

  const handleEdit = useCallback((proof) => {
    setIsEditing(true);
    setCurrentProof(proof);
    setFormData({
      user: proof.user,
      proofType: proof.type,
    });
    setOpen(true);
  }, []);

  const handleDelete = useCallback(
    (proof) => {
      if (window.confirm("Are you sure you want to delete this proof?")) {
        dispatch(deleteProof({ type: proof.type, user: proof.user }));
      }
    },
    [dispatch]
  );

  const handlePreview = useCallback(
    (proof) => {
      dispatch(setPreview({ type: proof.type, user: proof.user }));
      setPreviewOpen(true);
    },
    [dispatch]
  );

  const convertToJSX = useCallback((content) => {
    if (!content || typeof content !== "string") {
      return <div className="text-red-500">No content available</div>;
    }
    const jsxContent = content
      .replace(/class=/g, "className=")
      .replace(/<b>/g, "<strong>")
      .replace(/<\/b>/g, "</strong>");
    return <div dangerouslySetInnerHTML={{ __html: jsxContent }} />;
  }, []);

  const filteredProofs = useMemo(() => {
    if (!Array.isArray(proofs)) return [];
    return proofs.filter((proof) =>
      proof.user.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [proofs, searchTerm]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Proof Type Management</h1>
        <button
          onClick={() => setOpen(true)}
          className="bg-[#00008B] text-white cursor-pointer p-[10px] px-[20px] rounded-2xl text-[16px] font-bold flex justify-center items-center"
        >
          <span className="font-bold text-lg mr-1">
            <FaPlus />
          </span>
          Add Proof Type
        </button>
      </div>

      {/* Error Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span>{typeof error === "string" ? error : "An error occurred"}</span>
          <button
            onClick={() => dispatch(fetchAllProofs())}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00008B]"></div>
        </div>
      )}

      {/* Proof List */}
      {!loading && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proof Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!loading && filteredProofs.length === 0 && !error ? (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No proofs found
                  </td>
                </tr>
              ) : (
                filteredProofs.map((proof) => (
                  <tr key={`${proof.type}-${proof.user}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {proof.user}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {proof.type}
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
                        onClick={() => handleDelete(proof)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit/Add Modal */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-xl">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              {isEditing ? "Edit Proof Type" : "Add Proof Type"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
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
                  Proof Type
                </label>
                <select
                  name="proofType"
                  value={formData.proofType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                >
                  <option value="">Select Proof Type</option>
                  {proofTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
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
      {previewOpen && preview && preview.proof && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-xl">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Proof Type Preview
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-gray-700">Username:</div>
                <div className="col-span-2">{preview.proof.user || "N/A"}</div>
                <div className="font-medium text-gray-700">Proof Type:</div>
                <div className="col-span-2">{preview.proof.type || "N/A"}</div>
                <div className="font-medium text-gray-700">Notes:</div>
                <div className="col-span-2">
                  {preview.proof.notes || "None"}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Content:</h3>
                {convertToJSX(preview.proof.content)}
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  Whitelabel Data:
                </h3>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(preview.whitelabel, null, 2)}
                </pre>
              </div>
            </div>
            <div className="flex justify-between mt-8">
              <button
                onClick={() => handleEdit(preview.proof)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center"
              >
                <FaEdit className="mr-2" /> Edit
              </button>
              <button
                onClick={() => {
                  setPreviewOpen(false);
                  dispatch(setPreview(null));
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProofType;
