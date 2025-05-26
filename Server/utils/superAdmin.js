import Role from '../models/Role.js';
import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';

export const initializeSuperAdmin = async () => {
  try {
    let superAdminRole = await Role.findOne({ name: 'superadmin' });
    if (!superAdminRole) {
      superAdminRole = new Role({
        name: 'superadmin',
        permissions: [
          'create_admin',
          'update_admin',
          'delete_admin',
          'create_subadmin',
          'update_subadmin',
          'delete_subadmin',
          'create_role',
          'update_role',
          'delete_role',
          'view_users',
        ],
      });
      await superAdminRole.save();
      console.log('Superadmin role created');
    }

    const superAdminEmail = 'superadmin@example.com';
    const superAdminPassword = 'SuperAdmin123!';
    let superAdminUser = await Admin.findOne({ email: superAdminEmail });
    if (!superAdminUser) {
      superAdminUser = new Admin({
        fullName: 'Super Admin',
        email: superAdminEmail,
        password: superAdminPassword,
        role: superAdminRole._id,
      });
      await superAdminUser.save();
      console.log('Superadmin Created');
    }
  } catch (error) {
    console.error('Error initializing superadmin:', error.message);
  }
};