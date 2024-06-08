---
title: any는 유해한 것으로 고려됩니다. 단 이 경우만 제외하고 말이죠
date: 2024-04-08
description: typescript any에 대한 오해
tags:
  - typescript
thumbnail: ./tistory_thumbnail(256x256).png
---
![typescript any](tistory_thumbnail(256x256).png)


## 개요

`any`는 다들 아시다시피 슈퍼 타입이든 서브 타입이든 고려하지 않고 할당이 가능한 강력하지만 위험한 타입입니다.

사용하게 되면 런타임이 되어서야 에러를 볼 수 있는 위험이 생길 수 있죠.

```ts
const myFunction = (input: any) => {
  input.someMethod();
};

myFunction('abc'); // This will fail at runtime!
```

그래서 `any`를 사용하는 것은 대부분 유해하기 때문에 권장되지 않습니다. 그러나 `any`를 예외적으로 사용해야 하는 경우가 있습니다.

<br />
<br />
<br />

## [Type Argument Constraints](https://www.totaltypescript.com/any-considered-harmful#type-argument-constraints)

예를 들어 우리가 `ReturnType` 빌트인 유틸리티 타입을 수행하고 싶다고 가정을 해보겠습니다.

우리는 type 전달인자로 함수 타입을 가지는 제네릭을 생성해야 합니다.
`any`를 쓰지 않도록 제한한다면, 아마도 `unknown`을 아래와 같이 작성하게 될 것입니다.

```ts
type ReturnType<T extends (...args: unknown[]) => unknown> =
  // Not important for our explanation:
  T extends (...args: unknown[]) => infer R ? R : never;
```

위 코드는 전달인자가 없으면 잘 작동하는 것처럼 보입니다.

<br />
<br />

```ts
const myFunction = () => {
  console.log('Hey!');
};

type Result = ReturnType<typeof myFunction>;
//    ^ type Result = void
```

그러나 전달인자를 전달하면 에러가 뜨게 됩니다.

```ts
const myFunction = (input: string) => {
  console.log('Hey!');
};

type Result = ReturnType<typeof myFunction>;
```

```
Type '(input: string) => void' does not satisfy the constraint '(...args: unknown[]) => unknown'.
  Types of parameters 'input' and 'args' are incompatible.
    Type 'unknown' is not assignable to type 'string'.

```

<br />
<br />

이는 사실 함수 매개변수 타입을 `unknown`으로 바꾸면 해결되기는 합니다.

```ts
const myFunction = (input: unknown) => {
  console.log('Hey!');
};

type Result = ReturnType<typeof myFunction>;
//    ^ type Result = void
```

그러나 이 함수는 `unknown` 전달인자만 허락하는 함수가 되어버렸습니다. 이건 우리가 원하는 방향이 아닙니다. 우리는 어떠한 함수에서라도 정상적으로 작동하기를 원합니다.

여기에 대한 해결법은 `any[]`를 전달인자 제약사항으로 사용하는 것입니다.:

```ts
type ReturnType<T extends (...args: any[]) => any> = T extends (...args: any[]) => infer R ? R : never;

const myFunction = (input: string) => {
  console.log('Hey!');
};

type Result = ReturnType<typeof myFunction>;
//     ^ type Result = void
```

이제 원하는대로 동작합니다. 우리는 함수가 어떤 타입을 전달인자로 받든 상관하지 않는다고 선언한 것입니다.

이 방식은 안전합니다. 그 이유는 우리가 넓은 타입을 선언한 것이 의도적이기 때문입니다. 우리는 "함수이기만 하면, 함수가 어떤 것을 받든 상관 안 해"라고 말하는 것입니다. 이게 바로 `any`의 안전한 사용 예시입니다.

<br />
<br />
<br />

## [Returning Conditional Types From Generic Functions](https://www.totaltypescript.com/any-considered-harmful#returning-conditional-types-from-generic-functions)

어떤 곳에서는 TypeScript의 좁아지는 기능이 우리가 원하는 만큼 좋지 않습니다. 조건에 따라 다른 유형을 반환하는 함수를 만들고 싶다고 가정해 보겠습니다:

```ts
const youSayGoodbyeISayHello = (input: 'hello' | 'goodbye') => {
  if (input === 'goodbye') {
    return 'hello';
  } else {
    return 'goodbye';
  }
};

const result = youSayGoodbyeISayHello('hello');
//     ^ const result: "hello" | "goodbye"
```

이 함수는 우리가 원하는대로 작동하지 않고 있어요. 우리는 "goobye"에는 "hello"가 나오고, "hello"에는 "goodbye"가 나오기를 원하고 있습니다. 그러나 현재, `result`는 `hello | goodbye`로 타입되어 있습니다.

<br />
<br />

리턴되는 타입도 런타임 때 로직과 동일하게 미러링 처리하면 될까요?

```ts
const youSayGoodbyeISayHello = <TInput extends 'hello' | 'goodbye'>(
  input: TInput,
): TInput extends 'hello' ? 'goodbye' : 'hello' => {
  if (input === 'goodbye') {
    return 'hello';
    // Type '"hello"' is not assignable to type 'TInput extends "hello" ? "goodbye" : "hello"'.
  } else {
    return 'goodbye';
    // Type '"goodbye"' is not assignable to type 'TInput extends "hello" ? "goodbye" : "hello"'.
  }
};
```

이렇게 해도 에러가 뜹니다. 타입스크립트는 런타임 로직의 조건 타입과 매칭되지 않는 것으로 보입니다.

우리는 이를 `as`를 활용해서 고칠 수 있습니다. 올바른 조건 타입을 가리키도록 강제화하는 것이죠.

```ts
const youSayGoodbyeISayHello = <TInput extends 'hello' | 'goodbye'>(
  input: TInput,
): TInput extends 'hello' ? 'goodbye' : 'hello' => {
  if (input === 'goodbye') {
    return 'hello' as TInput extends 'hello' ? 'goodbye' : 'hello';
  } else {
    return 'goodbye' as TInput extends 'hello' ? 'goodbye' : 'hello';
  }
};
```

공용 제네릭 타입으로 로직을 추출해서 깔끔하게 만들 수도 있습니다.

```ts
type YouSayGoodbyeISayHello<TInput extends 'hello' | 'goodbye'> = TInput extends 'hello' ? 'goodbye' : 'hello';

const youSayGoodbyeISayHello = <TInput extends 'hello' | 'goodbye'>(input: TInput): YouSayGoodbyeISayHello<TInput> => {
  if (input === 'goodbye') {
    return 'hello' as YouSayGoodbyeISayHello<TInput>;
  } else {
    return 'goodbye' as YouSayGoodbyeISayHello<TInput>;
  }
};
```

<br />
<br />

그런데 이런 경우에는, `as any`를 사용하는 것이 더 적합할 수도 있습니다.:

```ts
const youSayGoodbyeISayHello = <TInput extends 'hello' | 'goodbye'>(
  input: TInput,
): TInput extends 'hello' ? 'goodbye' : 'hello' => {
  if (input === 'goodbye') {
    return 'hello' as any;
  } else {
    return 'goodbye' as any;
  }
};
```

네, 맞아요. 이게 우리의 함수를 type-safe하지 않게 만듭니다. 우리는 함수에서 실수로 `bonsoir`를 return할 수도 있겠죠.

그러나 이러한 경우에는, `as any`를 사용하고 이 함수의 동작을 위한 unit test를 작성하는 것이 종종 더 낫습니다.
타입스크립트는 이러한 사항을 검사하는 데 한계가 있기 때문에 이렇게 하는 것이 타입 안전성에 거의 근접한 경우가 많습니다.

<br />
<br />
<br />

## 결론

한 가지 의문이 남습니다. 코드베이스에서 `any`를 금지해야 할까요? 제 생각에는 '예'라고 대답해야 한다고 생각합니다. ESLint 규칙을 설정하여 사용을 방지하고 가능한 한 사용을 피해야 합니다.

하지만 `any`가 꼭 필요한 경우도 있습니다. 이러한 경우 `eslint-disable`을 사용하여 우회할 가치가 있습니다. 따라서 이 문서를 북마크에 추가하고 사용해야 할 필요가 있을 때 PR에 첨부하세요.

<br />
<br />
<br />

## 레퍼런스

1. https://www.totaltypescript.com/any-considered-harmful
