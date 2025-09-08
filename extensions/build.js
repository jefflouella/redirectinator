#!/usr/bin/env node

/**
 * Build script for Redirectinator Advanced Extensions
 * Creates production-ready ZIP files for Chrome Web Store and Firefox Add-ons
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

class ExtensionBuilder {
  constructor() {
    this.rootDir = path.dirname(__filename);
  }

  async buildChrome() {
    console.log('🚀 Building Chrome extension...');

    const outputPath = path.join(
      this.rootDir,
      'redirectinator-advanced-chrome.zip'
    );
    const sourceDir = path.join(this.rootDir, 'chrome');

    if (!fs.existsSync(sourceDir)) {
      throw new Error('Chrome extension directory not found');
    }

    await this.createZip(sourceDir, outputPath);
    console.log('✅ Chrome extension built successfully!');
    console.log(`📦 Output: ${outputPath}`);
  }

  async buildFirefox() {
    console.log('🚀 Building Firefox add-on...');

    const outputPath = path.join(
      this.rootDir,
      'redirectinator-advanced-firefox.zip'
    );
    const sourceDir = path.join(this.rootDir, 'firefox');

    if (!fs.existsSync(sourceDir)) {
      throw new Error('Firefox add-on directory not found');
    }

    await this.createZip(sourceDir, outputPath);
    console.log('✅ Firefox add-on built successfully!');
    console.log(`📦 Output: ${outputPath}`);
  }

  async buildAll() {
    console.log('🔨 Building all extensions...');
    await this.buildChrome();
    await this.buildFirefox();
    console.log('🎉 All extensions built successfully!');
  }

  async createZip(sourceDir, outputPath) {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outputPath);
      const archive = archiver('zip', {
        zlib: { level: 9 }, // Maximum compression
      });

      output.on('close', () => {
        console.log(`📊 Archive created: ${archive.pointer()} bytes`);
        resolve();
      });

      archive.on('error', err => {
        reject(err);
      });

      archive.pipe(output);

      // Add all files from source directory
      archive.directory(sourceDir, false);

      // Add version info
      const version = require('./package.json').version;
      archive.append(
        JSON.stringify(
          {
            version: version,
            buildDate: new Date().toISOString(),
            platform: path.basename(sourceDir),
          },
          null,
          2
        ),
        { name: 'build-info.json' }
      );

      archive.finalize();
    });
  }

  clean() {
    console.log('🧹 Cleaning build artifacts...');

    const files = [
      'redirectinator-advanced-chrome.zip',
      'redirectinator-advanced-firefox.zip',
    ];

    files.forEach(file => {
      const filePath = path.join(this.rootDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Removed ${file}`);
      }
    });

    console.log('✅ Clean completed!');
  }

  validate() {
    console.log('🔍 Validating extension structure...');

    const chromeDir = path.join(this.rootDir, 'chrome');
    const firefoxDir = path.join(this.rootDir, 'firefox');

    // Check required files
    const requiredFiles = {
      chrome: ['manifest.json', 'src/background.js', 'src/content.js'],
      firefox: ['manifest.json', 'src/background.js', 'src/content.js'],
    };

    let isValid = true;

    Object.entries(requiredFiles).forEach(([platform, files]) => {
      const platformDir = platform === 'chrome' ? chromeDir : firefoxDir;

      files.forEach(file => {
        const filePath = path.join(platformDir, file);
        if (!fs.existsSync(filePath)) {
          console.error(`❌ Missing file: ${file} in ${platform} extension`);
          isValid = false;
        } else {
          console.log(`✅ Found: ${file} in ${platform} extension`);
        }
      });
    });

    if (isValid) {
      console.log('🎉 Validation passed!');
    } else {
      console.error('❌ Validation failed!');
      process.exit(1);
    }
  }
}

// CLI interface
const builder = new ExtensionBuilder();
const command = process.argv[2];

switch (command) {
  case 'chrome':
    builder.buildChrome().catch(console.error);
    break;
  case 'firefox':
    builder.buildFirefox().catch(console.error);
    break;
  case 'all':
    builder.buildAll().catch(console.error);
    break;
  case 'clean':
    builder.clean();
    break;
  case 'validate':
    builder.validate();
    break;
  default:
    console.log(`
Redirectinator Advanced Extensions - Build Script

Usage:
  node build.js <command>

Commands:
  chrome     Build Chrome extension only
  firefox    Build Firefox add-on only
  all        Build both extensions
  clean      Remove build artifacts
  validate   Validate extension structure

Examples:
  node build.js all
  node build.js chrome
  node build.js validate
    `);
    break;
}
