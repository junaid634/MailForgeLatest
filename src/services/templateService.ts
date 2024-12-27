import { readFile } from 'fs/promises';
import { compile } from 'handlebars';
import { TemplateData, Template } from '../types/template';

export class TemplateService {
  private templates: Map<string, Template> = new Map();

  async loadTemplate(name: string, filePath: string): Promise<void> {
    const content = await readFile(filePath, 'utf-8');
    const compiled = compile(content);
    this.templates.set(name, { content, compiled });
  }

  async renderTemplate(name: string, data: TemplateData): Promise<string> {
    const template = this.templates.get(name);
    if (!template) {
      throw new Error(`Template ${name} not found`);
    }
    return template.compiled(data);
  }
}

export default new TemplateService();