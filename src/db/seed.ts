import "dotenv/config";

import { ensureAdminUser } from "@/lib/data";

async function main() {
  const admin = await ensureAdminUser();
  console.log(`Admin ready: ${admin.email}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
