---
title: websocket(feat. socket.io, sockjs, stomp)
date: 2024-04-08
description: websocket에 대하여
tags:
  - javascript
thumbnail:
---

## TL;DR

- **websocket(ws)** 은 html5에서 표준이 된 기술명
  - 즉, 브라우저 기능이라고 보면 된다.
  - ws는 최근에 나온 것이기 때문에 하위 버전과 호환이 안 된다.
- **socket.io**은 해당 기술을 이용한 모듈명
  - 이 socket.io 모듈이 <mark style="background: #FFB8EBA6;">nodejs</mark> 프레임워크에서 동작을 한다.
  - 클라이언트 사이드, 서버 사이드 두 가지로 나뉘게 된다.
    - 서버 사이드는 nodejs에서 돌아가는 express 같은 프레임 워크이고, 클라이언트 사이드는 흔히 플러그인이라고 말하는 자바스크립트 websocket 통신 설정 및 제어를 api로 제공한다.
  - 하위 버전과 호환이 되지 않는 ws의 문제를 해결한다.
  - io는 ws를 기반으로 작동하되, 만일 클라이언트가 이를 지원하지 않는다면 하위버전에 맞는 폴링, 스트리밍과 같은 다양한 방법으로 통신을 시도한다.
  - <mark style="background: #FFB8EBA6;">React와 nodejs 간에는 socket.io를 사용</mark>한다.
- [socketJS(= sockJS)](https://github.com/sockjs/sockjs-client)
  - [Using STOMP with SockJS](https://stomp-js.github.io/guide/stompjs/rx-stomp/using-stomp-with-sockjs.html) - 근데 공식 문서에서는 이미 WebSocket이 보편화되어 있으므로 SockJS를 권장하지 않는다고 함.
  - <mark style="background: #FF5582A6;">websocket과 유사한 객체를 제공</mark>하는 브라우저 javascript 라이브러리
  - sockJS를 이용하면 websocket을 지원하지 않는 브라우저에서도 WebSocket과 유사한 방식으로 실시간 통신을 수행할 수 있 커버가능
  - 소켓을 지원하지 않는 브라우저 대응을 위해 `sockjs-client` 설치.
  - 서버 개발 시 <mark style="background: #BBFABBA6;">스프링</mark> 설정에서 일반 WebSocket으로 통신할지 SockJS 호환으로 통신할 지 결정 가능
  - 클라이언트는 `sockjs-client`를 통해 서버랑 통신
- **@stomp/stompjs(= stompjs)**
  - [STOMP](#STOMP%20란?)는 Simple Text Oriented Messaging Protocol의 약자이다.
  - [공식 레포지토리](https://github.com/stomp-js/stompjs)
  - [공식 문서](https://stomp-js.github.io/)
  - WebSocket을 통해 STOMP 브로커에 연결할 수 있게 해주는 라이브러리(WebSocket 위에서 돌아간다는 뜻임.)
  - Javascript and Typescript Stomp client for Web browsers and node.js apps
  - Stomp는 HTTP에서 모델링 되는 Frame 기반 프로토콜
  - 메세지 전송을 효율적으로 하기 위해 탄생한 프로토콜(WebSocket 위에서 동작)
  - 클라이언트와 서버가 전송할 메시지의 유형, 형식, 내용들을 정의하는 메커니즘
  - 텍스트 기반 프로토콜로 subscriber, sender, broker를 따로 두어 처리를 한다.

보통 Node.js를 사용할 때 socket.io를 주로 사용하고,
spring을 사용할 때 sockJS, STOMP를 주로 사용한다.

**단, sockJS는 stompjs 라이브러리에서 권장하고 있지 않다.** 왜냐하면, 이제는 WebSocket api를 대부분 지원([can I use WebSocket ?](https://caniuse.com/?search=WebSocket))하고 있기 때문이다.
정말 구형 브라우저까지 지원할거면 [example with sockJS 카테고리](<#[Example with sockJS](https //stomp-js.github.io/guide/stompjs/rx-stomp/using-stomp-with-sockjs.html example-with-stompjs)>)를 보도록 하자.

<br />
<br />
<br />

## Browser native WebSocket api

### 웹소켓(WebSocket) 프로토콜이란?
웹소켓(WebSocket)은 클라이언트와 서버(브라우저와 서버)를 연결하고 실시간으로 통신이 가능하도록 하는 통신 프로토콜이다.
웹소켓은 하나의 TCP(Transmission Control Protocol) 접속에 전이중(duplex) 통신 채널을 제공한다.

>[!TIP] 전이중(duplex) 통신 채널
>
>데이터가 양방향으로 전송되는 통신 채널을 의미한다.
>양쪽에서 데이터를 동시에 송수신할 수 있다.

<br />

### HTTP와의 차이점은?
기존 HTTP는 단방향 통신이다.
클라이언트가 Request를 보내면 서버가 클라이언트로 Response를 보내는 방식으로 동작했다.

웹소켓은 연결이 이루어지면 클라이언트의 요청 없이도 서버로부터 데이터를 수신할 수 있다. 웹소켓은 이전 요청 상태를 기억하지 않는 무상태성(Stateless)을 가지는 HTTP와는 다르게 상태(Statefull) 프로토콜이다. 그렇기 때문에 한 번 연결되면 같은 연결을 이용해 통신하므로 TCP Connection 비용을 아낄 수 있다.

<br />

### 웹소켓의 동작

<div style="display: flex; flex-direction: row; justify-conent: center">
	<img src="https://upload.wikimedia.org/wikipedia/commons/1/10/Websocket_connection.png" style="width: 50%; justify-self: center"/>
</div>

<br />

웹소켓은 HTTP port 80, HTTPS는 port 443 위에서 동작한다.
웹소켓은 TCP 연결처럼 HandShake 방식을 사용해서 연결된다.
이 때 HTTP 업그레이드(HTTP Upgrade) 헤더를 사용해서 HTTP 프로토콜에서 웹소켓 프로토콜로 변경한다.

즉, HTTP 프로토콜을 사용하지 않는 것은 아니란 것이다.
최초 접속시에는 HTTP 프로토콜을 사용해서 핸드셰이킹을 한다.

연결이 맺어진 이후에는 어느 한 쪽이 연결을 끊지 않는 한 영구적인 동일한 채널이 맺어지고, HTTP 프로토콜이 웹소켓 프로토콜로 변경된다.

이 때 데이터를 암호화하기 위해 ws가 아닌 wss 프로토콜을 사용할 수 있다.

<br />

### 단점

WebSocket 프로토콜은 Text 또는 Binary 두 가지 유형의 메시지 타입은 정의하지만 메시지의 내용에 대해서는 정의하지 않는다.
즉, WebSocket만 사용해서 구현하게 되면 해당 메시지가 어떤 요청인지, 어떤 포맷으로 오는지, 메시지 통신 과정을 어떻게 처리해야 하는지 정해져 있지 않아 일일이 구현해야 한다.

<br />

### 문제해결

따라서 STOMP(Simple Text Oriented Messaging Protocol)라는 프로토콜을 서브 프로토콜로 사용한다.

<br />

### STOMP 란?

<mark style="background: #BBFABBA6;">STOMP는 클라이언트와 서버가 서로 통신하는 데 있어 메시지의 형식, 유형, 내용 등을 정의해주는 프로토콜</mark>이라고 할 수 있다.
STOMP를 사용하게 되면 단순한 Binary, Text가 아닌 규격을 갖춘 메시지를 보낼 수 있다.
스프링은 **spring-websocket** 모듈을 통해서 STOMP를 제공하고 있다.

<br />

### stompjs는 WebSocket 위에서 돌아간다?

stompjs는 STOMP 프로토콜을 사용할 수 있는 라이브러리이다.
그리고 이 라이브러리는 WebSocket을 기본적으로 사용하는 라이브러리이다.
STOMP Client api 소스코드를 뜯어보면 다음과 같이 내부적으로 WebSocket을 사용하려는 코드가 있다. 공식 문서에서 [소스 코드를 친절하게 제공](https://stomp-js.github.io/api-docs/latest/classes/Client.html#source)해놔서 볼 수 있다.

```ts
private _createWebSocket(): IStompSocket {
    let webSocket: IStompSocket;

    if (this.webSocketFactory) {
      webSocket = this.webSocketFactory();
    } else if (this.brokerURL) {
      webSocket = new WebSocket(
        this.brokerURL,
        this.stompVersions.protocolVersions()
      ); // 이제 웬만한 브라우저에서는 다 지원해서 기본값이 됨.
    } else {
      throw new Error('Either brokerURL or webSocketFactory must be provided');
    }
    webSocket.binaryType = 'arraybuffer';
    return webSocket;
  }
```

<br />
<br />
<br />

## Stompjs 사용 예시

[공식 문서](https://stomp-js.github.io/)가 너무나도 잘 나와있다.
그 중 일부를 보자.
검색해보면 옛날 것들(3~4 버전대)이 너무 많이 나온다.
그렇기 때문에 공식 문서에서 최신 버전으로 사용하는 방법을 가져왔다.

### [upgrading from version 3/4](https://stomp-js.github.io/guide/stompjs/upgrading-stompjs.html)

**Old version**

```ts
const client = Stomp.client('ws://localhost:15674/ws');

client.debug = function (str) {
  console.log(str);
};

client.heartbeat.incoming = 4000;
client.heartbeat.outgoing = 4000;

client.reconnect_delay = 5000;

client.connect('user', 'password', function () {
  // Do something
});
```

**Updated version**

```ts
const client = new StompJs.Client({
  brokerURL: 'ws://localhost:15674/ws',
  connectHeaders: {
    login: 'user',
    passcode: 'password',
  },
  debug: function (str) {
    console.log(str);
  },
  reconnectDelay: 5000,
  heartbeatIncoming: 4000,
  heartbeatOutgoing: 4000,
});

client.onConnect = function (frame) {
  // Do something
};

client.activate();
```

<br />
<br />
<br />

## [Example with sockJS](https://stomp-js.github.io/guide/stompjs/rx-stomp/using-stomp-with-sockjs.html#example-with-stompjs)

위쪽에서도 얘기했다시피 이제는 WebSocket이 보편화되어 있기 때문에 **SockJS를 쓰는 것을 권장하지 않는다.**
그러나 정말 구형의 브라우저까지 지원하고 싶다면, 아래와 같이 사용하면 된다고 한다.

```ts
const client = new StompJs.Client({
  brokerURL: 'ws://localhost:15674/ws',
  connectHeaders: {
    login: 'user',
    passcode: 'password',
  },
  debug: function (str) {
    console.log(str);
  },
  reconnectDelay: 5000,
  heartbeatIncoming: 4000,
  heartbeatOutgoing: 4000,
});

// Fallback code
if (typeof WebSocket !== 'function') {
  // For SockJS you need to set a factory that creates a new SockJS instance
  // to be used for each (re)connect
  client.webSocketFactory = function () {
    // 🚨 Note that the URL is different from the WebSocket URL
    return new SockJS('http://localhost:15674/stomp');
  };
}

client.onConnect = function (frame) {
  // Do something, all subscribes must be done is this callback
  // This is needed because this will be executed after a (re)connect
};

client.onStompError = function (frame) {
  // Will be invoked in case of error encountered at Broker
  // Bad login/passcode typically will cause an error
  // Complaint brokers will set `message` header with a brief message. Body may contain details.
  // Compliant brokers will terminate the connection after any error
  console.log('Broker reported error: ' + frame.headers['message']);
  console.log('Additional details: ' + frame.body);
};

client.activate();
```

<br />
<br />
<br />

### WebSocket api를 지원하는 브라우저에서는 SockJS가 어떻게 동작할까?

일단 위 코드와 같이 작성하되, 궁금증이 생겼다.
SockJS가 WebSocket도 지원하는 것 같은데 조건문 분기 처리 없이 그냥 SockJS를 사용하면 안될까?
SockJS를 쓰면 WebSocket api를 지원하는 브라우저에서 WebSocket api를 우선 제공하지 않는 문제가 있나?

역시 똑같은 것을 궁금해하는 사람이 있었다.
[Does SockJS emulate websockets even on a browser that supports websockets?](https://stackoverflow.com/questions/24584284/does-sockjs-emulate-websockets-even-on-a-browser-that-supports-websockets)를 참고해보면, native WebSocket을 먼저 사용하려고 하되, 없으면 SockJS에서 WebSocket과 유사한 api를 expose한다고 한다.

그냥 SockJS를 사용하면 안될까?

그럼에도 불구하고 if문을 통해 webSocketFactory를 정의하여 WebSocket api를 사용하려고 하는 까닭은 html5에서 등장한 WebSocket api가 공식적으로 웹 소켓을 사용하는 방법일뿐더러 WebSocket으로 했을 때와 SockJS로 했을 때의 속도? 면에서 차이가 있기 때문이라고 추정한다(SockJS에서 구현된 방식은 websocket처럼 동작하도록 모방된 방식.).

<br />
<br />
<br />

## 참고

1. [웹 소켓에 대해 알아보자 - 실전 편](https://tecoble.techcourse.co.kr/post/2021-09-05-web-socket-practice/) - 테코
2. [WebSocket과 Socket.io](https://d2.naver.com/helloworld/1336)- 네이버 옛날 글
3. [Stomp.js 를 이용한 WebSocket 연동](https://medium.com/@woal9844/stomp-js-%EB%A5%BC-%EC%9D%B4%EC%9A%A9%ED%95%9C-websocket-%EC%97%B0%EB%8F%99-c9f0ef6ab540)- client 사이드 코드 있음.
4. [실시간 통신 / 채팅 기능 Web Socket 과 Socket.io](https://dev-coderkim.tistory.com/140)- 정리 잘 되어 있음
