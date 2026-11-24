import Fastify from "fastify";

export function buildApp() {
  const app = Fastify({
    logger: true,
    bodyLimit: 1048576
  });

  app.get("/health", async () => {
    return {
      status: "ok"
    };
  });

  return app;
}