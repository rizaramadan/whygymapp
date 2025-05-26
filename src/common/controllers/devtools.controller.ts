import { Controller, Get } from '@nestjs/common';

@Controller('.well-known/appspecific')
export class DevToolsController {
  @Get('com.chrome.devtools.json')
  handleChromeDevTools() {
    return {};
  }
} 