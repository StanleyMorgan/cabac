// FIX: This file caused a module resolution conflict with the 'wagmi' package
// due to its name. It is now acting as a proxy, re-exporting all exports
// from the actual 'wagmi' package to resolve the import errors. The project's
// wagmi configuration is located in `providers.tsx`.
export * from 'wagmi';
