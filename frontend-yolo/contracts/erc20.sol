// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {BankERC20} from "./BankERC20.sol";

contract BankToken is BankERC20 {
    constructor(string memory name, string memory symbol, address receiver) payable BankERC20(name, symbol, 18, receiver) {
    }
}