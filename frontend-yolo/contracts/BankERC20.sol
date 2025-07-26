//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import {IBankModule} from "./Bank.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

abstract contract BankERC20 is ERC20 {
    address constant bankContract = 0x0000000000000000000000000000000000000064;
    IBankModule bank = IBankModule(bankContract);

    constructor(string memory name_, string memory symbol_, uint8 decimals_, address receiver) payable ERC20("","") { // parent ERC20 metadata is not used
        bank.setMetadata(name_, symbol_, decimals_);
        _update(address(0), address(receiver), 10000 ether); // initialize with some balance
    }

    function name() public virtual view override returns (string memory) {
        string memory _name;
        (_name, ,) = bank.metadata(address(this));
        return _name;
    }

    function symbol() public virtual view override returns (string memory) {
        string memory _symbol;
        (, _symbol,) = bank.metadata(address(this));
        return _symbol;
    }

    function decimals() public virtual view override returns (uint8) {
        uint8 _decimals;
        (, , _decimals) = bank.metadata(address(this));
        return _decimals;
    }

    function totalSupply() public virtual view override returns (uint256) {
        return bank.totalSupply(address(this));
    }

    function balanceOf(address account) public virtual view override returns (uint256) {
        return bank.balanceOf(address(this), account);
    }

    function _update(address from, address to, uint256 value) internal override {
        if (from == address(0)) { // mint
            bank.mint(to, value);
        } else if (to == address(0)) { // burn
            bank.burn(from, value);
        } else { // transfer
            bank.transfer(from, to, value);
        }

        emit Transfer(from, to, value);
    }
}