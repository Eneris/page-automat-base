export const delay = (timeToWait: number) => new Promise((resolve) => setTimeout(resolve, timeToWait))

export const handleLog = (...args: any[]) => console.log('[' + (new Date()).toISOString() + ']', ...args)

export const handleError = (err: Error) => {
  console.error(err)
}