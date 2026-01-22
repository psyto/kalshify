import puppeteer from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';

const SITE_URL = 'https://kalshify-fabrknt.vercel.app';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to move mouse smoothly to element and click
async function moveAndClick(page, selector, description) {
  try {
    const element = await page.$(selector);
    if (element) {
      const box = await element.boundingBox();
      if (box) {
        const x = box.x + box.width / 2;
        const y = box.y + box.height / 2;
        await page.mouse.move(x, y, { steps: 20 });
        await delay(200);
        await page.mouse.click(x, y);
        console.log(`  ✓ ${description}`);
        return true;
      }
    }
    console.log(`  ✗ ${description} - element not found`);
    return false;
  } catch (e) {
    console.log(`  ✗ ${description} - error: ${e.message}`);
    return false;
  }
}

// Helper to find element by text, get coordinates, and click with mouse movement
async function moveAndClickByText(page, text, description) {
  try {
    // Get element coordinates from page context
    const coords = await page.evaluate((searchText) => {
      const elements = document.querySelectorAll('button, a, [role="button"], [class*="cursor-pointer"]');
      for (const el of elements) {
        if (el.textContent && el.textContent.includes(searchText)) {
          const rect = el.getBoundingClientRect();
          return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
        }
      }
      return null;
    }, text);

    if (coords) {
      await page.mouse.move(coords.x, coords.y, { steps: 20 });
      await delay(200);
      await page.mouse.click(coords.x, coords.y);
      console.log(`  ✓ ${description}`);
      return true;
    }
    console.log(`  ✗ ${description} - element not found`);
    return false;
  } catch (e) {
    console.log(`  ✗ ${description} - error: ${e.message}`);
    return false;
  }
}

// Helper to click first market card with mouse movement
async function clickFirstMarketCard(page) {
  try {
    const coords = await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="rounded-xl"][class*="cursor-pointer"]');
      for (const card of cards) {
        if (card.querySelector('h3') && card.textContent.includes('%')) {
          const rect = card.getBoundingClientRect();
          return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
        }
      }
      return null;
    });

    if (coords) {
      await page.mouse.move(coords.x, coords.y, { steps: 25 });
      await delay(300);
      await page.mouse.click(coords.x, coords.y);
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

async function recordDemo() {
  console.log('Launching browser...');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 720 },
    args: ['--window-size=1280,720']
  });

  const page = await browser.newPage();

  // Set dark mode
  await page.emulateMediaFeatures([
    { name: 'prefers-color-scheme', value: 'dark' }
  ]);

  const recorder = new PuppeteerScreenRecorder(page, {
    fps: 30,
    ffmpeg_Path: null,
    videoFrame: { width: 1280, height: 720 },
    aspectRatio: '16:9'
  });

  const outputPath = './demo-video.mp4';

  console.log('Starting recording...');
  await recorder.start(outputPath);

  try {
    // 1. Landing Page
    console.log('1. Landing page...');
    await page.goto(SITE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await delay(3000);

    // Scroll down slowly to show features
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 80;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= 800) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
    await delay(1500);

    // 2. Markets Page
    console.log('2. Markets page...');
    await page.goto(`${SITE_URL}/markets`, { waitUntil: 'domcontentloaded' });
    await delay(3000);

    // Click heatmap view button
    await moveAndClick(page, 'button[aria-label="Heatmap view"]', 'Heatmap view');
    await delay(2500);

    // Switch back to grid view
    await moveAndClick(page, 'button[aria-label="Grid view"]', 'Grid view');
    await delay(2000);

    // 3. Click on first market card to go to detail page
    console.log('3. Market detail page...');
    if (await clickFirstMarketCard(page)) {
      console.log('  ✓ Clicked on market card');
      await delay(3000);
    }

    // Show Orderbook tab
    console.log('  Showing orderbook...');
    await moveAndClickByText(page, 'Orderbook', 'Orderbook tab');
    await delay(2500);

    // Back to chart
    await moveAndClickByText(page, 'Price Chart', 'Price Chart tab');
    await delay(2000);

    // 4. Buy YES position
    console.log('4. Buying YES position...');
    await moveAndClickByText(page, 'Buy YES', 'Buy YES button');
    await delay(2000);

    // In the trade dialog, click the submit button
    await moveAndClickByText(page, 'Buy YES -', 'Submit trade');
    await delay(3000);

    // 5. Portfolio - view the position
    console.log('5. Portfolio page...');
    await page.goto(`${SITE_URL}/portfolio`, { waitUntil: 'domcontentloaded' });
    await delay(4000);

    // 6. Close the position
    console.log('6. Closing position...');
    await moveAndClickByText(page, 'Close Position', 'Close Position');
    await delay(4000); // Extra time for celebration animation

    // 7. Intel Terminal
    console.log('7. Intel Terminal...');
    await page.goto(`${SITE_URL}/intel`, { waitUntil: 'domcontentloaded' });
    await delay(3000);

    // Click SCAN NOW button
    await moveAndClickByText(page, 'SCAN NOW', 'SCAN NOW');
    await delay(3500);

    // Click ANALYZE button on first signal
    await moveAndClickByText(page, '[ANALYZE]', 'ANALYZE signal');
    await delay(4000);

    // Toggle LIVE mode
    await moveAndClickByText(page, 'LIVE MODE', 'LIVE MODE toggle');
    await delay(4000);

    // 8. AI Picks
    console.log('8. AI Picks page...');
    await page.goto(`${SITE_URL}/for-you`, { waitUntil: 'domcontentloaded' });
    await delay(2500);

    // Click Get Recommendations
    await moveAndClickByText(page, 'Get Recommendations', 'Get Recommendations');
    await delay(5000);

    // Click on a flip card
    const flipCardCoords = await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="cursor-pointer"]');
      for (const card of cards) {
        if (card.textContent && card.textContent.includes('%')) {
          const rect = card.getBoundingClientRect();
          return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
        }
      }
      return null;
    });

    if (flipCardCoords) {
      await page.mouse.move(flipCardCoords.x, flipCardCoords.y, { steps: 20 });
      await delay(300);
      await page.mouse.click(flipCardCoords.x, flipCardCoords.y);
      console.log('  ✓ Clicked flip card');
      await delay(3000);
    }

    // 9. Leaderboard
    console.log('9. Leaderboard page...');
    await page.goto(`${SITE_URL}/leaderboard`, { waitUntil: 'domcontentloaded' });
    await delay(4000);

    // 10. Back to landing with Kalshi CTA
    console.log('10. Back to landing...');
    await page.goto(SITE_URL, { waitUntil: 'domcontentloaded' });

    // Scroll to "Ready for Real Trading" section
    await page.evaluate(async () => {
      const sections = document.querySelectorAll('section');
      for (const section of sections) {
        if (section.textContent && section.textContent.includes('Ready for Real Trading')) {
          section.scrollIntoView({ behavior: 'smooth', block: 'center' });
          break;
        }
      }
    });
    await delay(3500);

  } catch (error) {
    console.error('Error during recording:', error);
  }

  console.log('Stopping recording...');
  await recorder.stop();

  await browser.close();

  console.log(`\nDemo video saved to: ${outputPath}`);
}

recordDemo().catch(console.error);
