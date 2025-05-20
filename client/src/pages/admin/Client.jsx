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

  const [view, setView] = useState('list');
  const [editId, setEditId] = useState(null);
  const [isValidUsername, setIsValidUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const previewRef = useRef(null);

  const [formData, setFormData] = useState({
    agentname: '',
    username: '',
    user: '',
    amount: '',
    prooftype: '',
    sportname: '',
    marketname: '',
    eventname: '',
    navigation: '',
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
        user: '',
        amount: '',
        prooftype: '',
        sportname: '',
        marketname: '',
        eventname: '',
        navigation: '',
        profitAndLoss: '',
      });
      setSelectedImages([]);
      setIsValidUsername(false);
      setUsernameStatus('');
    }
  }, [view, editId, dispatch]);

  useEffect(() => {
    if (currentClient && view === 'edit') {
      setFormData({
        agentname: currentClient.agentname || '',
        username: currentClient.username?.whitelabel_user || '',
        user: currentClient.user || '',
        amount: currentClient.amount || '',
        prooftype: currentClient.prooftype?.type || '',
        sportname: currentClient.sportname?.sportsName || '',
        marketname: currentClient.marketname?.marketName || '',
        eventname: currentClient.eventname || '',
        navigation: currentClient.navigation || '',
        profitAndLoss: currentClient.profitAndLoss || '',
      });
      setSelectedImages([]);
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

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert('You can upload a maximum of 5 images.');
      return;
    }
    const base64Images = await Promise.all(
      files.map(async (file) => ({
        file,
        base64: await toBase64(file),
        filename: file.name,
      }))
    );
    setSelectedImages(base64Images);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidUsername) {
      setUsernameStatus('Please enter a valid username');
      return;
    }
    if (!formData.user || !formData.eventname || !formData.navigation) {
      alert('User, Event Name, and Navigation are required fields.');
      return;
    }

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });

    selectedImages.forEach((image) => {
      formDataToSend.append('images', image.file);
    });

    let action;
    try {
      if (view === 'edit') {
        action = await dispatch(updateClient({ id: editId, clientData: formDataToSend }));
      } else {
        action = await dispatch(createClient(formDataToSend));
      }

      if (action.error) {
        throw new Error(action.error.message);
      }

      const newClient = action.payload;

      let proofContent = '';
      if (formData.prooftype) {
        const proofRes = await dispatch(fetchProofByType(formData.prooftype));
        proofContent = proofRes.payload?.content || 'No content available';
      }

      const matchedWhitelabel = whitelabels.find(
        (wl) => wl.whitelabel_user === formData.username
      );

      // Fetch base64 for logo if it exists
      let logoBase64 = null;
      if (matchedWhitelabel?.logo) {
        try {
          const logoUrl = getImageUrl(matchedWhitelabel.logo);
          const response = await fetch(logoUrl);
          const blob = await response.blob();
          logoBase64 = await toBase64(blob);
        } catch (error) {
          console.error('Error converting logo to base64:', error);
        }
      }

      // If editing, convert server-stored images to base64
      let fetchedImages = [];
      if (view === 'edit' && newClient.images?.length) {
        fetchedImages = await Promise.all(
          newClient.images.map(async (img) => {
            try {
              const response = await fetch(getImageUrl(img.path));
              const blob = await response.blob();
              const base64 = await toBase64(blob);
              return { path: base64, filename: img.filename };
            } catch (error) {
              console.error('Error converting image to base64:', error);
              return { path: '', filename: img.filename };
            }
          })
        );
      } else {
        fetchedImages = selectedImages.map((img) => ({
          path: img.base64,
          filename: img.filename,
        }));
      }

      setPreviewData({
        ...formData,
        images: fetchedImages,
        proofContent,
        whitelabel: { ...matchedWhitelabel, logoBase64 },
      });
      setView('preview');
    } catch (error) {
      console.error('Submit error:', error);
      alert(`Failed to ${view === 'edit' ? 'update' : 'create'} client: ${error.message}`);
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
    setPreviewData(null);
    setSelectedImages([]);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return `${API_BASE_URL}${DEFAULT_PLACEHOLDER}`;
    }
    if (imagePath.startsWith('data:')) {
      return imagePath;
    }
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const formattedPath = imagePath.startsWith('/')
      ? imagePath.substring(1)
      : imagePath;
    return `${API_BASE_URL}/${formattedPath}`;
  };

  const getPreviewHTML = () => {
    let proofContent = DOMPurify.sanitize(previewData?.proofContent || 'No content available', {
      ADD_TAGS: ['style'],
      ADD_ATTR: ['class', 'style'],
    });

    // Simplify placeholders in the proof content
    const placeholderMap = {
      '{data\\.user\\|\\|""}': '{USER}',
      '{data\\.totalAmount\\|\\|""}': '{AMOUNT}',
      '{data\\.profitLoss\\|\\|""}': '{PROFIT_LOSS}',
      '{data\\.issueType\\|\\|"odds manipulating or odds hedging"}': '{ISSUE_TYPE}',
      '{data\\.sportName\\|\\|"Sport"}': '{SPORT_NAME}',
      '{data\\.eventName\\|\\|"Event"}': '{EVENT_NAME}',
      '{data\\.marketName\\|\\|"Market"}': '{MARKET_NAME}',
      '{data\\.marketDetails\\s&&\\s{data\\.marketDetails}}': '',
    };

    Object.keys(placeholderMap).forEach((oldPlaceholder) => {
      const regex = new RegExp(oldPlaceholder, 'g');
      proofContent = proofContent.replace(regex, placeholderMap[oldPlaceholder]);
    });

    // Define simplified placeholders and their replacements
    const placeholders = {
      '{USER}': previewData?.user || 'N/A',
      '{AMOUNT}': previewData?.amount || 'N/A',
      '{PROFIT_LOSS}': previewData?.profitAndLoss || 'N/A',
      '{ISSUE_TYPE}': 'odds manipulating or odds hedging', // Default value as per original logic
      '{SPORT_NAME}': previewData?.sportname || 'Sport',
      '{EVENT_NAME}': previewData?.eventname || 'Event',
      '{MARKET_NAME}': previewData?.marketname || 'Market',
    };

    // Replace simplified placeholders with dynamic values
    Object.keys(placeholders).forEach((placeholder) => {
      const regex = new RegExp(placeholder, 'g');
      proofContent = proofContent.replace(regex, placeholders[placeholder]);
    });

    let proofContentHTML = proofContent;
    const conclusionStart = proofContentHTML.indexOf('Conclusion:');
    if (conclusionStart !== -1) {
      const beforeConclusion = proofContentHTML.substring(0, conclusionStart);
      const conclusionAndAfter = proofContentHTML.substring(conclusionStart);
      const conclusionEnd = conclusionAndAfter.indexOf('We hope');
      if (conclusionEnd !== -1) {
        const conclusionText = conclusionAndAfter.substring(0, conclusionEnd);
        const afterConclusion = conclusionAndAfter.substring(conclusionEnd);
        proofContentHTML = `
          ${beforeConclusion}
          <strong style="font-weight: bold;">${conclusionText}</strong>
          ${afterConclusion}
        `;
      } else {
        proofContentHTML = `
          ${beforeConclusion}
          <strong style="font-weight: bold;">${conclusionAndAfter}</strong>
        `;
      }
    } else {
      proofContentHTML = `<div style="margin-bottom: 1rem;">${proofContentHTML}</div>`;
    }

    const imagesHTML = previewData?.images?.length
      ? previewData.images
        .map(
          (image) =>
            image.path
              ? `<img src="${image.path}" alt="${image.filename}" style="max-width: 100px; margin: 0.25rem;" />`
              : '<p style="color: #6b7280;">Image not available</p>'
        )
        .join('')
      : '<p style="color: #6b7280;">No images available</p>';

    // Fallback CSS for PDF rendering

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          
        </head>
        <body>
          <div class="container font-sans">
            <header class="header  header-footer flex items-center h-22 " style="background-color: ${previewData?.whitelabel?.hexacode || '#00008B'};">
              <img src="${previewData?.whitelabel?.logoBase64 || getImageUrl(previewData?.whitelabel?.logo)}" alt="Whitelabel Logo" class="logo -[70px] pl-[20px]" />
            </header>
            <main class="main">
              <div class="section">
                <p class="text-sm bg-amber-300"><strong>Agent Name:</strong> ${previewData?.agentname || 'N/A'}</p>
                <p class="text-sm"><strong>Username:</strong> ${previewData?.username || 'N/A'}</p>
                <p class="text-sm"><strong>User:</strong> ${previewData?.user || 'N/A'}</p>
                <p class="text-sm"><strong>Amount:</strong> ${previewData?.amount || 'N/A'}</p>
                <p class="text-sm"><strong>Event Name:</strong> ${previewData?.eventname || 'N/A'}</p>
                <p class="text-sm"><strong>Navigation:</strong> ${previewData?.navigation || 'N/A'}</p>
              </div>
              <div class="section ">
                ${proofContentHTML}
              </div>
              <div class="section">
                <p class="text-sm font-bold">Images:</p>
                <div class="flex">
                  ${imagesHTML}
                </div>
              </div>
              <div>
                <p class="text-sm"><strong>Sport:</strong> ${previewData?.sportname || 'N/A'}</p>
                <p class="text-sm"><strong>Market:</strong> ${previewData?.marketname || 'N/A'}</p>
                <p class="text-sm"><strong>Profit & Loss:</strong> ${previewData?.profitAndLoss || 'N/A'}</p>
              </div>
            </main>
            <footer class="footer" style="background-color: ${previewData?.whitelabel?.hexacode || '#00008B'};">
              <p class="text-sm">${previewData?.whitelabel?.url || 'No URL available'}</p>
              <p class="text-sm">T&C Apply</p>
            </footer>
          </div>
        </body>
      </html>
    `;
    return html;
  };

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
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert(
        `Failed to download PDF: ${error.message}. Please ensure the backend server is running at ${API_BASE_URL} and check the console for errors.`
      );
    }
  };

  const renderList = () => (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clients</h1>
        <button
          onClick={() => setView('create')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Client
        </button>
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </div>
      )}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proof Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sport</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Navigation</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit & Loss</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map((client) => (
              <tr key={client._id}>
                <td className="px-6 py-4 whitespace-nowrap">{client.agentname}</td>
                <td className="px-6 py-4 whitespace-nowrap">{client.username?.whitelabel_user || ''}</td>
                <td className="px-6 py-4 whitespace-nowrap">{client.user || ''}</td>
                <td className="px-6 py-4 whitespace-nowrap">{client.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap">{client.prooftype?.type || ''}</td>
                <td className="px-6 py-4 whitespace-nowrap">{client.sportname?.sportsName || ''}</td>
                <td className="px-6 py-4 whitespace-nowrap">{client.marketname?.marketName || ''}</td>
                <td className="px-6 py-4 whitespace-nowrap">{client.eventname || ''}</td>
                <td className="px-6 py-4 whitespace-nowrap">{client.navigation || ''}</td>
                <td className="px-6 py-4 whitespace-nowrap">{client.profitAndLoss}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {client.images?.length ? (
                    <div className="flex space-x-2">
                      {client.images.slice(0, 3).map((image, index) => (
                        <img
                          key={index}
                          src={getImageUrl(image.path)}
                          alt={image.filename}
                          className="w-8 h-8 object-cover rounded"
                          onError={(e) => (e.target.src = `${API_BASE_URL}${DEFAULT_PLACEHOLDER}`)}
                        />
                      ))}
                      {client.images.length > 3 && <span>+{client.images.length - 3}</span>}
                    </div>
                  ) : (
                    'No images'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(client._id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded mr-2 hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(client._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderForm = () => (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{view === 'edit' ? 'Edit Client' : 'Add Client'}</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Agent Name</label>
          <input
            type="text"
            name="agentname"
            value={formData.agentname}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleUsernameChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
          {usernameStatus && (
            <p className={`text-sm ${isValidUsername ? 'text-green-600' : 'text-red-600'}`}>
              {usernameStatus}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">User</label>
          <input
            type="text"
            name="user"
            value={formData.user}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Proof Type</label>
          <select
            name="prooftype"
            value={formData.prooftype}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
        <div>
          <label className="block text-sm font-medium text-gray-700">Sport</label>
          <select
            name="sportname"
            value={formData.sportname}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
        <div>
          <label className="block text-sm font-medium text-gray-700">Market</label>
          <select
            name="marketname"
            value={formData.marketname}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
        <div>
          <label className="block text-sm font-medium text-gray-700">Event Name</label>
          <input
            type="text"
            name="eventname"
            value={formData.eventname}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Navigation</label>
          <input
            type="text"
            name="navigation"
            value={formData.navigation}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Images (up to 5)</label>
          <input
            type="file"
            name="images"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/gif"
            onChange={handleImageChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          {selectedImages.length > 0 && (
            <p className="text-sm text-gray-600">{selectedImages.length} image(s) selected</p>
          )}
          {view === 'edit' && currentClient?.images?.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700">Current Images:</p>
              <div className="flex space-x-2">
                {currentClient.images.map((image, index) => (
                  <img
                    key={index}
                    src={getImageUrl(image.path)}
                    alt={image.filename}
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => (e.target.src = `${API_BASE_URL}${DEFAULT_PLACEHOLDER}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Profit & Loss</label>
          <input
            type="number"
            name="profitAndLoss"
            value={formData.profitAndLoss}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {view === 'edit' ? 'Update' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderPreview = () => (
    <div className=" flex flex-col " >

      <div
        className="w-[100vh] h-[100vh]"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(getPreviewHTML(), {
            ADD_TAGS: ['style', 'script'],
            ADD_ATTR: ['class', 'style', 'src'],
          }),
        }}
      />
      <div className="flex justify-between mt-1 p-3 space-x-4">
        <button
          onClick={handleDownloadPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Download PDF
        </button>
        <button
          onClick={() => setView('list')}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Close
        </button>
      </div>

    </div>
  );

  return (
    <div className="w-full h-full">
      {view === 'list' && renderList()}
      {['create', 'edit'].includes(view) && renderForm()}
      {view === 'preview' && previewData && renderPreview()}
    </div>
  );
}

export default ClientManager;