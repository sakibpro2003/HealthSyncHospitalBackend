// import bcrypt from 'bcrypt';
// import config from '../../../../../../Course/PH/L2/SignatureMart/NextMart-Server/src/app/config';
// import { UserRole } from '../../../../../../Course/PH/L2/SignatureMart/NextMart-Server/src/app/modules/user/user.interface';
// import User from '../../../../../../Course/PH/L2/SignatureMart/NextMart-Server/src/app/modules/user/user.model';

import { UserRole } from "../modules/user/user.interface";

const adminUser = {
    email: 'admin@ph.com',
    password: "admin123",
    name: 'Admin',
    role: UserRole.ADMIN,
    clientInfo: {
        device: 'pc',
        browser: 'Unknown',
        ipAddress: '127.0.0.1',
        pcName: 'localhost',
        os: 'Unknown',
        userAgent: 'Seed Script',
    }
};

const seedAdmin = async () => {
    try {
        // Check if an admin already exists
        const isAdminExist = await User.findOne({ role: UserRole.ADMIN });

        if (!isAdminExist) {
            await User.create(adminUser);

            console.log('Admin user created successfully.');
        } else {
            console.log('Admin user already exists.');
        }
    } catch (error) {
        console.error('Error seeding admin user:', error);
    }
};

export default seedAdmin;
