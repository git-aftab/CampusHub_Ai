import "dotenv/config";
import app from "./app.js";
import { testSupabaseConnection } from "./db/supabaseTest.js";

const PORT = process.env.PORT || 3000;
testSupabaseConnection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`app is listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Supabase Connection Error",err);
    process.exit(1);
  });

console.log("hellow initializing the project");
