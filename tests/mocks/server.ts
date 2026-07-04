import { setupServer } from "msw/node";
import { handlers } from "./handlers";

/** Node-side MSW server — start in a test's beforeAll, reset afterEach, close afterAll. */
export const mswServer = setupServer(...handlers);
