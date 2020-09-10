module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "666",
      gasPrice: 100e9,
    },
    test: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "666",
      gasPrice: 100e9,
    },
  },
  compilers: {
    solc: {
      version: "0.5.17",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
};
