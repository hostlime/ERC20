const { ethers } = require("hardhat");
const { expect, assert } = require("chai");
//use default BigNumber
var chai = require('chai');
chai.use(require('chai-bignumber')());
//use custom BigNumber
//chai.use(require('chai-bignumber')(BigNumber));


describe("Checking ERC20 functions", function () {
    let ico;
    const mount = 55;
    // создаём экземпляры контракта
    beforeEach(async () => {
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        const ICO = await ethers.getContractFactory("TokenSale");
        ico = await ICO.deploy();
        await ico.deployed();
    });

    // view функции
    it("Checking functions - symbol(), decimals(), name(), totalSupply()", async function () {
        const name = "MegaToken";
        const symbol = "MEGA";
        const decimals = 18;
        //const totalSupply = 10000 * (10 ** decimals);
        const totalSupply =
            ethers.BigNumber.from(ethers.utils.parseEther("10000"));
        expect(await ico.totalSupply()).to.equal(totalSupply);

        // name()
        expect(await ico.name()).to.equal(name);
        // symbol()
        expect(await ico.symbol()).to.equal(symbol);
        // decimals()
        expect(await ico.decimals()).to.equal(decimals);
        // totalSupply()
        const ownerBalance = await ico.balanceOf(owner.address);
        expect(await ico.totalSupply()).to.equal(ownerBalance);
    });

    it("Checking function mint()", async function () {

        // Проверяем что баланс 0
        expect(await ico.balanceOf(addr1.address)).to.equal(0);
        // Только овнер может минтить токены
        await expect(ico.connect(addr1).mint(ethers.constants.AddressZero, mount))
            .to.be.revertedWith("Only owner can mint new tokens")

        // проверяем require(_user != address(0), "_user has the zero address");
        await expect(ico.connect(owner).mint(ethers.constants.AddressZero, mount))
            .to.be.revertedWith("_user has the zero address")

        // Овнер минтит адресу addr1 mount токенов
        const tx = await ico.mint(addr1.address, mount);
        // event Transfer
        //console.log(tx);
        expect(tx).to.emit(ico, "Transfer")
            .withArgs(ethers.constants.AddressZero, addr1.address, mount)

        expect(await ico.balanceOf(addr1.address)).to.equal(mount);
    });
    it("Checking function balanceOf()", async function () {
        expect(await ico.balanceOf(addr1.address)).to.equal(0);
        expect(await ico.balanceOf(addr2.address)).to.equal(0);

        const amountAddr1 = 55;
        const amountAddr2 = 65;

        await ico.mint(addr1.address, amountAddr1);
        await ico.mint(addr2.address, amountAddr2);

        expect(await ico.balanceOf(addr1.address)).to.equal(amountAddr1);
        expect(await ico.balanceOf(addr2.address)).to.equal(amountAddr2);
    });
    it("Checking function transfer()", async function () {
        const amountAddr1 = 55;
        const amountAddr2 = 23;

        // проверяем require(_to != address(0), "_to the zero address");
        await expect(ico.connect(addr1).transfer(ethers.constants.AddressZero, amountAddr1))
            .to.be.revertedWith("_to the zero address")

        // переводим от овнера amountAddr1 токенов,
        // чтобы потом проверить что он не сможет перевести amountAddr1 + 1
        await ico.transfer(addr1.address, amountAddr1);
        await expect(ico.connect(addr1).transfer(addr2.address, amountAddr1 + 1))
            .to.be.revertedWith("Do not enough balance")

        // переводим amountAddr2 на addr2
        await ico.connect(addr1).transfer(addr2.address, amountAddr2)



        // проверяем балансы адресов
        expect(await ico.balanceOf(addr1.address)).to.equal(amountAddr1 - amountAddr2);
        expect(await ico.balanceOf(addr2.address)).to.equal(amountAddr2);

        // event Transfer
        const tx = await ico.transfer(addr1.address, mount);
        expect(tx).to.emit(ico, "Transfer")
            .withArgs(owner.address, addr1.address, mount)

    });
    it("Checking function event Approval, aprove(), allowance(), increaseAllowance(), decreaseAllowance()", async function () {
        const amountAddr1 = 55;
        const amountIncDec = 5;
        // aprove()
        const tx = await ico.approve(addr1.address, amountAddr1);

        // event Approval
        expect(tx).to.emit(ico, "Approval")
            .withArgs(owner.address, addr1.address, amountAddr1)

        // проверяем require(_spender != address(0), "_spender the zero address");
        await expect(ico.connect(owner).approve(ethers.constants.AddressZero, mount))
            .to.be.revertedWith("_spender the zero address")

        // allowance
        expect(await ico.allowance(owner.address, addr1.address))
            .to.equal(amountAddr1)

        // increaseAllowance()
        await ico.increaseAllowance(addr1.address, amountIncDec)
        expect(await ico.allowance(owner.address, addr1.address))
            .to.equal(amountAddr1 + amountIncDec)

        // проверяем require(_allowance[msg.sender][_spender] >= _decAmount,"decreased allowance below zero");
        // вытаемся уменьшить количество approve больше чем возможно
        await expect(ico.connect(owner).decreaseAllowance(addr1.address, amountAddr1*amountAddr1))
            .to.be.revertedWith("decreased allowance below zero")

        // decreaseAllowance()
        await ico.decreaseAllowance(addr1.address, amountIncDec)
        expect(await ico.allowance(owner.address, addr1.address))
            .to.equal(amountAddr1 + amountIncDec - amountIncDec)  // учитываем предыдущий + amountIncDec
    });
    it("Checking function transferFrom()", async function () {
        const amount = 55;

        // Проверяем перевод если небыло апрува
        await expect(ico.connect(addr1).
            transferFrom(owner.address, addr2.address, amount))
            .to.be.revertedWith("Do not enough money");
        // Апрувим и проверяем балансы
        await ico.approve(addr1.address, amount);
        expect(await ico.balanceOf(addr1.address)).to.equal(0);
        expect(await ico.balanceOf(addr2.address)).to.equal(0);
        // переводим проапрувенные токены и проверяем
        await ico.connect(addr1).
            transferFrom(owner.address, addr2.address, amount);
        expect(await ico.balanceOf(addr2.address)).to.equal(amount);
    });
    it("Checking function burn()", async function () {
        const amount = 55;
        // Проверяем что сжигать нечего
        await expect(ico.connect(addr1).burn(amount))
            .to.be.revertedWith("not enough balance to burn");
        // отправляем amount токенов и проверяем баланс
        await ico.transfer(addr1.address, amount);
        expect(await ico.balanceOf(addr1.address)).to.equal(amount);
        // Сжигаем и проверяем что теперь баланс = 0
        await ico.connect(addr1).burn(amount);
        expect(await ico.balanceOf(addr1.address)).to.equal(0);
    });
});
describe("Checking TokenSale", function () {
    let ico;

    // создаём экземпляры контракта
    beforeEach(async () => {
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        const ICO = await ethers.getContractFactory("TokenSale");
        ico = await ICO.deploy();
        await ico.deployed();
    });
    // проверка, что контракт создан овнером
    it("Checking contract creater is an owner", async function () {
        expect(await ico.Owner()).to.equal(owner.address);
    });

    // проверка, что вся эмиссия у овнера
    it("Checking Should assign the total supply of tokens to the owner", async function () {
        const ownerBalance = await ico.balanceOf(owner.address);
        //console.log("'%s'",await ico.totalSupply() );
        expect(await ico.totalSupply()).to.equal(ownerBalance);
    });
    // функция покупки токенов
    it("Checking functions - buy()", async function () {
        tx_buy = {
            to: ico.address,
            value: ethers.utils.parseEther("1"),
        };
        // отправляем эфир на контракт
        await addr1.sendTransaction(tx_buy)
        expect(await ico.balanceOf(addr1.address)).to.equal(ethers.utils.parseEther("12"));

        //проверка require(msg.sender.balance >= msg.value && msg.value != 0 ether,
        tx_buy = {
            to: ico.address,
            value: ethers.utils.parseEther("0"),
        };
        await expect(addr1.sendTransaction(tx_buy)).to.be.revertedWith(
            "ICO: function buy invalid input"
        );
    });
    // функция покупки токенов
    it("Checking functions - buy() after a week => tokensale is over", async function () {
        tx_buy = {
            to: ico.address,
            value: ethers.utils.parseEther("1"),
        };

        // Смещаем время на 7 дня после деплоя
        const doubleDays = 7 * 24 * 60 * 60;
        await ethers.provider.send("evm_increaseTime", [doubleDays]);
        await ethers.provider.send("evm_mine");

        // отправляем эфир на контракт 
        await expect(addr1.sendTransaction(tx_buy)).to.be.revertedWith(
            "tokensale is over"
        );

        expect(await ico.balanceOf(addr1.address)).to.equal(ethers.utils.parseEther("0"));
    });
});