const path = require("path");
const { DockerComposeEnvironment, Wait } = require("testcontainers");
const { expect } = require("chai");
const superagent = require("superagent");

describe("NginxTest", () => {
  let environment;
  let port;

  before(async function () {
    this.timeout(0);
    const composeFilePath = path.resolve(__dirname);
    const composeFile = "test-docker-compose.yml";
    environment = await new DockerComposeEnvironment(composeFilePath, composeFile)
      .withWaitStrategy("frontend", Wait.forLogMessage("Configuration complete; ready for start up"))
      .withWaitStrategy("backend", Wait.forLogMessage("Backend starting"))
      .withBuild()
      .up();
    let nginxContainer = environment.getContainer("frontend_1");
    port = nginxContainer.getMappedPort(80);
  });

  after(async function () {
    environment && await environment.down();
  });

  it("index should return 200 for index route", async function () {
    const res = await superagent.get(`http://localhost:${port}/`);
    expect(res.statusCode).to.equal(200);
  });

  it("index response should include 'Hello from Docker!'", async function () {
    const res = await superagent.get(`http://localhost:${port}/`);
    expect(res.text).to.include("Hello from Docker!");
  });
});
