# 설정 관련 설명

## 1. 설정파일

- **config.json**  
서버를 구동 하기 위한 기본적인 설정 파일  
설정 파일은 root에 config.json에 세팅 해주면 됨  
config.json의 schema를 작성 하였으니 사용 할 것  
샘플로 config.sample.json을 제공함으로 자세한건 생략...  
- **tsparser.json5**  
json5로 사용중임 (주석이 필요해서...)  
주고받을 데이터 구조 (enum, interface)를 yaml 파일로  
생성 하는데 필요한 config 파일  
서버 실행시 init 인자를 추가 하면 자동으로 파일 생성함  

## 2. 실행 관련

npm으로 실행시 사용하는 스크립트 명령 설명  
아래 서술 안한것은 package.json의 scripts 참조

- **start** - tsc 빌드 -> yaml 파일 생성 -> 서버 실행
- **test** - jset로 테스트 코드 실행
