const { ethers } = require("hardhat");
const { expect, assert } = require("chai");
//use default BigNumber
var chai = require('chai');
chai.use(require('chai-bignumber')());
//use custom BigNumber
//chai.use(require('chai-bignumber')(BigNumber));


describe.only("Checking ERC20 functions", function () {
    let ico;

    // создаём экземпляры контракта
    beforeEach(async () => {
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        const ICO = await ethers.getContractFactory("TokenSale");
        ico = await ICO.deploy();
        await ico.deployed();
    });

    // view функции
    it("Checking functions - symbol(), symbol(), name(), totalSupply()", async function () {
        const name = "MegaToken";
        const symbol = "MEGA";
        const decimals = 18;
        const totalSupply = 1000000 * (10 ** decimals);
        expect(await ico.name()).to.equal(name);
        expect(await ico.symbol()).to.equal(symbol);
        expect(await ico.decimals()).to.equal(decimals);
        //const _totalSupply = await ico.totalSuplay()
        //console.log("'%s'   '%s'", totalSupply , await ico.totalSuplay());

        //expect(totalSupply).should.be.bignumber.equal(await ico.totalSuplay());
        //result.should.be.bignumber.equal(expected);
        //expect(await ico.totalSuplay()).should.be.bignumber.equal(totalSupply);
        //expect(_totalSupply).to.be.a(__totalSupply);
        //expect(await ico.totalSuplay()).to.equal(totalSupply);

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
    });
    it("Checking function event Approval, aprove(), allowance(), increaseAllowance(), decreaseAllowance()", async function () {
        const amountAddr1 = 55;
        const amountIncDec = 5;
        // aprove()
        const tx = await ico.approve(addr1.address, amountAddr1);

        // event Approval
        expect(tx).to.emit(ico, "Approval")
            .withArgs(owner.address, addr1.address, amountAddr1)

        // allowance
        expect(await ico.allowance(owner.address, addr1.address))
            .to.equal(amountAddr1)

        // increaseAllowance()
        await ico.increaseAllowance(addr1.address, amountIncDec)
        expect(await ico.allowance(owner.address, addr1.address))
            .to.equal(amountAddr1 + amountIncDec)

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
describe.only("Checking TokenSale", function () {
    let ico;

    // создаём экземпляры контракта
    beforeEach(async () => {
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        const ICO = await ethers.getContractFactory("TokenSale");
        ico = await ICO.deploy();
        await ico.deployed();
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