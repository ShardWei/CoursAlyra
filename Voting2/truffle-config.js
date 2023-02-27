const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

module.exports = {

  networks: {
    development: {
     host: "127.0.0.1",
     port: 8545,
     network_id: "*",
    },

    goerli: {
      provider: function() {return new HDWalletProvider({MNEMONIC:{phrase:`${process.env.MNEMONIC}`},providerOrUrl:`https://goerli.infura.io/v3/${process.env.INFURA_ID}`})},
      network_id: 5,
    },
    
  },
  
  mocha: {
    reporter: 'eth-gas-reporter',
    reporterOptions: {
      gasPrice:1,
      token: 'ETH',
      showTimeSpent: false
    }
  },
  
  // Ajouter cette partie (ou décommenter directement dans le fichier):
  compilers: {
    solc: {
      version: "0.8.18", // Récupérer la version exacte de solc-bin (par défaut : la  version de truffle)

    },
      
  },
}; 