import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "../../components/admin/Header";
import {
  fetchAllProofs,
  fetchProofByType,
  updateProofContent,
  clearSuccess,
  clearError,
} from "../../redux/markettype/markettypeSlice";
import { fetchWhitelabels } from "../../redux/whitelabel/whitelabelSlice";
import { FaEdit, FaSave } from "react-icons/fa";

const ProofManagement = () => {
  const dispatch = useDispatch();
  const { proofs, currentProof, loading, error, success, message } =
    useSelector((state) => state.proof);
  const { whitelabels } = useSelector((state) => state.whitelabel);

  // State for form inputs
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedProofType, setSelectedProofType] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState("");

  // Available proof types
  const proofTypes = [
    "Technical Malfunction",
    "Odds Manipulating Or Odds Hedging",
    "Live Line and Ground Line",
    "Live Line Betting",
  ];

  // Fetch whitelabels for dropdown on mount
  useEffect(() => {
    dispatch(fetchWhitelabels());
  }, [dispatch]);

  // Set first user as default when whitelabels are loaded
  useEffect(() => {
    if (whitelabels && whitelabels.length > 0 && !selectedUser) {
      setSelectedUser(whitelabels[0].user);
    }
  }, [whitelabels, selectedUser]);

  // Fetch proofs when user is selected
  useEffect(() => {
    if (selectedUser) {
      dispatch(fetchAllProofs(selectedUser));
    }
  }, [dispatch, selectedUser]);

  // Handle success state
  useEffect(() => {
    if (success) {
      setEditMode(false);
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

  // Handle user selection change
  const handleUserChange = useCallback((e) => {
    setSelectedUser(e.target.value);
    setSelectedProofType("");
    setEditMode(false);
  }, []);

  // Handle proof type selection change
  const handleProofTypeChange = useCallback(
    (e) => {
      const proofType = e.target.value;
      setSelectedProofType(proofType);
      setEditMode(false);

      if (proofType && selectedUser) {
        dispatch(fetchProofByType({ type: proofType, user: selectedUser }));
      }
    },
    [dispatch, selectedUser]
  );

  // Toggle edit mode
  const handleEditClick = useCallback(() => {
    if (currentProof) {
      setEditContent(currentProof.content);
      setEditMode(true);
    }
  }, [currentProof]);

  // Handle content update
  const handleContentUpdate = useCallback(() => {
    if (selectedProofType && selectedUser && editContent.trim()) {
      dispatch(
        updateProofContent({
          type: selectedProofType,
          content: editContent,
          user: selectedUser,
        })
      );
    }
  }, [dispatch, selectedProofType, selectedUser, editContent]);

  // Get the content to display based on current state
  const displayContent = currentProof ? currentProof.content : "";

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Proof Management</h1>
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

        {/* Selection Controls */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select User
              </label>
              <select
                value={selectedUser}
                onChange={handleUserChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                disabled={loading}
              >
                <option value="">Select a user</option>
                {whitelabels &&
                  whitelabels.map((item) => (
                    <option key={item._id} value={item.user}>
                      {item.user}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Proof Type
              </label>
              <select
                value={selectedProofType}
                onChange={handleProofTypeChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                disabled={!selectedUser || loading}
              >
                <option value="">Select a proof type</option>
                {proofTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00008B]"></div>
          </div>
        )}

        {/* Content Display/Edit Section */}
        {!loading && selectedProofType && currentProof && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {selectedProofType} Content
              </h2>
              {!editMode ? (
                <button
                  onClick={handleEditClick}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition"
                  disabled={loading}
                >
                  <FaEdit className="mr-2" /> Edit Content
                </button>
              ) : (
                <button
                  onClick={handleContentUpdate}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700 transition"
                  disabled={loading}
                >
                  <FaSave className="mr-2" /> Save Changes
                </button>
              )}
            </div>

            {editMode ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition min-h-[300px]"
                placeholder="Enter content here..."
              />
            ) : (
              <div className="prose max-w-none border border-gray-200 rounded-lg p-4 min-h-[300px] bg-gray-50">
                {displayContent || "No content available"}
              </div>
            )}
          </div>
        )}

        {/* Proofs List Table */}
        {!loading && selectedUser && proofs && proofs.length > 0 && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden mt-8">
            <h2 className="text-xl font-semibold p-4 border-b">
              All Proofs for {selectedUser}
            </h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content Preview
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {proofs.map((proof) => (
                  <tr key={proof.type}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {proof.type}
                    </td>
                    <td className="px-6 py-4">
                      <div className="line-clamp-2 text-sm text-gray-600">
                        {proof.content}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedProofType(proof.type);
                          dispatch(
                            fetchProofByType({
                              type: proof.type,
                              user: selectedUser,
                            })
                          );
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        View/Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default ProofManagement;
