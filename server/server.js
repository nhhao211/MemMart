import app from "./src/app.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 MarkFlow AI Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);

  // Debug DB URL (safe log)
  const dbUrl = process.env.DATABASE_URL || "";
  console.log(`🔌 Database URL Protocol: ${dbUrl.split(":")[0]}`);

  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
