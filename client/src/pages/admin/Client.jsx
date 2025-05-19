import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchClients,
  deleteClient,
  createClient,
  updateClient,
  fetchClientById,
  fetchWhitelabels,
  fetchProofTypes,
  fetchProofByType,
  fetchSports,
  fetchMarkets,
  resetCurrentClient,
} from '../../redux/client/clientSlice';
import DOMPurify from 'dompurify';

const API_BASE_URL = 'http://localhost:2030';
const DEFAULT_PLACEHOLDER = '/placeholder-logo.png';

function ClientManager() {
  const dispatch = useDispatch();
  const {
    clients,
    currentClient,
    whitelabels,
    proofTypes,
    selectedProof,
    sports,
    markets,
    status,
    error,
  } = useSelector((state) => state.clients);

  const [view, setView] = useState('list'); // 'list', 'create', 'edit', 'preview'
  const [editId, setEditId] = useState(null);
  const [isValidUsername, setIsValidUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const previewRef = useRef(null); // Ref for preview content

  const [formData, setFormData] = useState({
    agentname: '',
    username: '',
    amount: '',
    prooftype: '',
    sportname: '',
    marketname: '',
    profitAndLoss: '',
  });

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchClients());
      dispatch(fetchWhitelabels());
      dispatch(fetchProofTypes());
      dispatch(fetchSports());
      dispatch(fetchMarkets());
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (view === 'edit' && editId) {
      dispatch(fetchClientById(editId));
    } else if (view !== 'preview') {
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
      const matchedUser = whitelabels.find(
        (wl) => wl.whitelabel_user === currentClient.username?.whitelabel_user
      );
      setIsValidUsername(!!matchedUser);
      setUsernameStatus(matchedUser ? 'User found' : 'User not found');
      if (currentClient.prooftype?.type) {
        dispatch(fetchProofByType(currentClient.prooftype.type));
      }
    }
  }, [currentClient, view, whitelabels, dispatch]);

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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'prooftype' && value) {
      dispatch(fetchProofByType(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidUsername) {
      setUsernameStatus('Please enter a valid username');
      return;
    }
    const clientData = { ...formData };
    let action;
    if (view === 'edit') {
      action = await dispatch(updateClient({ id: editId, clientData }));
    } else {
      action = await dispatch(createClient(clientData));
    }

    // Fetch proof content for preview
    let proofContent = '';
    if (formData.prooftype) {
      const proofRes = await dispatch(fetchProofByType(formData.prooftype));
      proofContent = proofRes.payload?.content || 'No content available';
    }

    // Find the whitelabel data for the selected username
    const matchedWhitelabel = whitelabels.find(
      (wl) => wl.whitelabel_user === formData.username
    );

    // Set preview data with whitelabel details
    setPreviewData({
      ...clientData,
      proofContent: proofContent || 'No content available',
      whitelabel: matchedWhitelabel || null,
    });
    setView('preview');
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
    setPreviewData(null);
  };

  // Format image URL
  const getImageUrl = (logoPath) => {
    if (!logoPath) {
      return `${API_BASE_URL}${DEFAULT_PLACEHOLDER}`;
    }
    if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
      return logoPath;
    }
    const formattedPath = logoPath.startsWith('/')
      ? logoPath.substring(1)
      : logoPath;
    return `${API_BASE_URL}/${formattedPath}`;
  };

  // Generate preview HTML for PDF
  const getPreviewHTML = () => {
    const sanitizedProofContent = DOMPurify.sanitize(previewData?.proofContent || 'No content available');
    const hexacode = previewData?.whitelabel?.hexacode || '#000000';
    const logoUrl = getImageUrl(previewData?.whitelabel?.logo);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; }
          .preview-container { width: 540px; background: white; border: 1px solid #000; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); margin: 0 auto; }
          .header-footer { display: flex; align-items: center; height: 88px; }
          .header-footer img { height: 70px; padding-left: 20px; }
          .main-content { padding: 20px 12px 10px; }
          .content { font-size: 12px; font-weight: bold; line-height: 1.5; }
          .content div { margin-bottom: 8px; }
          .proof-content { background: #f5f5f5; padding: 8px; border-radius: 4px; border: 1px solid red; font-size: 11px; font-weight: normal; }
          .spacer { height: 100px; }
          .footer { height: 50px; display: flex; align-items: center; }
          .footer-content { display: flex; justify-content: space-between; width: 100%; padding: 0 20px; }
          .footer-content a, .footer-content div { color: #fefce8; font-size: 15px; text-decoration: none; }
          .footer-content a:hover, .footer-content div:hover { color: #2563eb; text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="preview-container">
          <header class="header-footer" style="background-color: ${hexacode};">
            <img src="${logoUrl}" alt="Whitelabel Logo" onerror="this.src='${API_BASE_URL}${DEFAULT_PLACEHOLDER}'" />
          </header>
          <main class="main-content">
            <div class="content">
              <div><strong>Agent Name:</strong> ${previewData?.agentname || 'N/A'}</div>
              <div><strong>Username:</strong> ${previewData?.username || 'N/A'}</div>
              <div><strong>User:</strong> ${previewData?.whitelabel?.user || 'N/A'}</div>
              <div><strong>Amount:</strong> ${previewData?.amount || 'N/A'}</div>
              <div>
                <strong>Proof Content:</strong>
                <div class="proof-content">${sanitizedProofContent}</div>
              </div>
              <div><strong>Sport:</strong> ${previewData?.sportname || 'N/A'}</div>
              <div><strong>Market:</strong> ${previewData?.marketname || 'N/A'}</div>
              <div><strong>Profit & Loss:</strong> ${previewData?.profitAndLoss || 'N/A'}</div>
            </div>
            <div class="spacer"></div>
          </main>
          <footer class="header-footer" style="background-color: ${hexacode};">
            <div class="footer-content">
              <a href="${previewData?.whitelabel?.url || '#'}" target="_blank">${previewData?.whitelabel?.url || 'No URL available'}</a>
              <div>T&C Apply</div>
            </div>
          </footer>
        </div>
      </body>
      </html>
    `;
    console.log('Generated HTML for PDF:', html); // Debug log
    return html;
  };

  // Download PDF using backend endpoint
  const handleDownloadPDF = async () => {
    try {
      const previewHTML = getPreviewHTML();
      const response = await fetch(`${API_BASE_URL}/client/generate-preview-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: previewHTML }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate PDF: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'client-preview.pdf';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please ensure the backend server is running and check the console for errors.');
    }
  };

  // Table/List rendering
  const renderList = () => (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Clients</h2>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => setView('create')}
        >
          Add Client
        </button>
      </div>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Agent Name</th>
            <th className="py-2 px-4 border-b">Username</th>
            <th className="py-2 px-4 border-b">Amount</th>
            <th className="py-2 px-4 border-b">Proof Type</th>
            <th className="py-2 px-4 border-b">Sport</th>
            <th className="py-2 px-4 border-b">Market</th>
            <th className="py-2 px-4 border-b">Profit & Loss</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client._id}>
              <td className="py-2 px-4 border-b">{client.agentname}</td>
              <td className="py-2 px-4 border-b">{client.username?.whitelabel_user || ''}</td>
              <td className="py-2 px-4 border-b">{client.amount}</td>
              <td className="py-2 px-4 border-b">{client.prooftype?.type || ''}</td>
              <td className="py-2 px-4 border-b">{client.sportname?.sportsName || ''}</td>
              <td className="py-2 px-4 border-b">{client.marketname?.marketName || ''}</td>
              <td className="py-2 px-4 border-b">{client.profitAndLoss}</td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => handleEdit(client._id)}
                  className="bg-blue-600 text-white px-3 py-1 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(client._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </div>
  );

  // Form rendering
  const renderForm = () => (
    <form className="max-w-lg mx-auto bg-white p-6 rounded shadow" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-4">{view === 'edit' ? 'Edit Client' : 'Add Client'}</h2>
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Agent Name</label>
        <input
          type="text"
          name="agentname"
          value={formData.agentname}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleUsernameChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
        {usernameStatus && (
          <div className={`mt-1 text-sm ${isValidUsername ? 'text-green-600' : 'text-red-600'}`}>
            {usernameStatus}
          </div>
        )}
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Amount</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Proof Type</label>
        <select
          name="prooftype"
          value={formData.prooftype}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        >
          <option value="">Select Proof Type</option>
          {proofTypes.map((pt) => (
            <option key={pt._id} value={pt.type}>
              {pt.type}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Sport</label>
        <select
          name="sportname"
          value={formData.sportname}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        >
          <option value="">Select Sport</option>
          {sports.map((s) => (
            <option key={s._id} value={s.sportsName}>
              {s.sportsName}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Market</label>
        <select
          name="marketname"
          value={formData.marketname}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        >
          <option value="">Select Market</option>
          {markets.map((m) => (
            <option key={m._id} value={m.marketName}>
              {m.marketName}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Profit & Loss</label>
        <input
          type="number"
          name="profitAndLoss"
          value={formData.profitAndLoss}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handleCancel}
          className="bg-gray-400 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {view === 'edit' ? 'Update' : 'Submit'}
        </button>
      </div>
    </form>
  );

  // Preview rendering
  const renderPreview = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
      <div className="bg-white w-[50vh] border mt-[20px] rounded-lg shadow-xl" ref={previewRef}>
        {/* Header with whitelabel logo and hexacode color */}
        <header
          className="header-footer flex items-center h-22"
          style={{
            backgroundColor: previewData?.whitelabel?.hexacode || '#000000',
          }}
        >
          <img
            src={getImageUrl(previewData?.whitelabel?.logo)}
            alt="Whitelabel Logo"
            className="h-[70px] pl-[20px]"
          />
        </header>
        {/* Main Content */}
        <main className="pt-[20px] px-[12px] pb-[10px]">
          <div className="space-y-2 font-bold text-[12px] leading-[1.5]">
            <div><strong>Agent Name:</strong> {previewData?.agentname || 'N/A'}</div>
            <div><strong>Username:</strong> {previewData?.username || 'N/A'}</div>
            <div><strong>User:</strong> {previewData?.whitelabel?.user || 'N/A'}</div>
            <div><strong>Amount:</strong> {previewData?.amount || 'N/A'}</div>
            <div>
              <div className="mt-1 p-2 bg-gray-100 rounded text-sm border border-red-500">
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(previewData?.proofContent || 'No content available'),
                  }}
                />
              </div>
            </div>
            <div><strong>Sport:</strong> {previewData?.sportname || 'N/A'}</div>
            <div><strong>Market:</strong> {previewData?.marketname || 'N/A'}</div>
            <div><strong>Profit & Loss:</strong> {previewData?.profitAndLoss || 'N/A'}</div>
          </div>
          <div className="h-[10vh]"></div>
        </main>
        {/* Footer with URL and hexacode color */}
        <footer
          className="header-footer flex items-center h-[50px]"
          style={{
            backgroundColor: previewData?.whitelabel?.hexacode || '#000000',
          }}
        >
          <div className="flex justify-between w-full px-[20px]">
            <a
              href={previewData?.whitelabel?.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-50 hover:text-blue-600 hover:underline text-[15px]"
            >
              {previewData?.whitelabel?.url || 'No URL available'}
            </a>
            <div className="text-amber-50 hover:text-blue-600 hover:underline text-[15px]">
              T&C Apply
            </div>
          </div>
        </footer>
        <div className="flex justify-start py-3 px-2">
          <div className="flex gap-2">
            <button
              onClick={handleDownloadPDF}
              className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-800 transition flex items-center justify-center"
              title="Download PDF"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>
            <button
              onClick={handleCancel}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      {view === 'list' && renderList()}
      {['create', 'edit'].includes(view) && renderForm()}
      {view === 'preview' && previewData && renderPreview()}
    </div>
  );
}

export default ClientManager;