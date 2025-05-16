

import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaPlus, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import {
  fetchSports,
  fetchSportById,
  createSport,
  updateSport,
  deleteSport,
  clearError,
  clearSelectedSport,
} from "../../redux/sports/sportsSlice";
import Header from "../../components/admin/Header";

// Constants
const API_BASE_URL = "http://localhost:2030";

const SportsManager = () => {
  const dispatch = useDispatch();
  const { sports, selectedSport, loading, error } = useSelector((state) => state.sports);

  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({ sportsName: "" });
  const [previewOpen, setPreviewOpen] = useState(false);

  // Fetch sports on mount
  useEffect(() => {
    dispatch(fetchSports());
  }, [dispatch]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      handleReset();
      setIsEditing(false);
      setCurrentId(null);
    }
  }, [open]);

  // Clear errors after 3 seconds
  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError());
      }, 3000);
    }
  }, [error, dispatch]);

  // Clear selected sport when preview closes
  useEffect(() => {
    if (!previewOpen) {
      dispatch(clearSelectedSport());
    }
  }, [previewOpen, dispatch]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (isEditing) {
        dispatch(updateSport({ id: currentId, sportData: formData })).then((result) => {
          if (result.meta.requestStatus === "fulfilled") {
            setOpen(false);
            dispatch(fetchSports());
          }
        });
      } else {
        dispatch(createSport(formData)).then((result) => {
          if (result.meta.requestStatus === "fulfilled") {
            setOpen(false);
            dispatch(fetchSports());
          }
        });
      }
    },
    [dispatch, isEditing, currentId, formData]
  );

  const handleReset = useCallback(() => {
    setFormData({ sportsName: "" });
  }, []);

  const handleEdit = useCallback((sport) => {
    setIsEditing(true);
    setCurrentId(sport._id);
    setFormData({ sportsName: sport.sportsName });
    setOpen(true);
  }, []);

  const handleDelete = useCallback(
    (id) => {
      if (window.confirm("Are you sure you want to delete this sport?")) {
        dispatch(deleteSport(id));
      }
    },
    [dispatch]
  );

  const handlePreview = useCallback(
    (id) => {
      dispatch(fetchSportById(id)).then(() => {
        setPreviewOpen(true);
      });
    },
    [dispatch]
  );

  return (
    <>
    <Header/>
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add Sports</h1>
        <button
          onClick={() => setOpen(true)}
          className="bg-[#00008B] text-white cursor-pointer p-[10px] px-[20px] rounded-2xl text-[16px] font-bold flex justify-center items-center"
        >
          <span className="font-bold text-lg mr-1">
            <FaPlus />
          </span>
          Add Sport
        </button>
      </div>

      {/* Error Messages */}
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

      {/* Sports List */}
      {!loading && (
        <div className="bg-white shadow-md rounded-lg  overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sport Name
                </th>
                  <th className="px-6 flex  justify-end mr-[40px] py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sports && sports.length > 0 ? (
                sports.map((sport) => (
                  <tr key={sport._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{sport.sportsName}</td>
                    <td className="px-6 py-4 flex justify-end mr-[30px]  whitespace-nowrap text-sm font-medium flex">
                      <button
                        onClick={() => handlePreview(sport._id)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        title="Preview"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleEdit(sport)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(sport._id)}
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
                    colSpan="3"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No sports found
                  </td>
                </tr>
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
              {isEditing ? "Edit Sport" : "Add Sport"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sport Name
                </label>
                <input
                  type="text"
                  name="sportsName"
                  value={formData.sportsName}
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
                    {isEditing ? "Update" : "Submit"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewOpen && selectedSport && (
        <div className="fixed inset-0 flex items-center justify-center bg-transparent">
          <div className="bg-white w-[50vh] border mt-[20px]">
            <header
              id="header"
              className="header-footer flex items-center h-22"
              style={{ backgroundColor: "#00008B" }}
            >
              <h2 className="text-white text-xl font-bold pl-[20px]">
                {selectedSport.sportsName}
              </h2>
            </header>
            <main className="pt-[20px]">
              <div className="flex justify-between font-bold text-[12px] leading-[1.5] pl-[12px] pr-[12px] pb-[10px]">
                <div>
                  <h3>Sport: {selectedSport.sportsName}</h3>
                </div>
              </div>
              <div className="h-[50vh]"></div>
            </main>
            <footer
              id="footer"
              style={{ backgroundColor: "#00008B" }}
              className="header-footer flex items-center h-[50px]"
            >
              <div className="flex justify-between w-full">
                <span className="text-amber-50 mt-[20px] ml-[20px] text-[15px]">
                  Sport ID: {selectedSport._id}
                </span>
                <span className="text-amber-50 mt-[20px] mr-[20px] text-[15px]">
                  T&C Apply
                </span>
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

export default SportsManager;