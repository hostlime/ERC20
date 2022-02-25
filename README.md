#  Токен MEGA ERC20
Для контракта написаны тесты и прозведен анализ покрытия.
 В контракте имеются все методы описанные в стандарте EIP-20: Token Standard https://eips.ethereum.org/EIPS/eip-20 , а так же добавлены функции mint и burn.
+ Контракт https://rinkeby.etherscan.io/address/0xEFDB0b230c136b567bD7B4a5448875B3a68f47Aa
+ Скрин тестов https://prnt.sc/y0kxkjO-2dwN
#### npx hardhat test
 - Checking ERC20 functions
 -   √ Checking functions - symbol(), decimals(), name(), totalSupply() (151ms)
 -   √ Checking function mint() event Transfer (196ms)
 -   √ Checking function balanceOf() (153ms)
 -   √ Checking function transfer(), event Transfer (165ms)
 -   √ Checking function event Approval, aprove(), allowance(), increaseAllowance(), decreaseAllowance() (156ms)
 -   √ Checking function transferFrom() (160ms)
 -   √ Checking function burn() (91ms)
 -   √ Checking contract creater is an owner
 -   √ Checking Should assign the total supply of tokens to the owner

#### npx hardhat coverage
```
------------|----------|----------|----------|----------|----------------|
File        |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
------------|----------|----------|----------|----------|----------------|
 contracts\ |      100 |       95 |      100 |      100 |                |
  ERC20.sol |      100 |       95 |      100 |      100 |                |
------------|----------|----------|----------|----------|----------------|
All files   |      100 |       95 |      100 |      100 |                |
------------|----------|----------|----------|----------|----------------|
5% Branch снято из-за отсутствия покрытия require(_owner != address(0), "_owner the zero address"); в _approve(...). 
В данной реализации контракта проверить require нельзя, 
но убирать его не желательно т.к в случае использования данного кода могут 
воспользоваться внутренней функцией _approve и передать некорректные параметры.
```
#### В проекте составлены следующие tasks:
- task("transferFrom", "transfer tokens for person")
- task("approve", "approve tokens transfer for another person")
- task("transfer", "Transfer tokens MEGA(ERC20)")


