require('@nomicfoundation/hardhat-ethers');
require('dotenv').config();
require('@nomicfoundation/hardhat-chai-matchers');
require('@nomicfoundation/hardhat-verify');

module.exports = {
  solidity: {
    version: '0.8.28',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  gasReporter: {
    currency: 'USD',
    // coinmarketcap: process.env.COINMARKETCAP,
    gasPriceApi: 'https://api.etherscan.io/api?module=proxy&action=eth_gasPrice',
    gasPrice: 40,
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
    },
    holesky: {
      url: process.env.HOLESKY_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY, process.env.TOKEN_DEPLOYER],
    },
    mainnet: {
      url: process.env.MAINNET_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY, process.env.TOKEN_DEPLOYER],
    },
    arbitrumOne: {
      url: process.env.ARBITRUM_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY, process.env.TOKEN_DEPLOYER],
    },
    polygon: {
      url: process.env.POLYGON_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY, process.env.TOKEN_DEPLOYER],
      gasPrice: 130000000000,
    },
    bsc: {
      url: process.env.BSC_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY, process.env.TOKEN_DEPLOYER],
    },
    optimisticEthereum: {
      url: process.env.OPTIMISM_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY, process.env.TOKEN_DEPLOYER],
    },
    base: {
      url: process.env.BASE_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY, process.env.TOKEN_DEPLOYER],
      gasPrice: 2000000000,
    },
    linea: {
      url: process.env.LINEA_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY, process.env.TOKEN_DEPLOYER],
    },
    mode: {
      url: process.env.MODE_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY, process.env.TOKEN_DEPLOYER],
    },
    zora: {
      url: process.env.ZORA_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY, process.env.TOKEN_DEPLOYER],
    },
    iota: {
      url: process.env.IOTA_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY, process.env.TOKEN_DEPLOYER],
    },
    mantle: {
      url: process.env.MANTLE_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY, process.env.TOKEN_DEPLOYER],
    },
    fevm: {
      url: process.env.FEVM_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY, process.env.TOKEN_DEPLOYER],
    },
    fevmTestnet: {
      url: process.env.FEVM_TESTNET_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY, process.env.TOKEN_DEPLOYER],
    },
    peaq: {
      url: process.env.PEAQ_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY, process.env.TOKEN_DEPLOYER],
    },
    immutable: {
      url: process.env.IMMUTABLE_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY, process.env.TOKEN_DEPLOYER],
    },
    immutableTestnet: {
      url: process.env.IMMUTABLE_TESTNET_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
    },
  },
  etherscan: {
    customChains: [
      {
        network: 'base',
        chainId: 8453,
        urls: {
          apiURL: 'https://api.basescan.org/api',
          browserURL: 'https://basescan.org/',
        },
      },
      {
        network: 'linea',
        chainId: 59144,
        urls: {
          apiURL: 'https://api.lineascan.build/api',
          browserURL: 'https://lineascan.build/',
        },
      },
      {
        network: 'mode',
        chainId: 34443,
        urls: {
          apiURL: 'https://explorer.mode.network/api',
          browserURL: 'https://explorer.mode.network/',
        },
      },
      {
        network: 'zora',
        chainId: 7777777,
        urls: {
          apiURL: 'https://explorer.zora.energy/api',
          browserURL: 'https://explorer.zora.energy',
        },
      },
      {
        network: 'iota',
        chainId: 8822,
        urls: {
          apiURL: 'https://explorer.evm.iota.org/api',
          browserURL: 'https://explorer.evm.iota.org/',
        },
      },
      {
        network: 'mantle',
        chainId: 5000,
        urls: {
          apiURL: 'https://explorer.mantle.xyz/api',
          browserURL: 'https://explorer.mantle.xyz/',
        },
      },
      {
        network: 'fevm',
        chainId: 314,
        urls: {
          apiURL: 'https://filecoin.blockscout.com/api',
          browserURL: 'https://filecoin.blockscout.com/',
        },
      },
      {
        network: 'holesky',
        chainId: 17000,
        urls: {
          apiURL: 'https://api-holesky.etherscan.io/api',
          browserURL: 'https://holesky.etherscan.io/',
        },
      },
      {
        network: 'peaq',
        chainId: 3338,
        urls: {
          apiURL: 'https://peaq.api.subscan.io',
          browserURL: 'https://peaq.subscan.io/',
        },
      },
      {
        immutable: 'immutable',
        chainId: 13371,
        urls: {
          apiURL: 'https://explorer.immutable.com/api',
          browserURL: 'https://explorer.immutable.com/',
        },
      },
      {
        testnet: 'immutableTestnet',
        chainId: 13473,
        urls: {
          apiURL: 'https://explorer.testnet.immutable.com/api',
          browserURL: 'https://explorer.testnet.immutable.com',
        },
        apiKey: 'hedgeyfucks'
      },
    ],
    apiKey: {
      sepolia: process.env.ETHERSCAN_APIKEY,
      holesky: process.env.ETHERSCAN_APIKEY,
      mainnet: process.env.ETHERSCAN_APIKEY,
      arbitrumOne: process.env.ARBITRUM_APIKEY,
      polygon: process.env.POLYGON_APIKEY,
      bsc: process.env.BSC_APIKEY,
      optimisticEthereum: process.env.OPTIMISM_APIKEY,
      base: process.env.BASE_APIKEY,
      linea: process.env.LINEA_APIKEY,
      mode: process.env.MODE_APIKEY,
      zora: process.env.ZORA_APIKEY,
      iota: process.env.IOTA_APIKEY,
      mantle: process.env.MANTLE_APIKEY,
      fevm: process.env.FEVM_APIKEY,
      peaq: process.env.PEAQ_APIKEY,
      immutable: process.env.IMMUTABLE_APIKEY,
      immutableTestnet: 'hedgeyfucks',
    },
  },
};
