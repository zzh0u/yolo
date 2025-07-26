#!/bin/bash

# 确保abigen工具已安装
# go install github.com/ethereum/go-ethereum/cmd/abigen@latest

# 创建contracts目录
mkdir -p contracts/bindings

# 编译合约并生成ABI
cd July-Workshop
npx hardhat compile

# 生成Go绑定
abigen --abi artifacts/contracts/erc20.sol/BankToken.json --pkg contracts --type BankToken --out ../contracts/bindings/banktoken.go
abigen --abi artifacts/contracts/swap.sol/SimpleSwap.json --pkg contracts --type SimpleSwap --out ../contracts/bindings/simpleswap.go

echo "Contract bindings generated successfully!"