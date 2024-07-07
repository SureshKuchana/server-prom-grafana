import express from "express";
import doSomeTask from "./util.js";
import client from 'prom-client';
import responseTime from "response-time";
import { createLogger, transports } from "winston";
import LokiTransport from "winston-loki";
const options = {  
  transports: [
    new LokiTransport({
      host: "http://127.0.0.1:3100"
    })
  ]  
};

const logger = createLogger(options);
const app = express();
const PORT = process.env.PORT || 8000;

const collectDefaultMetrics = client.collectDefaultMetrics;

collectDefaultMetrics();

const reqResTime = new client.Histogram({
  name: "http_express_req_res_time",
  help: "This tells how much time is taken by req and res",
  labelNames: ["method", "route", "status_code"],
  buckets: [1, 50, 100, 200, 400, 500, 800, 1000, 2000]
})

const totalReqCounter = new client.Counter({
  name: 'total_req',
  help: 'Tells total req'
});

app.use(responseTime((req, res, time)=> {
  totalReqCounter.inc();
  reqResTime.labels({
    method: req.method,
    route: req.url,
    status_code: res.statusCode
  }).observe(time);
}));


app.get("/", (_, res) => {
  logger.info("Req home page")
  res.json({ message: "Hello from Server" });
});

app.get("/slow", async (_, res) => {
  try {
    logger.info("Req /slow route")
    const timeTaken = await doSomeTask();
    return res.json({
      status: "success",
      message: `Heavy task completed in ${timeTaken}ms`
    });
  } catch (error) {
    logger.error(error.message)
    return res.status(500).json({ status: "Error" , error: "Internal server error" });
  }
});

app.get("/metrics", async (_, res) => {
  res.setHeader('Content-Type', client.register.contentType);
  const metrics = await client.register.metrics();
  res.send(metrics);
})

app.listen(PORT, () => 
  console.log(`Express server started at http://localhost:${PORT}`));