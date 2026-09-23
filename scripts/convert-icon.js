const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'public', '56726986.jpg');

// ICO 容器：ICONDIR(6) + N * ICONDIRENTRY(16) + 内嵌的 PNG 数据
function createIco(pngBuffers) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = icon
  header.writeUInt16LE(pngBuffers.length, 4); // image count

  const entries = [];
  const offset = 6 + 16 * pngBuffers.length;
  let dataOffset = offset;

  pngBuffers.forEach(({ png, size }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height (0 = 256)
    entry.writeUInt8(0, 2); // color palette count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8); // size of image data
    entry.writeUInt32LE(dataOffset, 12); // offset to image data
    entries.push(entry);
    dataOffset += png.length;
  });

  return Buffer.concat([header, ...entries, ...pngBuffers.map((b) => b.png)]);
}

async function convertIcon() {
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    console.log('Original image:', metadata.width, 'x', metadata.height);

    // 主图标 512x512 PNG（Next.js 16 约定：app/icon.png 自动生成 favicon）
    const pngBuffer = await sharp(inputPath)
      .resize(512, 512, { fit: 'inside' })
      .png()
      .toBuffer();

    fs.writeFileSync(path.join(__dirname, '..', 'app', 'icon.png'), pngBuffer);
    console.log('Created app/icon.png');

    // 生成标准 ICO（内嵌 16/32/48/64/128/256 多尺寸 PNG）
    const icoSizes = [16, 32, 48, 64, 128, 256];
    const pngBuffers = [];
    for (const size of icoSizes) {
      const png = await sharp(inputPath)
        .resize(size, size, { fit: 'inside' })
        .ensureAlpha()
        .png()
        .toBuffer();
      pngBuffers.push({ png, size });
    }
    const icoFile = createIco(pngBuffers);
    fs.writeFileSync(path.join(__dirname, '..', 'app', 'favicon.ico'), icoFile);
    console.log('Created app/favicon.ico (multi-size: ' + icoSizes.join(', ') + ')');

    console.log('');
    console.log('Icon conversion completed!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

convertIcon();
