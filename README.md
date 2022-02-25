#  Токен MEGA ERC20
Для контракта написаны тесты и прозведен анализ покрытия.

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
```
#### В проекте составлены следующие tasks:
- task("transferFrom", "transfer tokens for person")
- task("approve", "approve tokens transfer for another person")
- task("transfer", "Transfer tokens MEGA(ERC20)")
