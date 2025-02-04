/**
 * Generate and show snippets for undefined steps
 */

import { pathToFileURL } from 'node:url';
import { IRunConfiguration, ISupportCodeLibrary } from '@cucumber/cucumber/api';
import { loadSnippetBuilder } from '../cucumber/loadSnippetBuilder';
import { TestFile, UndefinedStep } from '../gen/testFile';
import StepDefinitionSnippetBuilder from '@cucumber/cucumber/lib/formatter/step_definition_snippet_builder';
import { logger } from '../utils/logger';
import { getStepConfig, isDecorator, isPlaywrightStyle } from '../stepDefinitions/stepConfig';

export class Snippets {
  private snippetBuilder!: StepDefinitionSnippetBuilder;
  private bddBuiltInSyntax = false;

  constructor(
    private files: TestFile[],
    private runConfiguration: IRunConfiguration,
    private supportCodeLibrary: ISupportCodeLibrary,
  ) {}

  async print() {
    this.snippetBuilder = await this.createSnippetBuilder();
    const snippets = this.getSnippets();
    this.printHeader();
    this.printSnippets(snippets);
    this.printFooter(snippets);
    // exit();
  }

  private async createSnippetBuilder() {
    const { snippetInterface } = this.runConfiguration.formats.options;
    const snippetSyntax = this.getSnippetSyntax();
    return loadSnippetBuilder(this.supportCodeLibrary, snippetInterface, snippetSyntax);
  }

  private getSnippetSyntax() {
    const { snippetSyntax } = this.runConfiguration.formats.options;
    if (!snippetSyntax && this.isPlaywrightStyle()) {
      this.bddBuiltInSyntax = true;
      const filePath = this.isDecorators()
        ? require.resolve('./snippetSyntaxDecorators.js')
        : this.isTypeScript()
          ? require.resolve('./snippetSyntaxTs.js')
          : require.resolve('./snippetSyntax.js');
      return pathToFileURL(filePath).toString();
    } else {
      return snippetSyntax;
    }
  }

  private getSnippets() {
    const snippetsSet = new Set<string>();
    const snippets: string[] = [];
    this.files.forEach((file) => {
      file.undefinedSteps.forEach((undefinedStep) => {
        const { snippet, snippetWithLocation } = this.getSnippet(
          file,
          snippets.length + 1,
          undefinedStep,
        );
        if (!snippetsSet.has(snippet)) {
          snippetsSet.add(snippet);
          snippets.push(snippetWithLocation);
        }
      });
    });

    return snippets;
  }

  private getSnippet(file: TestFile, index: number, undefinedStep: UndefinedStep) {
    const snippet = this.snippetBuilder.build({
      keywordType: undefinedStep.keywordType,
      pickleStep: undefinedStep.pickleStep,
    });
    const { line, column } = undefinedStep.step.location;
    const snippetWithLocation = [
      `// ${index}. Missing step definition for "${file.sourceFile}:${line}:${column}"`,
      snippet,
    ].join('\n');

    return { snippet, snippetWithLocation };
  }

  private isTypeScript() {
    const { requirePaths, importPaths } = this.supportCodeLibrary.originalCoordinates;
    return (
      requirePaths.some((p) => p.endsWith('.ts')) || importPaths.some((p) => p.endsWith('.ts'))
    );
  }

  private isPlaywrightStyle() {
    const { stepDefinitions } = this.supportCodeLibrary;
    return stepDefinitions.length > 0
      ? stepDefinitions.some((step) => isPlaywrightStyle(getStepConfig(step)))
      : true;
  }

  private isDecorators() {
    const { stepDefinitions } = this.supportCodeLibrary;
    const decoratorSteps = stepDefinitions.filter((step) => isDecorator(getStepConfig(step)));
    return decoratorSteps.length > stepDefinitions.length / 2;
  }

  private printHeader() {
    const lines = [`Missing steps found. Use snippets below:`];
    if (this.bddBuiltInSyntax) {
      if (this.isDecorators()) {
        lines.push(`import { Fixture, Given, When, Then } from 'playwright-bdd/decorators';\n`);
      } else {
        lines.push(
          `import { createBdd } from 'playwright-bdd';`,
          `const { Given, When, Then } = createBdd();\n`,
        );
      }
    } else {
      lines.push(`import { Given, When, Then } from '@cucumber/cucumber';\n`);
    }
    logger.error(lines.join('\n\n'));
  }

  private printSnippets(snippets: string[]) {
    logger.error(snippets.concat(['']).join('\n\n'));
  }

  private printFooter(snippets: string[]) {
    logger.error(
      `Missing step definitions (${snippets.length}).`,
      `Use snippets above to create them.`,
    );
    this.printWarningOnZeroScannedFiles();
  }

  private printWarningOnZeroScannedFiles() {
    const { requirePaths, importPaths } = this.supportCodeLibrary.originalCoordinates;
    const scannedFilesCount = requirePaths.length + importPaths.length;
    if (scannedFilesCount === 0 && !this.isDecorators()) {
      logger.error(`Note that 0 step definition files found, check the config.`);
    }
  }
}
