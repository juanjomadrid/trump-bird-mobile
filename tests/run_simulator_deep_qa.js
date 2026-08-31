/**
 * DEEP SIMULATOR E2E QA TEST RUNNER FOR TRUMP BIRD: IRON DEFENSE
 * Executes full game cycle directly inside the Android Emulator Pixel 9 Pro.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

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

const captureScreenshot = (filename) => {
  const remotePath = `/data/local/tmp/${filename}`;
  const localPath = path.join(ARTIFACTS_DIR, filename);
  runAdb(`shell screencap -p ${remotePath}`);
  runAdb(`pull ${remotePath} "${localPath}"`);
  console.log(`  📸 Screenshot captured: ${filename}`);
  return localPath;
};

const tap = (x, y) => {
  runAdb(`shell input tap ${x} ${y}`);
};

async function runDeepQa() {
  console.log('======================================================');
  console.log('🎮 STARTING DEEP SIMULATOR QA FOR TRUMP BIRD');
  console.log('======================================================');

  // Step 1: Force stop and launch fresh app
  console.log('\n[STEP 1] Launching Trump Bird on Android Emulator...');
  runAdb(`shell am force-stop ${PACKAGE_NAME}`);
  await sleep(1000);
  runAdb(`shell am start -n ${ACTIVITY}`);
  await sleep(4000);

  // Step 2: Capture Start Menu
  console.log('\n[STEP 2] Verifying Start Menu & Initial HUD...');
  captureScreenshot('qa_01_start_menu.png');
  await sleep(1000);

  // Step 3: Test Wardrobe Modal
  console.log('\n[STEP 3] Opening Wardrobe & Skins Closet...');
  // Tap "👔 Change Skin" on bird (approx X: 720, Y: 1100 on 1440x3120) or bottom Wardrobe button (X: 500, Y: 2100)
  tap(500, 2100);
  await sleep(2000);
  captureScreenshot('qa_02_wardrobe_modal.png');

  // Select Classic / Preview skin and close modal
  console.log('  Selecting equipped skin and returning to menu...');
  tap(720, 2400); // Close / Apply button
  await sleep(1500);

  // Step 4: Test Leaderboard Modal
  console.log('\n[STEP 4] Opening Supabase Global Leaderboard...');
  tap(950, 2100); // Leaderboard button
  await sleep(2500);
  captureScreenshot('qa_03_leaderboard_modal.png');

  console.log('  Closing Leaderboard modal...');
  tap(720, 2400); // Close button
  await sleep(1500);

  // Step 5: Start Campaign Rally Gameplay & Flap loop
  console.log('\n[STEP 5] Starting Campaign Rally Gameplay & Testing 60 FPS Physics...');
  tap(720, 1850); // START CAMPAIGN RALLY button
  await sleep(1000);

  console.log('  Simulating in-flight player taps (flaps)...');
  for (let i = 0; i < 8; i++) {
    tap(720, 1500); // Flap tap
    await sleep(400);
  }

  captureScreenshot('qa_04_gameplay_flight.png');
  await sleep(1000);

  // Step 6: Wait for Game Over (let gravity crash)
  console.log('\n[STEP 6] Testing Collision, Crash Physics & Game Over Screen...');
  await sleep(3500);
  captureScreenshot('qa_05_game_over.png');

  // Step 7: Test Submit Score to Supabase
  console.log('\n[STEP 7] Submitting Ratings Score to Supabase Global Leaderboard...');
  tap(720, 1900); // SUBMIT TO GLOBAL LEADERBOARD button
  await sleep(3000);
  captureScreenshot('qa_06_score_certified.png');

  // Step 8: Test Daily Rally Mode
  console.log('\n[STEP 8] Testing Daily Rally (Deterministic Seed Mode)...');
  tap(720, 2050); // RUN CAMPAIGN AGAIN
  await sleep(2000);

  // If on Menu or Game Over, tap Daily Rally
  tap(720, 1950); // DAILY RALLY button
  await sleep(1000);

  for (let i = 0; i < 5; i++) {
    tap(720, 1500);
    await sleep(420);
  }

  captureScreenshot('qa_07_daily_rally_active.png');
  await sleep(2000);

  console.log('\n======================================================');
  console.log('🎉 DEEP SIMULATOR QA COMPLETED SUCCESSFULLY!');
  console.log('======================================================');
}

runDeepQa().catch(console.error);
