---
title: File on blockchain 개발기
---

## 이번 글은
파일의 해시값을 블록체인에 올리고, 파일이 원본임을 확인하고, 파일의 정보를 조회할 수 있는 기능을 개념 증명(Proof of concept) 수준에서 구현한 [File on blockchain](https://github.com/JungWinter/file-on-blockchain)이라는 서비스를 개발했다. 이번 글을 통해 **solidity 코드를 작성하면서 해결한 문제** 와 **파이썬 서버와 어떻게 결합했는지** 돌아보고자 한다.

## 복습
앞서 [파이썬으로 스마트 컨트랙트 개발하기](https://winterj.me/smart-contract-with-python/) 글을 통해서 파이썬 서버를 운영하면서 동시에 `geth`, `solc`, `web3.py`를 이용해 javascript가 아닌 파이썬으로 간단한 스마트 컨트랙트를 배포하고 사용하는 법에 대해 알아봤다.

<figure>
	<a href="https://winterj.me/images/20171127/finish.png"><img src="https://winterj.me/images/20171127/finish.png" alt=""></a>
	<figcaption style="text-align: center;">저번에 한 걸 요약한 사진. 파이썬으로 스마트 컨트랙트를 배포하고 호출했다.</figcaption>
</figure>

> 작성한 코드는 [여기서](https://github.com/JungWinter/file-on-blockchain/blob/master/example/deploy_contract_and_test.py) 볼 수 있다.

## File on blockchain 이란?
PoC 수준에서 간단한 원본 증명 서비스를 제공한다. 사용자는 파일을 업로드 할 수 있으며 파일의 데이터는 서버에, 파일의 메타 정보는 블록체인에 기록된다. 다른 사용자가 어떤 파일이 블록체인에 올라가있는지 확인(원본 증명)하기 위해 파일을 업로드하면 해당 파일의 해시값과 블록체인에 기록된 해시값을 비교하여 등재 여부를 반환해준다. 진정한 원본 증명을 제공하기엔 개선되어야 할 부분이 있지만 블록체인과 서버의 상호작용 부분을 중점으로 뒀기에 크게 고려하지 않았다.

### 참고 사진 (클릭 시 커짐)

<figure class="third">
	<a href="https://winterj.me/images/20171203/02_upload_file.png"><img src="https://winterj.me/images/20171203/02_upload_file.png" alt=""></a>
	<a href="https://winterj.me/images/20171203/03_upload_result.png"><img src="https://winterj.me/images/20171203/03_upload_result.png" alt=""></a>
	<a href="https://winterj.me/images/20171203/04_info.png"><img src="https://winterj.me/images/20171203/04_info.png" alt=""></a>
	<figcaption style="text-align: center;">파일 업로드와 파일 메타 정보 조회 화면</figcaption>
</figure>

<figure class="third">
	<a href="https://winterj.me/images/20171203/05_check.png"><img src="https://winterj.me/images/20171203/05_check.png" alt=""></a>
	<a href="https://winterj.me/images/20171203/06_true.png"><img src="https://winterj.me/images/20171203/06_true.png" alt=""></a>
	<a href="https://winterj.me/images/20171203/08_false.png"><img src="https://winterj.me/images/20171203/08_false.png" alt=""></a>
	<figcaption style="text-align: center;">블록체인에 있는 파일인지 확인한 결과 화면</figcaption>
</figure>

### 기능
사용자 입장에서 고려한 기능은 윗 단락에서 언급했으니 [서버의 endpoint](https://github.com/JungWinter/file-on-blockchain/blob/master/app/server.py)를 기준으로 기능을 사펴보자.

#### `/` - 파일 업로드
인덱스 페이지, 파일을 업로드 하는 사용자의 이름을 적고 파일을 업로드 해 결과를 얻을 수 있다. 이 때 `upload_on_blockchain`함수가 실행돼 `filehash`, `filename`, `filesize`, `owner`가 [`FileHashStorage`라는 스마트 컨트랙트](https://github.com/JungWinter/file-on-blockchain/blob/master/app/storage.sol)에 기록된다. 사용자에겐 해당 파일의 해시값이 반환되고 이를 토대로 블록체인에 기록된 파일의 메타 정보를 조회할 수 있다.

업로드된 파일은 Flask 설정에 따라 지정된 폴더에 저장된다. `/uploads/<filename>`로 파일에 접근할 수 있는데 이 부분을 더 분산화 한다면 [ipfs](https://ipfs.io/)를 사용할 수 있겠으나 본래 목적은 아니었기에 개선 사항으로 남겨두었다.

#### `/info/<filehash>` - 파일 메타 정보 조회
파일 해시에 해당하는 파일의 정보를 컨트랙트에서 조회해 메타 정보를 반환한다. 스마트 컨트랙트의 특성상 해시가 `mapping`의 키로 존재하지 않는다면 value의 기본값들이 반환된다. 여기선 간단하게 `filename`, `uploadDate`, `filesize`가 반환되는데 존재하지 않는 파일 해시값이라면 `""`, `1970-01-01`, `0`이 반환된다.

사용자는 파일이 블록체인에 존재함을 알고 파일의 메타 정보를 조회할 때 업로더가 파일을 언제 올렸는지 비교함으로써 원본인지 확인할 수 있다.

- [존재하지 않는 key의 기본 값](https://ethereum.stackexchange.com/questions/10831/how-to-judge-if-a-struct-var-exists-in-solidity)

#### `/check` - 파일 등재 여부 조회
인덱스 페이지에서 파일을 업로드 해 그 파일이 블록체인에 존재하는지 조회한다. 존재한다면 파일의 메타정보 조회, 다운로드가 가능하다.

## Solidity로 구현한 기능들
저번에는 홈페이지에서 제공되는 예제로만 테스트해봤는데 이번에는 실제로 서비스에 사용될 기능을 설계하고, solidity를 사용해 [별도의 파일](https://github.com/JungWinter/file-on-blockchain/blob/master/app/storage.sol)로 작성했다. 컨트랙트는 2개가 존재하는데 `Owned`라는 컨트랙트는 접근 권한을 제한하는 Abstract Contract에 가깝다. 실제 기능은 `FileHashStorage`컨트랙트에 기술되어 있다.

- [유용한 Storage 컨트랙트 패턴](https://ethereum.stackexchange.com/questions/13167/are-there-well-solved-and-simple-storage-patterns-for-solidity)

### 변수들
> 보다보면 왜 굳이 이렇게 짰을까스러운 부분이 있지만 첫째로 간단한 구조를 유지하기 위해, 둘째로 이렇게 할 수 밖에 없었기에 어쩔 수 없었다. Solidity에선 mapping의 key를 반환하는 기능(파이썬의 `dict.keys()`)도 없고, 중첩 mapping을 사용할 수도 없다.

#### File
```go
struct File {
    string name;
    uint uploadDate;
    uint size;
}
```
파일의 메타 정보를 저장하는 구조체다. 여기서는 간단하게 파일의 이름, 업로드 된 날짜, 파일의 사이즈만 기록하고 있으며 `uploadDate`는 유닉스 타임스탬프기 때문에 `unit`자료형을 사용한다. 또 `bytes32`가 아닌 `string`을 사용했는데 [Solidity 공식문서에 따르면](http://solidity.readthedocs.io/en/develop/types.html#dynamically-sized-byte-array) `bytes`는 raw byte data, `string`은 UTF-8로 인코딩된 문자열을 저장하는 타입이라고 설명하고있기에 `string`을 사용하였다.

- [bytes와 string 중 무엇을 사용해야 할까](https://ethereum.stackexchange.com/questions/11556/use-string-type-or-bytes32)
- [Solidity 공식문서 - array](http://solidity.readthedocs.io/en/develop/types.html#dynamically-sized-byte-array)

#### files
```go
mapping(string => File) private files;
```
`mapping` 자료형은 파이썬의 딕셔너리와 비슷한 자료구조이며 여기선 `string`이 key, `File`이 value로 지정됐다. 여기서 파일의 해시값이 key로 사용되는 `string`이다. 아래와 같은 형태라고 생각하면 편하다.

```js
files["0xABCD1234"] = {
  name: "test_file.pdf",
  registerDate: 17203124, // Unix timestamp
  size: 154000 // Bytes
}
```

#### fileOwners
```go
mapping(string => string[]) private fileOwners;
```
특정 사용자가 여러 파일을 업로드 했을 때, 그 사용자가 올린 모든 파일의 해시값을 조회하기 위해 선언해둔 변수다. 스마트 컨트랙트의 별도로 getter를 구현해두지 않았기에 현재는 사용할 수 없는 변수지만 향후 기능을 업데이트할 때 참고하기 위해 남겨두었다. `fileOwners["Jung"] = ["0xABCD1234", "0xDEAD4321"]`의 형태를 가지고 있다.

#### owners
```java
string[] public owners;
```
파일을 업로드한 사용자의 이름을 가지고 있는 리스트다. 서버 기능으로 구현해두진 않았지만 `getOwnerName` 함수에 인덱스 번호를 전달해 사용자의 이름을 반환받을 수 있다. 모든 사용자의 이름을 알고 싶다면 `ownerID` 혹은 `owners.length`로 길이를 가져와 해당하는 만큼 `getOwnerName(i)`를 호출하면 된다. `owners = ["Jung", "Park", ...]`의 형태를 가지고 있다.

#### ownerID
```go
uint public ownerID = 0;
```
현재 서비스를 사용한 사람의 수를 알기 위해 선언해 둔 변수다. 이 부분은 `owners.length`가 있으니 굳이 있을 필요가 없지만 차후 개선 사항으로 남겨두었다.


### `upload` - 업로드
```java
function upload(string personName, string fileHash, string fileName, uint fileSize) onlyOwner public {
    ownerID++;
    owners.push(personName);
    File memory f = File(fileName, now, fileSize);
    files[fileHash] = f;
}
```
입력받은 정보들을 스마트 컨트랙트 내부에 저장한다. 사용자 이름은 `owners`, 파일 해시와 파일 이름과 사이즈는 `File` struct를 생성해준 후 `files`에 저장하며 key값은 파일 해시로 지정해준다. `File` struct는 임시로 생성해줄 것이기 때문에 memory 키워드를 붙여 초기화해줬다. 굳이 저렇게 할 필요없이 바로 초기화하며 할당해도 되지만 Event에도 넘겨주기 위해 코드의 중복을 막고자 별도의 로컬 변수로 선언해주었다. 예시 코드상엔 Event가 포함되어있지 않다. `now`는 글로벌 변수로 현재 트랜잭션이 처리되는 머신의 타임스탬프 값이다.

- [struct를 생성하는 방법](https://ethereum.stackexchange.com/questions/1511/how-to-initialize-a-struct)
- [Solidity의 글로벌 변수](http://solidity.readthedocs.io/en/develop/units-and-global-variables.html)

### `checkExist` - 존재 확인
```java
function checkExist(string fileHash) onlyOwner public view returns (bool) {
    if (files[fileHash].size > 0) {
        return true;
    }
    return false;
}
```
위에서도 언급했듯이 존재하지 않는 key로 접근하면 에러가 나는게 아니라 default 값을 반환한다. 그렇기에 파일 해시를 key로 메타 정보를 조회해봤을 때 `size`가 0이라면 존재하지 않는다고 판단할 수 있다. 참고로 `onlyOnwer`는 앞에서 말한 `Owner` 컨트랙트에 존재하는 [modifier](https://image.slidesharecdn.com/smartcontractandsolidity-170919052746/95/smart-contract-and-solidity-25-638.jpg?cb=1506008674)다. solidity 0.4.16부터 `constant`는 `view`와 `pure`로 분리되었는데 기존의 `constant`는 `view`와 같다. [여기서](https://ethereum.stackexchange.com/questions/25200/solidity-what-is-the-difference-between-view-and-constant) 더 자세한 차이점을 볼 수 있다.

### `getFileInfo` - 파일 메타 정보 반환
```java
function getFileInfo(string fileHash) onlyOwner public view returns (string, uint, uint) {
    return (files[fileHash].name, files[fileHash].uploadDate, files[fileHash].size);
}
```
struct를 반환한다. 0.4.17부터는 `pragma experimental ABIEncoderV2`를 명시해 줌으로써 struct를 반환할 수 있으나 그 이하에서는 일일이 멤버변수와 자료형을 지정해서 반환해줘야한다. `FileHashStorage`는 0.4.16 컴파일러를 사용하기에 괄호로 감싸 반환해주었다. 이 경우 받는 쪽에서는 리스트로 값을 받을 수 있다.

- [struct를 반환하려면](https://ethereum.stackexchange.com/questions/7317/how-can-i-return-struct-when-function-is-called)

## 파이썬 서버와 스마트 컨트랙트
Flask에서 web3.py를 사용해 스마트 컨트랙트와 상호작용 하는 부분을 간략하게 옮겨본다.

```py
# 파일 업로드
transaction = contract_instance.transact({"from": web3.eth.accounts[0]})
tx_hash = transaction.upload(owner,
                             filehash,
                             filename,
                             filesize)


# 파일 메타 정보 반환                           
file_info = contract_instance.call().getFileInfo(filehash)

# 파일 존재 여부 확인
is_exist = contract_instance.call().checkExist(filehash)
```

저번 글에서도 언급했듯이 `view` 함수들은 단순히 컨트랙트 스토리지의 값만 읽는 것이므로 별도의 마이닝 과정이 필요 없고, `upload`함수는 트랜잭션을 발행해서 스토리지를 갱신시키는 작업이기 때문에 마이닝 과정이 필요하다.

## 문제가 됐던 부분
Solidity로 스마트 컨트랙트 코드를 작성하며 매우 많은 오류를 만나고 디버깅 과정을 거쳤다. [공식 예제를 분석했을 때](https://www.slideshare.net/wintermy201/smart-contract-and-solidity)나 `Greeter`같은 예제로 사용했을 때는 별다른 문제가 없었지만 `mapping`, `struct`, `view`등의 개념이 적용된 컨트랙트를 작성하고 파이썬 서버에서 사용하는 것은 다른 영역이었다. 코드를 고치고 버그를 잡으면서 기록해둔 링크들을 적어본다.

- `smart contract dynamically-sized keys`: remix에서 컴파일 했을 때 나오는 에러.
	- [가변 키 컴파일 에러에 관한 논의](https://ethereum.stackexchange.com/questions/2397/internal-compiler-error-accessors-for-mapping-with-dynamically-sized-keys-not-y): public을 private으로 바꾸거나 getter를 만들어 줘야한다.
	- [public, private, internal, external 차이](https://forum.ethereum.org/discussion/3344/function-visibility-whats-the-difference-between-private-and-internal-if-any)
- `solidity return array`: 배열을 반환하려면 어떻게 해야하는지.
	- [기본적으로 불가능하지만 우회법은 있다.](https://ethereum.stackexchange.com/questions/17312/solidity-can-you-return-dynamic-arrays-in-a-function)
- `web3 contract deploy parameter`: 컨트랙트를 배포할 때 생성자로 인자를 어떻게 넘겨주는지.
	- [web3.py 에선 args로 넘겨주면 된다.](http://web3py.readthedocs.io/en/latest/contracts.html#web3.contract.Contract.deploy)
- [컨트랙트를 파일로 불러와 컴파일 하기](https://github.com/ethereum/py-solc): 굳이 `compile_source`할 필요 없이 `compile_files`로 할 수 있고, 컨트랙트 파일을 리스트로 넘겨야 한다.
- `contract_instance`를 contract모듈의 전역변수로 선언하고 Flask에서 불러와서 사용하려 했으나 실패함. pickle로 dump&load하려 했으나 실패함. 그냥 팩토리 만들어서 Flask 단에서 전역변수로 활용했다.
- 원래는 파일을 블록체인에 저장하려 했으나 [1 MB를 저장하는데 32 ETH](https://ethereum.stackexchange.com/questions/872/what-is-the-cost-to-store-1kb-10kb-100kb-worth-of-data-into-the-ethereum-block)(2017.12.07 기준 1,760만원)가 든다기에 해시만 저장하는 식으로 선회했다.

## 개선해야 할 점
**File on blockchain** 은 아직 개선해야할 점이 많다. Proof of concept라는 생각으로 만들었지만 미래의 나 혹은 다른 사람들의 즐거움을 위해 일부러 남겨둔 부분도 있다.
- **Async upload**: 코드를 보면 알겠지만 서버에서 `upload`를 처리할 때 마이닝을 위해 `time.sleep()`하는 부분이 있다. 이 부분은 메인 스레드를 중단시키므로 웹 서버에선 없어져야 할 부분이다. `async`, `await`를 활용하거나 스레드를 사용해서 비동기적인 로직으로 개선시킬 필요가 있다.
- **특정 사용자가 올린 모든 파일의 해시 리스트 반환**: 해당 기능을 위해 `fileOwners` 변수를 만들어두긴 했지만 서버에서 이를 활용하는 부분은 존재하지 않는다. 진짜 파일, 가짜 파일 2개를 올려두고 타인에게 잘못된 파일을 줬음에도 일단 블록체인에 존재하기 때문에 True를 반환하는데, 그 부분을 방지하고자 한다면 그 사람이 어떤 파일들을 올렸는지 파악할 필요가 있다. 서버 사이드에서 `owners.length` 혹은 `ownerID`를 기준으로 반복문을 돌며 체크하는 부분이 필요하고 컨트랙트에서 `fileOwners`의 getter를 만들 필요가 있다.
- **컨트랙트 초기 배포**: 지금은 [Geth를 초기화](https://github.com/JungWinter/file-on-blockchain/blob/master/blockchain/init.sh)하고 [프라이빗 네트워크로 구동](https://github.com/JungWinter/file-on-blockchain/blob/master/blockchain/start.sh)시킨 다음 어카운트를 만들고 소량의 이더를 직접 채굴해준 다음 `server.py`를 실행시켜 초기 컨트랙트 배포를 기다려야한다. 이부분을 [Ganache](https://github.com/trufflesuite/ganache)와 [Truffle](https://github.com/trufflesuite/truffle)을 사용함으로써 개선시킬 수 있으리라 예상한다.
- **파일 분산 저장**: 업로드 된 파일을 AWS S3 혹은 서버 폴더에 저장하고 있는데 이는 분산화를 관점에서 더 개선시킬 여지가 있다. 아직은 개발중이지만 파일을 분산 저장 시키기 위해 [ipfs](https://ipfs.io)를 이용할 수 있을 것이다. [ether spinner](http://etherspinner.com/)라는 dApp도 js를 ipfs로 관리한다.

## 마치며
파이썬 Flask 서버와 블록체인을 이용한 간단한 파일 원본 증명 서비스는 [Github/file-on-blockchain](https://github.com/JungWinter/file-on-blockchain)에 소스가 공개되어 있습니다. 앞에서 언급한 개선점 말고도 더 발전시키고 싶으신 분들의 PR을 환영합니다. 혹시 잘못된 점이나 궁금한 점이 있다면 언제든지 **wintermy201@gmail.com** 로 메일을 보내주기 바랍니다.
