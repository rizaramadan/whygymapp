export class ErrorApp {
  message: string;
  code: string;
  data: any;

  constructor(message: string, code: string, data: any) {
    this.message = message;
    this.code = code;
    this.data = data;
  }

  static get success(): ErrorApp {
    return new ErrorApp('success', '', null);
  }

  hasError(): boolean {
    return this.code !== '';
  }
}
