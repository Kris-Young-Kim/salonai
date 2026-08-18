import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const logoSource = path.join(rootDir, 'public', 'logo.jpg');

if (!fs.existsSync(logoSource)) {
  console.error('Logo source not found:', logoSource);
  process.exit(1);
}

const logoBuffer = fs.readFileSync(logoSource);

// 1. app/icon.png & app/icon.jpg
fs.writeFileSync(path.join(rootDir, 'app', 'icon.jpg'), logoBuffer);
fs.writeFileSync(path.join(rootDir, 'app', 'icon.png'), logoBuffer);

// 2. app/apple-icon.png & app/apple-icon.jpg
fs.writeFileSync(path.join(rootDir, 'app', 'apple-icon.png'), logoBuffer);
fs.writeFileSync(path.join(rootDir, 'app', 'apple-icon.jpg'), logoBuffer);

// 3. app/favicon.ico (기존 Vercel 기본 아이콘 덮어쓰기)
fs.writeFileSync(path.join(rootDir, 'app', 'favicon.ico'), logoBuffer);
fs.writeFileSync(path.join(rootDir, 'public', 'favicon.ico'), logoBuffer);

// 4. public/icons/에도 복사
fs.writeFileSync(path.join(rootDir, 'public', 'icons', 'icon-192x192.png'), logoBuffer);
fs.writeFileSync(path.join(rootDir, 'public', 'icons', 'icon-512x512.png'), logoBuffer);
fs.writeFileSync(path.join(rootDir, 'public', 'icons', 'icon-maskable-512x512.png'), logoBuffer);

// 5. OpenGraph SNS 공유 이미지 (카톡/문자 링크 시 미리보기 이미지)
fs.writeFileSync(path.join(rootDir, 'public', 'og-image.jpg'), logoBuffer);
fs.writeFileSync(path.join(rootDir, 'app', 'opengraph-image.jpg'), logoBuffer);

console.log('✅ Successfully replaced all favicons and icons with Uni Hair Shop logo!');
