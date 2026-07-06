import client from "prom-client";

client.collectDefaultMetrics();

export const httpRequests = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP Requests",
  labelNames: ["method", "route", "status"],
});

export const requestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP Request Duration",
  labelNames: ["method", "route", "status"],
});

export { client };