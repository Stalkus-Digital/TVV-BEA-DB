import { stopTestServer } from "../helpers/test-server";

export default async function globalTeardown(): Promise<void> {
  await stopTestServer();
}
