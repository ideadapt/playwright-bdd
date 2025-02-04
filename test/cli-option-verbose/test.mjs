import path from 'node:path';
import { expect } from '@playwright/test';
import { test, execPlaywrightTest, TestDir, BDDGEN_CMD } from '../helpers.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  const stdout = execPlaywrightTest(testDir.name, `${BDDGEN_CMD} --verbose`);
  expect(stdout).toContain('Loading features from: features/*.feature');
  expect(stdout).toContain('Loading steps from: steps.ts');
  expect(stdout).toContain('Clearing output dir:');
  expect(stdout).toContain(
    `Generated: ${path.normalize('.features-gen/features/sample.feature.spec.js')}`,
  );
  expect(stdout).toContain('Generated files: 1');
});
