---
title: 스마트 컨트랙트 개발 준비하기 - 개발 과정
---

## 헷갈리는 용어 정리
- `Test RPC`: Ethereum client for testing and development, [파이썬 구현체](https://github.com/pipermerriam/eth-testrpc)도있고 js구현체도 있지만 node.js기반의 `ethereumjs/testrpc`가 업데이트가 좋음.
- `Geth`: full ethereum node implemented in Go
- `pyethapp`: `pyethereum`+`pydevp2p`, complete networked Ethereum client
- `pyethereum`: core blockchain related logic
- `web3.py`, `web3.js`: The key connection between the Ethereum network and your dapp. Web3 allows you to compile, deploy, and interact with your smart contracts.

### 결론
- `ethereumjs-testrpc`는 초기 개발에 사용하는 경량급 테스트넷 노드고 `Geth`는 `Ropsten`같은 대중적인 testnet과 연결될 수 있고 실제 이더리움 네트워크와도 연결될 수 있는 heavy한 노드. [참고](https://karl.tech/intro-guide-to-ethereum-testnets/), `pyethapp`도 노드 구현체 중 하나임
- `web3`는 Dapp과 Geth, testrpc같은 노드들을 연결시켜줌. `ether-pudding`은 `web3`의 래퍼
- `web3`는 컴파일과 배포를 할 수 있지만 `solc`는 컴파일만 할 수 있음.

## 배포 흐름
1. `solidity`로 스마트 컨트랙트 작성
2. `web3` 혹은 `solc`를 이용해 바이트코드로 컴파일
3. 컴파일의 결과물인 바이트코드과 `ABI`를 얻음
4. `testrpc` 실행
5. `web3`를 이용해 `localhost:port`에 있는 `testrpc`에 바이트코드를 배포. 이 때 `ABI`가 사용됨
6. 배포 후 `컨트랙트 어드레스`를 반환받을 수 있음
7. `web3`를 이용해 `컨트렉스 어드레스`와 `ABI`를 이용해 컨트랙트를 가져와 함수를 실행시킬 수 있음.
8. `web3.js`와 html를 연동시켜 웹 페이지와 블록체인에 있는 스마트 컨트랙트가 서로 통신할 수 있음.

```js
// 컴파일 결과물에서 ABI를 가져옴
abiDefinition = JSON.parse(compiledCode.contracts[':Voting'].interface)
// ABI를 통해 골격만 잡힌 컨트랙트 껍데기를 생성함
VotingContract = web3.eth.contract(abiDefinition)
byteCode = compiledCode.contracts[':Voting'].bytecode
// 껍데기에 바이트코드를 담아 컨트랙트를 배포함.
deployedContract = VotingContract.new(['Rama','Nick','Jose'],{data: byteCode, from: web3.eth.accounts[0], gas: 4700000})
// deployedContract는 컨트랙트 어드레스를 담고 있음
// 골격만 잡힌 컨트랙트에 .at 을 통해 실제 내용을 채워 컨트랙트를 객체화함
contractInstance = VotingContract.at(deployedContract.address)
```

### 참고
- [Truffle을 사용하지 않고 컴파일, 배포, 사용하기](https://medium.com/@doart3/ethereum-dapps-without-truffle-compile-deploy-use-it-e6daeefcf919)
- [Truffle을 이용한 스마트 컨트랙트 만들기](https://medium.com/@gus_tavo_guim/using-truffle-to-create-and-deploy-smart-contracts-95d65df626a2)
- [Truffle을 이용해 간단한 스마트 컨트랙트 배포하고 확인해보기](https://medium.com/hci-wvu/hello-world-in-solidity-3e7d3e025831)
- [Voting app 튜토리얼 1](https://medium.com/@mvmurthy/full-stack-hello-world-voting-ethereum-dapp-tutorial-part-1-40d2d0d807c2)
- [Voting app 튜토리얼 2](https://medium.com/@mvmurthy/full-stack-hello-world-voting-ethereum-dapp-tutorial-part-2-30b3d335aa1f)
- [TestRPC에 컨트랙트 올리기](http://sancs.tistory.com/163) (위 링크의 튜토리얼의 한국어 버전)
- [Truffle을 이용해 rinkeby 테스트넷에 배포하기](http://sancs.tistory.com/164)
- [Node.js 콘솔로 TestRPC에 배포하고 사용하기](http://www.chaintalk.io/archive/lecture/586)
- [컨트랙트와 통신하는 프론트 dApp 예제](http://www.chaintalk.io/archive/lecture/501)
