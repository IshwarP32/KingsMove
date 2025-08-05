import request from "supertest";
import express from "express";

// Simple health check test
describe("Health Check", () => {
  let app;

  beforeAll(() => {
    app = express();
    app.get("/health", (req, res) => {
      res.json({ 
        success: true, 
        message: "Server is running",
        timestamp: new Date().toISOString()
      });
    });
  });

  it("should return health status", async () => {
    const response = await request(app)
      .get("/health")
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Server is running");
    expect(response.body.timestamp).toBeDefined();
  });
});