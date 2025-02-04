/**
 * Scenario level hooks: Before / After.
 *
 * before(async ({ page }) => {})
 */

/* eslint-disable max-depth */

import { TestInfo } from '@playwright/test';
import parseTagsExpression from '@cucumber/tag-expressions';
import { BddWorld } from '../run/bddWorld';
import { KeyValue } from '../playwright/types';
import { fixtureParameterNames } from '../playwright/fixtureParameterNames';
import { callWithTimeout } from '../utils';

type ScenarioHookOptions = {
  name?: string;
  tags?: string;
  timeout?: number;
};

type ScenarioHookBddFixtures<World> = {
  $bddWorld: World;
  $tags: string[];
  $testInfo: TestInfo;
};

type ScenarioHookFn<Fixtures, World> = (this: World, fixtures: Fixtures) => unknown;

type ScenarioHook<Fixtures = object, World extends BddWorld = BddWorld> = {
  type: 'before' | 'after';
  options: ScenarioHookOptions;
  fn: ScenarioHookFn<Fixtures, World>;
  tagsExpression?: ReturnType<typeof parseTagsExpression>;
};

/**
 * When calling Before() / After() you can pass:
 * 1. hook fn
 * 2. tags string + hook fn
 * 3. options object + hook fn
 *
 * See: https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/api_reference.md#afteroptions-fn
 */
type ScenarioHookDefinitionArgs<Fixtures, World> =
  | [ScenarioHookFn<Fixtures, World>]
  | [NonNullable<ScenarioHookOptions['tags']>, ScenarioHookFn<Fixtures, World>]
  | [ScenarioHookOptions, ScenarioHookFn<Fixtures, World>];

const scenarioHooks: ScenarioHook[] = [];
let scenarioHooksFixtures: string[];

/**
 * Returns Before() / After() functions.
 */
export function scenarioHookFactory<
  TestFixtures extends KeyValue,
  WorkerFixtures extends KeyValue,
  World,
>(type: ScenarioHook['type']) {
  type Args = ScenarioHookDefinitionArgs<
    TestFixtures & WorkerFixtures & ScenarioHookBddFixtures<World>,
    World
  >;
  return (...args: Args) => {
    addHook({
      type,
      options: getOptionsFromArgs(args) as ScenarioHookOptions,
      fn: getFnFromArgs(args) as ScenarioHook['fn'],
    });
  };
}

export function hasScenarioHooks() {
  return scenarioHooks.length > 0;
}

// eslint-disable-next-line complexity
export async function runScenarioHooks<
  World extends BddWorld,
  Fixtures extends ScenarioHookBddFixtures<World>,
>(type: ScenarioHook['type'], fixtures: Fixtures) {
  let error;
  for (const hook of scenarioHooks) {
    if (hook.type !== type) continue;
    if (hook.tagsExpression && !hook.tagsExpression.evaluate(fixtures.$tags)) continue;

    const { timeout } = hook.options;
    try {
      await callWithTimeout(
        () => hook.fn.call(fixtures.$bddWorld, fixtures),
        timeout,
        `${type} hook timeout (${timeout} ms)`,
      );
    } catch (e) {
      if (type === 'before') throw e;
      if (!error) error = e;
    }
  }
  if (error) throw error;
}

export function getScenarioHooksFixtures() {
  if (!scenarioHooksFixtures) {
    const fixturesFakeObj: Record<keyof ScenarioHookBddFixtures<BddWorld>, null> = {
      $bddWorld: null,
      $tags: null,
      $testInfo: null,
    };
    const set = new Set<string>();
    scenarioHooks.forEach((hook) => {
      fixtureParameterNames(hook.fn)
        .filter(
          (fixtureName) => !Object.prototype.hasOwnProperty.call(fixturesFakeObj, fixtureName),
        )
        .forEach((fixtureName) => set.add(fixtureName));
    });
    scenarioHooksFixtures = [...set];
  }

  return scenarioHooksFixtures;
}

function getOptionsFromArgs(args: unknown[]) {
  if (typeof args[0] === 'string') return { tags: args[0] };
  if (typeof args[0] === 'object') return args[0];
  return {};
}

function getFnFromArgs(args: unknown[]) {
  return args.length === 1 ? args[0] : args[1];
}

function setTagsExpression(hook: ScenarioHook) {
  if (hook.options.tags) {
    hook.tagsExpression = parseTagsExpression(hook.options.tags);
  }
}

function addHook(hook: ScenarioHook) {
  setTagsExpression(hook);
  if (hook.type === 'before') {
    scenarioHooks.push(hook);
  } else {
    // 'after' hooks run in reverse order
    scenarioHooks.unshift(hook);
  }
}
