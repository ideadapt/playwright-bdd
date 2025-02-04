import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
  projects: [
    {
      name: 'project1',
      testDir: defineBddConfig({
        outputDir: '.features-gen/one',
        require: ['steps.ts'],
      }),
    },
    {
      name: 'project2',
      testDir: defineBddConfig({
        outputDir: '.features-gen/two',
        require: ['steps.ts', 'steps2.ts'],
      }),
    },
  ],
});
