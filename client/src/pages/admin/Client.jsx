import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchClients,
  deleteClient,
  createClient,
  updateClient,
  fetchClientById,
  fetchWhitelabels,
  fetchProofTypes,
  fetchSports,
  fetchMarkets,
  resetCurrentClient,
} from '../../redux/client/clientSlice';

function ClientManager() {
  const dispatch = useDispatch();
  const {
    clients,
    currentClient,
    whitelabels,
    proofTypes,
    sports,
    markets,
    status,
    error,
  } = useSelector((state) => state.clients);

  const [view, setView] = useState('list'); // 'list', 'create', or 'edit'
  const [editId, setEditId] = useState(null);
  const [isValidUsername, setIsValidUsername] = useState(false); // Tracks if username is valid
  const [usernameStatus, setUsernameStatus] = useState(''); // Feedback for username search

  const [formData, setFormData] = useState({
    agentname: '',
    username: '',
    amount: '',
    prooftype: '',
    sportname: '',
    marketname: '',
    profitAndLoss: '',
  });

  // Fetch data for dropdowns and clients
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchClients());
      dispatch(fetchWhitelabels());
      dispatch(fetchProofTypes());
      dispatch(fetchSports());
      dispatch(fetchMarkets());
    }
  }, [status, dispatch]);

  // Fetch client data for editing
  useEffect(() => {
    if (view === 'edit' && editId) {
      dispatch(fetchClientById(editId));
    } else {
      dispatch(resetCurrentClient());
      setFormData({
        agentname: '',
        username: '',
        amount: '',
        prooftype: '',
        sportname: '',
        marketname: '',
        profitAndLoss: '',
      });
      setIsValidUsername(false);
      setUsernameStatus('');
    }
  }, [view, editId, dispatch]);

  // Populate form with current client data for editing
  useEffect(() => {
    if (currentClient && view === 'edit') {
      setFormData({
        agentname: currentClient.agentname || '',
        username: currentClient.username?.whitelabel_user || '',
        amount: currentClient.amount || '',
        prooftype: currentClient.prooftype?.type || '',
        sportname: currentClient.sportname?.sportsName || '',
        marketname: currentClient.marketname?.marketName || '',
        profitAndLoss: currentClient.profitAndLoss || '',
      });
      // Validate username for edit mode
      const matchedUser = whitelabels.find(
        (wl) => wl.whitelabel_user === currentClient.username?.whitelabel_user
      );
      setIsValidUsername(!!matchedUser);
      setUsernameStatus(matchedUser ? 'User found' : 'User not found');
    }
  }, [currentClient, view, whitelabels]);

  // Validate username on change
  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, username: value });

    if (value.trim() === '') {
      setIsValidUsername(false);
      setUsernameStatus('');
      return;
    }

    const matchedUser = whitelabels.find((wl) => wl.whitelabel_user === value);
    if (matchedUser) {
      setIsValidUsername(true);
      setUsernameStatus('User found');
    } else {
      setIsValidUsername(false);
      setUsernameStatus('User not found');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValidUsername) {
      setUsernameStatus('Please enter a valid username');
      return;
    }
    const clientData = { ...formData };
    if (view === 'edit') {
      dispatch(updateClient({ id: editId, clientData })).then(() => setView('list'));
    } else {
      dispatch(createClient(clientData)).then(() => setView('list'));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      dispatch(deleteClient(id));
    }
  };

  const handleEdit = (id) => {
    setEditId(id);
    setView('edit');
  };

  const handleCancel = () => {
    setView('list');
    setEditId(null);
    dispatch(resetCurrentClient());
  };

  // Client List View
  const renderList = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Clients</h2>
        <button
          onClick={() => setView('create')}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Client
        </button>
      </div>
      {status === 'loading' && <p>Loading...</p>}
      {status === 'failed' && <p>Error: {error}</p>}
      {status === 'succeeded' && (
        <table className="w-full border-collapse bg-white shadow">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Agent Name</th>
              <th className="border p-2">Username</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">Proof Type</th>
              <th className="border p-2">Sport</th>
              <th className="border p-2">Market</th>
              <th className="border p-2">P&L</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client._id}>
                <td className="border p-2">{client.agentname}</td>
                <td className="border p-2">{client.username?.whitelabel_user}</td>
                <td className="border p-2">{client.amount}</td>
                <td className="border p-2">{client.prooftype?.type}</td>
                <td className="border p-2">{client.sportname?.sportsName}</td>
                <td className="border p-2">{client.marketname?.marketName}</td>
                <td className="border p-2">{client.profitAndLoss}</td>
                <td className="border p-2">
                  <button
                    onClick={() => handleEdit(client._id)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(client._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  // Client Form View (Create/Edit)
  const renderForm = () => (
    <div className="max-w-lg mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">{view === 'edit' ? 'Edit Client' : 'Add Client'}</h2>
      {status === 'loading' && <p>Loading...</p>}
      {status === 'failed' && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Agent Name</label>
          <input
            type="text"
            name="agentname"
            value={formData.agentname}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleUsernameChange}
            className={`w-full border p-2 rounded ${
              usernameStatus === 'User not found' ? 'border-red-500' : ''
            }`}
            required
          />
          {usernameStatus && (
            <p
              className={`text-sm mt-1 ${
                isValidUsername ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {usernameStatus}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Proof Type</label>
          <select
            name="prooftype"
            value={formData.prooftype}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select Proof Type</option>
            {proofTypes.map((proof) => (
              <option key={proof._id} value={proof.type}>
                {proof.type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Sport</label>
          <select
            name="sportname"
            value={formData.sportname}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select Sport</option>
            {sports.map((sport) => (
              <option key={sport._id} value={sport.sportsName}>
                {sport.sportsName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Market</label>
          <select
            name="marketname"
            value={formData.marketname}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select Market</option>
            {markets.map((market) => (
              <option key={market._id} value={market.marketName}>
                {market.marketName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Profit & Loss</label>
          <input
            type="number"
            name="profitAndLoss"
            value={formData.profitAndLoss}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValidUsername}
            className={`px-4 py-2 rounded text-white ${
              isValidUsername
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-blue-300 cursor-not-allowed'
            }`}
          >
            {view === 'edit' ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      {view === 'list' ? renderList() : renderForm()}
    </div>
  );
}

export default ClientManager;