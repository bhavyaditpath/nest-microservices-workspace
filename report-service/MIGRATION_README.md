# Branch Service Migrations

This service uses TypeORM migrations for database schema management.

## Setup

The migration configuration is already set up in:
- `src/database/data-source.ts` - TypeORM data source configuration
- `package.json` - Migration scripts added
- `src/database/migrations/` - Directory for migration files

## Available Commands

```bash
# Generate migration from entity changes
npm run typeorm:generate-migration -- -n CreateBranchesTable

# Run pending migrations
npm run typeorm:run-migrations

# Show migration status
npm run typeorm:show-migrations

# Revert last migration
npm run typeorm:revert-migration
```

## Database Structure

```
src/database/
├── data-source.ts          # TypeORM data source configuration
├── index.ts               # Database exports
└── migrations/            # Migration files directory
```

## Migration Files

Migration files will be created in `src/database/migrations/` directory with timestamp prefixes.

Example migration file structure:
```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBranchesTable1700000000000 implements MigrationInterface {
  name = 'CreateBranchesTable1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Migration logic here
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback logic here
  }
}
```

## Entities

The data source includes:
- `Branch` - Branch entity with name, address, phone fields

Note: This service manages the `branches` table for branch management across the microservices architecture.