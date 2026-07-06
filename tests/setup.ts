import "@testing-library/jest-dom/vitest";
import { beforeAll, beforeEach } from "vitest";

import { ensureTestDatabase } from "@/tests/helpers/database";

beforeAll(async () => {
  await ensureTestDatabase();
});

beforeEach(async () => {
  await ensureTestDatabase();
});
