// import { useEffect, useState, useRef } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import {
//   fetchClients,
//   deleteClient,
//   createClient,
//   updateClient,
//   fetchClientById,
//   fetchWhitelabels,
//   fetchProofTypes,
//   fetchProofByType,
//   fetchSports,
//   fetchMarkets,
//   resetCurrentClient,
// } from '../../redux/client/clientSlice';
// import DOMPurify from 'dompurify';

// const API_BASE_URL = 'http://localhost:2030';
// const DEFAULT_PLACEHOLDER = '/placeholder-logo.png';

// function ClientManager() {
//   const dispatch = useDispatch();
//   const {
//     clients,
//     currentClient,
//     whitelabels,
//     proofTypes,
//     selectedProof,
//     sports,
//     markets,
//     status,
//     error,
//   } = useSelector((state) => state.clients);

//   const [view, setView] = useState('list');
//   const [editId, setEditId] = useState(null);
//   const [isValidUsername, setIsValidUsername] = useState(false);
//   const [usernameStatus, setUsernameStatus] = useState('');
//   const [previewData, setPreviewData] = useState(null);
//   const [selectedImages, setSelectedImages] = useState([]);
//   const previewRef = useRef(null);

//   const [formData, setFormData] = useState({
//     agentname: '',
//     username: '',
//     user: '',
//     amount: '',
//     prooftype: '',
//     sportname: '',
//     marketname: '',
//     eventname: '',
//     navigation: '',
//     profitAndLoss: '',
//   });

//   useEffect(() => {
//     if (status === 'idle') {
//       dispatch(fetchClients());
//       dispatch(fetchWhitelabels());
//       dispatch(fetchProofTypes());
//       dispatch(fetchSports());
//       dispatch(fetchMarkets());
//     }
//   }, [status, dispatch]);

//   useEffect(() => {
//     if (view === 'edit' && editId) {
//       dispatch(fetchClientById(editId));
//     } else if (view !== 'preview') {
//       dispatch(resetCurrentClient());
//       setFormData({
//         agentname: '',
//         username: '',
//         user: '',
//         amount: '',
//         prooftype: '',
//         sportname: '',
//         marketname: '',
//         eventname: '',
//         navigation: '',
//         profitAndLoss: '',
//       });
//       setSelectedImages([]);
//       setIsValidUsername(false);
//       setUsernameStatus('');
//     }
//   }, [view, editId, dispatch]);

//   useEffect(() => {
//     if (currentClient && view === 'edit') {
//       setFormData({
//         agentname: currentClient.agentname || '',
//         username: currentClient.username?.whitelabel_user || '',
//         user: currentClient.user || '',
//         amount: currentClient.amount || '',
//         prooftype: currentClient.prooftype?.type || '',
//         sportname: currentClient.sportname?.sportsName || '',
//         marketname: currentClient.marketname?.marketName || '',
//         eventname: currentClient.eventname || '',
//         navigation: currentClient.navigation || '',
//         profitAndLoss: currentClient.profitAndLoss || '',
//       });
//       setSelectedImages([]);
//       const matchedUser = whitelabels.find(
//         (wl) => wl.whitelabel_user === currentClient.username?.whitelabel_user
//       );
//       setIsValidUsername(!!matchedUser);
//       setUsernameStatus(matchedUser ? 'User found' : 'User not found');
//       if (currentClient.prooftype?.type) {
//         dispatch(fetchProofByType(currentClient.prooftype.type));
//       }
//     }
//   }, [currentClient, view, whitelabels, dispatch]);

//   const handleUsernameChange = (e) => {
//     const value = e.target.value;
//     setFormData({ ...formData, username: value });

//     if (value.trim() === '') {
//       setIsValidUsername(false);
//       setUsernameStatus('');
//       return;
//     }

//     const matchedUser = whitelabels.find((wl) => wl.whitelabel_user === value);
//     if (matchedUser) {
//       setIsValidUsername(true);
//       setUsernameStatus('User found');
//     } else {
//       setIsValidUsername(false);
//       setUsernameStatus('User not found');
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//     if (name === 'prooftype' && value) {
//       dispatch(fetchProofByType(value));
//     }
//   };

//   const handleImageChange = (e) => {
//     const files = Array.from(e.target.files);
//     if (files.length > 5) {
//       alert('You can upload a maximum of 5 images.');
//       return;
//     }
//     setSelectedImages(files);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!isValidUsername) {
//       setUsernameStatus('Please enter a valid username');
//       return;
//     }
//     if (!formData.user || !formData.eventname || !formData.navigation) {
//       alert('User, Event Name, and Navigation are required fields.');
//       return;
//     }

//     const formDataToSend = new FormData();
//     Object.entries(formData).forEach(([key, value]) => {
//       formDataToSend.append(key, value);
//     });

//     selectedImages.forEach((image) => {
//       formDataToSend.append('images', image);
//     });

//     let action;
//     try {
//       if (view === 'edit') {
//         action = await dispatch(updateClient({ id: editId, clientData: formDataToSend }));
//       } else {
//         action = await dispatch(createClient(formDataToSend));
//       }

//       if (action.error) {
//         throw new Error(action.error.message);
//       }

//       const newClient = action.payload;

//       let proofContent = '';
//       if (formData.prooftype) {
//         const proofRes = await dispatch(fetchProofByType(formData.prooftype));
//         proofContent = proofRes.payload?.content || 'No content available';
//       }

//       const matchedWhitelabel = whitelabels.find(
//         (wl) => wl.whitelabel_user === formData.username
//       );

//       setPreviewData({
//         ...formData,
//         images: newClient.images || [],
//         proofContent,
//         whitelabel: matchedWhitelabel || null,
//       });
//       setView('preview');
//     } catch (error) {
//       console.error('Submit error:', error);
//       alert(`Failed to ${view === 'edit' ? 'update' : 'create'} client: ${error.message}`);
//     }
//   };

//   const handleDelete = (id) => {
//     if (window.confirm('Are you sure you want to delete this client?')) {
//       dispatch(deleteClient(id));
//     }
//   };

//   const handleEdit = (id) => {
//     setEditId(id);
//     setView('edit');
//   };

//   const handleCancel = () => {
//     setView('list');
//     setEditId(null);
//     dispatch(resetCurrentClient());
//     setPreviewData(null);
//     setSelectedImages([]);
//   };

//   const getImageUrl = (imagePath) => {
//     if (!imagePath) {
//       return `${API_BASE_URL}${DEFAULT_PLACEHOLDER}`;
//     }
//     if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
//       return imagePath;
//     }
//     const formattedPath = imagePath.startsWith('/')
//       ? imagePath.substring(1)
//       : imagePath;
//     return `${API_BASE_URL}/${formattedPath}`;
//   };

//   const getPreviewHTML = () => {
//     let proofContent = DOMPurify.sanitize(previewData?.proofContent || 'No content available');
//     const hexacode = previewData?.whitelabel?.hexacode || '#00008B';
//     const logoUrl = getImageUrl(previewData?.whitelabel?.logo);

//     const placeholders = {
//       '{agentname}': previewData?.agentname || 'N/A',
//       '{username}': previewData?.username || 'N/A',
//       '{user}': previewData?.user || 'N/A',
//       '{amount}': previewData?.amount || 'N/A',
//       '{sportname}': previewData?.sportname || 'N/A',
//       '{marketname}': previewData?.marketname || 'N/A',
//       '{eventname}': previewData?.eventname || 'N/A',
//       '{navigation}': previewData?.navigation || 'N/A',
//       '{profitAndLoss}': previewData?.profitAndLoss || 'N/A',
//     };

//     Object.keys(placeholders).forEach((placeholder) => {
//       const regex = new RegExp(placeholder.replace(/([{}])/g, '\\$1'), 'g');
//       proofContent = proofContent.replace(regex, placeholders[placeholder]);
//     });

//     let proofContentHTML = proofContent;
//     const conclusionStart = proofContentHTML.indexOf('Conclusion:');
//     if (conclusionStart !== -1) {
//       const beforeConclusion = proofContentHTML.substring(0, conclusionStart);
//       const conclusionAndAfter = proofContentHTML.substring(conclusionStart);
//       const conclusionEnd = conclusionAndAfter.indexOf('We hope');
//       if (conclusionEnd !== -1) {
//         const conclusionText = conclusionAndAfter.substring(0, conclusionEnd);
//         const afterConclusion = conclusionAndAfter.substring(conclusionEnd);
//         proofContentHTML = `
//           ${beforeConclusion}
//           <strong class="font-bold">${conclusionText}</strong>
//           ${afterConclusion}
//         `;
//       } else {
//         proofContentHTML = `
//           ${beforeConclusion}
//           <strong class="font-bold">${conclusionAndAfter}</strong>
//         `;
//       }
//     } else {
//       proofContentHTML = `<div>${proofContentHTML}</div>`;
//     }

//     const imagesHTML = previewData?.images?.length
//       ? previewData.images
//         .map(
//           (image) => `
//             <img src="${getImageUrl(image.path)}" alt="${image.filename}" class="max-w-[100px] m-1" />
//           `
//         )
//         .join('')
//       : '<p class="text-gray-500">No images available</p>';

//     const html = `
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <meta charset="UTF-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
//           <style>
//             @page {
//               size: A4;
//               margin: 0;
//             }
//             body {
//               margin: 0;
//               font-family: Arial, sans-serif;
//             }
//             .a4-container {
//               width: 595px;
//               height: 842px;
//               margin: 0 auto;
//               box-sizing: border-box;
//             }
//           </style>
//         </head>
//         <body>
//           <div class="a4-container font-sans p-5">
//             <header style="background-color: ${hexacode}" class="p-2 text-center">
//               <img src="${logoUrl}" alt="Whitelabel Logo" class="max-h-20 mx-auto" onerror="this.src='${API_BASE_URL}${DEFAULT_PLACEHOLDER}'"/>
//             </header>
//             <main class="p-5">
//               <div class="mb-4">
//                 <p class="text-sm"><strong>Agent Name:</strong> ${previewData?.agentname || 'N/A'}</p>
//                 <p class="text-sm"><strong>Username:</strong> ${previewData?.username || 'N/A'}</p>
//                 <p class="text-sm"><strong>User:</strong> ${previewData?.user || 'N/A'}</p>
//                 <p class="text-sm"><strong>Amount:</strong> ${previewData?.amount || 'N/A'}</p>
//                 <p class="text-sm"><strong>Event Name:</strong> ${previewData?.eventname || 'N/A'}</p>
//                 <p class="text-sm"><strong>Navigation:</strong> ${previewData?.navigation || 'N/A'}</p>
//               </div>
//               <div class="mb-4">
//                 ${proofContentHTML}
//               </div>
//               <div class="mb-4">
//                 <p class="text-sm font-bold">Images:</p>
//                 <div class="flex flex-wrap">
//                   ${imagesHTML}
//                 </div>
//               </div>
//               <div>
//                 <p class="text-sm"><strong>Sport:</strong> ${previewData?.sportname || 'N/A'}</p>
//                 <p class="text-sm"><strong>Market:</strong> ${previewData?.marketname || 'N/A'}</p>
//                 <p class="text-sm"><strong>Profit & Loss:</strong> ${previewData?.profitAndLoss || 'N/A'}</p>
//               </div>
//             </main>
//             <footer style="background-color: ${hexacode}" class="p-2 text-center text-white">
//               <p class="text-sm">${previewData?.whitelabel?.url || 'No URL available'}</p>
//               <p class="text-sm">T&C Apply</p>
//             </footer>
//           </div>
//         </body>
//       </html>
//     `;
//     return html;
//   };

//   const handleDownloadPDF = async () => {
//     try {
//       const previewHTML = getPreviewHTML();
//       const response = await fetch(`${API_BASE_URL}/client/generate-preview-pdf`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ html: previewHTML }),
//       });

//       if (!response.ok) {
//         throw new Error(`Failed to generate PDF: ${response.statusText}`);
//       }

//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = 'client-preview.pdf';
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error('Error downloading PDF:', error);
//       alert('Failed to download PDF. Please ensure the backend server is running at http://localhost:2030.');
//     }
//   };

//   const renderList = () => (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">Clients</h1>
//         <button
//           onClick={() => setView('create')}
//           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
//         >
//           Add Client
//         </button>
//       </div>
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {typeof error === 'string' ? error : JSON.stringify(error)}
//         </div>
//       )}
//       <div className="bg-white shadow-md rounded-lg overflow-hidden">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent Name</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proof Type</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sport</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Name</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Navigation</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit & Loss</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {clients.map((client) => (
//               <tr key={client._id}>
//                 <td className="px-6 py-4 whitespace-nowrap">{client.agentname}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">{client.username?.whitelabel_user || ''}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">{client.user || ''}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">{client.amount}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">{client.prooftype?.type || ''}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">{client.sportname?.sportsName || ''}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">{client.marketname?.marketName || ''}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">{client.eventname || ''}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">{client.navigation || ''}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">{client.profitAndLoss}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   {client.images?.length ? (
//                     <div className="flex space-x-2">
//                       {client.images.slice(0, 3).map((image, index) => (
//                         <img
//                           key={index}
//                           src={getImageUrl(image.path)}
//                           alt={image.filename}
//                           className="w-8 h-8 object-cover rounded"
//                           onError={(e) => (e.target.src = `${API_BASE_URL}${DEFAULT_PLACEHOLDER}`)}
//                         />
//                       ))}
//                       {client.images.length > 3 && <span>+{client.images.length - 3}</span>}
//                     </div>
//                   ) : (
//                     'No images'
//                   )}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <button
//                     onClick={() => handleEdit(client._id)}
//                     className="bg-blue-600 text-white px-3 py-1 rounded mr-2 hover:bg-blue-700"
//                   >
//                     Edit
//                   </button>
//                   <button
//                     onClick={() => handleDelete(client._id)}
//                     className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );

//   const renderForm = () => (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-2xl font-bold mb-6">{view === 'edit' ? 'Edit Client' : 'Add Client'}</h1>
//       <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Agent Name</label>
//           <input
//             type="text"
//             name="agentname"
//             value={formData.agentname}
//             onChange={handleChange}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Username</label>
//           <input
//             type="text"
//             name="username"
//             value={formData.username}
//             onChange={handleUsernameChange}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//             required
//           />
//           {usernameStatus && (
//             <p className={`text-sm ${isValidUsername ? 'text-green-600' : 'text-red-600'}`}>
//               {usernameStatus}
//             </p>
//           )}
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">User</label>
//           <input
//             type="text"
//             name="user"
//             value={formData.user}
//             onChange={handleChange}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Amount</label>
//           <input
//             type="number"
//             name="amount"
//             value={formData.amount}
//             onChange={handleChange}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Proof Type</label>
//           <select
//             name="prooftype"
//             value={formData.prooftype}
//             onChange={handleChange}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//             required
//           >
//             <option value="">Select Proof Type</option>
//             {proofTypes.map((pt) => (
//               <option key={pt._id} value={pt.type}>
//                 {pt.type}
//               </option>
//             ))}
//           </select>
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Sport</label>
//           <select
//             name="sportname"
//             value={formData.sportname}
//             onChange={handleChange}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//             required
//           >
//             <option value="">Select Sport</option>
//             {sports.map((s) => (
//               <option key={s._id} value={s.sportsName}>
//                 {s.sportsName}
//               </option>
//             ))}
//           </select>
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Market</label>
//           <select
//             name="marketname"
//             value={formData.marketname}
//             onChange={handleChange}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//             required
//           >
//             <option value="">Select Market</option>
//             {markets.map((m) => (
//               <option key={m._id} value={m.marketName}>
//                 {m.marketName}
//               </option>
//             ))}
//           </select>
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Event Name</label>
//           <input
//             type="text"
//             name="eventname"
//             value={formData.eventname}
//             onChange={handleChange}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Navigation</label>
//           <input
//             type="text"
//             name="navigation"
//             value={formData.navigation}
//             onChange={handleChange}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Images (up to 5)</label>
//           <input
//             type="file"
//             name="images"
//             multiple
//             accept="image/jpeg,image/jpg,image/png,image/gif"
//             onChange={handleImageChange}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//           />
//           {selectedImages.length > 0 && (
//             <p className="text-sm text-gray-600">{selectedImages.length} image(s) selected</p>
//           )}
//           {view === 'edit' && currentClient?.images?.length > 0 && (
//             <div className="mt-2">
//               <p className="text-sm font-medium text-gray-700">Current Images:</p>
//               <div className="flex space-x-2">
//                 {currentClient.images.map((image, index) => (
//                   <img
//                     key={index}
//                     src={getImageUrl(image.path)}
//                     alt={image.filename}
//                     className="w-16 h-16 object-cover rounded"
//                     onError={(e) => (e.target.src = `${API_BASE_URL}${DEFAULT_PLACEHOLDER}`)}
//                   />
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Profit & Loss</label>
//           <input
//             type="number"
//             name="profitAndLoss"
//             value={formData.profitAndLoss}
//             onChange={handleChange}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg"
//             required
//           />
//         </div>
//         <div className="flex justify-end space-x-4">
//           <button
//             type="button"
//             onClick={handleCancel}
//             className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
//           >
//             {view === 'edit' ? 'Update' : 'Submit'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );

//   const renderPreview = () => (
//     <div className="bg-white rounded-lg mt-5 shadow-xl w-full h-full flex flex-col">
//       <div
//         className="p-5"
//         dangerouslySetInnerHTML={{
//           __html: DOMPurify.sanitize(getPreviewHTML()),
//         }}
//       />
//       <div className="flex justify-end p-3 mt-[25px] space-x-4">
//         <button
//           onClick={handleDownloadPDF}
//           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
//         >
//           Download PDF
//         </button>
//         <button
//           onClick={() => setView('list')}
//           className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
//         >
//           Close
//         </button>
//       </div>
//     </div>
//   );

//   return (
//     <div className="w-full h-full">
//       {view === 'list' && renderList()}
//       {['create', 'edit'].includes(view) && renderForm()}
//       {view === 'preview' && previewData && renderPreview()}
//     </div>
//   );
// }

// export default ClientManager;


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
  const [files, setFiles] = useState([]);
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
      setFiles([]);
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
      const matchedUser = whitelabels.find(
        (wl) => wl.whitelabel_user === currentClient.username?.whitelabel_user
      );
      setIsValidUsername(!!matchedUser);
      setUsernameStatus(matchedUser ? 'User found' : 'User not found');
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
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 5) {
      alert('You can upload a maximum of 5 images.');
      return;
    }
    setFiles(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidUsername) {
      setUsernameStatus('Please enter a valid username');
      return;
    }

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) formDataToSend.append(key, value);
    });
    files.forEach((file) => {
      formDataToSend.append('images', file);
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

      const matchedWhitelabel = whitelabels.find(
        (wl) => wl.whitelabel_user === formData.username
      );
      const selectedProofType = proofTypes.find(
        (pt) => pt.type === formData.prooftype
      );

      setPreviewData({
        ...formData,
        images: action.payload.images || [],
        proofContent: selectedProofType?.content || 'No content available',
        whitelabel: matchedWhitelabel || null,
      });
      setView('preview');
    } catch (error) {
      console.error('Error submitting form:', error);
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
    setFiles([]);
  };

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

  const getPreviewHTML = () => {
    const sanitizedProofContent = DOMPurify.sanitize(previewData?.proofContent || 'No content available');
    const hexacode = previewData?.whitelabel?.hexacode || '#000000';
    const logoUrl = getImageUrl(previewData?.whitelabel?.logo);

    let proofContentHTML = sanitizedProofContent;
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
          <div class="proof-content conclusion">${conclusionText}</div>
          ${afterConclusion}
        `;
      } else {
        proofContentHTML = `
          ${beforeConclusion}
          <div class="proof-content conclusion">${conclusionAndAfter}</div>
        `;
      }
    } else {
      proofContentHTML = `<div class="proof-content">${proofContentHTML}</div>`;
    }

    const imagesHTML = previewData?.images?.length > 0
      ? previewData.images
          .map(
            (img) =>
              `<img src="${getImageUrl(img.path)}" alt="Client Image" style="max-width: 100px; margin: 5px;" />`
          )
          .join('')
      : '';

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
          .proof-content { background: #f5f5f5; padding: 8px; border-radius: 4px; font-size: 11px; font-weight: normal; }
          .proof-content.conclusion { border: 1px solid red; }
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
              <div><strong>User:</strong> ${previewData?.user || 'N/A'}</div>
              <div><strong>Amount:</strong> ${previewData?.amount || 'N/A'}</div>
              <div><strong>Event Name:</strong> ${previewData?.eventname || 'N/A'}</div>
              <div><strong>Navigation:</strong> ${previewData?.navigation || 'N/A'}</div>
              <div>
                ${proofContentHTML}
              </div>
              <div><strong>Sport:</strong> ${previewData?.sportname || 'N/A'}</div>
              <div><strong>Market:</strong> ${previewData?.marketname || 'N/A'}</div>
              <div><strong>Profit & Loss:</strong> ${previewData?.profitAndLoss || 'N/A'}</div>
              ${imagesHTML ? `<div><strong>Images:</strong><br>${imagesHTML}</div>` : ''}
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
      alert('Failed to download PDF. Please ensure the backend server is running at http://localhost:2030 and check the console for errors.');
    }
  };

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
            <th className="py-2 px-4 border-b">User</th>
            <th className="py-2 px-4 border-b">Amount</th>
            <th className="py-2 px-4 border-b">Proof Type</th>
            <th className="py-2 px-4 border-b">Sport</th>
            <th className="py-2 px-4 border-b">Market</th>
            <th className="py-2 px-4 border-b">Event Name</th>
            <th className="py-2 px-4 border-b">Navigation</th>
            <th className="py-2 px-4 border-b">Profit & Loss</th>
            <th className="py-2 px-4 border-b">Images</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client._id}>
              <td className="py-2 px-4 border-b">{client.agentname}</td>
              <td className="py-2 px-4 border-b">{client.username?.whitelabel_user || ''}</td>
              <td className="py-2 px-4 border-b">{client.user || ''}</td>
              <td className="py-2 px-4 border-b">{client.amount}</td>
              <td className="py-2 px-4 border-b">{client.prooftype?.type || ''}</td>
              <td className="py-2 px-4 border-b">{client.sportname?.sportsName || ''}</td>
              <td className="py-2 px-4 border-b">{client.marketname?.marketName || ''}</td>
              <td className="py-2 px-4 border-b">{client.eventname || ''}</td>
              <td className="py-2 px-4 border-b">{client.navigation || ''}</td>
              <td className="py-2 px-4 border-b">{client.profitAndLoss}</td>
              <td className="py-2 px-4 border-b">
                {client.images?.length > 0
                  ? client.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={getImageUrl(img.path)}
                        alt="Client Image"
                        className="inline-block w-12 h-12 object-cover mr-2"
                      />
                    ))
                  : 'None'}
              </td>
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
        <label className="block mb-1 font-semibold">User</label>
        <input
          type="text"
          name="user"
          value={formData.user}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Amount</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Proof Type</label>
        <select
          name="prooftype"
          value={formData.prooftype}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
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
        <label className="block mb-1 font-semibold">Event Name</label>
        <input
          type="text"
          name="eventname"
          value={formData.eventname}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Navigation</label>
        <input
          type="text"
          name="navigation"
          value={formData.navigation}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
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
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Images (Max 5, JPEG/PNG/GIF, 5MB each)</label>
        <input
          type="file"
          name="images"
          accept="image/jpeg,image/jpg,image/png,image/gif"
          multiple
          onChange={handleFileChange}
          className="w-full border px-3 py-2 rounded"
        />
        {files.length > 0 && (
          <div className="mt-2">
            <p>Selected files:</p>
            <ul>
              {files.map((file, idx) => (
                <li key={idx}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}
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

  const renderPreview = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white w-[540px] border rounded-lg shadow-xl" ref={previewRef}>
        <header
          className="flex items-center h-[88px]"
          style={{
            backgroundColor: previewData?.whitelabel?.hexacode || '#000000',
          }}
        >
          <img
            src={getImageUrl(previewData?.whitelabel?.logo)}
            alt="Whitelabel Logo"
            className="h-[70px] pl-[20px]"
            onError={(e) => (e.target.src = `${API_BASE_URL}${DEFAULT_PLACEHOLDER}`)}
          />
        </header>
        <main className="p-[20px_12px_10px]">
          <div className="space-y-[8px] font-bold text-[12px] leading-[1.5]">
            <div><strong>Agent Name:</strong> {previewData?.agentname || 'N/A'}</div>
            <div><strong>Username:</strong> {previewData?.username || 'N/A'}</div>
            <div><strong>User:</strong> {previewData?.user || 'N/A'}</div>
            <div><strong>Amount:</strong> {previewData?.amount || 'N/A'}</div>
            <div><strong>Event Name:</strong> {previewData?.eventname || 'N/A'}</div>
            <div><strong>Navigation:</strong> {previewData?.navigation || 'N/A'}</div>
            <div>
              <div className="p-[8px] bg-[#f5f5f5] rounded-[4px] border border-red-500 text-[11px] font-normal">
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
            {previewData?.images?.length > 0 && (
              <div>
                <strong>Images:</strong>
                <div className="flex flex-wrap gap-2 mt-2">
                  {previewData.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={getImageUrl(img.path)}
                      alt="Client Image"
                      className="w-24 h-24 object-cover"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="h-[100px]"></div>
        </main>
        <footer
          className="flex items-center h-[50px]"
          style={{
            backgroundColor: previewData?.whitelabel?.hexacode || '#000000',
          }}
        >
          <div className="flex justify-between w-full px-[20px]">
            <a
              href={previewData?.whitelabel?.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#fefce8] hover:text-blue-600 hover:underline text-[15px]"
            >
              {previewData?.whitelabel?.url || 'No URL available'}
            </a>
            <div className="text-[#fefce8] hover:text-blue-600 hover:underline text-[15px]">
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