import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchReports,
  createReport,
  updateReport,
  deleteReport,
} from '../../redux/reportSlice';

const Report = () => {
  const dispatch = useDispatch();
  const { reports, loading, error } = useSelector((state) => state.reports);

  const [formData, setFormData] = useState({
    date: '',
    userName: '',
    agent: '',
    origin: '',
    sportName: '',
    eventName: '',
    marketName: '',
    acBalance: '',
    afterVoidBalance: '',
    pl: '',
    betDetails: [{ odds: '', stack: '', time: '' }],
    catchBy: '',
    remark1: '',
    remark2: '',
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    dispatch(fetchReports());
  }, [dispatch]);

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    if (name.startsWith('betDetails')) {
      const field = name.split('.')[2];
      const updatedBetDetails = [...formData.betDetails];
      updatedBetDetails[index] = { ...updatedBetDetails[index], [field]: value };
      setFormData({ ...formData, betDetails: updatedBetDetails });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addBetDetail = () => {
    setFormData({
      ...formData,
      betDetails: [...formData.betDetails, { odds: '', stack: '', time: '' }],
    });
  };

  const removeBetDetail = (index) => {
    setFormData({
      ...formData,
      betDetails: formData.betDetails.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const reportData = {
      ...formData,
      date: new Date(formData.date).toISOString(),
      acBalance: parseFloat(formData.acBalance),
      afterVoidBalance: parseFloat(formData.afterVoidBalance),
      pl: parseFloat(formData.pl),
      betDetails: formData.betDetails.map((detail) => ({
        odds: parseFloat(detail.odds),
        stack: parseFloat(detail.stack),
        time: detail.time,
      })),
    };

    if (editingId) {
      dispatch(updateReport({ id: editingId, data: reportData }));
      setEditingId(null);
    } else {
      dispatch(createReport(reportData));
    }
    setFormData({
      date: '',
      userName: '',
      agent: '',
      origin: '',
      sportName: '',
      eventName: '',
      marketName: '',
      acBalance: '',
      afterVoidBalance: '',
      pl: '',
      betDetails: [{ odds: '', stack: '', time: '' }],
      catchBy: '',
      remark1: '',
      remark2: '',
    });
  };

  const handleEdit = (report) => {
    setEditingId(report._id);
    setFormData({
      date: report.date.split('T')[0],
      userName: report.userName,
      agent: report.agent,
      origin: report.origin,
      sportName: report.sportName,
      eventName: report.eventName,
      marketName: report.marketName,
      acBalance: report.acBalance,
      afterVoidBalance: report.afterVoidBalance,
      pl: report.pl,
      betDetails: report.betDetails.map((detail) => ({
        odds: detail.odds,
        stack: detail.stack,
        time: detail.time,
      })),
      catchBy: report.catchBy,
      remark1: report.remark1 || '',
      remark2: report.remark2 || '',
    });
  };

  const handleDelete = (id) => {
    dispatch(deleteReport(id));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Report Management</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-100 rounded">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            placeholder="Date"
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            name="userName"
            value={formData.userName}
            onChange={handleInputChange}
            placeholder="User Name"
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            name="agent"
            value={formData.agent}
            onChange={handleInputChange}
            placeholder="Agent"
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            name="origin"
            value={formData.origin}
            onChange={handleInputChange}
            placeholder="Origin"
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            name="sportName"
            value={formData.sportName}
            onChange={handleInputChange}
            placeholder="Sport Name"
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            name="eventName"
            value={formData.eventName}
            onChange={handleInputChange}
            placeholder="Event Name"
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            name="marketName"
            value={formData.marketName}
            onChange={handleInputChange}
            placeholder="Market Name"
            className="p-2 border rounded"
            required
          />
          <input
            type="number"
            name="acBalance"
            value={formData.acBalance}
            onChange={handleInputChange}
            placeholder="Account Balance"
            className="p-2 border rounded"
            required
          />
          <input
            type="number"
            name="afterVoidBalance"
            value={formData.afterVoidBalance}
            onChange={handleInputChange}
            placeholder="After Void Balance"
            className="p-2 border rounded"
            required
          />
          <input
            type="number"
            name="pl"
            value={formData.pl}
            onChange={handleInputChange}
            placeholder="P&L"
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            name="catchBy"
            value={formData.catchBy}
            onChange={handleInputChange}
            placeholder="Catch By"
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            name="remark1"
            value={formData.remark1}
            onChange={handleInputChange}
            placeholder="Remark 1 (Optional)"
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="remark2"
            value={formData.remark2}
            onChange={handleInputChange}
            placeholder="Remark 2 (Optional)"
            className="p-2 border rounded"
          />
        </div>

        {/* Bet Details */}
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Bet Details</h2>
          {formData.betDetails.map((detail, index) => (
            <div key={index} className="flex gap-4 mb-2">
              <input
                type="number"
                name={`betDetails.${index}.odds`}
                value={detail.odds}
                onChange={(e) => handleInputChange(e, index)}
                placeholder="Odds"
                className="p-2 border rounded"
                required
              />
              <input
                type="number"
                name={`betDetails.${index}.stack`}
                value={detail.stack}
                onChange={(e) => handleInputChange(e, index)}
                placeholder="Stack"
                className="p-2 border rounded"
                required
              />
              <input
                type="text"
                name={`betDetails.${index}.time`}
                value={detail.time}
                onChange={(e) => handleInputChange(e, index)}
                placeholder="Time (e.g., 12:00 PM)"
                className="p-2 border rounded"
                required
              />
              {formData.betDetails.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeBetDetail(index)}
                  className="p-2 bg-red-500 text-white rounded"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addBetDetail}
            className="mt-2 p-2 bg-blue-500 text-white rounded"
          >
            Add Bet Detail
          </button>
        </div>

        <button
          type="submit"
          className="mt-4 p-2 bg-green-500 text-white rounded"
        >
          {editingId ? 'Update Report' : 'Create Report'}
        </button>
      </form>

      {/* Error Message */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Loading Indicator */}
      {loading && <p className="text-blue-500 mb-4">Loading...</p>}

      {/* Reports Table */}
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Date</th>
            <th className="border p-2">User Name</th>
            <th className="border p-2">Agent</th>
            <th className="border p-2">Origin</th>
            <th className="border p-2">Sport</th>
            <th className="border p-2">Event</th>
            <th className="border p-2">Market</th>
            <th className="border p-2">Balance</th>
            <th className="border p-2">Void Balance</th>
            <th className="border p-2">P&L</th>
            <th className="border p-2">Bet Details</th>
            <th className="border p-2">Catch By</th>
            <th className="border p-2">Remark 1</th>
            <th className="border p-2">Remark 2</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report._id}>
              <td className="border p-2">{new Date(report.date).toLocaleDateString()}</td>
              <td className="border p-2">{report.userName}</td>
              <td className="border p-2">{report.agent}</td>
              <td className="border p-2">{report.origin}</td>
              <td className="border p-2">{report.sportName}</td>
              <td className="border p-2">{report.eventName}</td>
              <td className="border p-2">{report.marketName}</td>
              <td className="border p-2">{report.acBalance}</td>
              <td className="border p-2">{report.afterVoidBalance}</td>
              <td className="border p-2">{report.pl}</td>
              <td className="border p-2">
                {report.betDetails.map((detail, index) => (
                  <div key={index}>
                    Odds: {detail.odds}, Stack: {detail.stack}, Time: {detail.time}
                  </div>
                ))}
              </td>
              <td className="border p-2">{report.catchBy}</td>
              <td className="border p-2">{report.remark1 || '-'}</td>
              <td className="border p-2">{report.remark2 || '-'}</td>
              <td className="border p-2">
                <button
                  onClick={() => handleEdit(report)}
                  className="mr-2 p-1 bg-yellow-500 text-white rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(report._id)}
                  className="p-1 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Report;

// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   fetchReports,
//   createReport,
//   updateReport,
//   deleteReport,
// } from '../../redux/reportSlice';

// const Report = () => {
//   const dispatch = useDispatch();
//   const { reports, loading, error } = useSelector((state) => state.reports);

//   const [formData, setFormData] = useState({
//     date: '',
//     userName: '',
//     agent: '',
//     origin: '',
//     sportName: '',
//     eventName: '',
//     marketName: '',
//     acBalance: '',
//     afterVoidBalance: '',
//     pl: '',
//     betDetails: [{ odds: '', stack: '', time: '' }],
//     catchBy: '',
//     remark1: '',
//     remark2: '',
//   });
//   const [editingId, setEditingId] = useState(null);

//   useEffect(() => {
//     dispatch(fetchReports());
//   }, [dispatch]);

//   const handleInputChange = (e, index) => {
//     const { name, value } = e.target;
//     if (name.startsWith('betDetails')) {
//       const field = name.split('.')[2];
//       const updatedBetDetails = [...formData.betDetails];
//       updatedBetDetails[index] = { ...updatedBetDetails[index], [field]: value };
//       setFormData({ ...formData, betDetails: updatedBetDetails });
//     } else {
//       setFormData({ ...formData, [name]: value });
//     }
//   };

//   const addBetDetail = () => {
//     setFormData({
//       ...formData,
//       betDetails: [...formData.betDetails, { odds: '', stack: '', time: '' }],
//     });
//   };

//   const removeBetDetail = (index) => {
//     setFormData({
//       ...formData,
//       betDetails: formData.betDetails.filter((_, i) => i !== index),
//     });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const reportData = {
//       ...formData,
//       date: new Date(formData.date).toISOString(),
//       acBalance: parseFloat(formData.acBalance),
//       afterVoidBalance: parseFloat(formData.afterVoidBalance),
//       pl: parseFloat(formData.pl),
//       betDetails: formData.betDetails.map((detail) => ({
//         odds: parseFloat(detail.odds),
//         stack: parseFloat(detail.stack),
//         time: detail.time,
//       })),
//     };

//     if (editingId) {
//       dispatch(updateReport({ id: editingId, data: reportData }));
//       setEditingId(null);
//     } else {
//       dispatch(createReport(reportData));
//     }
//     setFormData({
//       date: '',
//       userName: '',
//       agent: '',
//       origin: '',
//       sportName: '',
//       eventName: '',
//       marketName: '',
//       acBalance: '',
//       afterVoidBalance: '',
//       pl: '',
//       betDetails: [{ odds: '', stack: '', time: '' }],
//       catchBy: '',
//       remark1: '',
//       remark2: '',
//     });
//   };

//   const handleEdit = (report) => {
//     setEditingId(report._id);
//     setFormData({
//       date: report.date.split('T')[0],
//       userName: report.userName,
//       agent: report.agent,
//       origin: report.origin,
//       sportName: report.sportName,
//       eventName: report.eventName,
//       marketName: report.marketName,
//       acBalance: report.acBalance,
//       afterVoidBalance: report.afterVoidBalance,
//       pl: report.pl,
//       betDetails: report.betDetails.map((detail) => ({
//         odds: detail.odds,
//         stack: detail.stack,
//         time: detail.time,
//       })),
//       catchBy: report.catchBy,
//       remark1: report.remark1 || '',
//       remark2: report.remark2 || '',
//     });
//   };

//   const handleDelete = (id) => {
//     dispatch(deleteReport(id));
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">Report Management</h1>

//       {/* Form */}
//       <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-100 rounded">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <input
//             type="date"
//             name="date"
//             value={formData.date}
//             onChange={handleInputChange}
//             placeholder="Date"
//             className="p-2 border rounded"
//             required
//           />
//           <input
//             type="text"
//             name="userName"
//             value={formData.userName}
//             onChange={handleInputChange}
//             placeholder="User Name"
//             className="p-2 border rounded"
//             required
//           />
//           <input
//             type="text"
//             name="agent"
//             value={formData.agent}
//             onChange={handleInputChange}
//             placeholder="Agent"
//             className="p-2 border rounded"
//             required
//           />
//           <input
//             type="text"
//             name="origin"
//             value={formData.origin}
//             onChange={handleInputChange}
//             placeholder="Origin"
//             className="p-2 border rounded"
//             required
//           />
//           <input
//             type="text"
//             name="sportName"
//             value={formData.sportName}
//             onChange={handleInputChange}
//             placeholder="Sport Name"
//             className="p-2 border rounded"
//             required
//           />
//           <input
//             type="text"
//             name="eventName"
//             value={formData.eventName}
//             onChange={handleInputChange}
//             placeholder="Event Name"
//             className="p-2 border rounded"
//             required
//           />
//           <input
//             type="text"
//             name="marketName"
//             value={formData.marketName}
//             onChange={handleInputChange}
//             placeholder="Market Name"
//             className="p-2 border rounded"
//             required
//           />
//           <input
//             type="number"
//             name="acBalance"
//             value={formData.acBalance}
//             onChange={handleInputChange}
//             placeholder="Account Balance"
//             className="p-2 border rounded"
//             required
//           />
//           <input
//             type="number"
//             name="afterVoidBalance"
//             value={formData.afterVoidBalance}
//             onChange={handleInputChange}
//             placeholder="After Void Balance"
//             className="p-2 border rounded"
//             required
//           />
//           <input
//             type="number"
//             name="pl"
//             value={formData.pl}
//             onChange={handleInputChange}
//             placeholder="P&L"
//             className="p-2 border rounded"
//             required
//           />
//           <input
//             type="text"
//             name="catchBy"
//             value={formData.catchBy}
//             onChange={handleInputChange}
//             placeholder="Catch By"
//             className="p-2 border rounded"
//             required
//           />
//           <input
//             type="text"
//             name="remark1"
//             value={formData.remark1}
//             onChange={handleInputChange}
//             placeholder="Remark 1 (Optional)"
//             className="p-2 border rounded"
//           />
//           <input
//             type="text"
//             name="remark2"
//             value={formData.remark2}
//             onChange={handleInputChange}
//             placeholder="Remark 2 (Optional)"
//             className="p-2 border rounded"
//           />
//         </div>

//         {/* Bet Details */}
//         <div className="mt-4">
//           <h2 className="text-lg font-semibold">Bet Details (Required)</h2>
//           {formData.betDetails.map((detail, index) => (
//             <div key={index} className="flex gap-4 mb-2">
//               <input
//                 type="number"
//                 name={`betDetails.${index}.odds`}
//                 value={detail.odds}
//                 onChange={(e) => handleInputChange(e, index)}
//                 placeholder="Odds"
//                 className="p-2 border rounded"
//                 min="0"
//               />
//               <input
//                 type="number"
//                 name={`betDetails.${index}.stack`}
//                 value={detail.stack}
//                 onChange={(e) => handleInputChange(e, index)}
//                 placeholder="Stack"
//                 className="p-2 border rounded"
//                 min="0"
//               />
//               <input
//                 type="text"
//                 name={`betDetails.${index}.time`}
//                 value={detail.time}
//                 onChange={(e) => handleInputChange(e, index)}
//                 placeholder="Time (e.g., 12:00 PM)"
//                 className="p-2 border rounded"
//                 required
//               />
//               {formData.betDetails.length > 1 && (
//                 <button
//                   type="button"
//                   onClick={() => removeBetDetail(index)}
//                   className="p-2 bg-red-500 text-white rounded"
//                 >
//                   Remove
//                 </button>
//               )}
//             </div>
//           ))}
//           <button
//             type="button"
//             onClick={addBetDetail}
//             className="mt-2 p-2 bg-blue-500 text-white rounded"
//           >
//             Add Bet Detail
//           </button>
//         </div>

//         <button
//           type="submit"
//           className="mt-4 p-2 bg-green-500 text-white rounded"
//         >
//           {editingId ? 'Update Report' : 'Create Report'}
//         </button>
//       </form>

//       {/* Error Message */}
//       {error && <p className="text-red-500 mb-4">{error}</p>}

//       {/* Loading Indicator */}
//       {loading && <p className="text-blue-500 mb-4">Loading...</p>}

//       {/* Reports Table */}
//       <table className="w-full border-collapse border">
//         <thead>
//           <tr className="bg-gray-200">
//             <th className="border p-2">Date</th>
//             <th className="border p-2">User Name</th>
//             <th className="border p-2">Agent</th>
//             <th className="border p-2">Origin</th>
//             <th className="border p-2">Sport</th>
//             <th className="border p-2">Event</th>
//             <th className="border p-2">Market</th>
//             <th className="border p-2">Balance</th>
//             <th className="border p-2">Void Balance</th>
//             <th className="border p-2">P&L</th>
//             <th className="border p-2">Odds</th>
//             <th className="border p-2">Stack</th>
//             <th className="border p-2">Time</th>
//             <th className="border p-2">Catch By</th>
//             <th className="border p-2">Remark 1</th>
//             <th className="border p-2">Remark 2</th>
//             <th className="border p-2">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {reports.map((report) =>
//             report.betDetails.map((detail, index) => (
//               <tr key={`${report._id}-${index}`}>
//                 {index === 0 && (
//                   <>
//                     <td className="border p-2" rowSpan={report.betDetails.length}>
//                       {new Date(report.date).toLocaleDateString()}
//                     </td>
//                     <td className="border p-2" rowSpan={report.betDetails.length}>
//                       {report.userName}
//                     </td>
//                     <td className="border p-2" rowSpan={report.betDetails.length}>
//                       {report.agent}
//                     </td>
//                     <td className="border p-2" rowSpan={report.betDetails.length}>
//                       {report.origin}
//                     </td>
//                     <td className="border p-2" rowSpan={report.betDetails.length}>
//                       {report.sportName}
//                     </td>
//                     <td className="border p-2" rowSpan={report.betDetails.length}>
//                       {report.eventName}
//                     </td>
//                     <td className="border p-2" rowSpan={report.betDetails.length}>
//                       {report.marketName}
//                     </td>
//                     <td className="border p-2" rowSpan={report.betDetails.length}>
//                       {report.acBalance}
//                     </td>
//                     <td className="border p-2" rowSpan={report.betDetails.length}>
//                       {report.afterVoidBalance}
//                     </td>
//                     <td className="border p-2" rowSpan={report.betDetails.length}>
//                       {report.pl}
//                     </td>
//                   </>
//                 )}
//                 <td className="border p-2">{detail.odds}</td>
//                 <td className="border p-2">{detail.stack}</td>
//                 <td className="border p-2">{detail.time}</td>
//                 {index === 0 && (
//                   <>
//                     <td className="border p-2" rowSpan={report.betDetails.length}>
//                       {report.catchBy}
//                     </td>
//                     <td className="border p-2" rowSpan={report.betDetails.length}>
//                       {report.remark1 || '-'}
//                     </td>
//                     <td className="border p-2" rowSpan={report.betDetails.length}>
//                       {report.remark2 || '-'}
//                     </td>
//                     <td className="border p-2" rowSpan={report.betDetails.length}>
//                       <button
//                         onClick={() => handleEdit(report)}
//                         className="mr-2 p-1 bg-yellow-500 text-white rounded"
//                       >
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => handleDelete(report._id)}
//                         className="p-1 bg-red-500 text-white rounded"
//                       >
//                         Delete
//                       </button>
//                     </td>
//                   </>
//                 )}
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default Report;