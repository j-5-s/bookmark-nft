//@ts-check
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require("@nx/next");
const hostname = process.env.NEXT_PUBLIC_IPFS_HOST || "ipfs.io";
/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias["@j5s/contracts/bytecode"] = path.resolve(
      __dirname,
      "libs/contracts/bytecode.ts"
    );

    return config;
  },
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: "https",
  //       hostname,
  //       port: "",
  //       pathname: "/ipfs/**",
  //     },
  //   ],
  // },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
