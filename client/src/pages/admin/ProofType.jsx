import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProofByType,
  fetchAllProofs,
  updateProof,
  deleteProof,
  setPreview,
  clearError,
} from "../../redux/proofType/proofTypeSlice";

const ProofType = () => {
  const dispatch = useDispatch();
  const { proofs, preview, error, loading } = useSelector(
    (state) => state.proofType
  );
  const [user, setUser] = useState("");
  const [proofType, setProofType] = useState("");
  const [formError, setFormError] = useState("");

  const proofTypes = [
    "Technical Malfunction",
    "Odds Manipulating Or Odds Hedging",
    "Live Line and Ground Line",
    "Live Line Betting",
  ];

  // Fetch all proofs on component mount
  useEffect(() => {
    if (user) {
      dispatch(fetchAllProofs(user));
    }
  }, [dispatch, user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user || !proofType) {
      setFormError("Please fill in all fields");
      return;
    }
    setFormError("");
    dispatch(fetchProofByType({ type: proofType, user }));
    setProofType("");
  };

  const handleUpdate = (type, user) => {
    const notes = prompt("Enter new notes:");
    if (notes !== null) {
      dispatch(updateProof({ type, user, notes }));
    }
  };

  const handleDelete = (type, user) => {
    if (window.confirm("Are you sure you want to delete this proof?")) {
      dispatch(deleteProof({ type, user }));
    }
  };

  const handlePreview = (type, user) => {
    dispatch(setPreview({ type, user }));
  };

  // Convert backend content to JSX
  const convertToJSX = (content) => {
    if (!content || typeof content !== "string") {
      return <div className="text-red-500">No content available</div>;
    }
    const jsxContent = content
      .replace(/class=/g, "className=")
      .replace(/<b>/g, "<strong>")
      .replace(/<\/b>/g, "</strong>");
    return <div dangerouslySetInnerHTML={{ __html: jsxContent }} />;
  };

  // Debug proofs state
  console.log("Proofs state:", proofs);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">
        Proof Type Management
      </h1>

      {/* Form */}
      <div className="max-w-md mx-auto mb-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Add Proof Type</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Proof Type
            </label>
            <select
              value={proofType}
              onChange={(e) => setProofType(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Proof Type</option>
              {proofTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          {formError && <p className="text-red-500">{formError}</p>}
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Proof Types</h2>
        {error && (
          <div className="text-red-500 mb-4">
            Error: {error}
            <button
              onClick={() => dispatch(clearError())}
              className="ml-2 text-blue-500 underline"
            >
              Clear
            </button>
          </div>
        )}
        {loading && <p>Loading proofs...</p>}
        {!Array.isArray(proofs) || proofs.length === 0 ? (
          <p>No proofs available. Try adding a proof.</p>
        ) : (
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-4 border">Username</th>
                <th className="py-2 px-4 border">Proof Type</th>
                <th className="py-2 px-4 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {proofs.map((proof) => (
                <tr key={`${proof.type}-${proof.user}`}>
                  <td className="py-2 px-4 border">{proof.user}</td>
                  <td className="py-2 px-4 border">{proof.type}</td>
                  <td className="py-2 px-4 border flex space-x-2">
                    <button
                      onClick={() => handleUpdate(proof.type, proof.user)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                      disabled={loading}
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDelete(proof.type, proof.user)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      disabled={loading}
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handlePreview(proof.type, proof.user)}
                      className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                      disabled={loading}
                    >
                      Preview
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Preview Modal */}
      {preview && preview.proof && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-2xl max-h-[80vh] overflow-auto">
            <h2 className="text-2xl font-bold mb-4">Preview</h2>
            <h3 className="text-lg font-semibold">Proof Details</h3>
            <p>
              <strong>Type:</strong> {preview.proof.type || "N/A"}
            </p>
            <p>
              <strong>User:</strong> {preview.proof.user || "N/A"}
            </p>
            <p>
              <strong>Notes:</strong> {preview.proof.notes || "None"}
            </p>
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Content</h3>
              {convertToJSX(preview.proof.content)}
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Whitelabel Data</h3>
              <pre className="bg-gray-100 p-2 rounded">
                {JSON.stringify(preview.whitelabel, null, 2)}
              </pre>
            </div>
            <button
              onClick={() => dispatch(setPreview(null))}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProofType;
