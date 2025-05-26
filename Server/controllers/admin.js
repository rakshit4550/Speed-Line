import Admin from '../models/Admin.js';
import Role from '../models/Role.js';
import bcrypt from 'bcryptjs';

export const createUser = async (req, res) => {
  const { fullName, email, password, confirmPassword, role } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    const existingUser = await Admin.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    const roleExists = await Role.findById(role);
    if (!roleExists) return res.status(400).json({ message: 'Invalid role' });

    const user = new Admin({ fullName, email, password, role });
    await user.save();
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { fullName, email, password, role } = req.body;

  try {
    const user = await Admin.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (email && email !== user.email) {
      const existingUser = await Admin.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'Email already exists' });
    }

    if (role) {
      const roleExists = await Role.findById(role);
      if (!roleExists) return res.status(400).json({ message: 'Invalid role' });
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.role = role || user.role;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();
    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await Admin.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await Admin.find().populate('role', 'name permissions');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};