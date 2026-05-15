import '@testing-library/jest-dom/vitest';

// Set up Firebase emulator connection for tests
process.env.NEXT_PUBLIC_USE_EMULATOR = 'true';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';
