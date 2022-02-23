/**
 * @type import('hardhat/config').HardhatUserConfig
 */
// для подтягивания конфигурации process.env......
require("dotenv").config();

require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
//верификация контракта
require("@nomiclabs/hardhat-etherscan");

// проверка покрытия
require("solidity-coverage");

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.0",
      },
      {
        version: "0.8.1",
        settings: {},
      },
    ],
  },
  networks: {
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.RINKEBY_PRIVATE_KEY]
    }
  },
  etherscan: {
    // Ваш ключ API для Etherscan 
    // Получите его на https://etherscan.io/ 
    apiKey: `${process.env.ETHERSCAN_KEY}`
  }
};