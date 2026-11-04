/** @type {import('next').NextConfig} */
const nextConfig = {
  // `node:sqlite` is a Node builtin that predates this Next version's builtin
  // list, so it has to be kept out of the bundle and required at runtime.
  webpack(config, { isServer }) {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({ 'node:sqlite': 'commonjs node:sqlite' });
    }
    return config;
  },
};

module.exports = nextConfig;
