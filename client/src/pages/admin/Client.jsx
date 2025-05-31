import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
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
import { useDispatch } from 'react-redux';

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
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [proofMaker, setProofMaker] = useState('');
  const [groupName, setGroupName] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(null);
  const [modalImageType, setModalImageType] = useState(''); // 'images' or 'navigation2Images'
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
      setProofMaker('');
      setGroupName('');
      setShowImageModal(false);
      setModalImageIndex(null);
      setModalImageType('');
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
      setGroupName(currentClient.whitelabel_user?.group || '');
      setSelectedImages(currentClient.images || []);
      setSelectedNavigation2Images(currentClient.navigation2Images || []);
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
      setGroupName('');
      return;
    }

    const matchedUser = whitelabels.find((wl) => wl.whitelabel_user === value);
    if (matchedUser) {
      setIsValidUsername(true);
      setUsernameStatus('User found');
      setGroupName(matchedUser.group || '');
    } else {
      setIsValidUsername(false);
      setUsernameStatus('User not found');
      setGroupName('');
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
    setGroupName(matchedUser ? matchedUser.group : '');
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
    if (files.length + selectedImages.length > 6) {
      alert('You can only upload a maximum of 6 images');
      return;
    }
    const base64Images = await Promise.all(
      files.map(async (file) => ({
        file,
        base64: await toBase64(file),
        filename: file.name,
      }))
    );
    setSelectedImages([...selectedImages, ...base64Images]);
  };

  const handleNavigation2ImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedNavigation2Images.length > 6) {
      alert('You can upload a maximum of 6 images for Navigation 2');
      return;
    }
    const base64Images = await Promise.all(
      files.map(async (file) => ({
        file,
        base64: await toBase64(file),
        filename: file.name,
      }))
    );
    setSelectedNavigation2Images([...selectedNavigation2Images, ...base64Images]);
  };

  const handleRemoveImage = (index, imageType) => {
    if (imageType === 'images') {
      setSelectedImages(selectedImages.filter((_, i) => i !== index));
    } else if (imageType === 'navigation2Images') {
      setSelectedNavigation2Images(selectedNavigation2Images.filter((_, i) => i !== index));
    }
    setShowImageModal(false);
  };

  const handleAddImage = async (e, imageType) => {
    const files = Array.from(e.target.files);
    const maxImages = 6;
    const currentImages = imageType === 'images' ? selectedImages : selectedNavigation2Images;
    if (files.length + currentImages.length > maxImages) {
      alert(`You can upload a maximum of ${maxImages} images for ${imageType === 'images' ? 'Proof Images' : 'Navigation 2 Images'}`);
      return;
    }
    const base64Images = await Promise.all(
      files.map(async (file) => ({
        file,
        base64: await toBase64(file),
        filename: file.name,
      }))
    );
    if (imageType === 'images') {
      setSelectedImages([...selectedImages, ...base64Images]);
    } else if (imageType === 'navigation2Images') {
      setSelectedNavigation2Images([...selectedNavigation2Images, ...base64Images]);
    }
  };

  const handleDragStart = (e, index, imageType) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ index, imageType }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

// const handleDrop = (e, dropIndex, imageType) => {
//   e.preventDefault();
//   const data = JSON.parse(e.dataTransfer.getData('text/plain'));
//   const { index: dragIndex, imageType: draggedImageType } = data;

//   // Prevent cross-type dragging
//   if (imageType !== draggedImageType) return;

//   // Swap images in the respective array
//   const images = imageType === 'images' ? [...selectedImages] : [...selectedNavigation2Images];
//   if (dragIndex !== dropIndex) {
//     // Swap the images at dragIndex and dropIndex
//     [images[dragIndex], images[dropIndex]] = [images[dropIndex], images[dragIndex]];
//   }

//   // Update the state with the swapped images
//   if (imageType === 'images') {
//     setSelectedImages(images);
//   } else {
//     setSelectedNavigation2Images(images);
//   }
// };

const handleDrop = (e, dropIndex, imageType) => {
  e.preventDefault();
  const data = JSON.parse(e.dataTransfer.getData('text/plain'));
  const { index: dragIndex, imageType: draggedImageType } = data;

  // Prevent cross-type dragging
  if (imageType !== draggedImageType) return;

  // Swap images in the respective array
  const images = imageType === 'images' ? [...selectedImages] : [...selectedNavigation2Images];
  if (dragIndex !== dropIndex) {
    // Swap the images at dragIndex and dropIndex
    [images[dragIndex], images[dropIndex]] = [images[dropIndex], images[dragIndex]];
  }

  // Update the state with the swapped images
  if (imageType === 'images') {
    setSelectedImages(images);
  } else {
    setSelectedNavigation2Images(images);
  }
};
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidUsername) {
      setUsernameStatus('Please enter a valid username');
      return;
    }
    if (!formData.user || !formData.eventname || !formData.navigation) {
      alert('User, Event Name, and Navigation are required fields');
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
        group: matchedWhitelabel?.group || 'N/A',
        images: fetchedImages,
        navigation2Images: fetchedNavigation2Images,
        proofContent,
        whitelabel: { ...matchedWhitelabel, logoBase64 },
        clientId: newClient._id,
      });
      setGroupName(matchedWhitelabel?.group || 'N/A');
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
    setProofMaker('');
    setGroupName('');
    setShowImageModal(false);
    setModalImageIndex(null);
    setModalImageType('');
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
    const formattedPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${API_BASE_URL}/${formattedPath}`;
  };

  const getPreviewHTML = () => {
    let proofContent = DOMPurify.sanitize(previewData?.proofContent || 'No content available', {
      ADD_TAGS: ['style'],
      ADD_ATTR: ['class', 'style'],
    });

    const placeholderMap = {
      '{data\\.user\\|\\|""}': '{USER}',
      '{data\\.totalAmount\\|\\|""}': '',
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
      '{PROFIT_LOSS}': previewData?.profitAndLoss ? previewData.profitAndLoss : 'N/A',
      '{ISSUE_TYPE}': 'odds manipulating or odds hedging',
      '{SPORT_NAME}': previewData?.sportname || 'N/A',
      '{EVENT_NAME}': previewData?.eventname || 'N/A',
      '{MARKET_NAME}': previewData?.marketname || 'N/A',
    };

    Object.keys(placeholders).forEach((placeholder) => {
      const regex = new RegExp(placeholder, 'g');
      proofContent = proofContent.replace(regex, placeholders[placeholder]);
    });

    const proofContentHTML = `<div class="mb-4">${proofContent}</div>`;

    const imagesHTML = previewData?.images?.length
      ? previewData.images
          .map(
            (image) =>
              image.path
                ? `<img src="${image.path}" alt="${image.filename}" class="mx-[25px] w-[1200px] h-[150px]" />`
                : ''
          )
          .join('')
      : '';

    const navigation2ImagesHTML = previewData?.navigation2Images?.length
      ? previewData.navigation2Images
          .map(
            (image) =>
              image.path
                ? `<img src="${image.path}" alt="${image.filename}" class="mx-[25px] w-[1200px] h-[150px]" />`
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
          <header class="sticky top-0 z-10 h-[60px] flex items-center justify-between p-5 text-white" style="background-color: ${
            previewData?.whitelabel?.hexacode || '#00008B'
          };">
            <img src="${
              previewData?.whitelabel?.logoBase64 || getImageUrl(previewData?.whitelabel?.logo)
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
                <span class="font-bold">Total Amount: ${previewData?.amount ? previewData.amount : 'N/A'}</span>
              </div>
              <div class="flex-1">
                <span class="font-bold">Sport Name: ${previewData?.sportname || 'N/A'}</span><br/>
                <span class="font-bold">Event Name: ${
                  previewData?.eventname && previewData.eventname.length > 10
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
              <span class="font-bold text-[16px]">${previewData?.navigation || 'N/A'}</span>
            </div>
            <div class="mt-[-px] w-full flex flex-wrap gap-1">
              ${imagesHTML}
            </div>
            ${
              previewData?.navigation2
                ? `
              <div class="italic font-bold ml-[48px] mt-[25px] mx-[24px]">
                <span class="font-bold text-[16px]">${previewData?.navigation2}</span>
              </div>
              <div class="mt- w-full flex flex-wrap gap-2.5 mr-[25px]">
                ${navigation2ImagesHTML}
              </div>
            `
                : ''
            }
          </main>
          <footer class="fixed bottom-0 w-full flex justify-between p-1 text-white" style="background-color: ${
            previewData?.whitelabel?.hexacode || '#00008B'
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

  const handleOpenDownloadModal = () => {
    if (!previewData?.whitelabel_user) {
      alert('Please select a valid whitelabel user before downloading.');
      return;
    }
    setShowDownloadModal(true);
  };

  const handleDownloadPDF = async () => {
    if (!proofMaker.trim() || !groupName.trim()) {
      alert('Proof Maker and Group Name are required before downloading the PDF.');
      return;
    }

    try {
      setIsDownloading(true);
      const updatedFormData = new FormData();
      Object.entries(previewData).forEach(([key, value]) => {
        if (key !== 'images' && key !== 'navigation2Images' && key !== 'proofContent' && key !== 'whitelabel' && key !== 'group' && key !== 'clientId') {
          if (value !== undefined && value !== '') {
            updatedFormData.append(key, value);
          }
        }
      });
      updatedFormData.append('proofMaker', proofMaker);
      updatedFormData.append('groupName', groupName);

      let action;
      if (previewData.clientId) {
        action = await dispatch(updateClient({ id: previewData.clientId, clientData: updatedFormData }));
      } else {
        action = await dispatch(createClient(updatedFormData));
      }

      if (action.error) {
        throw new Error(action.error.message);
      }

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

      setShowDownloadModal(false);
      setProofMaker('');
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
    setFormData({
      whitelabel_user: previewData.whitelabel_user || '',
      agentname: previewData.agentname || '',
      user: previewData.user || '',
      amount: previewData.amount || '',
      prooftype: previewData.prooftype || '',
      sportname: previewData.sportname || '',
      marketname: previewData.marketname || '',
      eventname: previewData.eventname || '',
      navigation: previewData.navigation || '',
      profitAndLoss: previewData.profitAndLoss || '',
      navigation2: previewData.navigation2 || '',
    });
    setGroupName(previewData.group || '');
    setSelectedImages(previewData.images || []);
    setSelectedNavigation2Images(previewData.navigation2Images || []);
    setEditId(previewData.clientId || null);
    setView('edit');
    setShowDownloadModal(false);
  };

  const renderList = () => {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
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
              <thead className="thead">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Whitelabel User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proof Maker</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nav 2 Images</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client._id}>
                    <td className="px-4 py-4 text-sm">{client.whitelabel_user?.whitelabel_user || '-'}</td>
                    <td className="px-4 py-4 text-sm">{client.whitelabel_user?.group || '-'}</td>
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
                    <td className="px-4 py-4 text-sm">{client.proofMaker || '-'}</td>
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
                        'No images available'
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
                            />
                          ))}
                          {client.navigation2Images.length > 3 && (
                            <span>+{client.navigation2Images.length - 3}</span>
                          )}
                        </div>
                      ) : (
                        'No images available'
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




// const renderForm = () => (
//   <div className="container mx-auto px-4 py-8">
//     <h1 className="text-2xl font-bold mb-6">{view === 'edit' ? 'Edit Client' : 'Add Client'}</h1>
//     <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-4">
//       <div className="relative">
//         <label className="block mb-2 text-sm font-medium text-gray-700">White Label</label>
//         <input
//           type="text"
//           name="whitelabel_user"
//           value={formData.whitelabel_user}
//           onChange={handleUsernameChange}
//           placeholder="Select white label, e.g., cbtfturbo"
//           className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//           required
//           autoComplete="off"
//           onFocus={() => setShowDropdown(true)}
//           onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
//         />
//         {showDropdown && suggestions.length > 0 && (
//           <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-[150px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
//             {suggestions.map((suggestion, index) => (
//               <li
//                 key={index}
//                 className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                 onClick={() => handleSuggestionClick(suggestion)}
//               >
//                 {suggestion}
//               </li>
//             ))}
//           </ul>
//         )}
//         {usernameStatus && (
//           <p className={`px-4 py-1 text-sm ${isValidUsername ? 'text-green-600' : 'text-red-600'}`}>
//             {usernameStatus}
//           </p>
//         )}
//       </div>
//       <div>
//         <label className="block text-sm font-medium text-gray-700">Proof Type</label>
//         <select
//           name="prooftype"
//           value={formData.prooftype}
//           onChange={handleChange}
//           className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//           required
//         >
//           <option value="">Select Proof Type</option>
//           {proofTypes.map((pt) => (
//             <option key={pt._id} value={pt.type}>
//               {pt.type}
//             </option>
//           ))}
//         </select>
//       </div>
//       <div>
//         <label className="block text-sm font-medium text-gray-700">Agent Name</label>
//         <input
//           type="text"
//           name="agentname"
//           placeholder="Enter agent name"
//           value={formData.agentname}
//           onChange={handleChange}
//           className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//           required
//         />
//       </div>
//       <div>
//         <label className="block text-sm font-medium text-gray-700">User</label>
//         <input
//           type="text"
//           name="user"
//           placeholder="Enter user name, e.g., abcd1234"
//           value={formData.user}
//           onChange={handleChange}
//           className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//           required
//         />
//       </div>
//       <div>
//         <label className="block text-sm font-medium text-gray-700">Amount</label>
//         <input
//           type="number"
//           name="amount"
//           placeholder="Enter amount"
//           value={formData.amount}
//           onChange={handleChange}
//           className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//           required
//         />
//       </div>
//       <div>
//         <label className="block text-sm font-medium text-gray-700">Select Sport</label>
//         <select
//           name="sportname"
//           value={formData.sportname}
//           onChange={handleChange}
//           className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//           required
//         >
//           <option value="">Select Sport</option>
//           {sports.map((sport) => (
//             <option key={sport._id} value={sport.sportsName}>
//               {sport.sportsName}
//             </option>
//           ))}
//         </select>
//       </div>
//       <div>
//         <label className="block text-sm font-medium text-gray-700">Market Name</label>
//         <select
//           name="marketname"
//           value={formData.marketname}
//           onChange={handleChange}
//           className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//           required
//         >
//           <option value="">Select Market</option>
//           {markets.map((market) => (
//             <option key={market._id} value={market.marketName}>
//               {market.marketName}
//             </option>
//           ))}
//         </select>
//       </div>
//       <div>
//         <label className="block text-sm font-medium text-gray-700">Event Name</label>
//         <input
//           type="text"
//           name="eventname"
//           value={formData.eventname}
//           onChange={handleChange}
//           className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//           required
//         />
//       </div>
//       <div>
//         <label className="block text-sm font-medium text-gray-700">Market Navigation</label>
//         <input
//           type="text"
//           name="navigation"
//           value={formData.navigation}
//           onChange={handleChange}
//           className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//           required
//         />
//       </div>
//       <div>
//         <label className="block text-sm font-medium text-gray-700">Profit & Loss</label>
//         <input
//           type="number"
//           name="profitAndLoss"
//           value={formData.profitAndLoss}
//           onChange={handleChange}
//           className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//         />
//       </div>
//       <div>
//         <label className="block text-sm font-medium text-gray-700">
//           <div>Upload Proof Images (up to 6)</div>
//           <div>Follow these instructions for best results:</div>
//           <div>1. Use Google Chrome browser.</div>
//           <div>2. Recommended dimensions:</div>
//           <div>- Mac: 1355x280px, 5 bets</div>
//           <div>- Ubuntu: 1600x330px, 5 bets</div>
//           <div>- Windows: 1270x280px, 5 bets</div>
//           <li>For Double Bets VOID proof:</li>
//           <div>- Mac: 1355x280px 2x, 5 bets</div>
//           <div>- Ubuntu: 1600x330px 2x, 5 bets</div>
//           <div>- Windows: 1270x280px 2x, 5 bets</div>
//           <li>For Triple Bets VOID proof:</li>
//           <div>- Mac: 1355x280px 3x, 5 bets</div>
//           <div>- Ubuntu: 1600x330px 3x, 5 bets</div>
//           <div>- Windows: 1270x280px 3x, 5 bets</div>
//         </label>
//         <input
//           type="file"
//           name="images"
//           multiple
//           accept="image/jpeg,image/jpg,image/png,image/gif"
//           onChange={handleImageChange}
//           className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//         />
//         {selectedImages.length > 0 && (
//           <div className="mt-2">
//             <div className="flex justify-between items-center mb-2">
//               <p className="text-sm font-medium text-gray-700">Selected Images:</p>
//               <div className="flex space-x-2">
//                 <label className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 cursor-pointer">
//                   Add Image
//                   <input
//                     type="file"
//                     accept="image/jpeg,image/jpg,image/png,image/gif"
//                     onChange={(e) => handleAddImage(e, 'images')}
//                     className="hidden"
//                   />
//                 </label>
//                 <button
//                   onClick={() => setSelectedImages([])}
//                   className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
//                 >
//                   ✕ Delete All
//                 </button>
//               </div>
//             </div>
//             <div className="flex space-x-2 flex-wrap">
//               {selectedImages.map((image, index) => (
//                 <div
//                   key={index}
//                   draggable
//                   onDragStart={(e) => handleDragStart(e, index, 'images')}
//                   onDragOver={handleDragOver}
//                   onDrop={(e) => handleDrop(e, index, 'images')}
//                   className="relative cursor-move"
//                 >
//                   <button
//                     onClick={() => handleRemoveImage(index, 'images')}
//                     className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
//                   >
//                     ✕
//                   </button>
//                   <img
//                     src={image.base64 || getImageUrl(image.path)}
//                     alt={image.filename}
//                     className="w-16 h-16 object-cover rounded"
//                     onError={(e) => (e.target.src = `${API_BASE_URL}${DEFAULT_PLACEHOLDER}`)}
//                     onClick={() => {
//                       setShowImageModal(true);
//                       setModalImageIndex(index);
//                       setModalImageType('images');
//                     }}
//                   />
//                 </div>
//               ))}
//             </div>
//             <p className="text-sm text-gray-600 mt-2">{selectedImages.length} image(s) selected</p>
//           </div>
//         )}
//       </div>
//       <div>
//         <label className="block text-sm font-medium text-gray-700">
//           <div>Upload Navigation 2 Images (up to 6, Optional)</div>
//           <div>Follow these instructions for best results:</div>
//           <div>1. Use Google Chrome browser.</div>
//           <div>2. Set browser resolution to 100%.</div>
//           <div>3. Use FuseBasePDF Google Chrome extension for screenshots.</div>
//           <li>For Single Bet VOID proof:</li>
//           <div>- Mac: 1355x280px, 5 bets</div>
//           <div>- Ubuntu: 1600x330px, 5 bets</div>
//           <div>- Windows: 1270x280px, 5 bets</div>
//           <li>For Double Bets VOID proof:</li>
//           <div>- Mac: 1355x280px 2x, 5 bets</div>
//           <div>- Ubuntu: 1600x330px 2x, 5 bets</div>
//           <div>- Windows: 1270x280px 2x, 5 bets</div>
//           <li>For Triple Bets VOID proof:</li>
//           <div>- Mac: 1355x280px 3x, 5 bets</div>
//           <div>- Ubuntu: 1600x330px 3x, 5 bets</div>
//           <div>- Windows: 1270x280px 3x, 5 bets</div>
//         </label>
//         <input
//           type="file"
//           name="navigation2Images"
//           multiple
//           accept="image/jpeg,image/jpg,image/png,image/gif"
//           onChange={handleNavigation2ImageChange}
//           className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//         />
//         {selectedNavigation2Images.length > 0 && (
//           <div className="mt-2">
//             <div className="flex justify-between items-center mb-2">
//               <p className="text-sm font-medium text-gray-700">Selected Navigation 2 Images:</p>
//               <div className="flex space-x-2">
//                 <label className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 cursor-pointer">
//                   Add Image
//                   <input
//                     type="file"
//                     accept="image/jpeg,image/jpg,image/png,image/gif"
//                     onChange={(e) => handleAddImage(e, 'navigation2Images')}
//                     className="hidden"
//                   />
//                 </label>
//                 <button
//                   onClick={() => setSelectedNavigation2Images([])}
//                   className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
//                 >
//                   ✕ Delete All
//                 </button>
//               </div>
//             </div>
//             <div className="flex space-x-2 flex-wrap">
//               {selectedNavigation2Images.map((image, index) => (
//                 <div
//                   key={index}
//                   draggable
//                   onDragStart={(e) => handleDragStart(e, index, 'navigation2Images')}
//                   onDragOver={handleDragOver}
//                   onDrop={(e) => handleDrop(e, index, 'navigation2Images')}
//                   className="relative cursor-move"
//                 >
//                   <button
//                     onClick={() => handleRemoveImage(index, 'navigation2Images')}
//                     className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
//                   >
//                     ✕
//                   </button>
//                   <img
//                     src={image.base64 || getImageUrl(image.path)}
//                     alt={image.filename}
//                     className="w-16 h-16 object-cover rounded"
//                     onError={(e) => (e.target.src = `${API_BASE_URL}${DEFAULT_PLACEHOLDER}`)}
//                     onClick={() => {
//                       setShowImageModal(true);
//                       setModalImageIndex(index);
//                       setModalImageType('navigation2Images');
//                     }}
//                   />
//                 </div>
//               ))}
//             </div>
//             <p className="text-sm text-gray-600 mt-2">{selectedNavigation2Images.length} image(s) selected</p>
//           </div>
//         )}
//       </div>
//       <div className="flex justify-end space-x-4">
//         <button
//           type="button"
//           onClick={handleCancel}
//           className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
//         >
//           Cancel
//         </button>
//         <button
//           type="submit"
//           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//         >
//           {view === 'edit' ? 'Update' : 'Submit'}
//         </button>
//       </div>
//     </form>
//     {showImageModal && modalImageIndex !== null && (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//         <div className="relative bg-white p-4 rounded-lg shadow-lg max-w-3xl w-full">
//           <button
//             onClick={() => setShowImageModal(false)}
//             className="absolute top-2 right-2 bg-gray-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-600"
//           >
//             ✕
//           </button>
//           <img
//             src={
//               modalImageType === 'images'
//                 ? selectedImages[modalImageIndex]?.base64 || getImageUrl(selectedImages[modalImageIndex]?.path)
//                 : selectedNavigation2Images[modalImageIndex]?.base64 || getImageUrl(selectedNavigation2Images[modalImageIndex]?.path)
//             }
//             alt=""
//             className="max-w-full max-h-[80vh] object-contain"
//             onError={(e) => (e.target.src = `${API_BASE_URL}${DEFAULT_PLACEHOLDER}`)}
//           />
//         </div>
//       </div>
//     )}
//   </div>
// );
 const renderForm = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-2xl font-bold mb-6">{view === 'edit' ? 'Edit Client' : 'Add Client'}</h1>
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-4">
      {/* Other form fields remain unchanged */}
      <div className="relative">
        <label className="block mb-2 text-sm font-medium text-gray-700">White Label</label>
        <input
          type="text"
          name="whitelabel_user"
          value={formData.whitelabel_user}
          onChange={handleUsernameChange}
          placeholder="Select white label, e.g., cbtfturbo"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          required
          autoComplete="off"
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        />
        {showDropdown && suggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-[150px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
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
          <p className={`px-4 py-1 text-sm ${isValidUsername ? 'text-green-600' : 'text-red-600'}`}>
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
          placeholder="Enter user name, e.g., abcd1234"
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
          placeholder="Enter amount"
          value={formData.amount}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Select Sport</label>
        <select
          name="sportname"
          value={formData.sportname}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
        <label className="block text-sm font-medium text-gray-700">Market Name</label>
        <select
          name="marketname"
          value={formData.marketname}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          <div>Upload Proof Images (up to 6)</div>
          <div>Follow these instructions for best results:</div>
          <div>1. Use Google Chrome browser.</div>
          <div>2. Recommended dimensions:</div>
          <div>- Mac: 1355x280px, 5 bets</div>
          <div>- Ubuntu: 1600x330px, 5 bets</div>
          <div>- Windows: 1270x280px, 5 bets</div>
          <li>For Double Bets VOID proof:</li>
          <div>- Mac: 1355x280px 2x, 5 bets</div>
          <div>- Ubuntu: 1600x330px 2x, 5 bets</div>
          <div>- Windows: 1270x280px 2x, 5 bets</div>
          <li>For Triple Bets VOID proof:</li>
          <div>- Mac: 1355x280px 3x, 5 bets</div>
          <div>- Ubuntu: 1600x330px 3x, 5 bets</div>
          <div>- Windows: 1270x280px 3x, 5 bets</div>
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
          <div className="mt-2">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-gray-700">Selected Images:</p>
              <div className="flex space-x-2">
                <label className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 cursor-pointer">
                  Add Image
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    onChange={(e) => handleAddImage(e, 'images')}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => setSelectedImages([])}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  ✕ Delete All
                </button>
              </div>
            </div>
            <div className="flex space-x-2 flex-wrap">
              {selectedImages.map((image, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index, 'images')}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index, 'images')}
                  className="relative cursor-move"
                >
                  <button
                    onClick={() => handleRemoveImage(index, 'images')}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  >
                    ✕
                  </button>
                  <img
                    src={image.base64 || getImageUrl(image.path)}
                    alt={image.filename}
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => (e.target.src = `${API_BASE_URL}${DEFAULT_PLACEHOLDER}`)}
                    onClick={() => {
                      setShowImageModal(true);
                      setModalImageIndex(index);
                      setModalImageType('images');
                    }}
                    title="Drag to swap with another image"
                  />
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">{selectedImages.length} image(s) selected</p>
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          <div>Upload Navigation 2 Images (up to 6, Optional)</div>
          <div>Follow these instructions for best results:</div>
          <div>1. Use Google Chrome browser.</div>
          <div>2. Set browser resolution to 100%.</div>
          <div>3. Use FuseBasePDF Google Chrome extension for screenshots.</div>
          <li>For Single Bet VOID proof:</li>
          <div>- Mac: 1355x280px, 5 bets</div>
          <div>- Ubuntu: 1600x330px, 5 bets</div>
          <div>- Windows: 1270x280px, 5 bets</div>
          <li>For Double Bets VOID proof:</li>
          <div>- Mac: 1355x280px 2x, 5 bets</div>
          <div>- Ubuntu: 1600x330px 2x, 5 bets</div>
          <div>- Windows: 1270x280px 2x, 5 bets</div>
          <li>For Triple Bets VOID proof:</li>
          <div>- Mac: 1355x280px 3x, 5 bets</div>
          <div>- Ubuntu: 1600x330px 3x, 5 bets</div>
          <div>- Windows: 1270x280px 3x, 5 bets</div>
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
          <div className="mt-2">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-gray-700">Selected Navigation 2 Images:</p>
              <div className="flex space-x-2">
                <label className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 cursor-pointer">
                  Add Image
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    onChange={(e) => handleAddImage(e, 'navigation2Images')}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => setSelectedNavigation2Images([])}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  ✕ Delete All
                </button>
              </div>
            </div>
            <div className="flex space-x-2 flex-wrap">
              {selectedNavigation2Images.map((image, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index, 'navigation2Images')}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index, 'navigation2Images')}
                  className="relative cursor-move"
                >
                  <button
                    onClick={() => handleRemoveImage(index, 'navigation2Images')}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  >
                    ✕
                  </button>
                  <img
                    src={image.base64 || getImageUrl(image.path)}
                    alt={image.filename}
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => (e.target.src = `${API_BASE_URL}${DEFAULT_PLACEHOLDER}`)}
                    onClick={() => {
                      setShowImageModal(true);
                      setModalImageIndex(index);
                      setModalImageType('navigation2Images');
                    }}
                    title="Drag to swap with another image"
                  />
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">{selectedNavigation2Images.length} image(s) selected</p>
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
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {view === 'edit' ? 'Update' : 'Submit'}
        </button>
      </div>
    </form>
    {showImageModal && modalImageIndex !== null && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="relative bg-white p-4 rounded-lg shadow-lg max-w-3xl w-full">
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-2 right-2 bg-gray-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-600"
          >
            ✕
          </button>
          <img
            src={
              modalImageType === 'images'
                ? selectedImages[modalImageIndex]?.base64 || getImageUrl(selectedImages[modalImageIndex]?.path)
                : selectedNavigation2Images[modalImageIndex]?.base64 || getImageUrl(selectedNavigation2Images[modalImageIndex]?.path)
            }
            alt=""
            className="max-w-full max-h-[80vh] object-contain"
            onError={(e) => (e.target.src = `${API_BASE_URL}${DEFAULT_PLACEHOLDER}`)}
          />
        </div>
      </div>
    )}
  </div>
);
const renderPreview = () => (
    <div className="relative w-full h-full flex flex-col items-center overflow-hidden">
      <div
        className="w-full max-w-4xl bg-white shadow-lg"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(getPreviewHTML(), {
            ADD_TAGS: ['style'],
            ADD_ATTR: ['class', 'style'],
          }),
        }}
      />
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex justify-center items-center space-x-4 p-4 bg-white shadow-md rounded-lg">
        <button
          onClick={handleOpenDownloadModal}
          disabled={isDownloading}
          className={`px-6 py-2 text-white font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ${
            isDownloading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isDownloading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="opacity-25"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Generating PDF...
            </span>
          ) : (
            'Download PDF'
          )}
        </button>
        <button
          onClick={handleUpdateFromPreview}
          className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
        >
          Update
        </button>
        <button
          onClick={() => setView('list')}
          className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200"
        >
          Close Preview
        </button>
      </div>
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Download PDF</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter Group Name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Proof Maker</label>
              <input
                type="text"
                value={proofMaker}
                onChange={(e) => setProofMaker(e.target.value)}
                placeholder="Enter Proof Maker name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setShowDownloadModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={!proofMaker.trim() || !groupName.trim() || isDownloading}
                className={`px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                  !proofMaker.trim() || !groupName.trim() || isDownloading
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-blue-700'
                }`}
              >
                {isDownloading ? 'Processing...' : 'Download PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
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

