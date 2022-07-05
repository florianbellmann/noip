
const dotenv = require("dotenv");
const playwright = require("playwright");
const fs = require("fs");

dotenv.config();

(async () => {
  const browser = await playwright.chromium.launch({ headless: false });

  const page = await (await browser.newContext()).newPage();
  await page.goto(process.env.WEBSITE);

  await page.click("#topnav li:first-child");

  await page.waitForLoadState('networkidle') // wait for the page to be loaded

  await page.fill('#username', process.env.USERNAME)
  await page.fill('#password', process.env.PASSWORD)

  await page.click("#clogs-captcha-button");

  await delay(40000)

  await browser.close();
})();

function delay(time) {
  return new Promise(function(resolve) {
    setTimeout(resolve, time);
  });
}
