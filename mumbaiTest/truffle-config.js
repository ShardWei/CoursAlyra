const path = require("path");
const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

module.exports = {

  networks: {
    development: {
     host: "127.0.0.1",
     port: 8545,
     network_id: "*",
    },

    mumbai: {
      provider: function() {return new HDWalletProvider({mnemonic:{phrase:`${process.env.MNEMONIC}`},providerOrUrl:`https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_ID}`})},
      network_id: 80001,
    }
    
  },
  
  mocha: {
  },
  
  // Ajouter cette partie (ou décommenter directement dans le fichier):
  compilers: {
    solc: {
      version: "0.8.12", // Récupérer la version exacte de solc-bin (par défaut : la  version de truffle)
      settings: {  // Voir les documents de solidity pour des conseils sur l'optimisation et l'evmVersion
        optimizer: {
        enabled: false,
        runs: 200
        },
      }
    },
  },
 }; 