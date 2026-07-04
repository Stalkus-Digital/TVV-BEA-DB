import type { AppError } from "@/shared/errors";
import type { Result } from "@/shared/types";
import { getNavigationService } from "../module";
import type { NavigationResponseDTO } from "../dto/website-navigation.dto";

export async function getNavigationHandler(): Promise<Result<NavigationResponseDTO, AppError>> {
  return getNavigationService().getNavigation();
}
