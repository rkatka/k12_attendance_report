const electron = require('electron');
const puppeteer = require('puppeteer');
const schedule = require('node-schedule');
const creds = require('./creds');

// user variables
const USERNAME = '#username';
const REPORT = '#ReportSelectBoxID';
const STUDENT_DETAILS_REPORT = 'Student Details Report';
const TERM_CHECKBOX = '#selectlist\\`1\\$include';
const TERM = '#selectlist\\`1\\$value';
const SUBMIT = '#DataExportSubmitButton';

const DEV = false;

const app = electron.app;
app.setLoginItemSettings({
  openAtLogin: true,
  openAsHidden: !DEV
});

async function run() {
  const browser = await puppeteer.launch({
    headless: !DEV,
    slowMo: 10,
    devtools: DEV
  });
  const page = await browser.newPage();

  // navigate to URL
  console.log('navigating to: ' + creds.k12CustomReportUrl);
  await page.goto(creds.k12CustomReportUrl);
  await page.waitForSelector(USERNAME);

  // login
  await login(page);

  // Wait for the report dropdown list
  await page.waitForSelector(REPORT);
  await page.click(REPORT);

  // select student details report
  await selectOptionByText(page, REPORT, STUDENT_DETAILS_REPORT);

  // select the correct term
  await page.waitForSelector(TERM_CHECKBOX);
  await page.click(TERM_CHECKBOX);
  await page.waitForSelector(TERM);
  await page.click(TERM);

  await selectOptionByText(page, TERM, creds.semester);

  // Submit the form
  await page.waitForSelector(SUBMIT);
  await page.click(SUBMIT);

  // verify that the report executed
  await page.waitFor(2000);
  browser.close();
}

async function login(page) {
  await page.waitFor(500);
  // select and enter username
  await page.click(USERNAME);
  await page.keyboard.type(creds.username);

  // select and enter password
  await page.click('#password');
  await page.keyboard.type(creds.password);

  // submit the SignOn
  await page.click('a[title="Sign On"]');
}

async function selectOptionByText(page, el, text) {
  page.evaluate(
    (sel, val) => {
      let i,
        len,
        $opt,
        opts = $(document.querySelectorAll(sel + ' option'));

      for (i = 0, len = opts.length; i < len; i++) {
        $opt = $(opts[i]);

        if ($opt.text() === val) {
          $opt.attr('selected', true);
          break;
        }
      }

      $(document.querySelector(sel)).trigger('change');

      return;
    },
    el,
    text
  );
}

if (DEV) {
  run();
} else {
  // schedule to run at 23:55:00, Monday through Friday
  const j = schedule.scheduleJob('55 23 * * 1-5', run);

  console.log('Reporting will run at ' + j.nextInvocation());
}