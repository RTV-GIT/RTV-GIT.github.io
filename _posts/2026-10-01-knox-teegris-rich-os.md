---
title: "Knox Vault? TEEGRIS? Rich OS?"
tags: [study]
thumbnail: /assets/img/knox-teegris/image-2.png
---

## 1. 개요

갑자기 이런 내용으로 글을 작성하는 이유부터 언급하고 넘어갈까 한다. 최근 퇴근 후에 가장 많은 시간을 쏟는 곳은 바로 코덱스와 함께하는 Samsung&모바일 취약점 연구이다. 작업을 시작하게 된 계기는 크게 아래 네가지인 것 같다.

1. 2026년 초, AI의 바이너리 분석 능력이 인간을 뛰어 넘을 뿐만 아니라 이미 특이점을 넘었다고 느낌
2. BoB 프로젝트 (갤럭시 워치 취약점 연구)를 하면서 모바일 생태계의 취약점과 버그바운티에 대한 지식을 어느 정도 갖춤 
3. 펌웨어는 쉽게 구할 수 있고, 실기기도 이미 오른쪽 호주머니에 있음
4. 안드, 퀄컴, 각종 하드웨어 드라이버 등 확장성이 매우매우 좋음

다시 봐도 이만큼 매력적인 타겟이 없는 것 같다. 물론 자세한 성과는 나중에 버그 패치가 완료되고, 내용을 정리할 여유가 생기면 중간 중간 블로그 글로 작성해볼 예정이다. 

이렇게 타겟을 정한 뒤에 버그 바운티 관련 [공식 문서](https://security.samsungmobile.com/isvp.smsb)를 읽어보던 중, 알면서도 뭐라 설명을 못하겠는, 그런 용어들이 등장했다. 

![image.png](/assets/img/knox-teegris/image.png)

Knox는 깨지면 금융 거래 같은 중요 작업 못 한다 했던거 같고… 흠 잘못하면 벽돌 되는 경우도 있었는데 뭐더라;; TEEGRIS가 TrustZone 말하는건가?? Rich OS가 안드로이드인거 같은데 왜 Rich지…

이대로는 취약점이고 뭐고 코덱스 받아쓰기 밖에 안 될 것 같아서 이 글을 통해 대략적으로라도 정리해보려 한다. 솔직히 이젠 AI한테 물어보면 10초만에 설명해주긴 하지만, 이렇게 정리하면서 조금이라도 내 것이 되지 않을까 싶다.

## 2. Rich OS vs TEEGRIS OS

Rich OS와 TEEGRIS OS는 ARM TrustZone이라는 구조를 먼저 알면 한 번에 구분하기 쉽다. 더 나아가 두 영역이 어떻게 데이터를 주고 받는지까지 알아두면, TEEGRIS OS 영역에 대한 공격이 어떻게 이루어지는지를 가늠해볼 수 있다. 관련 공식 문서는 ARM 홈페이지에 올라와 있다. 링크는 하단에.

ARM 프로세서는 하드웨어 레벨에서 Secure/Non-secure 상태를 구분하여 동작한다. 즉, 프로세서가 Non-secure 상태일 때는 Secure로 지정된 메모리나 장치에 접근할 수 없도록 하드웨어 수준에서 차단된다. 이후 보호가 필요한 연산은 Secure 상태에서 수행하도록 설계할 수 있다. 상태 전환에는 운영체제 시간에 배웠던 user mode - kernel mode 전환과 어딘가 비슷해 보이는 특수 exception을 통한 단계적인 CPU의 권한 전환이 이루어지는데, 이건 TEEGRIS 연구를 시작할 때 정리해도 늦지 않을 것 같다.

![image.png](/assets/img/knox-teegris/image-1.png)

이렇게 구분된 영역에서 Non-secure 상태로 동작하는 실행 환경을 Rich Execution Environment(REE), Secure 상태에서 동작하는 실행 환경을 Trusted Execution Environment(TEE)라고 부른다. TEE/REE는 물리적으로 나눠진 공간이 아니라, 프로세서의 상태에 따라 구분되는 추상적인 영역이라고 이해하면 될 것 같다. 그동안 왜 "Rich"인지 항상 궁금했는데, 그냥 동작이 풍부해서 "Rich"를 사용한다고 한다.

그럼 Rich OS는 뭘까? 당연히 REE에서 작동하는 운영체제를 지칭한다. Samsung 모바일 환경에선 안드로이드 OS가 이 역할을 수행한다고 보면 된다. Linux 커널 뿐만 아니라 system_server, 각종 네이티브 데몬과 같은 안드로이드의 고권한 구성 요소들이 여기에 포함된다.

![image.png](/assets/img/knox-teegris/image-2.png)

그렇다면 TEEGRIS OS는 Rich OS의 반대겠지? 정확하게는 Rich OS와 반대인 TEE에서 작동하는 OS는 Trusted OS라고 부르며, Samsung에서 자체 개발한 Trusted OS가 TEEGRIS라고 한다. 예전에는 다른 업체의 Trusted OS를 사용하였는데, 갤럭시 S10부터 TEEGRIS로 대체되었다고 한다. Samsung 공식 홈페이지에서 그 기능을 간략하게 확인할 수 있다.

![image.png](/assets/img/knox-teegris/image-3.png)

또한 공식 ISVP 안내 문서에는 아래와 같은 문구가 적혀 있다.

> Targeting TEEGRIS OS doesn't include vulnerabilities of Trustlets. This target refers to Secure OS itself.

Trustlet은 ARM 공식 문서에도 없긴 한데, Trustonic/MobiCore 계열에서 Trusted Application (TA)를 지칭할 때 사용했다고 한다. 과거에 Samsung이 MobiCore의 Trusted OS를 사용했다고 하니, 그 흔적이 여기 남아있는게 아닐까 싶다.

아무튼 저 문구도 TEEGRIS를 안드로이드와 대응시켜보면 어떤 느낌인지 감이 온다. 갤러리, 메시지, 메모장 같은 User Application에 대한 공격을 안드로이드 OS에 대한 공격으로 볼 수는 없듯이, TrustedZone에 대해서도 같은 기준을 적용한다고 보면 될 것 같다. 물론 ISVP 대상에서 제외될 뿐이지, Samsung 관여 REE Application처럼 일반 제보 대상에는 포함된다는 사실을 `CVE-2021-25469` 같은 사례를 통해 알 수 있다.

![image.png](/assets/img/knox-teegris/image-4.png)

## 3. Knox Vault

Samsung은 프로세서 상태로 구분되는 TrustZone 구조에서 나아가 아예 별개의 하드웨어 장치를 두어 암호키나 자격 증명 저장할 수 있도록 Knox Vault를 구축하였다. 공식 문서의 아래 그림을 참고하면, Knox Vault의 프로세서는 SoC 안에서 작동하지만 일반 프로세서와는 완전히 독립적인 프로세서가 사용되며, Storage로는 SoC 외부의 비휘발성 메모리 IC를 사용한다고 한다.

![image.png](/assets/img/knox-teegris/image-5.png)

이렇게 물리적 분리를 강화함으로써 프로세서 장악, 부채널 공격 등 하드웨어 공유가 유발할 수 있는 TrustZone의 유효한 약점까지 보완하였다. 갤럭시 S21을 시작으로 일부 Samsung 기기에 적용되었다고 한다. Knox Vault Storage에는 대표적으로 아래와 같은 항목이 저장된다.

- Android Keystore key
- 생체 데이터 관련 암호화 키
- 블록체인 자격 증명
- 잠금 화면 인증 정보

다시 보니 대체 입력 벡터를 어떻게 잡아야 하는지부터 감이 안잡힌다. 실제 연구 사례를 간략하게 조사해보니 `KnoxVault`라는 trustlet 취약점이 제보된 사례 (`CVE-2025-20982`, `CVE-2025-20983`, `CVE-2026-21104`)는 존재하지만, 이게 단순 TA 취약점인건지, Knox Vault와 연관이 있는건지는 잘 모르겠다. **혹시나 아시는 분들은 블로그 메인 페이지 이메일로 알려주십쇼…** 

추가로 Knox Vault는 펌웨어 무결성 등 기기의 비승인 상태 부팅을 감지해 하드웨어 기록을 남기는 Knox Warranty Bit와는 완전히 다르며, 각각 Knox라는 Samsung 보안 생태계/플랫폼의 하위 항목이라고 한다.

## 4. 마치며

이번엔 이렇게 Knox, TEEGRIS, Rich OS가 각각 무엇이고, 어떤 역할을 하는지 핵심만 짚어보았다. 세부적인 TEEGRIS/Knox의 공격 벡터나 분석 방법 등은 나중에 제대로 연구할 생각이 들면 하려고 한다. 언젠가 실기기를 더 확보하거나(당근 상주?), New 갤럭시를 장만해서 현역 선수가 은퇴하면 TEEGRIS부터 Knox까지 시도해 보지 않을까…

가능하다면? 조만간 제보한 취약점 일부에 대한 분석 글로 돌아오지 않을까 싶다.

## 5. References

- https://support.arm.com/compute-ip/trustzone-for-cortex-a
- https://developer.samsung.com/teegris/overview.html
- https://docs.samsungknox.com/admin/fundamentals/whitepaper/samsung-knox-mobile-security/system-security/knox-vault/
- https://allsoftwaresucks.blogspot.com/2019/05/reverse-engineering-samsung-exynos-9820.html
- https://blog.quarkslab.com/a-deep-dive-into-samsungs-trustzone-part-1.html
