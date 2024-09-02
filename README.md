# solana-movies-example-2024

实践过，能跑起来的 solana movies 项目代码

## 环境

- wsl Ubuntu 22.04.3 LTS
- rust 1.75.0
- solana CLI 1.18.21
- anchor CLI 0.30.1
- node 18.20.4

## 文件夹区分

1. `rust-program`

rust 写的 movies 项目智能合约代码，用来部署到 solana 网络（本地网络 solana-test-validator）

原始代码 https://github.com/Unboxed-Software/solana-movie-program

2. `client`

typescript 写的客户端，用来发送交易和链上合约交互。

原始代码 https://github.com/Unboxed-Software/solana-movie-client

3. `anchor-program`

还是智能合约，基于 anchor 框架重写

原始代码 https://github.com/Unboxed-Software/anchor-movie-review-program

4. `frontend-dapp`

dapp 前端用户界面，用于发送交易和链上合约交互。

原始代码 https://github.com/Unboxed-Software/solana-movie-frontend

## 编译和运行

1. `rust-program`

`solana config get -v` 查看网络，确保 solana-test-validator 在运行

`cargo build-sbf` 编译

`solana program deploy target/deploy/pda-local.so` 部署合约

得到合约程序ID `FEQmfwU5qzBU9otZTJDynvkndwDqNDyUMFn7vF4jrQ76`

2. `client`

修改代码中的合约程序ID

`npm install` 下载依赖

`npm run start` 合约交互，发送一个电影评价

3. `anchor-program`

anchor 有 workspace 和 programs 两个概念。前者是工作区间，可以包含很多个 programs（solana 智能合约）。

在这个示例中，`programs` 下包含2个智能合约

- anchor-program 自动生成的 hello-world 合约，可以忽略
- movie-program 我们的 movie 合约

`anchor build` 编译

`anchor deploy` 部署上链

`anchor test --skip-local-validator` 运行测试

4. `frontend-dapp`

