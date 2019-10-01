import Browser from './lib/browser'

const slack = new Browser();

(async () => {
    await slack.init()
    await slack.screenshot('.screenshots/test.png')
})()