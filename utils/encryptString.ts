import crypto from 'crypto'
const encryptString = (str: string) => {
    str = str.toString()
    const hash = crypto.createHash('sha1')
    return hash.update(`Hello world!${str}scriptJava`).digest('hex')
}
export default encryptString