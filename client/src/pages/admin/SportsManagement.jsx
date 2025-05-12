import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "../../components/admin/Header";
import {
  fetchAllSports,
  createSports,
  updateSports,
  deleteSports,
  clearMessage,
} from "../../redux/sports/sportsSlice";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

const SportsManagement = () => {
  const dispatch = useDispatch();
  const { sports, loading, error, message } = useSelector((state) => state.sports);
  const [user, setUser] = useState("");
  const [sportsName, setSportsName] = useState("");
  const [editId, setEditId] = useState(null);

  const sportsOptions = [
    "Cricket",
    "Kabaddi",
    "Football",
    "Basketball",
    "Hockey",
    "Volleyball",
    "Tennis",
    "Badminton",
    "Athletics",
    "Wrestling",
  ];

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!sportsName || !user) {
      dispatch({ type: "sports/setError", payload: "Sports name and user are required" });
      return;
    }

    if (editId) {
      dispatch(updateSports({ id: editId, sportsName, user }));
      setEditId(null);
    } else {
      dispatch(createSports({ sportsName, user }));
    }
    setSportsName("");
    setUser("");
  };

  // Handle edit
  const handleEdit = (sport) => {
    setEditId(sport._id);
    setSportsName(sport.sportsName);
    setUser(sport.user);
  };

  // Handle delete
  const handleDelete = (id) => {
    dispatch(deleteSports(id));
  };

  // Fetch sports when user changes
  useEffect(() => {
    if (user) {
      dispatch(fetchAllSports(user));
    }
  }, [user, dispatch]);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        dispatch(clearMessage());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, error, dispatch]);

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Sports Management</h1>

        {/* Success/Error Messages */}
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Form for Creating/Updating Sports */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{editId ? "Update Sport" : "Add New Sport"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Whitelabel User
                </label>
                <input
                  type="text"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  placeholder="Enter whitelabel user (e.g., viram)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Sport
                </label>
                <select
                  value={sportsName}
                  onChange={(e) => setSportsName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  disabled={loading}
                >
                  <option value="">Select a sport</option>
                  {sportsOptions.map((sport) => (
                    <option key={sport} value={sport}>
                      {sport}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition"
              disabled={loading}
            >
              {editId ? (
                <>
                  <FaEdit className="mr-2" /> Update Sport
                </>
              ) : (
                <>
                  <FaPlus className="mr-2" /> Add Sport
                </>
              )}
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00008B]"></div>
          </div>
        )}

        {/* Sports List Table */}
        {!loading && sports.length > 0 && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <h2 className="text-xl font-semibold p-4 border-b">Sports for {user || "All Users"}</h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sport Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sports.map((sport) => (
                  <tr key={sport._id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{sport.sportsName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{sport.user}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(sport)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                        disabled={loading}
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(sport._id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={loading}
                      >
                        <FaTrash />
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

export default SportsManagement;