// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ERC20 {
    // Название токена
    string private _name;
    // Символ токена
    string private _symbol;
    // Количество нулей токена
    uint8 private _decimals;

    // Эмиссия токена
    uint256 private _totalSupply;

    // Маппинг для хранения баланса
    mapping(address => uint256) private _balanceOf;

    // Маппинг для хранения одобренных транзакций
    mapping(address => mapping(address => uint256)) private _allowance;

    //Эвенты (ЛОГИ)
    event Transfer(address indexed _from, address indexed _to, uint256 indexed _amount);
    event Approval(address indexed _owner, address indexed _spender, uint256 indexed _amount);

    // Функция инициализации контракта
    constructor(string memory __name, string memory __symbol) {
        // Указываем число нулей
        _decimals = 18;
        // Указываем название токена
        _symbol = __symbol;
        // Указываем символ токена
        _name = __name;
    }

    // Геттеры
    function decimals() public view virtual returns (uint8) {
        return _decimals;
    }

    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }

    function name() public view virtual returns (string memory) {
        return _name;
    }

    function balanceOf(address account) public view virtual returns (uint256) {
        return _balanceOf[account];
    }

    function totalSupply() public view virtual returns (uint256) {
        return _totalSupply;
    }
    function allowance(address owner, address spender) public view virtual returns (uint256) {
        return _allowance[owner][spender];
    }
    // Внутренняя функция для перевода токенов
    function _transfer(
        address _from,
        address _to,
        uint256 _amount
    ) internal virtual {
        // Проверка на пустой адрес
        require(_from != address(0), "_from the zero address");
        require(_to != address(0), "_to the zero address");
        // Проверка того, что отправителю хватает токенов для перевода
        require(_balanceOf[_from] >= _amount, "Do not enough balance");
        // Проверка на переполнение
        require(_balanceOf[_to] + _amount >= _balanceOf[_to]);
        // Токены списываются у отправителя
        _balanceOf[_from] -= _amount;
        // Токены прибавляются получателю
        _balanceOf[_to] += _amount;
        // Эвент перевода токенов
        emit Transfer(_from, _to, _amount);
    }

    // Функция для перевода токенов
    function transfer(address _to, uint256 _amount)
        public
        virtual
        returns (bool)
    {
        // Вызов внутренней функции перевода
        _transfer(msg.sender, _to, _amount);
        return true;
    }

    // Функция для перевода "одобренных" токенов
    function transferFrom(
        address _from,
        address _to,
        uint256 _amount
    ) public virtual returns (bool) {
        // Проверка, что токены были выделены аккаунтом _from для аккаунта _to
        require(_allowance[_from][msg.sender] >= _amount, "Do not enough money");
        // Уменьшаем число "одобренных" токенов
        _approve(_from, msg.sender, _allowance[_from][msg.sender] - _amount);
        // Отправка токенов
        _transfer(_from, _to, _amount);
        return true;
    }

    // Функция для "одобрения" перевода токенов
    function approve(address _spender, uint256 _amount)
        public
        virtual
        returns (bool)
    {
        _approve(msg.sender, _spender, _amount);
        return true;
    }

    // Функция для добавления к одобряемому количеству токенов
    function increaseAllowance(address _spender, uint256 _addAmount)
        public
        virtual
        returns (bool)
    {
        _approve(
            msg.sender,
            _spender,
            _allowance[msg.sender][_spender] + _addAmount
        );
        return true;
    }

    // Функция для уменьшения одобряемого количества токенов
    function decreaseAllowance(address _spender, uint256 _decAmount)
        public
        virtual
        returns (bool)
    {
        // Проверяем, доступно ли для msg.sender переводить по адресу _spender токены в размере _decAmount
        require(
            _allowance[msg.sender][_spender] >= _decAmount,
            "decreased allowance below zero"
        );
        _approve(
            msg.sender,
            _spender,
            _allowance[msg.sender][_spender] - _decAmount
        );
        return true;
    }

    // Внутренняя функция для "одобрения" перевода токенов
    function _approve(
        address _owner,
        address _spender,
        uint256 _amount
    ) internal virtual {
        // Проверка на пустой адрес
        require(_owner != address(0), "_owner the zero address");
        require(_spender != address(0), "_spender the zero address");
        // Записываем в маппинг число "одобренных" токенов
        _allowance[_owner][_spender] = _amount;
        // Вызов эвента для логгирования события одобрения перевода токенов
        emit Approval(_owner, _spender, _amount);
    }

    // Функция для увеличения эмиссии
    function _mint(address _user, uint256 _amount) internal virtual {
        // Проверка на пустой адрес
        require(_user != address(0), "_user has the zero address");
        // увеличиваем эмиссию
        _totalSupply += _amount;
        // зачиляем добавленную эмиссию пользователю _user
        _balanceOf[_user] += _amount;
        // генерируем событие о передаче токенов
        emit Transfer(address(0), _user, _amount);
    }

    // Функция для сжигания токенов
    function _burn(address _user, uint256 _amount) internal virtual {
        // Проверка на пустой адрес
        require(_user != address(0), "_user has the zero address");
        // Есть ли у пользователя столько на балансе
        require(_balanceOf[_user] >= _amount, "not enough balance to burn");
        // увеличиваем эмиссию
        _totalSupply -= _amount;
        // зачиляем добавленную эмиссию пользователю _user
        _balanceOf[_user] -= _amount;
        // генерируем событие о передаче токенов на нулевой адрес
        emit Transfer(_user, address(0), _amount);
    }
}

contract TokenSale is ERC20 {
    uint256 internal endTimeSale = block.timestamp + 5 days;
    uint8 internal tokenCostRate = 12;
    address public Owner;

    constructor() ERC20("MegaToken", "MEGA") {
        _mint(msg.sender, 10_000 * 10**decimals());
        Owner = msg.sender;
    }

    receive() external payable {
        buy();
    }

    // Сейл сейчас активен?
    modifier isSaleAvailable() {
        require(
            (block.timestamp <= endTimeSale),
            "tokensale is over"
        );
        _;
    }

    function buy() internal isSaleAvailable {
        require(
            msg.sender.balance >= msg.value && msg.value != 0 ether,
            "ICO: function buy invalid input"
        );

        uint256 amount = msg.value * tokenCostRate;
        _transfer(Owner, msg.sender, amount);
    }

    function mint(address _user, uint256 _amount) public virtual {
        require(msg.sender == Owner, "Only owner can mint new tokens");
        _mint(_user, _amount);
    }
    function burn(uint256 _amount) public virtual {
        _burn(msg.sender, _amount);
    }

}
