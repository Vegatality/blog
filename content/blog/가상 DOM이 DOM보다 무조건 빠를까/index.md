---
title: 가상 DOM이 DOM을 조작하는 것보다 빠를까
date: 2024-06-07
description: 가상 DOM에 대해 React 라이브러리를 통해 알아봅시다.
tags:
  - javascript
  - react
thumbnail: ./virtual_dom_thumbnail(256x256).png
---
![](virtual_dom_thumbnail(256x256).png)

<br />

## DOM 이란?
우선 DOM이란 무엇일까요?

DOM은 
- **Document Object Model의 약자**로 문서 객체 모델 이라는 뜻을 가집니다.
- HTML이나 XML 문서를 브라우저가 해석하여 계층적 구조를 표현한 것입니다.
- 문서의 각 요소를 객체로 표현하게 되는데 이 객체를 노드라고 표현합니다.
- 노드에는 문서 노드(Document Node), 요소 노드(Element Node), 어트리뷰트 노드(attribute Node), 텍스트 노드(Text Node)가 있습니다.
- 노드는 최상위 문서 노드(Document Node)에서부터 각각의 요소 노드(Element Node)간에 계층적인 구조를 띄게 됩니다. 이 계층적인 구조를 트리 구조라고 부르고, 이를 DOM tree라고 부릅니다.
- 우리가 자바스크립트(Javascript)로 조작할 수 있는 것이 바로 이 완성된 DOM을 이루고 있는 노드(Node)들 입니다.
- 한 마디로 정리하자면, 문서를 해석하여 웹 페이지의 구조를 표현하는 프로그래밍 인터페이스라고 할 수 있습니다.

>[!INFO] 인터페이스란?<br />
>인터페이스란 서로 다른 시스템이나 컴포넌트 간에 상호 작용을 할 수 있도록 해주는 경계면이나 프로토콜을 말합니다. 즉, 인터페이스는 두 개체가 정보를 교환하고 기능을 공유할 수 있도록 해주는 규칙이나 방법을 정의합니다.

<br />
<br />
<br />

## Virtual DOM이란?
virtual DOM은 virtual DOM 그 자체로서는 DOM을 복제한 가상의 돔 그 이상 그 이하도 아닌 개념입니다.

![](Pasted_image_20240607181631.jpg)

<br />
<br />
<br />

## Virtual DOM의 기본적인 원리

아래 과정을 reconciliation(재조정)이라고 부릅니다.
1. real DOM으로부터 virtual DOM을 만든다.(virtual DOM은 메모리 상에 존재하는 하나의 객체)
2. 변화가 생기면 새로운 버전의 virtual DOM을 만든다.
3. old 버전의 virtual DOM과 new 버전의 virtual DOM을 비교한다.(diff algorithm)
4. 비교 과정을 통해서 발견한 차이점을 real DOM에 적용한다.

<br />
<br />

### virtual DOM이 변화를 감지하는 방법
리렌더링이 발생한다는 것은 특정 node에 변화가 생겼다는 것입니다. 그렇다면 이 변화를 어떻게 감지하는 것일까요? 변화를 감지하는 방법에는 크게 2가지가 있습니다.

<br />

#### 1) dirty checking
dirty checking은 <mark style="background: #BBFABBA6;">node tree를 재귀적으로 계속 순회</mark>하면서 어떤 노드에 변화가 생겼는지를 인식하는 방법입니다. 그리고 그 노드만 리렌더링을 시켜주면 되는 방식이었습니다. 이 방법은 angular.js가 사용하던 방법인데, 이렇게 하면 <mark style="background: #FF5582A6;">변화가 없을 때도 재귀적으로 노드를 탐색함으로써 불필요한 비용이 발생</mark>하고 성능적인 측면에서도 문제가 있었습니다.

<br />

#### 2) observable
observable은 변화가 생긴 노드가 관찰자에게 알림을 보내주는 방식입니다. 리액트의 경우에는 state에 변화가 생겼을 때, 리액트에게 렌더링을 해줘야한다는 것을 알려주는 방식으로 이루어집니다. 그리고 리액트는 알림을 받으면 렌더링을 시키죠. 이런 방식을 사용할 경우에 변화가 생기기 전까지는 아무일도 하지 않아도 됩니다. <mark style="background: #BBFABBA6;">노드에게 변화가 생겼다는 알림을 받으면 렌더링 한다.</mark> 아주 효율적인 방식이라고 할 수 있습니다.

<br />
<br />

#### observable의 문제점

그렇다면 이 observable에는 문제가 없었을까요? 아니요. 역시나 observable에도 문제점이 있었으니, <mark style="background: #FF5582A6;">변화에 대한 알림을 받으면 전체를 렌더링 시켜버린다</mark>는 것입니다. 전체를 렌더링시키는 것은 말그대로 엄청난 reflow-repaint 비용을 발생시킵니다. <mark style="background: #FFF3A3A6;">이 지점에 등장한 것이 바로 virtual dom</mark>이라는 것입니다.

<br />
<br />

#### virtual dom의 등장  
virtual dom은 말씀드렸다시피 메모리 상에 존재하는 하나의 객체입니다. 이제 리액트는 특정 state에 변화가 생겼다는 알림을 받으면 real dom 전체를 렌더링 시켜주는 것이 아니라, virtual dom을 렌더링 시킵니다. 즉, 메모리 상에서 가상 DOM에 해당하는 객체를 새로 만듭니다.
<br />


>[!INFO] 메모리란<br />
>컴퓨터에서 데이터를 저장하고 접근하는 데 사용되는 장치
>
>>메모리의 주요 역할
>- **데이터 저장**: 프로그램 실행 중 필요한 데이터를 일시적으로 저장합니다.
>- **빠른 접근**: CPU가 필요한 데이터를 빠르게 읽고 쓸 수 있도록 지원합니다.
>- **작업 효율성**: 여러 작업을 동시에 처리할 수 있도록 도와줍니다.
>
>> 메모리의 중요성
> 
>컴퓨터 성능에 큰 영향을 미치며, 충분한 메모리 용량과 속도는 프로그램 실행 속도와 작업 처리 능력을 향상시킵니다. 특히, 멀티태스킹 환경에서는 메모리의 역할이 더욱 중요해집니다.


<br />
<br />

## 브라우저를 렌더링 시키는 비용 vs 객체를 새로 만드는 비용

브라우저를 새롭게 렌더링 시키는 비용보다, 객체를 새로 만드는 비용이 훨씬 더 저렴합니다. 리액트는 이렇게 변화가 감지되면 real dom을 새롭게 렌더링 시키는 대신, virtual dom이라는 메모리상의 객체를 새로 만드는 방식을 선택했습니다. diffing 과정을 통해 변경사항을 담은 최종 virtual dom을 real dom에 적용시키는 방식으로 효율성을 높인 것입니다.

<br />
<br />


## React JSX 문법

컴포넌트를 작성할 때 우리는 JSX 문법으로 React Element를 아래와 같이 편리하게 작성할 수 있습니다.

```jsx
function App () {
 	return (
     <div id="root">
        <ul>
          <li>1</li>
          <li>2</li>
        </ul>
      </div> 
    )
}
```

이를 javascript compiler인 **babel**로 변환을 하면 아래와 같이 변환이 됩니다.
`React.createElement`라는 함수를 통해 순수 객체 형태로 변환을 시키는 것이죠.

```js
function App() {
  return /*#__PURE__*/React.createElement("div", {
    id: "root"
  }, /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, "1"), /*#__PURE__*/React.createElement("li", null, "2")));
}
```

그러니까 React Element란 사용자 인터페이스의 일부에 대한 표현입니다. 예를 들어 `<Greeting name="Taylor" />`와 `createElement(Greeting, { name: 'Taylor' })`는 모두 다음과 같은 객체를 생성합니다.

```jsx
// 약간 단순화됨
{
  type: Greeting,
  props: {
    name: 'Taylor'
  },
  key: null,
  ref: null,
}
```

위와 같이 만들어진 객체를 재조정 단계에서 비교하게 되는 것입니다.

<br />
<br />


## 레퍼런스
1. https://velog.io/@yesbb/virtual-dom%EC%9D%98-%EC%84%B1%EB%8A%A5%EC%9D%B4-%EB%8D%94-%EC%A2%8B%EC%9D%80%EC%9D%B4%EC%9C%A0
2. https://junilhwang.github.io/TIL/Javascript/Design/Vanilla-JS-Virtual-DOM/#_2-jsx