const { execSync } = require('child_process');
const path = require('path');

const ADB = `"${process.env.LOCALAPPDATA}\\Android\\Sdk\\platform-tools\\adb.exe"`;
const PACKAGE_NAME = 'com.juanjomadrid.trumpbird';
const ACTIVITY = `${PACKAGE_NAME}/.MainActivity`;
const ARTIFACTS_DIR = 'C:\\Users\\Juanjo\\.gemini\\antigravity-ide\\brain\\27d259c1-ea94-460a-9b25-45f23b03ab1d';

const runAdb = (cmd) => {
  try {
    return execSync(`${ADB} ${cmd}`, { encoding: 'utf-8', timeout: 15000 });
  } catch (err) {
    return err.stdout || err.message;
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const capture = (filename) => {
  const remotePath = `/data/local/tmp/${filename}`;
  const localPath = path.join(ARTIFACTS_DIR, filename);
  runAdb(`shell screencap -p ${remotePath}`);
  runAdb(`pull ${remotePath} "${localPath}"`);
  console.log(`  📸 Screenshot captured: ${filename}`);
  return localPath;
};

const tap = (x, y) => runAdb(`shell input tap ${x} ${y}`);

async function main() {
  console.log('Capturing all modal views...');

  // 1. Restart fresh app
  runAdb(`shell am force-stop ${PACKAGE_NAME}`);
  await sleep(1000);
  runAdb(`shell am start -n ${ACTIVITY}`);
  await sleep(3500);

  // Capture Main Start Menu
  capture('qa_modal_01_start_menu.png');

  // 2. Open Quests Modal
  tap(720, 2180);
  await sleep(1500);
  capture('qa_modal_02_quests.png');

  // Close Quests
  tap(720, 2300);
  await sleep(1000);

  // 3. Open Settings Modal (top right gear)
  tap(1060, 770);
  await sleep(1500);
  capture('qa_modal_03_settings.png');

  // Close Settings
  tap(720, 2050);
  await sleep(1000);

  // 4. Open Wardrobe Modal
  tap(430, 2180);
  await sleep(1500);
  capture('qa_modal_04_wardrobe.png');

  // Close Wardrobe
  tap(720, 2450);
  await sleep(1000);

  console.log('All modal views captured!');
}

main().catch(console.error);
