import express from "express";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(import.meta.dirname, "public")));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
