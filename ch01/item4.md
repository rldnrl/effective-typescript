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

이런 특성 때문에 가끔 당황스러운 결과가 발생합니다.

```ts
function calculateLength(v: Vector3D) {
  let length = 0

  for (const axis of Object.keys(v)) {
    const coord = v[axis] // Error. "string"은 Vector3D의 인덱스으로 사용할 수 없기 때문에 엘리먼트는 암시적으로 "any" 타입입니다.
    length += Math.abs(coord)
  }

  return length
}
```

이것은 `axis`는 `Vector3D` 타입인 `v`의 키 중 하나이기 때문에 "x", "y", "z" 중에 하나여야 합니다. 그리고 `Vector3D` 타입의 모든 `value` 타입이 `number`이므로 `coord` 타입은 `number`가 되어야할 것으로 예측됩니다.

타입스크립트는 오류를 정확하게 찾아냈습니다! Vector3D는 다른 속성이 없다고 가정되었습니다. 그런데 다음처럼 작성할 수 있습니다.

```ts
const vec3D = {x: 3, y: 4, z: 1, name: "David Thomas"}
calculateLength(vec3D) // 정상!!! NaN
```

`v`는 어떤 속성이든 가질 수 있기 때문에, `axis`의 타입은 `string`이 될 수도 있습니다. 그러므로 타입스크립트는 `v[axis]`가 어떤 속성이 될지 알 수 없기 때문에 number라고 확정할 수 없습니다. 결론을 말하자면, 루프를 돌리는 것보다 모든 속성을 각각 더하는 구현이 훨씬 낫습니다.

```ts
function calculateLength(v: Vector3D) {
  return Math.abs(v.x) + Math.abs(v.y) + Math.abs(v.z)
}
```

구조적 타이핑은 클래스와 관련된 할당문에서도 당황스러운 결과를 보여 줍니다.

```ts
class C {
  foo: string;
  constructor(foo: string) {
    this.foo = foo
  }
}

const c = new C('instanceof C')
const d: C = { foo: 'Object Literal' } // 정상!
```

`d`가 `C` 타입에 할당되는 이유는 뭘까요? `d`는 `string` 타입의 `foo` 속성을 가지고 있습니다. 게다가 하나의 매개변수로 호출이 되는 생성자를 가집니다. 그래서 구조적으로 필요한 속성과 생성자가 존재하기 때문에 문제가 없습니다. 만약 `C`의 생성자에 단순 할당이 아닌 로직이 들어가게 된다면, `d`의 경우 생성자를 실행하지 않으므로 문제가 발생하게 됩니다.

테스트를 작성할 때는 구조적 타이핑이 유리합니다. DB에 쿼리하고 결과를 처리하는 함수를 가정해보겠습니다.

```ts
interface Author {
  first: string
  last: string
}

function getAuthors(database: PostgresDB): Author[] {
  const authorRows = database.runQuery('SELECT FIRST, LAST FROM AUTHORS');
  return authorRows.map(row => ({ first: row[0], last: row[1] }))
}
```

`getAuthors` 함수를 테스트하기 위해서는 모킹한 `PostgresDB`를 생성해야 합니다. 그러나 구조적 타이핑을 활용하여 더 구체적인 인터페이스를 정의하는 것이 더 나은 방법입니다.

```ts
interface DB {
  runQuery: (sql: string) => any[]
}

function getAuthors(database: DB): Author[] {
  const authorRows = database.runQuery('SELECT FIRST, LAST FROM AUTHORS');
  return authorRows.map(row => ({ first: row[0], last: row[1] }))
}
```

`runQuery` 메서드가 있기 때문에 실제 환경에서도 `getAuthors`에 `PostgresDB`를 사용할 수 있습니다. `PostgresDB`가 `DB` 인터페이스를 구현하는지 명확히 선언할 필요가 없습니다. 타입스크립트는 그렇게 동작할 거라는 걸 알아챕니다.

```ts
test('getAuthors', () => {
  const authors = getAuthors({
    runQuery(sql: string) {
      return [['Toni', 'Morrison'], ['Maya', 'Angelou']]
    }
  })

  expect(authors).toEqual([
    {fist: 'Toni', last: 'Morrison'},
    {fist: 'Maya', last: 'Angelou'},
  ])
})
```

타입스크립트는 테스트 DB가 해당 인터페이스를 충족하는지 확인합니다. 그리고 테스트 코드에는 실제 환경의 DB에 대한 정보가 불필요합니다. 심지어는 모킹 라이브러리도 필요가 없습니다. `DB`로 추상화를 함으로써, 로직과 테스트를 특정한 구현(`PostgresDB`)으로부터 분리한 것입니다.

테스트 이외에 구조적 타이핑의 또 다른 장점은 라이브러리 간의 의존성을 완전히 분리할 수 있습니다.