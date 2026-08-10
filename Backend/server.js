import app from "./src/app.js";
import config from "./src/config/config.js";
import connectDB from "./src/config/database.js";

await connectDB();

const PORT = config.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
