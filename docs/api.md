# API

### `defineBddConfig(config)`
Defines BDD config inside Playwright config file.

**Params**
  * `config` *object* - BDD [configuration](configuration.md)

**Returns**: *string* - directory where test files will be generated

### `createBdd(test?, WorldConstructor?)`

Creates:
 * `Given`, `When`, `Then`, `Step` functions for defining steps
 * `Before`, `After`, `BeforeAll`, `AfterAll` functions for defining hooks

**Params**
  * `test` *object* - custom test instance
  * `WorldConstructor` *object* - custom world constructor

**Returns**: *object* - `{ Given, When, Then, Step, Before, After, BeforeAll, AfterAll }`

### `Given(pattern, fn)`
Defines `Given` step implementation.

**Params**
  * `pattern` *string | regexp* - step pattern
  * `fn` *function* - step function `(fixtures, ...args) => void`:
    - `fixtures` *object* - Playwright fixtures
    - `...args` *array* - arguments captured from step pattern  

### `When(pattern, fn)`
Defines `When` step implementation.

**Params**
  * `pattern` *string | regexp* - step pattern
  * `fn` *function* - step function `(fixtures, ...args) => void`:
    - `fixtures` *object* - Playwright fixtures
    - `...args` *array* - arguments captured from step pattern  

### `Then(pattern, fn)`
Defines `Then` step implementation.

**Params**
  * `pattern` *string | regexp* - step pattern
  * `fn` *function* - step function `(fixtures, ...args) => void`:
    - `fixtures` *object* - Playwright fixtures
    - `...args` *array* - arguments captured from step pattern  

### `Step(pattern, fn)`
Defines universal step implementation.

**Params**
  * `pattern` *string | regexp* - step pattern
  * `fn` *function* - step function `(fixtures, ...args) => void`:
    - `fixtures` *object* - Playwright fixtures
    - `...args` *array* - arguments captured from step pattern  

### `Before(options?, hookFn)`
Defines `Before` hook.

**Params**
  * `options` *string | object*
    - `tags` *string* - [tag expression](https://github.com/cucumber/tag-expressions) used to apply this hook to only specific scenarios
    - `timeout` *number* - timeout for this hook in milliseconds
    - `name` *string* - an optional name for this hook
  * `hookFn` *Function* hook function `(fixtures?) => void`:
    - `fixtures` *object* - Playwright fixtures:
      - `$testInfo` *object* - Playwright [testInfo](https://playwright.dev/docs/api/class-testinfo)
      - `$tags` *string[]* - list of tags for current scenario
      - `$bddWorld` *object* - instance of [BddWorld](./writing-steps.md#world)
      - any other built-in and custom fixtures

### `After(options?, hookFn)`
Defines `After` hook.

**Params**
  * `options` *string | object*
    - `tags` *string* - [tag expression](https://github.com/cucumber/tag-expressions) used to apply this hook to only specific scenarios
    - `timeout` *number* - timeout for this hook in milliseconds
    - `name` *string* - an optional name for this hook
  * `hookFn` *Function* hook function `(fixtures?) => void`:
    - `fixtures` *object* - Playwright fixtures:
      - `$testInfo` *object* - Playwright [testInfo](https://playwright.dev/docs/api/class-testinfo)
      - `$tags` *string[]* - list of tags for current scenario
      - `$bddWorld` *object* - instance of [BddWorld](./writing-steps.md#world)
      - any other built-in and custom fixtures

### `BeforeAll(options?, hookFn)`
Defines `BeforeAll` hook.

**Params**
  * `options` *string | object*
    - `timeout` *number* - timeout for this hook in milliseconds
  * `hookFn` *Function* hook function `(fixtures?) => void`:
    - `fixtures` *object* - Playwright [worker-scoped fixtures](https://playwright.dev/docs/test-fixtures#worker-scoped-fixtures):
      - `$workerInfo` *object* - Playwright [workerInfo](https://playwright.dev/docs/api/class-workerinfo)
      - any other built-in and custom worker-scoped fixtures

### `AfterAll(options?, hookFn)`
Defines `AfterAll` hook.

**Params**
  * `options` *string | object*
    - `timeout` *number* - timeout for this hook in milliseconds
  * `hookFn` *Function* hook function `(fixtures?) => void`:
    - `fixtures` *object* - Playwright [worker-scoped fixtures](https://playwright.dev/docs/test-fixtures#worker-scoped-fixtures):
      - `$workerInfo` *object* - Playwright [workerInfo](https://playwright.dev/docs/api/class-workerinfo)
      - any other built-in and custom worker-scoped fixtures

### `@Fixture(fixtureName)`
Class decorator to bind POM with fixture name.

**Params**
  * `fixtureName` *string* - fixture name for the given class.

It is also possible to provide `test` type as a generic parameter to restrict `fixtureName` to available fixture names:
```ts
import { Fixture } from 'playwright-bdd/decorators';
import type { test } from './fixtures';

export
@Fixture<typeof test>('todoPage')
class TodoPage { ... };
```

### `@Given(pattern)`
Method decorator to define `Given` step.

**Params**
  * `pattern` *string | regexp* - step pattern

### `@When(pattern)`
Method decorator to define `When` step.

**Params**
  * `pattern` *string | regexp* - step pattern

### `@Then(pattern)`
Method decorator to define `Then` step.

**Params**
  * `pattern` *string | regexp* - step pattern

### `@Step(pattern)`
Method decorator to define universal step.

**Params**
  * `pattern` *string | regexp* - step pattern
