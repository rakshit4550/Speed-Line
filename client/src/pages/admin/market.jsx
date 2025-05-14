import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMarkets, addMarket, updateMarket, deleteMarket } from '../../redux/market/marketSlice';

// List all markets
export const MarketList = () => {
  const dispatch = useDispatch();
  const { markets, loading, error } = useSelector(state => state.markets);

  useEffect(() => {
    dispatch(fetchMarkets());
  }, [dispatch]);

  if (loading) return <p>Loading markets...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <ul>
      {markets.map(market => (
        <li key={market._id}>{market.marketName}</li>
      ))}
    </ul>
  );
};

// Add a new market
export const AddMarketForm = () => {
  const [marketName, setMarketName] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (marketName.trim()) {
      dispatch(addMarket(marketName));
      setMarketName('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={marketName}
        onChange={(e) => setMarketName(e.target.value)}
        placeholder="Enter market name"
        required
      />
      <button type="submit">Add Market</button>
    </form>
  );
};

// Update a market
export const UpdateMarketForm = ({ market }) => {
  const [marketName, setMarketName] = useState(market.marketName);
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (marketName.trim()) {
      dispatch(updateMarket({ id: market._id, marketName }));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={marketName}
        onChange={(e) => setMarketName(e.target.value)}
        required
      />
      <button type="submit">Update Market</button>
    </form>
  );
};

// Delete a market
export const DeleteMarketButton = ({ id }) => {
  const dispatch = useDispatch();

  const handleDelete = () => {
    dispatch(deleteMarket(id));
  };

  return <button onClick={handleDelete}>Delete Market</button>;
};
