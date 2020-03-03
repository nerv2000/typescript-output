# ts-parser-gen

ts 파일 읽어서 필요한 파일 만들기

ts 파일에서 enum, interface를 읽어 swagger에서 사용할 yaml 파일을 생성한다.  

차후에는 다른 언어로 파일 생성하는것도 추가  
(하지만 아직 필요성이 없어서...)

--

## 설치 방법

일단 소스 파일을 받은후 아래와 같이 해주자.

``` bash
#module 설치
npm install

#typescript build
npm run-script build

#글로벌 설치
npm install -g <소스 위치/ts-parser-gen>
```

설치가 잘 되었다면 아래와 같이 실행

``` bash
tsgen
```

--help 옵션을 보면 대충 사용법 나와있음

---
