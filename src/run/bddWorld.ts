import { APIRequestContext, Browser, BrowserContext, Page, TestInfo } from '@playwright/test';
import { World as CucumberWorld, IWorldOptions } from '@cucumber/cucumber';
import { ISupportCodeLibrary } from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { Fixtures, TestTypeCommon } from '../playwright/types';

export type BddWorldFixtures = {
  page: Page;
  context: BrowserContext;
  browser: Browser;
  browserName: string;
  request: APIRequestContext;
};

export type BddWorldOptions<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ParametersType = any,
  TestType extends TestTypeCommon = TestTypeCommon,
> = IWorldOptions<ParametersType> & {
  testInfo: TestInfo;
  supportCodeLibrary: ISupportCodeLibrary;
  $tags: string[];
  $test: TestType;
  $bddWorldFixtures: BddWorldFixtures;
  lang: string;
};

export class BddWorld<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ParametersType = any,
  TestType extends TestTypeCommon = TestTypeCommon,
> extends CucumberWorld<ParametersType> {
  stepFixtures: Fixtures<TestTypeCommon> = {};

  constructor(public options: BddWorldOptions<ParametersType, TestType>) {
    super(options);
  }

  /**
   * Use particular fixture in cucumber-style steps.
   *
   * Note: TS does not support partial generic inference,
   * that's why we can't use this.useFixture<typeof test>('xxx');
   * The solution is to pass TestType as a generic to BddWorld
   * and call useFixture without explicit generic params.
   * Finally, it looks even better as there is no need to pass `typeof test`
   * in every `this.useFixture` call.
   *
   * The downside - it's impossible to pass fixtures type directly to `this.useFixture`
   * like it's done in @Fixture decorator.
   *
   * See: https://stackoverflow.com/questions/45509621/specify-only-first-type-argument
   * See: https://github.com/Microsoft/TypeScript/pull/26349
   */
  useFixture<K extends keyof Fixtures<TestType>>(fixtureName: K) {
    return (this.stepFixtures as Fixtures<TestType>)[fixtureName];
  }

  get page() {
    return this.options.$bddWorldFixtures.page;
  }

  get context() {
    return this.options.$bddWorldFixtures.context;
  }

  get browser() {
    return this.options.$bddWorldFixtures.browser;
  }

  get browserName() {
    return this.options.$bddWorldFixtures.browserName;
  }

  get request() {
    return this.options.$bddWorldFixtures.request;
  }

  get testInfo() {
    return this.options.testInfo;
  }

  get tags() {
    return this.options.$tags;
  }

  get test() {
    return this.options.$test;
  }

  async init() {
    // async setup before each test
  }

  async destroy() {
    // async teardown after each test
  }
}

export function getWorldConstructor(supportCodeLibrary: ISupportCodeLibrary) {
  // setWorldConstructor was not called
  if (supportCodeLibrary.World === CucumberWorld) {
    return BddWorld;
  }
  if (!Object.prototype.isPrototypeOf.call(BddWorld, supportCodeLibrary.World)) {
    throw new Error(`CustomWorld should inherit from playwright-bdd World`);
  }
  return supportCodeLibrary.World as typeof BddWorld;
}
