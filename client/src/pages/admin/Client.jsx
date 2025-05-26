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
  const [selectedNavigation2Images, setSelectedNavigation2Images] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false); // Added for loading state
  const previewRef = useRef(null);

  const whitelabelUsers = whitelabels.map((wl) => wl.whitelabel_user).sort();

  const [formData, setFormData] = useState({
    whitelabel_user: '',
    agentname: '',
    prooftype: '',
    user: '',
    amount: '',
    sportname: '',
    marketname: '',
    eventname: '',
    navigation: '',
    profitAndLoss: '',
    navigation2: '',
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
        whitelabel_user: '',
        agentname: '',
        user: '',
        amount: '',
        prooftype: '',
        sportname: '',
        marketname: '',
        eventname: '',
        navigation: '',
        profitAndLoss: '',
        navigation2: '',
      });
      setSelectedImages([]);
      setSelectedNavigation2Images([]);
      setIsValidUsername(false);
      setUsernameStatus('');
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, [view, editId, dispatch]);

  useEffect(() => {
    if (currentClient && view === 'edit') {
      setFormData({
        whitelabel_user: currentClient.whitelabel_user?.whitelabel_user || '',
        agentname: currentClient.agentname || '',
        user: currentClient.user || '',
        amount: currentClient.amount || '',
        prooftype: currentClient.prooftype?.type || '',
        sportname: currentClient.sportname?.sportsName || '',
        marketname: currentClient.marketname?.marketName || '',
        eventname: currentClient.eventname || '',
        navigation: currentClient.navigation || '',
        profitAndLoss: currentClient.profitAndLoss || '',
        navigation2: currentClient.navigation2 || '',
      });
      setSelectedImages([]);
      setSelectedNavigation2Images([]);
      const matchedUser = whitelabels.find(
        (wl) => wl.whitelabel_user === currentClient.whitelabel_user?.whitelabel_user
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
    setFormData({ ...formData, whitelabel_user: value });

    if (value.trim() === '') {
      setIsValidUsername(false);
      setUsernameStatus('');
      setSuggestions([]);
      setShowDropdown(false);
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

    const filteredSuggestions = whitelabelUsers
      .filter((user) => user.toLowerCase().includes(value.toLowerCase()))
      .sort();
    setSuggestions(filteredSuggestions);
    setShowDropdown(true);
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData({ ...formData, whitelabel_user: suggestion });
    const matchedUser = whitelabels.find((wl) => wl.whitelabel_user === suggestion);
    setIsValidUsername(!!matchedUser);
    setUsernameStatus(matchedUser ? 'User found' : 'User not found');
    setShowDropdown(false);
    setSuggestions([]);
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
    if (files.length > 6) {
      alert('You can upload a maximum of 6 images.');
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

  const handleNavigation2ImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 6) {
      alert('You can upload a maximum of 6 images for Navigation 2.');
      return;
    }
    const base64Images = await Promise.all(
      files.map(async (file) => ({
        file,
        base64: await toBase64(file),
        filename: file.name,
      }))
    );
    setSelectedNavigation2Images(base64Images);
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
      if (value !== undefined && value !== '') {
        formDataToSend.append(key, value);
      }
    });

    selectedImages.forEach((image) => {
      formDataToSend.append('images', image.file);
    });

    selectedNavigation2Images.forEach((image) => {
      formDataToSend.append('navigation2Images', image.file);
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
        (wl) => wl.whitelabel_user === formData.whitelabel_user
      );

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

      let fetchedNavigation2Images = [];
      if (view === 'edit' && newClient.navigation2Images?.length) {
        fetchedNavigation2Images = await Promise.all(
          newClient.navigation2Images.map(async (img) => {
            try {
              const response = await fetch(getImageUrl(img.path));
              const blob = await response.blob();
              const base64 = await toBase64(blob);
              return { path: base64, filename: img.filename };
            } catch (error) {
              console.error('Error converting navigation2 image to base64:', error);
              return { path: '', filename: img.filename };
            }
          })
        );
      } else {
        fetchedNavigation2Images = selectedNavigation2Images.map((img) => ({
          path: img.base64,
          filename: img.filename,
        }));
      }

      setPreviewData({
        ...formData,
        images: fetchedImages,
        navigation2Images: fetchedNavigation2Images,
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
    setSelectedNavigation2Images([]);
    setSuggestions([]);
    setShowDropdown(false);
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

    const placeholders = {
      '{USER}': previewData?.user || 'N/A',
      '{AMOUNT}': previewData?.amount ? `${previewData.amount}` : 'N/A',
      '{PROFIT_LOSS}': previewData?.profitAndLoss
        ? (previewData.profitAndLoss)
        : 'N/A',
      '{ISSUE_TYPE}': 'odds manipulating or odds hedging',
      '{SPORT_NAME}': previewData?.sportname || 'N/A',
      '{EVENT_NAME}': previewData?.eventname || 'N/A',
      '{MARKET_NAME}': previewData?.marketname || 'N/A',
    };

    Object.keys(placeholders).forEach((placeholder) => {
      const regex = new RegExp(placeholder, 'g');
      proofContent = proofContent.replace(regex, placeholders[placeholder]);
    });

    // Use proofContent directly without additional parsing
    const proofContentHTML = `<div class="mb-4">${proofContent}</div>`;

    const imagesHTML = previewData?.images?.length
      ? previewData.images
        .map(
          (image) =>
            image.path
              ? `<img src="${image.path}" alt="${image.filename}" class="w mx-[25px]  w-[1200px] h-[150px]" />`
              : ''
        )
        .join('')
      : '';

    const navigation2ImagesHTML = previewData?.navigation2Images?.length
      ? previewData.navigation2Images
        .map(
          (image) =>
            image.path
              ? `<img src="${image.path}" alt="${image.filename}" class=" mx-[25px]  w-[1200px] h-[150px]" />`
              : '<p class="text-gray-500">Navigation 2 Image not available</p>'
        )
        .join('')
      : '';

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Amaranth&display=swap" rel="stylesheet">
        <style>
          @page {
            height: 100%;
            width: 100%;
            margin: 0;
          }
          body {
            font-family: 'Amaranth', sans-serif;
          }
        </style>
      </head>
      <body class="font-amaranth w-full h-full text-black text-base m-0 p-0">
        <div class="min-h-[842px] mx-auto flex flex-col">
          <header class="sticky top-0 z-10 h-[60px] flex items-center justify-between p-5 text-white" style="background-color: ${previewData?.whitelabel?.hexacode || '#00008B'
      };">
            <img src="${previewData?.whitelabel?.logoBase64 || getImageUrl(previewData?.whitelabel?.logo)
      }" alt="Whitelabel Logo" class="ml-[35px] max-h-[50px] w-[200px]" />
            <span></span>
          </header>
          <main class="p-3" style="min-height: calc(842px - 100px);">
            <div class="flex justify-between mb-1 text-[14px] ml-[48px]">
              <div class="flex-1">
                <span class="font-bold">Whitelabel User: ${previewData?.whitelabel_user || 'N/A'}</span><br/>
                <span class="font-bold">Agent: ${previewData?.agentname || 'N/A'}</span><br/>
                <span class="font-bold">User: ${previewData?.user || 'N/A'}</span>
              </div>
              <div class="flex-1 ml-[30px] mt-[28px]">
                <span class="font-bold">Total Amount: ${previewData?.amount ? (previewData.amount) : 'N/A'
      }</span>
              </div>
              <div class="flex-1">
                <span class="font-bold">Sport Name: ${previewData?.sportname || 'N/A'}</span><br/>
                <span class="font-bold">Event Name: ${previewData?.eventname && previewData.eventname.length > 10
        ? `${previewData.eventname.slice(0, 16)}...`
        : previewData?.eventname || 'N/A'
      }</span><br/>
                <span class="font-bold">Market Name: ${previewData?.marketname || 'N/A'}</span>
              </div>
            </div>
            <div class="mt-[-20px] leading-6 text-[16px] text-black mx-[24px]">
              ${proofContentHTML}
            </div>
            <div class="italic font-bold ml-[48px] mt-[-25px] mx-[24px]">
              <span class="font-bold text-[16px] f">${previewData?.navigation || 'N/A'
      }</span>
            </div>
            <div class="mt-[-px] w-full flex flex-wrap gap-1">
              ${imagesHTML}
            </div>
            ${previewData?.navigation2
        ? `
              <div class="italic font-bold ml-[48px] mt-[25px] mx-[24px]">
                <span class="font-bold text-[16px]">${previewData.navigation2}</span>
              </div>
              <div class="mt- w-full flex flex-wrap gap-2.5 mr-[25px]">
                ${navigation2ImagesHTML}
              </div>
            `
        : ''
      }
          </main>
          <footer class="fixed bottom-0 w-full flex justify-between p-1 text-white" style="background-color: ${previewData?.whitelabel?.hexacode || '#00008B'
      };">
            <p class="text-[10px]">${previewData?.whitelabel?.url || 'No URL available'}</p>
            <p class="text-[5px] text-right text-gray-300"><span>*</span> T&C Apply</p>
          </footer>
        </div>
      </body>
    </html>
  `;
    return html;
  };

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
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
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUpdateFromPreview = () => {
    setView('edit');
  };

  const renderList = () => {
    console.log('Clients:', clients);

    return (
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
        {clients.length === 0 ? (
          <p className="text-gray-600">No clients available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 bg-white shadow-md rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Whitelabel User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proof Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sport</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Navigation</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Navigation 2</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit & Loss</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nav 2 Images</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client._id}>
                    <td className="px-4 py-4 text-sm">{client.whitelabel_user?.whitelabel_user || '-'}</td>
                    <td className="px-4 py-4 text-sm">{client.agentname || '-'}</td>
                    <td className="px-4 py-4 text-sm">{client.user || '-'}</td>
                    <td className="px-4 py-4 text-sm">{client.amount || '-'}</td>
                    <td className="px-4 py-4 text-sm">{client.prooftype?.type || '-'}</td>
                    <td className="px-4 py-4 text-sm">{client.sportname?.sportsName || '-'}</td>
                    <td className="px-4 py-4 text-sm">{client.marketname?.marketName || '-'}</td>
                    <td className="px-4 py-4 text-sm">{client.eventname || '-'}</td>
                    <td className="px-4 py-4 text-sm">{client.navigation || '-'}</td>
                    <td className="px-4 py-4 text-sm">{client.navigation2 || '-'}</td>
                    <td className="px-4 py-4 text-sm">{client.profitAndLoss || '-'}</td>
                    <td className="px-4 py-4 text-sm">
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
                    <td className="px-4 py-4 text-sm">
                      {client.navigation2Images?.length ? (
                        <div className="flex space-x-2">
                          {client.navigation2Images.slice(0, 3).map((image, index) => (
                            <img
                              key={index}
                              src={getImageUrl(image.path)}
                              alt={image.filename}
                              className="w-8 h-8 object-cover rounded"
                              onError={(e) => (e.target.src = `${API_BASE_URL}${DEFAULT_PLACEHOLDER}`)}
                            />
                          ))}
                          {client.navigation2Images.length > 3 && <span>+{client.navigation2Images.length - 3}</span>}
                        </div>
                      ) : (
                        'No Nav 2 images'
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(client._id)}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(client._id)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderForm = () => (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{view === 'edit' ? 'Edit Client' : 'Add Client'}</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700">White Label</label>
          <input
            type="text"
            name="whitelabel_user"
            value={formData.whitelabel_user}
            placeholder="Select white label, e.g. cbtfturbo"
            onChange={handleUsernameChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
            autoComplete="off"
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          />
          {showDropdown && suggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
          {usernameStatus && (
            <p className={`text-sm ${isValidUsername ? 'text-green-600' : 'text-red-600'}`}>
              {usernameStatus}
            </p>
          )}
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
          <label className="block text-sm font-medium text-gray-700">Agent Name</label>
          <input
            type="text"
            name="agentname"
            placeholder="Enter agent name"
            value={formData.agentname}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">User</label>
          <input
            type="text"
            name="user"
            placeholder="Enter user name, e.g. abcd2000"
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
            placeholder="Enter bet or bets amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
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
          <label className="block text-sm font-medium text-gray-700">Market Navigation</label>
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
        <div>
          <label className="block text-sm font-medium text-gray-700">
            <div>Select proof Image </div>
            <div>સારા પરિણામો માટે નીચની સૂચનાઓ વાંચો અને અનુસરો.</div>
            <div>૧. તમારું બ્રાઉઝર ગૂગલ ક્રોમ રાખો.</div>
            <div>૨. તમારા બ્રાઉઝરનુ રેસોલુશન ૧૦૦% રાખો.</div>
            <div>૩. SS માટે FuseBase Pro ગૂગલ એક્સટેન્શનનો ઉપયોગ કરો.</div>
            <li>Single Bet VOID ના Proof માટે સિસ્ટમ પ્રમાણે નીચેના માપથી SS લો.</li>
            <div>મેક: 1355*280 અને 5 Bets, ઉબન્ટુ: 1600*330 અને 5 Bets વિન્ડોઝ: 1270*280 અને 5 Bets</div>
            <li>Duble Bets VOID ના Proof માટે સિસ્ટમ પ્રમાણે નીચેના માપથી SS લો.</li>
            <div>મેક: 1355*280 2x અને 5 Bets, ઉબન્ટુ: 1600*330 2x અને 5 Bets વિન્ડોઝ: 1270*280 2x અને 5 Bets.</div>
            <li>Three Bets VOID ના Proof માટે સિસ્ટમ પ્રમાણે નીચેના માપથી SS લો.</li>
            <div>મેક: 1355*280 3x અને 5 Bets, ઉબન્ટુ: 1600*330 3x અને 5 Bets વિન્ડોઝ: 1270*280 3x અને 5 Bets.</div>
          </label>
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
          <label className="block text-sm font-medium text-gray-700">Market Navigation 2 (Optional)</label>
          <input
            type="text"
            name="navigation2"
            value={formData.navigation2}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Navigation 2 Images (up to 6, Optional)</label>
          <label className="block text-sm font-medium text-gray-700">
            <div>Select proof Image 2 (Optional) </div>
            <div>સારા પરિણામો માટે નીચની સૂચનાઓ વાંચો અને અનુસરો.</div>
            <div>૧. તમારું બ્રાઉઝર ગૂગલ ક્રોમ રાખો.</div>
            <div>૨. તમારા બ્રાઉઝરનુ રેસોલુશન ૧૦૦% રાખો.</div>
            <div>૩. SS માટે FuseBase Pro ગૂગલ એક્સટેન્શનનો ઉપયોગ કરો.</div>
            <li>Single Bet VOID ના Proof માટે સિસ્ટમ પ્રમાણે નીચેના માપથી SS લો.</li>
            <div>મેક: 1355*280 અને 5 Bets, ઉબન્ટુ: 1600*330 અને 5 Bets વિન્ડોઝ: 1270*280 અને 5 Bets</div>
            <li>Duble Bets VOID ના Proof માટે સિસ્ટમ પ્રમાણે નીચેના માપથી SS લો.</li>
            <div>મેક: 1355*280 2x અને 5 Bets, ઉબન્ટુ: 1600*330 2x અને 5 Bets વિન્ડોઝ: 1270*280 2x અને 5 Bets.</div>
            <li>Three Bets VOID ના Proof માટે સિસ્ટમ પ્રમાણે નીચેના માપથી SS લો.</li>
            <div>મેક: 1355*280 3x અને 5 Bets, ઉબન્ટુ: 1600*330 3x અને 5 Bets વિન્ડોઝ: 1270*280 3x અને 5 Bets.</div>
          </label>

          <input
            type="file"
            name="navigation2Images"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/gif"
            onChange={handleNavigation2ImageChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          {selectedNavigation2Images.length > 0 && (
            <p className="text-sm text-gray-600">{selectedNavigation2Images.length} image(s) selected for Navigation 2</p>
          )}
          {view === 'edit' && currentClient?.navigation2Images?.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700">Current Navigation 2 Images:</p>
              <div className="flex space-x-2">
                {currentClient.navigation2Images.map((image, index) => (
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
    <div className="relative w-full h-full flex flex-col justify-center items-center overflow-hidden ">
      <div
        className="w-full max-w-4xl bg-white shadow-lg"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(getPreviewHTML(), {
            ADD_TAGS: ['style', 'script'],
            ADD_ATTR: ['class', 'style', 'src'],
          }),
        }}
      />
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex justify-center items-center space-x-4 p-4 bg-white shadow-md rounded-lg">
        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className={`px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
          {isDownloading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Generating PDF...
            </span>
          ) : (
            'Download PDF'
          )}
        </button>
        <button
          onClick={handleUpdateFromPreview}
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
        >
          Update
        </button>
        <button
          onClick={() => setView('list')}
          className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200"
        >
          Close Preview
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