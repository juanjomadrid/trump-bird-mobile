const { execSync } = require('child_process');
const path = require('path');

const ADB = `"${process.env.LOCALAPPDATA}\\Android\\Sdk\\platform-tools\\adb.exe"`;
const ARTIFACTS_DIR = 'C:\\Users\\Juanjo\\.gemini\\antigravity-ide\\brain\\7d31e5a6-82ae-4edc-816e-111577e7bb98';

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
  // 1. Close Breaking News Report
  console.log('Closing Breaking News report...');
  tap(720, 2120);
  await sleep(1000);

  // 2. Tap RUN CAMPAIGN AGAIN (center red button on Game Over card)
  console.log('Tapping RUN CAMPAIGN AGAIN...');
  tap(720, 1750);
  await sleep(1200);

  // 3. Flap twice to get bird in center air
  console.log('Flapping in flight...');
  tap(720, 1500);
  await sleep(300);
  tap(720, 1500);
  await sleep(200);

  // 4. Tap Pause button (orange circle at 1180, 180)
  console.log('Tapping Pause button at (1180, 180)...');
  tap(1180, 180);
  await sleep(1000);
  capture('qa_06_tactical_pause.png');

  // 5. Tap RESUME RALLY
  console.log('Tapping Resume Rally...');
  tap(720, 1550);
  await sleep(400); // During countdown 3-2-1
  capture('qa_07_resume_countdown.png');

  console.log('Done capturing pause and countdown!');
}

main().catch(console.error);
