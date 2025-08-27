const serverConfig = {
  protocol: "http",
  hostname: "localhost",
  port: 3000,
  get url() {
    return `${this.protocol}://${this.hostname}:${this.port}`
  }
}
export default serverConfig