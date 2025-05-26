import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  permissions: [{ type: String }], // e.g., ['create_admin', 'update_admin', 'delete_admin']
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Role', roleSchema);