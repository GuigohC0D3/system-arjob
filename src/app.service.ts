import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus() {
    return {
      service: 'arjob-api',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
