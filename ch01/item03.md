# 코드 생성과 타입이 관계 없음을 이해하기

타입스크립트 컴파일러는 크게 두 가지 역할을 합니다.

1. 최신 타입스크립트/자바스크립트를 브라우저에서 동작할 수 있도록 구버전의 자바스크립트로 트랜스파일 합니다.
2. 코드의 타입 오류를 체크 합니다.

재밌는 점은 두 가지가 완벽히 독립적이라는 사실입니다. 타입스크립트가 자바스크립트로 변환될 때 코드 내의 타입에는 영향을 주지 않습니다. 또한 그 자바스크립트의 실행 시점에도 타입은 영향을 주지 않습니다.

타입스크립트 컴파일러가 수행하는 두 가지 역할을 보면, 타입스크립트가 *할 수 있는 일*과 *할 수 없는 일*을 볼 수 있습니다.

## 타입에 오류가 있는 코드도 컴파일이 가능합니다.
컴파일은 타입 체크와 독립적으로 동작하기 때문에, 타입 오류가 있는 코드도 컴파일이 가능합니다.

### 타입스크립트 코드
```ts:test.ts
let x = 'hello'
x = 1234
```

```bash
$ tsc test.ts
```

### ES5 변환된 코드
```js
var x = 'hello';
x = 1234;
```

타입스크립트의 오류는 경고와 같습니다. 문제가 될 만한 부분을 알려주지만, 그렇다고 빌드를 멈추지는 않습니다. 만약 오류가 있을 때 컴파일하지 않으려면, `tsconfig.json` 파일에서 `noEmitOnError를` 설정하면 됩니다.

## 런타임에서는 타입 체크가 불가능합니다.

타입스크립트의 타입은 Erasable 합니다. 즉, 인터페이스, 타입, 타입 구문은 전부 제거가 됩니다. 그렇다면 런타임에서 타입을 체크하는 방법은 없을까요? 있습니다. 

첫 번째는 `in` 연산자로 가능합니다. 다음 예제를 통해서 알아봅시다.

```ts
interface Square {
  width: number
}

interface Rectangle extends Square {
  height: number
}

type Shape = Square | Rectangle

function calculateArea(shape: Shape) {
  if ('height' in shape) {
    // 타입이 Rectangle
    return shape.width * shape.height
  } else {
    // 타입이 Square
    return shape.width * shape.width
  }
}
```

두 번째는 '태그 기법'을 통해서 가능합니다. 다음 예제를 봅시다.

```ts
interface Square {
  kind: 'square'
  width: number
}

interface Rectangle {
  kind: 'rectangle'
  weight: number
  height: number
}

type Shape = Square | Rectangle

function calculateArea(shape: Shape) {
  if (shape.kind === 'rectangle') {
    // 타입이 Rectangle
    return shape.width * shape.height
  } else if (shape.kind === 'square') {
    // 타입이 Square
    return shape.width * shape.width
  }
}
```

이 기법은 런타임에 타입 정보를 쉽게 유지할 수 있습니다.

세 번째는 런타임에서는 사용할 수 있도록 `class`를 이용해 타입을 만드는 방법입니다. 다음 예제를 봅시다.

```ts
class Square {
  constructor(public width: number) {}
}

class Rectangle extends Square {
  constructor(public width: number, public height: number) {
    super(width)
  }
}

type Shape = Square | Rectangle

function calculateArea(shape: Shape) {
  if (shape instanceof Rectangle) {
    // 타입이 Rectangle
    return shape.width * shape.height
  } else if (shape.kind === 'square') {
    // 타입이 Square
    return shape.width * shape.width
  }
}
```

`class`는 타입과 값으로 사용할 수 있습니다. `type Shape = Square | Rectangle`은 타입으로 참조되지만, `shape instanceof Rectangle`는 값으로 참조됩니다.

## 타입 연산은 런타임에 영향을 주지 않습니다.

`string` 또는 `number` 타입인 값을 항상 `number`로 정제하는 경우를 가정해봅시다. 다음 코드는 타입 체커를 통과하지만, 잘못된 방법입니다.

```ts
function asNumber(value: string | number): number {
  return value as number
}
```

타입 단언문(`as`)을 이용해서 함수를 만들었습니다. 다음은 자바스크립트로 변환된 결과입니다.

```js
function asNumber(value) {
  return value
}
```

변환된 코드에는 아무런 타입 연산이 없습니다. `as`는 타입 연산이고, 런타임에는 아무런 영향을 주지 않습니다. 값을 정제하기 위해서는 런타임의 타입을 체크해야 하고 자바스크립트 연산을 통해 변환을 수행해야합니다.

```ts
function asNumber(value: string | number): number {
  return typeof value === 'string' ? Number(value) : value
}
```

## 런타임 타입은 선언된 타입과 다를 수 있습니다.

다음 코드를 보고 `console.log`까지 실행될 수 있을지 생각해봅시다.

```ts
function setLightSwitch(value: boolean) {
  switch (value) {
    case true:
      turnLightOn();
      break;
    case false:
      turnLightOff();
      break;
    default:
      console.log("실행되지 않을까 봐 걱정이 됩니다.");
      break;
  }
}
```

타입스크립트는 일반적으로 실행되지 못하는 죽은 코드를 찾아냅니다. 그러나 여기서는 `strict`를 설정하더라도 찾아내지 못하죠. 그러면 마지막 부분을 실행할 수 있는 경우는 무엇일까요?

`:boolean` 타입 선언문이라는 것을 주목해봅시다. 타입스크립트의 타입이기 때문에 boolean은 런타임에서 사라지게 됩니다. 자바스크립트였다면 실수로 `setLightSwitch`를 "ON"으로 호출할 수도 있었을 것입니다.

순수 타입스크립트에서도 마지막 코들 실행하는 벙법이 있습니다. 다음 코드를 봅시다.

```ts
interface LightApiResponse {
  lightSwitchValue: boolean
}

async function setLight() {
  const response = await fetch('/light')
  const result: LightApiResponse = await response.json()
  setLightSwitch(result.lightSwitchValue)
}
```

`/light`를 요청하면 결과로 `LightApiResponse`를 반환하라고 선언했습니다. 그러나 실제로 그렇지 않을 수 있습니다. API를 잘못 파악해서 `lightSwitchValue`가 실제로 문자열이었다면, 런타임에서는 `setLightSwitch` 함수까지 전달될 것입니다. 또는 API가 변경되어 `lightSwitchValue`가 문자열이 되는 경우도 있을 것입니다. 

타입스크립트에서는 런타임 타입과 선언된 타입이 맞지 않을 수 있습니다. 선언된 타입이 언제든지 달라질 수 있다는 것을 명심해야 합니다.

## 타입스크립트 타입으로는 함수를 오버로드할 수 없습니다.
C++ 같은 언어는 동일한 이름에 매개변수만 다른 여러 버전의 함수를 허용할 수 있습니다. 이것을 '함수 오버로딩'라고 하는데요. 타입스크립트에서는 타입과 런타임의 동작이 무관하기 때문에, 함수 오버로딩은 불가능 합니다.

```ts
function add(a: number, b: number) { return a + b; } // 중복된 함수입니다.

function add(a: string, b: string) { return a + b; } // 중복된 함수입니다.
```

타입스크립트가 함수 오버로딩 기능을 지원하기는 하지만, 온전히 타입 수준에서만 동작합니다. 하나의 함수에 대해 여러 개의 선언문을 작성할 수 있지만, 구현테는 오직 하나 입니다.

```ts
function add(a: number, b: number): number
function add(a: string, b: string): string

function add(a, b) { return a + b }

const three = add(1, 2)       // 타입이 number
const twelve = add('1', '2')  // 타입이 string
```

`add`에 대한 처음 두 개의 선언문은 타입 정보를 제공할 뿐 입니다. 이 두 선언문은 타입스크립트가 자바스크립트로 변환되면서 제거되고, 구현체만 남게 됩니다.

## 타입스크립트 타입은 런타임 성능에 영향을 주지 않습니다.
타입과 타입 연산저는 자바스크립트 변환 시점에 제거되기 때문에, 런타임의 성능에 아무런 영향을 주지 않습니다. 타입스크립트의 정적 타입은 실제로 비용이 전혀 들지 않죠. 대신 빌드타임에 오버헤드가 있습니다. 타입스크립트 팀은 컴파일러 성능을 매우 중요하게 생각합니다. 따라서 컴파일은 일반적으로 상당히 빠른 편이며 특히 Incremental 빌드 시에 더욱 체감됩니다. 빌드 타임 오버헤드가 커지면, 빌드 도구에서 'transpile only'를 설정하여 타입 체크를 건널 뛸 수 있습니다.