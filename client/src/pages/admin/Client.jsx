import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createClient,
  updateClient,
  getProofTypes,
  getSports,
  getMarkets,
  getAllWhitelabels,
  clearSelectedClient,
  clearError,
} from '../../redux/client/clientSlice';

const ClientForm = () => {
  const dispatch = useDispatch();
  const { selectedClient, proofTypes, sports, markets, whitelabelUsers, loading, error } = useSelector(
    (state) => state.clients
  );

  // Form state
  const [formData, setFormData] = useState({
    agentname: '',
    username: '',
    amount: '',
    prooftype: '',
    sportname: '',
    marketname: '',
    profitAndLoss: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isDropdownLoading, setIsDropdownLoading] = useState(true);
  const [formError, setFormError] = useState('');
  const [submittedClient, setSubmittedClient] = useState(null); // State for preview

  // Populate form when editing a client
  useEffect(() => {
    if (selectedClient) {
      setFormData({
        agentname: selectedClient.agentname || '',
        username: selectedClient.username?.whitelabel_user || '',
        amount: selectedClient.amount || '',
        prooftype: selectedClient.prooftype?.type || '',
        sportname: selectedClient.sportname?.sportsName || '',
        marketname: selectedClient.marketname?.marketName || '',
        profitAndLoss: selectedClient.profitAndLoss || '',
      });
      setSearchQuery(selectedClient.username?.whitelabel_user || '');
    }
  }, [selectedClient]);

  // Fetch dropdown data and whitelabel users on mount
  useEffect(() => {
    setIsDropdownLoading(true);
    Promise.all([
      dispatch(getProofTypes()),
      dispatch(getSports()),
      dispatch(getMarkets()),
      dispatch(getAllWhitelabels()),
    ])
      .then(() => {
        setIsDropdownLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching dropdown data:', err);
        setFormError('Failed to load dropdown data. Please try again.');
        setIsDropdownLoading(false);
      });
  }, [dispatch]);

  // Log data for debugging
  useEffect(() => {
    console.log('Sports data:', sports);
    console.log('Markets data:', markets);
    console.log('Whitelabel users:', whitelabelUsers);
    console.log('Filtered users:', filteredUsers);
    console.log('Whitelabel users structure:', JSON.stringify(whitelabelUsers, null, 2));
  }, [sports, markets, whitelabelUsers, filteredUsers]);

  // Filter whitelabel users based on search query
  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = whitelabelUsers.filter((user) =>
        user.whitelabel_user?.toLowerCase().includes(searchQuery.trim().toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  }, [searchQuery, whitelabelUsers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setFormData((prev) => ({ ...prev, username: e.target.value }));
    setFormError('');
  };

  const handleUserSelect = (whitelabelUser) => {
    console.log('Selected user:', { whitelabelUser });
    setFormData((prev) => ({ ...prev, username: whitelabelUser }));
    setSearchQuery(whitelabelUser);
    setFilteredUsers([]);
  };

  const validateForm = () => {
    if (!formData.agentname) return 'Agent name is required';
    if (!formData.username) return 'Please select a valid username';
    const selectedUser = whitelabelUsers.find(
      (user) => user.whitelabel_user.toLowerCase() === formData.username.toLowerCase()
    );
    if (!selectedUser) {
      return 'Invalid whitelabel user. Please select a valid user from the list.';
    }
    if (!formData.amount || isNaN(formData.amount)) return 'Valid amount is required';
    if (!formData.prooftype) return 'Proof type is required';
    if (!proofTypes.find((p) => p.type.toLowerCase() === formData.prooftype.toLowerCase())) {
      return 'Invalid proof type. Please select a valid proof type.';
    }
    if (!formData.sportname) return 'Sport name is required';
    if (!sports.find((s) => s.sportsName.toLowerCase() === formData.sportname.toLowerCase())) {
      return 'Invalid sport name. Please select a valid sport.';
    }
    if (!formData.marketname) return 'Market name is required';
    if (!markets.find((m) => m.marketName.toLowerCase() === formData.marketname.toLowerCase())) {
      return 'Invalid market name. Please select a valid market.';
    }
    if (!formData.profitAndLoss || isNaN(formData.profitAndLoss)) return 'Valid profit and loss is required';
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form data on submit:', formData);
    console.log('Search query:', searchQuery);
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const clientData = {
      agentname: formData.agentname,
      username: formData.username,
      amount: parseFloat(formData.amount),
      prooftype: formData.prooftype,
      sportname: formData.sportname,
      marketname: formData.marketname,
      profitAndLoss: parseFloat(formData.profitAndLoss),
    };

    if (selectedClient) {
      dispatch(updateClient({ id: selectedClient._id, clientData })).then((result) => {
        if (result.meta.requestStatus === 'fulfilled') {
          setSubmittedClient(result.payload);
          dispatch(clearSelectedClient());
          setFormData({
            agentname: '',
            username: '',
            amount: '',
            prooftype: '',
            sportname: '',
            marketname: '',
            profitAndLoss: '',
          });
          setSearchQuery('');
          setFormError('');
        } else {
          setFormError(
            result.payload?.message || result.payload || 'Failed to update client'
          );
        }
      });
    } else {
      dispatch(createClient(clientData)).then((result) => {
        console.log('Create client result:', result);
        if (result.meta.requestStatus === 'fulfilled') {
          setSubmittedClient(result.payload);
          setFormData({
            agentname: '',
            username: '',
            amount: '',
            prooftype: '',
            sportname: '',
            marketname: '',
            profitAndLoss: '',
          });
          setSearchQuery('');
          setFormError('');
        } else {
          setFormError(
            result.payload?.message || result.payload || 'Failed to create client'
          );
        }
      });
    }
  };

  const handleCancel = () => {
    dispatch(clearSelectedClient());
    setFormData({
      agentname: '',
      username: '',
      amount: '',
      prooftype: '',
      sportname: '',
      marketname: '',
      profitAndLoss: '',
    });
    setSearchQuery('');
    dispatch(clearError());
    setFormError('');
    setSubmittedClient(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6">
        {selectedClient ? 'Update Client' : 'Create Client'}
      </h2>
      {(error || formError) && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {typeof formError === 'string' ? formError : JSON.stringify(formError)}
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Agent Name</label>
          <input
            type="text"
            name="agentname"
            value={formData.agentname}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search whitelabel users..."
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            disabled={isDropdownLoading}
          />
          {filteredUsers.length > 0 && (
            <ul className="mt-1 border border-gray-300 rounded-md bg-white max-h-40 overflow-y-auto absolute z-10 w-full">
              {filteredUsers.map((user) => (
                <li
                  key={user._id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUserSelect(user.whitelabel_user);
                  }}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {user.whitelabel_user}
                </li>
              ))}
            </ul>
          )}
          {searchQuery.length > 0 && filteredUsers.length === 0 && !isDropdownLoading && (
            <div className="mt-1 text-sm text-gray-500">No matching whitelabel users found</div>
          )}
          {isDropdownLoading && (
            <div className="mt-1 text-sm text-gray-500">Loading whitelabel users...</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Proof Type</label>
          <select
            name="prooftype"
            value={formData.prooftype}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          >
            <option value="">Select Proof Type</option>
            {isDropdownLoading ? (
              <option disabled>Loading proof types...</option>
            ) : Array.isArray(proofTypes) && proofTypes.length > 0 ? (
              proofTypes.map((proof) => (
                <option key={proof._id} value={proof.type}>
                  {proof.type}
                </option>
              ))
            ) : (
              <option disabled>No proof types available. Please add some.</option>
            )}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Sport Name</label>
          <select
            name="sportname"
            value={formData.sportname}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          >
            <option value="">Select Sport</option>
            {isDropdownLoading ? (
              <option disabled>Loading sports...</option>
            ) : Array.isArray(sports) && sports.length > 0 ? (
              sports.map((sport) => (
                <option key={sport._id} value={sport.sportsName}>
                  {sport.sportsName || 'Unnamed Sport'}
                </option>
              ))
            ) : (
              <option disabled>No sports available. Please add some.</option>
            )}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Market Name</label>
          <select
            name="marketname"
            value={formData.marketname}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          >
            <option value="">Select Market</option>
            {isDropdownLoading ? (
              <option disabled>Loading markets...</option>
            ) : Array.isArray(markets) && markets.length > 0 ? (
              markets.map((market) => (
                <option key={market._id} value={market.marketName}>
                  {market.marketName || 'Unnamed Market'}
                </option>
              ))
            ) : (
              <option disabled>No markets available. Please add some.</option>
            )}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Profit and Loss</label>
          <input
            type="number"
            name="profitAndLoss"
            value={formData.profitAndLoss}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        <div className="flex space-x-4">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || isDropdownLoading}
            className={`bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 ${
              loading || isDropdownLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Processing...' : selectedClient ? 'Update' : 'Create'}
          </button>
          {(selectedClient || Object.values(formData).some((val) => val)) && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Preview Section */}
      {submittedClient && (
        <div className="mt-6 p-4 bg-gray-100 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Submission Preview</h3>
          <div className="space-y-2">
            <p><strong>Agent Name:</strong> {submittedClient.agentname}</p>
            <p>
              <strong>Username:</strong>{' '}
              {submittedClient.username?.whitelabel_user || submittedClient.username}
            </p>
            <p><strong>Amount:</strong> {submittedClient.amount}</p>
            <p>
              <strong>Proof Type:</strong>{' '}
              {submittedClient.prooftype?.type || submittedClient.prooftype}
            </p>
            <p>
              <strong>Sport Name:</strong>{' '}
              {submittedClient.sportname?.sportsName || submittedClient.sportname}
            </p>
            <p>
              <strong>Market Name:</strong>{' '}
              {submittedClient.marketname?.marketName || submittedClient.marketname}
            </p>
            <p><strong>Profit and Loss:</strong> {submittedClient.profitAndLoss}</p>
          </div>
          <button
            onClick={() => setSubmittedClient(null)}
            className="mt-4 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Close Preview
          </button>
        </div>
      )}
    </div>
  );
};

export default ClientForm;