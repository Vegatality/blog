---
title: accessToken과 refreshToken 안전하게 관리하기
date: 2024-04-23
description: token을 안전하게 관리하는 방식에 대하여 알아봅니다.
tags:
  - "#javascript"
thumbnail:
---
# 개요
토큰 인증 방식에서 주로 사용되는 방식인 accessToken과 refreshToken을 역할을 간단하게 알아보고 각각 어떻게 관리해야 안전한 방식인지 살펴보도록 하겠습니다.

<br />
<br />

# AccessToken
AccessToken은 유저에게 특정 권한을 주기 위한 목적으로 사용되는 토큰을 의미합니다. AccessToken에는 유저에 대한 정보를 암호화한 문자열이 담겨있습니다.

아무런 장치 없이 단독으로 사용하면 안전성 문제가 생길 수도 있습니다.
토큰의 만료 기간을 길게 잡으면 토큰을 누군가 가로챘을 때 더 오랫동안 특정 권한을 갖는 유저 행세를 할 수 있기 때문에 위험합니다.
그렇다고 해서 만료 기간을 짧게 잡으면 이메일과 비밀번호로 인증을 너무 자주 해야 해서 유저에게 귀찮을 일이 될 수 있고 위험할 수 있습니다.


이 문제를 어느 정도 해소하기 위해 refreshToken이라는 것을 같이 사용합니다.
refreshToken은 accessToken이 만료됐을 때, 이메일 비밀번호를 사용하지 않고 accessToken을 새롭게 발급받는 데 사용되는 토큰입니다. 어떻게 사용되는지 조금 더 자세히 알아보겠습니다.

<br />
<br />

# RefreshToken
먼저 유저가 로그인을 하기 위해서 리퀘스트로 서버에 이메일과 비밀번호를 보내고, 서버가 이걸 확인했다고 하겠습니다. 그러면 서버는 클라이언트에서 access와 refresh, 두 가지의 토큰을 보내줄 수 있습니다.

Access 토큰이 소유자가 특정 권한을 가질 수 있게 하는 토큰이라면, refresh 토큰은 이메일과 비밀번호를 사용하지 않고 새로운 access 토큰은 발급받을 수 있게 하는 토큰입니다.

그러니까 <mark style="background: #ABF7F7A6;">access 토큰을 사용하다가 만료</mark>가 돼서 더 이상 리퀘스트를 인증할 수 없게 되는 경우가 생겼다고 할게요. 그럼 클라이언트는 <mark style="background: #ABF7F7A6;">access 토큰을 새롭게 발급받는 URL에 새로운 GET 리퀘스트</mark>를 보냅니다. 이때 <mark style="background: #ABF7F7A6;">body에 refresh 토큰을 함께 보내죠.</mark> 그럼 서버는 refresh 토큰이 유효한 걸 확인한 후, 새로운 access 토큰을 발급한 후, 리스폰스로 클라이언트에게 돌려줍니다.

일반적으로 refresh 토큰이 access 토큰보다 만료 기간이 더 깁니다. 정말 설정하기 나름이지만 예를 들어 access 토큰의 만료 기간이 10분이면 refresh 토큰은 24시간 이렇게 시간을 설정할 수 있습니다.

<mark style="background: #FFB86CA6;">access 토큰의 만료 기간이 짧기 때문에</mark> 서버로 토큰을 보낼 때 누군가 이 정보를 가로챈다고 해도 최대 10분까지만 다른 유저 행세를 할 수 있습니다. 만약 누군가 가로챈다고 해도 그렇게 <mark style="background: #FFB86CA6;">오래 사용할 수는 없으니 조금 더 안전</mark>하겠죠?

<br />
<br />

# Refresh Token이 탈취당한다면?
그런데 이 Refresh Token 자체가 탈취당한다면 어떻게 할까요? 공격자는 이 토큰의 유효 기간만큼 다시 Access Token을 생성해서 다시 정상적인 사용자인 척 위장할 수 있습니다. 그렇기 때문에 여기서는 서버측의 검증 로직이 필요합니다. [스택오버플로우의 답변](https://stackoverflow.com/questions/32060478/is-a-refresh-token-really-necessary-when-using-jwt-token-authentication)을 보면 다음과 같은 방법을 제안하고 있습니다.

- <mark style="background: #ABF7F7A6;">데이터베이스에 각 사용자에 1대1로 맵핑되는 Access Token, Refresh Token 쌍을 저장</mark>한다.
- 정상적인 사용자는 기존의 Access Token으로 접근하며 서버측에서는 데이터베이스에 저장된 Access Token과 비교하여 검증한다.
- 공격자는 탈취한 Refresh Token으로 새로 Access Token을 생성한다. 그리고 서버측에 전송하면 서버는 데이터베이스에 저장된 Access Token과 공격자에게 받은 Access Token이 다른 것을 확인한다.
- 만약 데이터베이스에 저장된 토큰이 아직 만료되지 않은 경우, 즉 굳이 Access Token을 새로 생성할 이유가 없는 경우 서버는 Refresh Token이 탈취당했다고 가정하고 두 토큰을 모두 만료시킨다.
- 이 경우 정상적인 사용자는 자신의 토큰도 만료됐으니 다시 로그인해야 한다. 하지만 공격자의 토큰 역시 만료됐기 때문에 공격자는 정상적인 사용자의 리소스에 접근할 수 없다.

이 때 <mark style="background: #BBFABBA6;">중요한 점은</mark> 발급된 토큰 자체는 모든 토큰 기반 인증 방식이 그렇듯이 그냥 그 JWT 문자열 자체로 존재하는 것이기 때문에 <mark style="background: #BBFABBA6;">클라이언트나 서버측에서 전역적으로 만료시킬 수 있는 개체가 아니라는 점입니다.</mark> 그렇기 때문에 <mark style="background: #BBFABBA6;">토큰의 유효 기간이 지나기 전까지는 토큰을 NoSQL 같은 데이터베이스에 저장하여 관리할 필요가 있습니다.</mark>

<br />

## 만약 공격자가 Refresh Token을 탈취해서 Access Token을 먼저 재발급 받는다면?
만약 공격자가 Refresh Token을 탈취해서 정상적인 사용자가 Access Token을 다시 발급받기 전에 자기가 먼저 Access Token을 생성한다면 어떻게 될까요? 이 경우에도 Request 시 Access Token의 충돌이 일어나기 때문에 서버측에서는 두 토큰을 모두 폐기(만료 대신 폐기가 어울리는 용어인 것 같다)해야 할 것입니다. 그래서 [ietf 문서](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps-00#section-8)에서는 <mark style="background: #BBFABBA6;">아예 Refresh Token도 Access Token과 같은 유효 기간을 가지도록 하여 사용자가 한 번 Refresh Token으로 Access Token을 발급받았으면 Refresh Token도 다시 발급받도록 하는 것을 권장</mark>하고 있습니다.

쉽게 말해서 이전 AccessToken이 만료되지 않았는데 굳이 AccessToken을 재발급받아 새로운 AccessToken으로 요청이 들어온다면 두 AccessToken 모두 폐기 처리를 하고 요청을 받아들이지 않는다는 방식입니다.
이와 매핑되어 있는 RefreshToken도 마찬가지로 폐기처리가 됩니다.

<br />

## 만약 Access Token과 Refresh Token을 둘 다 탈취당한다면?

그럼 만약에 공격자가 Access Token, Refresh Token을 <mark style="background: #FF5582A6;">둘 다 탈취한다면 어떻게 할까요? 이 때는 방법이 없습니다.</mark> 프론트엔드나 백엔드 로직을 강화하여 토큰이 유출되지 않도록 보완하는 수 밖에 없을 것입니다.

<br />
<br />

# 토큰의 저장 장소

<mark style="background: #BBFABBA6;">서버에서는 NoSQL이나 기타 데이터베이스에 저장</mark>할 수 있습니다. 그럼 <mark style="background: #ADCCFFA6;">클라이언트에서는</mark> 어디에 저장할 수 있을까요? 브라우저 환경의 경우 흔히 생각하는 방법은 쿠키, 로컬 스토리지 등 다양한 곳이 있지만 [스택오버플로우](https://stackoverflow.com/questions/57650692/where-to-store-the-refresh-token-on-the-client)에서는<mark style="background: #ADCCFFA6;"> http-only 속성이 부여된 쿠키에 저장하는 것을 권장</mark>하고 있습니다.

`http-only` 속성이 부여된 쿠키는 자바스크립트 환경에서 접근할 수 없습니다.그래서 XSS나 CSRF가 발생하더라도 토큰이 누출되지 않습니다. 일반 쿠키나 브라우저의 로컬 스토리지는 자바스크립트로 자유롭게 접근할 수 있기 때문에 보안 측면에서는 권장되지 않습니다.

이제 `httpOnly` 옵션을 통해 브라우저에서 쿠키에 접근하는 것은 방지할 수 있습니다. 하지만 쿠키는 HTTP 헤더를 통해 전송되고, 와이어 샤크 등과 같은 프로그램으로 네트워크 감청을 할 수 있다는 것은 널리 알려진 사실입니다. 이러한 통신 상 정보 유출을 방지하기 위해 <mark style="background: #ADCCFFA6;">HTTPS 프로토콜을 사용하여 데이터를 암호화</mark>할 수 있습니다. 그리고 <mark style="background: #ADCCFFA6;">Secure 옵션</mark>은 HTTPS 상에서 암호화된 요청일 경우에만 쿠키를 전송하도록 합니다.


<br />
<br />

# 레퍼런스
1. https://ko.javascript.info/cookie
2. https://seongminn.netlify.app/computer-science/cookie-xss/
3. https://velog.io/@park2348190/JWT%EC%97%90%EC%84%9C-Refresh-Token%EC%9D%80-%EC%99%9C-%ED%95%84%EC%9A%94%ED%95%9C%EA%B0%80

