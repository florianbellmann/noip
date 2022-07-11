const dotenv = require("dotenv");
const playwright = require("playwright");

dotenv.config();

(async () => {
  const browser = await playwright.chromium.launch({ headless: true });

  console.log("Initiating browser.")
  const page = await (await browser.newContext()).newPage();
  console.log("Visitting ", process.env.WEBSITE)
  await page.goto(process.env.WEBSITE);

  console.log("Going to signin page.")
  await page.click("#topnav li:first-child");
  await page.waitForLoadState('networkidle') // wait for the page to be loaded

  console.log("Logging in...")
  await page.fill('#username', process.env.USERNAME)
  await page.fill('#password', process.env.PASSWORD)
  await page.click("#clogs-captcha-button");
  console.log("Logged in.")

  console.log("Checking for expiry warning...")

  let dangerDiv
  try {
    dangerDiv = await page.$$(".host-data-widget .text-danger")
  }
  catch (e) {
    console.log("Expiry warning not found. All good.", new Date())
  }
  if (dangerDiv.length > 0) {
    const dangerContent = await dangerDiv.textContent()
    console.log("Warning: Expiry warning exists!", dangerContent)

    await dangerDiv.click()
    await page.waitForLoadState('networkidle') // wait for the page to be loaded

    const tableRows = await page.locator("tr")

    const rowCount = await tableRows.count()
    let domainFound = false
    let domainRenewed = false
    for (let i = 0; i < rowCount; ++i) {
      const tableRow = await tableRows.nth(i)
      const textContent = await tableRow.textContent()

      if (textContent.indexOf(process.env.DOMAIN) > -1) {
        console.log("Found domain listing.")
        foundDomain = true

        const confirmButton = await tableRow.locator(".btn-success")
        const confirmButtonText = await confirmButton.textContent()

        if (confirmButtonText.indexOf("Confirm") > -1) {
          console.log("Renewing domain.", new Date())
          await confirmButton.click()
          await page.waitForLoadState('networkidle') // wait for the page to be loaded
          domainRenewed = true
        } else {
          console.error("Error parsing confirm button! Did not renew domain.")
          process.exit(1)
        }
      }
    }

    if (domainFound === false || domainRenewed === false) {
      console.error("Domain not renewed.")
      process.exit(1)
    }
  }
  else {
    console.log("Expiry warning not found. All good.", new Date())
  }

  await browser.close();
  console.log("Closing browser.")
})();

function delay(time) {
  return new Promise(function(resolve) {
    setTimeout(resolve, time);
  });
}
