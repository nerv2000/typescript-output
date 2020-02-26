# 기타 설명

## 1. swagger 관련

swagger 사용은 서버를 실행한 상태에서 <http://localhost:3000/api-docs>로 접속 하면 됨

rest-api로 구현 하고 테스트 하는데 불편하였음.  
별도의 클라이언트가 필요하기도 했고...  
그래서 찾아보니 swagger라는 걸 찾아서 이용하기로 함.  

swagger로 만들면 일단 별도의 클라이언트가 필요가 없고  
나중에 api 정리도 할 필요가 없을꺼 같았음..  
그래서 swagger를 사용 해봄...  

일단 여러가지를 생각해봤을때 기본적인 path는 직접 작성 하는게  
나을꺼 같아서 jsDoc 방식을 이용함...  
swagger-JsDoc가 tags, definitions는 별도의 파일로 관리가 가능 하기에  

definitions만 자동으로 코드 생성 하도록 구현해봄..  
(자동생성 코드는 **.\src\modules\parser-gen** 폴더 확인)  
차후에 클라이언트에서 사용 할수 있도록 자동으로 뽑게 만들수는 있을꺼 같음.

enum 관련 부분은 swagger에서 사용이 별로라서  
enum은 설명하는 정도만 있으면 될꺼 같아서 enum이라고 앞에 붙임..

## 2. jest 관련

jset 실행 방법은 **npm test** 로 실행 하면 됨

코드 테스트 하는것으로는 jest를 사용한다기에 사용해봄  
rest api를 테스트 해야하기에 supertest 모듈을 사용하였음..  
테스트 코드 작성하는데 시간이 걸리긴 했지만 작성후에는 만족스러웠음  
특히 리팩토링 할때 도움이 많이 되었음...
