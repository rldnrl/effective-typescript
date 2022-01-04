# 구조적 타이핑에 익숙해지기

자바스크립트는 덕(duck typing) 기반입니다. 만약 어떤 함수의 매개변수 값이 모두 제대로 주어진다면, 그 값이 어떻게 만들어졌는지 신경 쓰지 않고 사용합니다. 타입스크립트는 매개변수 값이 요구사항을 만족한다면, 타입이 무엇인지 신경 쓰지 않는 동작을 그대로 모델링합니다. 그런데 타입 체커의 타입에 대한 이해도가 사람과 조금 다르기 때문에 가끔 예상치 못한 결과가 나오기도 합니다. 구조적 타이핑에 대한 개념을 제대로 이해한다면 오류인 경우와 오류가 아닌 경우의 차이를 알 수 있고, 더욱 견고한 코드를 작성할 수 있습니다.

2D 벡터 타입을 다루는 예제를 살펴봅시다.

```ts
interface Vertor2D {
  x: number;
  y: number;
}
```

벡터의 길이를 계산하는 함수는 다음과 같습니다.

```ts
function calculateLength(v: Vector2D) {
  return Math.sqrt(v.x * v.x + v.y * v.y)
}
```

이제 이름이 들어간 벡터를 추가합니다.

```ts
interface NamedVertor {
  name: string;
  x: number;
  y: number;
}
```

`NamedVector`는 `number` 타입의 `x`와 `y` 속성이 있기 때문에 calculateLength 함수로 호출 가능합니다. 타입스크립트는 다음 코드를 읽을 수 있을 정도로 매우 똑똑합니다.

```ts
const v: NamedVector = { x: 3, y: 4, name: "Thomas" }
calculateLength(v) // 결과 5
```

재밌는 점은 `Vector2D`와 `NameVector`의 관계를 전혀 선언하지 않았다는 점입니다. `NamedVector`를 위한 별도의 `calculateLength`를 구현할 필요도 없습니다. 그것은 바로 `NamedVector`의 `Vector2D`와 호환되기 때문에 `calculateLength` 호출이 가능합니다. 여기서 *구조적 타이핑*이라는 개념이 사용됩니다.

구조적 타이핑 때문에 문제가 발생하기도 합니다. 

```ts
interface Vector3D {
  x: number;
  y: number;
  z: number;
}
```

그리고 벡터의 길이를 1로 만드는 정규화 함수를 작성합니다.

```ts
function normalize(v: Vector3D) {
  const length = calculateLength(v);

  return {
    v.x / length,
    v.y / length,
    v.z / length,
  }
}
```

그러나 이 함수는 1보다 조금 더 긴(1.41) 길이를 가진 결과를 출력합니다.

왜 그럴까요?

그것은 바로 `calculateLength`는 `Vector2D`를 기반으로 계산을 하는데, `normalize`는 `Vector3D`를 기반으로 계산을 하기 때문이죠. 

왜 타입 체커는 이런 오류를 찾아내지 못한 것일까요?

`Vector3D`와 호환되는 `{x, y, z}` 객체로 `calculateLength`를 호출하면 구조적 타이핑 관점에서 `x`와 `y`가 있어서 `Vector2D`와 호환이 됩니다. 따라서 오류가 발생하지 않았고, 타입 체커가 문제로 인식하지 않았습니다.

함수를 작성할 때, 호출에 사용되는 매개변수의 속성들이 매개변수의 타입에 선언된 속성만 가질 거라고 생각하기 쉽습니다. 이런 타입을 *봉인된 타입* 또는 *정확한 타입*이라고 하는데, 타입스크립트의 타입 시스템에서는 표현할 수 없습니다. 좋든 싫든 타입은 *열려* 있습니다.