const fs = require('fs/promises')
const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const compareImages = require('resemblejs/compareImages')

const HOST = "http://localhost:4567";

describe("Notification Box Layout", function () {
  let driver;

  beforeAll(async () => {
    const options = new chrome.Options();
    if (options.headless) {
      options.addArguments("--headless");
    }
    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();
    await driver.get(HOST);
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  describe("Visual Comparison for Information Notification Box", () => {
    it("should match the appearance of the information notification box with the template", async () => {
      await compareNotificationBoxWithTemplate(driver, "notification-info", "info", 20);
    });
  });

  describe("Visual Comparison for Success Notification Box", () => {
    it("should match the appearance of the success notification box with the template", async () => {
      await compareNotificationBoxWithTemplate(driver, "notification-success", "success", 20);
    });
  });

  describe("Visual Comparison for Warning Notification Box", () => {
    it("should match the appearance of the warning notification box with the template", async () => {
      await compareNotificationBoxWithTemplate(driver, "notification-warning", "warning", 20);
    });
  });

  describe("Visual Comparison for the Notification Container", () => {
    it("should match the entire notification container layout with the template", async () => {
      await compareNotificationsWithTemplate(driver, 'main', 20);
    });
  });

  describe("Notification Box",()=>{
    let notificationBoxes;
    let title, message, icon;

   beforeEach(async () => {
     notificationBoxes = await driver.findElements(By.css(".notification-box"));
     title = await driver.findElement(By.css(".notification-title"));
     message = await driver.findElement(By.css(".notification-message"));
     icon = await driver.findElement(By.css(".notification-icon"));
   });

    it("should have a fixed width of 385px, height of 140px, a bold title with font size of 18px, a message with font size of 14px and padding horizontally of 20px", async () => {
        const titleFontWeight = await title.getCssValue("font-weight");
        const titleFontSize = await title.getCssValue("font-size");
        const titleColor = await title.getCssValue("color");
        expect(titleFontWeight).toBe("700"); // or "bold"
        expect(titleFontSize).toBe("18px");

        const msgFontSize = await message.getCssValue("font-size");
        const msgColor = await message.getCssValue("color");
        expect(msgFontSize).toBe("14px");
   
      for (const box of notificationBoxes) {
        const width = await box.getCssValue("width"); const height = await box.getCssValue("height");
        const paddingLeft = await box.getCssValue("padding-left");
        const paddingRight = await box.getCssValue("padding-right");
        expect(height).toBe("140px");
        expect(width).toBe("385px");
        expect(paddingLeft).toBe("20px");
        expect(paddingRight).toBe("20px");
      }
    });

      it("should have mention style in notifications", async () => {
        const infoBox = await driver.findElement(By.css(".notification-info"));
        const infoBoxBorderLeftColor = await infoBox.getCssValue("border-left-color");
        expect(infoBoxBorderLeftColor).toBe("rgba(0, 123, 255, 1)"); // #007bff

        const successBox = await driver.findElement(By.css(".notification-success"));
        const successBoxBorderLeftColor = await successBox.getCssValue("border-left-color");
        expect(successBoxBorderLeftColor).toBe("rgba(40, 167, 69, 1)"); // #28a745

        const warningBox = await driver.findElement(By.css(".notification-warning"));
        const warningBoxBorderLeftColor = await warningBox.getCssValue("border-left-color");
        expect(warningBoxBorderLeftColor).toBe("rgba(255, 193, 7, 1)"); // #ffc107

        const padding = await icon.getCssValue("padding");
        expect(padding).toBe("10px");   
      });
  })
});

const compareNotificationBoxWithTemplate = async (driver, className, stateName, epsilon) => {
  const notificationBox = await driver.findElement(By.className(className));
  const notificationBoxImage = await notificationBox.takeScreenshot();

  const actualImageBase64 = "data:image/png;base64," + notificationBoxImage;

  const templateImageBase64 = await fs.readFile(`./test/fixtures/${stateName}.png`);

  const { misMatchPercentage, getBuffer } = await compareImages(actualImageBase64, templateImageBase64);

  await fs.writeFile(`diff-${stateName}.png`, getBuffer(), "base64");

  expect(parseFloat(misMatchPercentage)).toBeLessThan(epsilon || 1);
};

const compareNotificationsWithTemplate = async (driver, stateName, epsilon) => {
  const actualNorificationContainer = await driver.findElement(By.className('main'))
  const notificationContainerImage = await actualNorificationContainer.takeScreenshot();

  const actualImageBase64 = "data:image/png;base64," + notificationContainerImage;

  const templateImageBase64 = await fs.readFile(`./test/fixtures/${stateName}.png`);

  const { misMatchPercentage, getBuffer } = await compareImages(actualImageBase64, templateImageBase64);

  await fs.writeFile(`diff-${stateName}.png`, getBuffer(), "base64");

  expect(parseFloat(misMatchPercentage)).toBeLessThan(epsilon || 1);
};