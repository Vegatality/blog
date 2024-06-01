---
title: tanstack query의 키 관리 기법에 대하여
date: 2024-05-30
description: tanstack query의 계층 키에 대해 알아보자
tags:
  - tanstackquery
thumbnail:
---
## 개요
tanstack query는 유니크한 query key를 통해서 쿼리를 관리합니다.
그런데 primitive type이 아닌 reference type을 사용해도 실제 데이터가 변경되지 않는 이상 재요청을 보내지 않습니다.

```jsx
useQuery({ queryKey: ['user', [userId] ], ...})
```

```js
const a = [1, 2, 3]
const b = [1, 2, 3]

console.log(a === b) // ?
```
자바스크립트를 공부한 사람이라면 위 코드에서 `false`가 로그로 찍힌다는 것을 알 수 있습니다.

리액트의 렌더링 때마다 새로운 배열값이 `queryKey`에 할당될 것입니다.
매번 새로운 값이 들어오는 셈이니 당연히 매번 데이터가 변경, 새로운 키라고 인식하겠죠.
하지만 useQuery를 한 번이라도 사용했다면, 당연히 그렇게 동작하지 않는다는 것을 알 수 있습니다.
이를 통해 tanstack query가 내부적으로 queryKey에 할당된 값의 메모리 주소를 그대로 비교해서 데이터의 변경을 캐치하는 것은 아님을 예상할 수 있겠죠.
무엇인가 이를 위한 특별한 로직이 있는 것입니다.

<br />

## hashKey 함수
정답은 `hashKey`라는 간단한 함수에 있었습니다.
`haskKey`함수를 포함하여 내부적으로 사용하는 함수의 코드까지 가져와봤습니다.

```ts
/**
 * Default query & mutation keys hash function.
 * Hashes the value into a stable hash.
 */
export function hashKey(queryKey: QueryKey | MutationKey): string {
  return JSON.stringify(queryKey, (_, val) =>
    isPlainObject(val)
      ? Object.keys(val)
          .sort()
          .reduce((result, key) => {
            result[key] = val[key]
            return result
          }, {} as any)
      : val,
  )
}

function hasObjectPrototype(o: any): boolean {
  return Object.prototype.toString.call(o) === '[object Object]';
}

// Copied from: https://github.com/jonschlinkert/is-plain-object
export function isPlainObject(o: any): o is object {
  if (!hasObjectPrototype(o)) {
    return false;
  }

  // If has no constructor
  const ctor = o.constructor;
  if (ctor === undefined) {
    return true;
  }

  // If has modified prototype
  const prot = ctor.prototype;
  if (!hasObjectPrototype(prot)) {
    return false;
  }

  // If constructor does not have an Object-specific method
  if (!prot.hasOwnProperty('isPrototypeOf')) {
    return false;
  }

  // Handles Objects created by Object.create(<arbitrary prototype>)
  if (Object.getPrototypeOf(o) !== Object.prototype) {
    return false;
  }

  // Most likely a plain Object
  return true;
}
```


<br />

### JSON.stringify()의 두 번째 인자 활용

`hashKey` 함수의 코드를 보면 `JSON.stringify` 메서드의 두 번째 인자를 활용한 것을 볼 수 있습니다. 


[mdn](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)에 따르면, `JSON.stringify`의 문법은 다음과 같습니다.
```js
let json = JSON.stringify(value, [replacer, space])
```

- `value`
인코딩 하려는 값
- `replacer`
JSON으로 인코딩 하길 원하는 프로퍼티가 담긴 배열. 또는 매핑 함수 `function(key, value)`
- `space`
서식 변경 목적으로 사용할 공백 문자 수

<br />

두 번째 인자에 대한 좀 더 자세한 설명을 하자면 다음과 같습니다.

- 두 번째 인자는 **함수**나 혹은 JSON화 하려는 객체의 속성들을 **배열**로 넘겨야 한다.
- JSON으로 인코딩 하길 원하는 프로퍼티가 담긴 배열. 또는 매핑 함수 `function(key, value)`형태가 될 수 있다.
- 재귀적으로 처리하기 때문에 중첩된 프로퍼티도 처리 가능

<br />

다시 `hashKey`함수 코드로 돌아가 보겠습니다.
```ts
/**
 * Default query & mutation keys hash function.
 * Hashes the value into a stable hash.
 */
export function hashKey(queryKey: QueryKey | MutationKey): string {
  return JSON.stringify(queryKey, (_, val) =>
    isPlainObject(val)
      ? Object.keys(val)
          .sort()
          .reduce((result, key) => {
            result[key] = val[key]
            return result
          }, {} as any)
      : val,
  )
}

```

두 번째 인자로 콜백함수를 넣어준 것을 알 수 있습니다.
그리고 `sort`를 통해 **plainObject라면 정렬**을 하는 코드가 있네요.

이를 통해 우리가 만약 아래와 같이 두 가지 방식으로 queryKey를 지정하여 stringified 되었다고 해도 정렬이 되어 동일하게 취급될 수 있음을 알 수 있습니다.

```js
useQuery({ queryKey: ['user', { some: 1, something: 2} ], ...})
```

```js
useQuery({ queryKey: ['user', { something: 2, some: 1 } ], ...})
```


<br />

## 결론
- queryKey의 비교는 stringified된 string type 단에서 비교된다.
- 내부적으로 `hashKey`라는 함수를 사용하는데 `JSON.stringifiy` 메서드의  두 번째 인자 replacer를 활용하여 정렬을 통해 정확한 키의 비교를 수행한다.


## 레퍼런스
1. https://ko.javascript.info/json
2. https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify