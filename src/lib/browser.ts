import Puppeteer from 'puppeteer'
import {
    PAGE_HOME,
    DEBUG,
    RELOAD_TIMER,
    BROWSER_USERAGENT,
    BROWSER_VIEW
} from '../config'

import { handleLog, handleError } from './functions'

export default class Browser {
    private restartTimer: any;

    public page: any;
    public instance: any;

    private constructor() {
        this.instance = null
        this.page = null
        this.restartTimer = null;
    }

    public async exit() {
        if (this.restartTimer) {
            this.restartTimer = clearTimeout(this.restartTimer)
        }

        if (this.instance) return this.instance.close()

        return Promise.resolve()
    }

    public async init() {
        handleLog('Init started')

        await this.exit()

        this.instance = await Puppeteer.launch({
            userDataDir: '.userData',
            headless: DEBUG >= 3,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        })

        this.page = await this.instance.newPage()

        await this.page.setUserAgent(BROWSER_USERAGENT)

        await this.page.setViewport({
            width: BROWSER_VIEW[0],
            height: BROWSER_VIEW[1],
            isMobile: false,
            hasTouch: false,
            isLandscape: true
        })

        if (DEBUG >= 2) {
            this.page.on('request', (request: any) => handleLog('REQUEST', request.url()))
            this.page.on('console', (msg: any) => handleLog('CONSOLE', msg._text))
        }

        this.page.on('pageerror', (err: Error) => {
            handleLog('PAGE Error')
            handleError(err)
        })

        await this.page.goto(PAGE_HOME)

        if (RELOAD_TIMER) {
            if (DEBUG) handleLog('Setting up periodic restarter')
            this.restartTimer = setTimeout(() => this.init(), RELOAD_TIMER)
        }

        if (DEBUG) handleLog('Init done')
    }

    // Generic functions section
    public async evaluate(functionToCall: Function, ...params: any[]) {
        return this.page.evaluate(functionToCall, ...params)
    }

    public async screenshot(fileName: string, options = {}) {
        if (DEBUG) handleLog('getting screenshot')
        return this.page.screenshot({ path: fileName, ...options })
    }

    public async checkHealth() {
        return this.page.evaluateAsync(() => {
            return !!Promise
        })
    }
}
