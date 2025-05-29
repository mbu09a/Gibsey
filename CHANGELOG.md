# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - Security & Data Integrity

### Added
- **Authentication System**: Implemented JWT-based authentication with argon2id password hashing
  - Added `users` table with email/password authentication
  - Created `/auth/register` and `/auth/login` endpoints
  - Updated auth middleware to validate Bearer tokens
  - Protected endpoints now require authentication

- **Database Integrity**: Added proper constraints and indexes
  - Added foreign key constraints to vault_entries, qdpi_moves, and page_notes
  - Added CHECK constraints for enum fields
  - Created indexes on frequently queried columns (user_id, created_at, etc.)
  - Fixed schema mismatches between TypeScript and SQL definitions

- **Error Handling**: Added ErrorBoundary component to frontend
  - Graceful error handling with user-friendly messages
  - Automatic error logging to console

- **Testing**: Added minimal smoke tests
  - Authentication tests for password hashing and JWT tokens
  - Test infrastructure with Vitest

### Changed
- Replaced hardcoded user IDs with authenticated user context
- Updated vulnerable dependencies (Hono 3.x → 4.6.5)
- External service URLs now configurable via environment variables

### Fixed
- Security vulnerabilities in esbuild and Hono dependencies
- Missing columns in qdpi_moves table definition
- Type mismatches between schema and migrations

### Security
- Removed all hardcoded placeholder values (temp-user-id, etc.)
- Added password hashing with argon2id
- Implemented proper JWT token validation
- Added CSRF protection through updated Hono version