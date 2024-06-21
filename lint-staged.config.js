module.exports = {
  'src/**/*.{ts,tsx}': () => 'pnpm run typecheck',
  'src/**/*.{js,jsx,ts,tsx}': ['eslint --fix'],
};
