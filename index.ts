import express from "express";
import expressMd from "express-md";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

const mdRouter = expressMd({
  // serve markdown files from `docs` directory
  dir: path.join(import.meta.dirname, "docs"),

  // serve requests from root of the site
  url: "/",

  // variables to replace {{{ varName }}} in markdown files
  vars: {
    message: "Hello World!",
  },
});

app.use("/public", express.static(path.join(import.meta.dirname, "public")));
app.use(mdRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
