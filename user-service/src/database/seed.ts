import { AppDataSource } from './data-source';
import { User } from '../user/user.entity';
import { UserRole } from '../common/enums/role.enum';
import * as bcrypt from 'bcrypt';

async function seedUsers() {
  await AppDataSource.initialize();

  const userRepository = AppDataSource.getRepository(User);

  const existingCount = await userRepository.count();
  if (existingCount > 0) {
    console.log('Users already exist, skipping seeding');
    await AppDataSource.destroy();
    return;
  }

  const users = [
    {
      username: 'admin@example.com',
      password: await bcrypt.hash('admin123', 10),
      role: UserRole.ADMIN,
      branchId: 1,
      isEmailVerified: true,
    },
    {
      username: 'admin12@yopmail.com',
      password: await bcrypt.hash('admin123', 10),
      role: UserRole.ADMIN,
      branchId: 1,
      isEmailVerified: true,
    },
    {
      username: 'branch1@example.com',
      password: await bcrypt.hash('branch123', 10),
      role: UserRole.BRANCH,
      branchId: 1,
      isEmailVerified: true,
    },
    {
      username: 'branch2@example.com',
      password: await bcrypt.hash('branch123', 10),
      role: UserRole.BRANCH,
      branchId: 2,
      isEmailVerified: true,
    },
  ];

  for (const userData of users) {
    const user = userRepository.create(userData);
    await userRepository.save(user);
  }

  console.log('Users seeded successfully');
  await AppDataSource.destroy();
}

seedUsers().catch(console.error);