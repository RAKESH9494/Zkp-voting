require("@nomicfoundation/hardhat-toolbox");
// require("@nomiclabs/hardhat-ethers");
require("dotenv").config();
// "https://eth-holesky.g.alchemy.com/v2/QNj1XeAlm9EIC5nQ0gO28jmY4FoNSg_p"

const { API_URL, PRIVATE_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  defaultNetwork: "sepolia",
  networks: {
    sepolia: {
      url: API_URL,
      accounts: [`0x${PRIVATE_KEY}`]
    }
  },
};

// verifier: 0x72E1f4B4fA5B2acc6f0658d7196B4a6e6d5e11e7

//Voting :0xcB14D82298Bf3c63d1216743b94FCA3281245D9d