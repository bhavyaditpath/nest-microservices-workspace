import { AppDataSource } from './data-source';
import { Branch } from '../branch/branch.entity';

async function seedBranches() {
  await AppDataSource.initialize();

  const branchRepository = AppDataSource.getRepository(Branch);

  const existingCount = await branchRepository.count();
  if (existingCount > 0) {
    console.log('Branches already exist, skipping seeding');
    await AppDataSource.destroy();
    return;
  }

  const branches = [
    { name: 'Main Branch', address: '123 Main St', phone: '1234567890' },
    { name: 'Downtown Branch', address: '456 Downtown Ave', phone: '0987654321' },
    { name: 'Suburb Branch', address: '789 Suburb Rd', phone: '1122334455' },
  ];

  for (const branchData of branches) {
    const branch = branchRepository.create(branchData);
    await branchRepository.save(branch);
  }

  console.log('Branches seeded successfully');
  await AppDataSource.destroy();
}

seedBranches().catch(console.error);