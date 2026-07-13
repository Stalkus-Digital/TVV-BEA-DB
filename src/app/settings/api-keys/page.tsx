import { ApiKeyManager } from "@/features/admin-auth/components/ApiKeyManager";

export const metadata = {
  title: "API Keys | The Vacation Voice",
};

export default function ApiKeysPage() {
  return <ApiKeyManager />;
}
