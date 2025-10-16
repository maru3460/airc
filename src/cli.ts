#!/usr/bin/env node

import { writeFileSync } from 'fs';
import { resolve } from 'path';

// test.md をカレントディレクトリに作成（中身は空）
const filePath = resolve(process.cwd(), 'test.md');
writeFileSync(filePath, '', 'utf-8');

console.log('✅ test.md を作成しました！');
