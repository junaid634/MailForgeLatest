export interface TemplateData {
  [key: string]: any;
}

export interface Template {
  content: string;
  compiled: HandlebarsTemplateDelegate;
}