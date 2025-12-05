import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class DatabaseService {
  private dbDir = path.join(__dirname, '../../database');

  private getFilePath(file: string): string {
    return path.join(this.dbDir, file);
  }

  async readDb(file: string): Promise<any[]> {
    try {
      const data = await fs.readFile(this.getFilePath(file), 'utf8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async writeDb(file: string, data: any[]): Promise<void> {
    await fs.writeFile(this.getFilePath(file), JSON.stringify(data, null, 2), 'utf8');
  }
}
