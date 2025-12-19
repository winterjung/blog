---
title: 파이썬으로 스마트 컨트랙트 개발하기
---

## 어떤 글인가
11월 21일 화요일, 블록체인 스터디에서 [web3.py](https://github.com/pipermerriam/web3.py)를 이용한 스마트 컨트랙트 배포와 활용에 대해 발표했다. 본래는 PDF파일을 블록체인에 올린 원본 증명 서비스의 간단한 개념 증명을 구현하려 했지만, 초기 계획보다 작업을 많이 하지 못해 2주에 걸쳐 작업하기로 결정했다. 이 글을 통해 **이더리움 노드를 설치해 구동시키고 파이썬을 사용해 스마트 컨트랙트를 컴파일 한 후 배포하기까지의 과정** 과 그러면서 있었던 **여러 문제 상황들을 어떻게 해결했는지** 회고하고자 한다.

## 파이썬을 사용한 이유
기존에 있던 예제들을 보면 대부분 web3.js와 Node를 사용한 자료들이 많다. 반면 나는 파이썬이 제일 친숙하고 기존에 자주 사용하는 서버 스택이 [Flask](flask.pocoo.org) 였기에 이번 발표에서 파이썬 [Flask](flask.pocoo.org) 서버에서 이더리움의 스마트 컨트랙트를 배포하고, 배포된 컨트랙트와 web3.py를 이용해 상호작용하는걸 코드로 구현해 시연했다.

![](/images/20171127/study.jpeg)

## 보편적인 스마트 컨트랙트 배포 방식
저번 스터디에는 [Time Token](https://github.com/winterjung/JungWinter.github.io/blob/284ba471852e7abac3fccedb57f8d90ac21cd7bd/project/time_second_token.sol)이라는 간단한 스마트 컨트랙트를 만들어 이를 [Mist 지갑](https://github.com/ethereum/mist) 클라이언트를 사용해 직접 배포하는 방식을 시연했다. 보통 배포 자체는 지갑 클라이언트를 사용하거나 [Truffle](https://github.com/trufflesuite/truffle)을 이용해 컴파일과 테스트를 거친 후 연동되어있는 이더리움 노드(e.g. [Geth](https://github.com/ethereum/go-ethereum), [Parity](https://github.com/paritytech/parity))를 통해 직접 배포하곤한다. TestRPC는 보통 개발단계에서 사용되며 현재 [Ganache](https://github.com/trufflesuite/ganache)로 이관되었다. (트러플에 가나슈까지 네이밍은 잘한다는 생각이 든다) 뒤에서도 말하겠지만 가나슈를 이용하면 스마트 컨트랙트를 개발하고 배포하는데 있어 여러 이점이 있다.

- [스마트 컨트랙트의 이해](http://goodjoon.tistory.com/261)


## 이번에 해본 배포 방식
Geth를 설치하고 구동시켜 프라이빗 체인을 구성시킨 후 solc를 사용해 스마트 컨트랙트 소스를 컴파일 한 후 web3를 사용해 저수준에서 직접 배포해봤다. 이를 위해선 여러모로 설치하고 설정해줘야 할 것들이 몇 가지 있는데 이 과정에서 많은 어려움이 있었다.

## 사전 준비
### Geth
#### 설치
먼저 이더리움 블록체인과 상호작용할 수 있는 노드가 필요하다. 여기서는 유지보수가 잘 되어있고 참고할 질문들이 많고 커뮤니티에서 논의가 활발한 Geth를 사용했다. macOS 기준으로 `brew install geth` 를 통해 손쉽게 설치할 수 있다.

#### 설정
설치가 완료되었으면 이제 세가지 선택지가 존재한다.

1. 이더리움 메인넷과 연동하기
2. 이더리움 테스트넷과 연동하기
3. 프라이빗 네트워크 구성하기

목적은 개발이기 때문에 당연히 3번으로 가야하고, 그러기 위해선 **첫번째 블록(Genesis Block)** 을 우리가 설정해주고, geth한테 이 설정을 알려줄 필요가 있다. 더불어 [이 글](https://souptacular.gitbooks.io/ethereum-tutorials-and-tips-by-hudson/content/private-chain.html)에 따르면 프라이빗 네트워크임을 다음과 같이 알려줄 수 있다고 한다.

1. 커스텀 제네시스 파일
2. 커스텀 체인 데이터 폴더
3. 커스텀 네트워크 ID
4. (권장) discovery 옵션 비활성화

4가지 모두 별도로 설정해줄 것이며, 먼저 `CustomGenesis.json` 이라는 파일을 하나 만들어준다.

```json
{
  "config": {
        "chainId": 42,
        "homesteadBlock": 0,
        "eip155Block": 0,
        "eip158Block": 0
    },
  "alloc": {},
  "coinbase"   : "0x0000000000000000000000000000000000000000",
  "difficulty" : "0x20000",
  "extraData"  : "",
  "gasLimit"   : "0x2fefd8",
  "nonce"      : "0x0000000012345678",
  "mixhash"    : "0x0000000000000000000000000000000000000000000000000000000000000000",
  "parentHash" : "0x0000000000000000000000000000000000000000000000000000000000000000",
  "timestamp"  : "0x00"
}
```

##### 주의점
1. `nonce` 값을 무작위적으로 선택된 값으로 할당한다.
2. `chainId` 값을 0 이 아닌 값으로 할당한다.
3. `difficulty` 값을 적절히 할당한다. 참고로 `0x20000` 의 난이도로는 2013 맥북 프로 기준 1초에 1블럭 꼴로 채굴된다.

#### 환경 구성
그 후 `geth init CustomGenesis.json --datadir chain-data` 를 통해 초기 프라이빗 네트워크 환경을 구성해준다. 이 때 `--datadir` 인자로 체인 데이터가 쌓일 폴더를 지정해줄 수 있다.


![](/images/20171127/init_success.png)

위와 같이 초기화가 잘 되었다면 실질적으로 geth를 구동시켜줘야 한다.

#### 실행
```sh
geth --rpc --rpccorsdomain "*" --nodiscover --datadir "chain-data" --port "30303" --rpcapi "db,eth,net,web3,personal,admin,miner,debug,txpool" --networkid 1001012
```

위 명령어로 노드를 구동시켜줬다. 중요한점은 `--nodiscover` 옵션과 `--networkid` 옵션에 무작위 수를 주는 것이다. 그래야 프라이빗 네트워크로 구동된다. 별도의 ipcapi 옵션은 주지 않았지만 큰 문제 없었고 향후 web3.py에서 `HTTPProvider`를 사용하려면 필히 rpcapi 옵션을 설정해줘야 한다.

![](/images/20171127/geth_start.png)

중간에 있는 경고 메시지를 제외하면 이와 비슷한 결과를 얻을 수 있다. 아래를 보면 별도의 IPC 옵션을 주지 않아도 IPC endpoint와 같이 HTTP endpoint를 얻었음을 확인할 수 있다.

#### 지갑 생성
마지막으로 새로운 쉘을 열어서

- `geth attach http://127.0.0.1:8545` 혹은
- `geth attach ./chain-data/geth.ipc`

명령어를 통해 콘솔에 접속한 뒤 `personal.newAccount()` 로 새로운 지갑 주소를 만들어준다. 비밀번호를 설정해 최종적으로 생성이 끝나면 `eth.accounts` 명령어로 다시 확인해볼 수 있다.

#### Error: insufficient funds for gas * price + value
geth, solc, web3.py를 전부 설치하고 개발을 하다가 컨트랙트를 배포하는 시점에서 `insufficient funds for gas * price + value` 에러를 만났다. 처음에는 단순히 account에 돈이 없거나 gas를 잘못설정해준줄 알고 이것저것 바꾸고 모든 지갑에 100 ETH 씩 채워두고 트랜잭션을 쓸 때도 `gasLimit - 1` 만큼 gas를 주거나 했다. 그래도 안되길래 계속 찾아보니 `genesis.json`에 있던 `chainId`를 0으로 설정해준게 원인이었다. 그래서 0을 대충 42정도로 바꿔주니 그 후 트랜잭션은 매우 잘 발행되었다.

- [이더리움 개발자 포럼 질문](https://ethereum.stackexchange.com/questions/28061/geth-sendtransaction-error-insufficient-funds-for-gas-price-value)
- [Geth 이슈](https://github.com/ethereum/go-ethereum/issues/15461)

### Solc
solc는 solidity 언어를 EVM(Ethereum Virtual Machine)에서 사용할 수 있게끔 바이트코드로 변환시켜주는 컴파일러다. 흔히 [solidity가 버전업 됐다는 것](https://github.com/ethereum/solidity/releases)은 이 solc라는 컴파일러가 버전업 됐다는 의미이다. solidity 언어로 작성된 스마트 컨트랙트 코드를 파이썬에서 활용하기 위해선 파이썬 환경에서 동작하는 solc 컴파일러가 필요했고, [py-solc](https://github.com/pipermerriam/py-solc)를 사용했다.

#### 설치
1. `brew install solidity`로 의존성 설치
2. `pip install py-solc`로 파이썬 solc 라이브러리 설치

#### 실행
이후 파이썬 스크립트 내부에서 `from solc import compile_source`로 가져와 스마트 컨트랙트 코드를 컴파일할 수 있다. 스마트 컨트랙트 코드는 문자열이며 별도의 `.sol` 파일을 읽어들이거나 스크립트에 하드코딩 해둘 수 있으며 이번엔 후자로 사용했다.
```python
from solc import compile_source

contract_source_code = '''
contract Greeter {
    string public greeting;

    function Greeter() {
        greeting = 'Hello';
    }

    function setGreeting(string _greeting) public {
        greeting = _greeting;
    }

    function greet() constant returns (string) {
        return greeting;
    }
}
'''
compiled_sol = compile_source(contract_source_code)
```

이 때 `compiled_sol`의 타입은 `dict` 형식이다.  매우 길기 때문에 `print()`보다는 `json.dump()`로 내용을 보면 `"<stdin>:Greeter"`라는 하나의 키 값만 존재하는 것을 확인할 수 있다. 해당 키의 값으로는 또 `dict`가 존재하는데 이 contract interface의 키로는 **abi**, asm, **bin**, **bin-runtime**, clone-bin, opcodes, devdoc, userdoc가 존재한다. 여기서 abi, bin, bin-runtime이 나중에 web3.py에서 필요한 값들이다.

- [ABI란?](https://ethereum.stackexchange.com/questions/234/what-is-an-abi-and-why-is-it-needed-to-interact-with-contracts)

### Web3.py
geth에서 구동되고 있는 이더리움 프라이빗 네트워크에 스마트 컨트랙트를 배포하고, 배포된 스마트 컨트랙트와 파이썬 서버가 상호작용하기 위해선 [web3.py](https://github.com/ethereum/web3.py)가 필요하다. 본래 노드와 HTTP기반 JSON RPC API를 이용해 트랜잭션을 생성하는 등의 작업을 할 수 있고, 이의 wrapper가 web3이다. 그리고 자바스크립트로 구현한 것이 web3.js, 파이썬으로 구현한 것이 web3.py다.

- [JSON RPC API 기본](http://goodjoon.tistory.com/255)

#### 설치
`pip install web3`로 간단하게 설치할 수 있다.

## 배포
이제 사전 준비가 끝났으니 실제로 스마트 컨트랙트를 배포해 볼 차례가 됐다. 스마트 컨트랙트 코드는 컴파일을 거쳐 나온 `abi` 와 `bin`(바이트 코드)를 사용해 `Contract` 객체를 만들어준 뒤 배포에 사용될 지갑 주소가 포함된 트랜잭션을 생성해 `deploy()`한다. `deploy()`의 결과로는 트랜잭션 해시를 반환받는다. 마지막으로 블럭의 채굴이 이루어지면 최종적으로 이더리움 블록체인에 스마트 컨트랙트가 올라간다. 과정을 도식화해보면 다음과 같다.

```
    solidity code
          +
          |
+---------+-----------+
|  compile_source()   |
+---------+-----------+
          |
          | abi, byte_code(bin)
          |
+---------------------+
| web3.eth.contract() |
+---------------------+
          |
          | transaction
          |
+---------------------+
|  contract.deploy()  |
+---------+-----------+
          |
          v
   transaction hash
          +
    ... mining ...
          |
          v
    S U C C E S S
```

여기까지의 과정을 파이썬 코드로 나타내면 다음과 같다.

```python
import time
from web3 import Web3, HTTPProvider
from solc import compile_source

# Solidity source code
contract_source_code = '''
contract Greeter {
    string public greeting;

    function Greeter() {
        greeting = 'Hello';
    }

    function setGreeting(string _greeting) public {
        greeting = _greeting;
    }

    function greet() constant returns (string) {
        return greeting;
    }
}
'''


# web3.py
rpc_url = "http://localhost:8545"
w3 = Web3(HTTPProvider(rpc_url))
# 혹은 IPC를 통해 연결할 수 있다.
# w3 = Web3(IPCProvider("./chain-data/geth.ipc"))
# 지갑 주소를 unlock 해준다. 순서대로 지갑 주소, 비밀번호, unlock할 시간 (0은 영원히)
w3.personal.unlockAccount(w3.eth.accounts[0], "test", 0)


compiled_sol = compile_source(contract_source_code)
contract_interface = compiled_sol["<stdin>:Greeter"]

# 배포 준비, 스마트 컨트랙트 껍데기(abi)에 내용물(bin)을 채운다.
contract = w3.eth.contract(abi= contract_interface['abi'],
                           bytecode= contract_interface['bin'],
                           bytecode_runtime= contract_interface['bin-runtime'])


# 비용을 부담할 주소를 from으로 하는 트랜잭션을 포함해 배포한다.
tx_hash = contract.deploy(transaction={'from': w3.eth.accounts[0]})

# 마이닝을 해줘야 후에 실제로 사용할 수 있다.
w3.miner.start(2)
time.sleep(5)
w3.miner.stop()
```

여기서 마이닝 과정은 TestRPC(현재 [Ganache](https://github.com/trufflesuite/ganache) )를 사용한다면 생략될 수 있다. 이번에는 따로 개발 툴들을 사용하지 않았기에 수동으로 마이닝해줘야하며  `start()`의 인자로 들어가는 정수는 스레드 개수인데 1로 지정해주면 GIL 때문인지 실제로 채굴이 진행되지 않아 2로 지정해줬다.

### Error: Could not transact with/call contract function, is contract deployed correctly and chain synced?
배포만 하고 블록을 채굴하지 않았을 때 나타나는 에러다. 분명히 `deploy()`를 실행해서 `tx_hash`까지 잘 받아왔는데 나중에 `web3.eth.getTransactionReceipt()`로 contract 주소를 받아오려 할 때 나타났던 에러로, 에러메시지의 말대로 제대로 배포되었고 체인이 동기화 되었는지 확인했더니 트랜잭션은 잘 생성 되었으나 채굴이 이루어져 블록에 포함되지 않아서 나타나는 문제였다.

## 사용
`tx_hash` 혹은 `contract_address`를 통해 스마트 컨트랙트와 상호작용할 수 있다. 어차피 `contract_address` 또한 `tx_hash`로부터 얻을 수 있는 값이니 전자의 상황으로 진행했다. 코드는 앞과 이어진다.

```python
# 배포된 컨트랙트 주소를 받아오기 위해 트랜잭션 receipt를 얻어온다.
tx_receipt = w3.eth.getTransactionReceipt(tx_hash)
contract_address = tx_receipt['contractAddress']

# 아까 만들어둔 컨트랙트 객체에 주소를 알려줌으로써 실제로 작동할 수 있게끔 한다.
contract_instance = contract(contract_address)

# 컨트랙트의 greet() 함수를 호출한다.
print('Contract value: {}'.format(contract_instance.call().greet()))

# get이 아닌 set 동작을 위해선 트랜잭션을 발행해 아까와 마찬가지로 채굴을 해줘야 한다.
# 여기서 setGreeting()은 컨트랙트에 있던 함수다.
contract_instance.transact({"from": w3.eth.accounts[0]}).setGreeting("WinterJ")
print('Setting value to: WinterJ')


w3.miner.start(2)
time.sleep(5)
w3.miner.stop()

# 그리고 다시 값을 확인해보면 WinterJ가 나옴을 확인할 수 있다.
print('Contract value: {}'.format(contract_instance.call().greet()))
```


## 결과
별도의 `.py` 파일로 만들어 실행시켜 보면 아래와 같이 잘 동작함을 확인할 수 있다.

> 로그는 디버깅을 위해 첨부했다. 크게 신경쓰지 않고 마지막 Contract value 값이 바뀌었음만 확인하자.  

![](/images/20171127/finish.png)

위의 코드와 `json` 파일은 [Github](https://github.com/JungWinter/file-on-blockchain)에 올라가 있다. 혹시 잘못된 점이나 궁금한 점이 있다면 언제든지 **wintermy201@gmail.com** 로 메일을 보내주기 바랍니다.

## 이제 해야할 것
- 제대로된 컨트랙트 코딩
- Flask 서버 제작
- 간단한 프론트 페이지 제작
- 최소한으로 동작하는 모델 만들기
