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


// Написать таски на transfer, transferFrom, approve

// Пример  npx hardhat transfer --contract 0xEFDB0b230c136b567bD7B4a5448875B3a68f47Aa --transferto 0xd506c6DF60cb274969af9c42472dd53975d1e20D --value 5555 --network rinkeby
// npx hardhat transfer --contract <..> --transferto <..> --value <..> --network rinkeby
task("transfer", "Transfer tokens MEGA(ERC20)")
  .addParam("contract", "address of deployed contract")
  .addParam("transferto", "address where we want to send tokens")
  .addParam("value", "amount token to transfer")
  .setAction(async (taskArgs, hre) => {
    const erc20 = await hre.ethers.getContractAt("ERC20", taskArgs.contract)
    await erc20.transfer(taskArgs.transferto, taskArgs.value)
    console.log("balance of " + taskArgs.transferto + " now is " + (await erc20.balanceOf(taskArgs.transferto)).toString());
  })

//npx hardhat approve --contract 0xEFDB0b230c136b567bD7B4a5448875B3a68f47Aa --approveto 0xd506c6DF60cb274969af9c42472dd53975d1e20D --value 777 --network rinkeby
task("approve", "approve tokens transfer for another person")
  .addParam("contract", "address of deployed contract")
  .addParam("approveto", "address which we want to approve")
  .addParam("value", "amount token to transfer")
  .setAction(async (taskArgs, hre) => {
    const erc20 = await hre.ethers.getContractAt("ERC20", taskArgs.contract)
    await erc20.approve(taskArgs.approveto, taskArgs.value)
    const [owner] = await hre.ethers.getSigners();
    console.log("allowance for " + taskArgs.approveto + " now is " + (await erc20.allowance(owner.address,taskArgs.approveto)).toString());
  })







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

