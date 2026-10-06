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
  console.log('--- 1. Tapping START CAMPAIGN RALLY ---');
  tap(720, 2050);
  await sleep(1000);

  console.log('--- 2. Flapping in Flight ---');
  tap(720, 1500);
  await sleep(250);
  tap(720, 1500);
  await sleep(250);
  tap(720, 1500);
  await sleep(200);

  capture('qa_05_gameplay_flight.png');

  console.log('--- 3. Pausing Rally ---');
  tap(1330, 230);
  await sleep(1200);
  capture('qa_06_tactical_pause.png');

  console.log('--- 4. Resuming with Countdown ---');
  tap(720, 1550);
  await sleep(700);
  capture('qa_07_resume_countdown.png');

  console.log('--- 5. Waiting for Crash / Game Over ---');
  await sleep(3500);
  capture('qa_08_game_over.png');

  console.log('--- 6. Opening Breaking News Share Card ---');
  tap(720, 1600);
  await sleep(1500);
  capture('qa_09_breaking_news_card.png');

  console.log('--- Completed gameplay captures ---');
}

main().catch(console.error);
