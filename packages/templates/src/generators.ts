import { createTemplateEngine, templates } from './index';

/**
 * Code generator for WXT extension files
 */
export class CodeGenerator {
  private engine = createTemplateEngine();

  /**
   * Generate a background script
   */
  generateBackground(options: {
    name: string;
    modules: string[];
  }): string {
    return this.engine.render(templates.background, options);
  }

  /**
   * Generate a content script
   */
  generateContent(options: { name: string }): string {
    return this.engine.render(templates.content, options);
  }

  /**
   * Generate a popup HTML
   */
  generatePopup(options: { title: string }): string {
    return this.engine.render(templates.popup, options);
  }

  /**
   * Generate a module
   */
  generateModule(options: {
    name: string;
    className: string;
    id: string;
    version: string;
  }): string {
    return this.engine.render(templates.module, options);
  }

  /**
   * Generate custom template
   */
  generate(template: string, data: Record<string, any>): string {
    return this.engine.render(template, data);
  }
}
