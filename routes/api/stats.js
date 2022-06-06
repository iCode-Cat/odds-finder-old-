const express = require('express');
const puppeteer = require('puppeteer');
const router = express.Router();

let count = 0;
let statObject = {};
// Functions for POST
const getStats = async (id, teamId1, teamId2) => {
  const url = `https://istatistik.nesine.com/${id}`;
  const urlTeam = 'https://istatistik.nesine.com/takim/';
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForSelector(
      '#root > div:nth-child(2) > div:nth-child(1) > div.col-xs-12.col-md-8.padding-right > div:nth-child(2) > div > div:nth-child(3) > div > div > div > div:nth-child(1) > div.table.last-match.highlight-last-match.summary'
    );
    const firstTeamId = await teamIdHandler(page, 1);
    const secondTeamId = await teamIdHandler(page, 2);
    const sum1 = await lastSixDaysStat(page, firstTeamId);
    const sum2 = await lastSixDaysStat(page, secondTeamId);
    statObject.totalGoal = sum1.totalSum + sum2.totalSum;
    statObject.totalGoalGame = sum1.totalGame + sum2.totalGame;
    const { totalGoalGame, totalGoal } = statObject;
    statObject.overChange = Math.floor([(1 / 12) * totalGoalGame] * 100);
    const { overChange } = statObject;
    statObject.odd = (1 / overChange) * 100;
    console.log(statObject);
    browser.close();
  } catch (error) {
    console.log(error.message);
  }
};

const teamIdHandler = async (page, teamName) => {
  let team;

  if (teamName === 1) {
    team = await page.evaluate(
      () =>
        document.querySelector(
          '#root > div:nth-child(2) > div:nth-child(1) > div.col-xs-12.col-md-8.padding-right > div:nth-child(2) > div > div:nth-child(3) > div > div > div > div:nth-child(1) > h5 > a'
        ).href
    );

    return team.replace('https://istatistik.nesine.com/takim/', '');
  }
  team = await page.evaluate(
    () =>
      document.querySelector(
        '#root > div:nth-child(2) > div:nth-child(1) > div.col-xs-12.col-md-8.padding-right > div:nth-child(2) > div > div:nth-child(3) > div > div > div > div:nth-child(2) > h5 > a'
      ).href
  );
  return team.replace('https://istatistik.nesine.com/takim/', '');
};

const lastSixDaysStat = async (page, id) => {
  console.log(id);
  const statArray = [];
  try {
    await page.goto('https://istatistik.nesine.com/takim/' + id, {
      waitUntil: 'networkidle0',
    });
    await page.click('#tab-container-tab-all');
    const activeClass = await page.$('#tab-container-pane-all');
    const scores = await activeClass.evaluate(async () =>
      Array.from(
        document.querySelectorAll('#tab-container-pane-all .first-half'),
        (e) => e.innerHTML
      )
    );
    const scoreArray = scores.reverse().map((score) => {
      if (score !== '-' && score !== 'İY' && count < 6) {
        count++;
        const numberOne = Number(score[0]);
        const numberTwo = Number(score[2]);
        if (numberOne + numberTwo !== 0) {
          statArray.push(numberOne + numberTwo);
        }
      }
    });
    await Promise.all(scoreArray);
    console.log(statArray);
    const totalSum = statArray.reduce((a, b) => a + b, 0);
    // Reset counter
    count = 0;
    return {
      totalSum,
      totalGame: statArray.length,
    };
  } catch (error) {
    console.log(error.message);
  }
};

// @route GET api/stats
// @ desc Bring History from DB
// @access Public
router.get('/', (req, res) => {
  res.send('HELLO WORLD');
});

// @route POST api/stats
// @ desc Query Stat
// @access Public
router.post('/', async (req, res) => {
  try {
    const stat = await getStats(490558);
    res.send(stat);
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
});

// @route DELETE api/stats
// @ desc Delete a result
// @access Public
router.delete('/', (req, res) => {
  res.send('HELLO WORLD DELETE');
});

module.exports = router;
