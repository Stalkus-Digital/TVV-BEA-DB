"use client";

import { useQuery } from "@tanstack/react-query";
import { adminQueryKeys } from "@/shared/lib/query-client";
import {
  fetchContentPerformance,
  fetchFormStatistics,
  fetchLandingPages,
  fetchMarketingDashboard,
  fetchSeoDashboard,
  fetchWebsiteHome,
  fetchWebsiteNavigation,
  fetchCampaigns,
} from "../api/marketing";

export function useMarketingDashboardQuery() {
  return useQuery({
    queryKey: adminQueryKeys.marketing.dashboard,
    queryFn: fetchMarketingDashboard,
  });
}

export function useFormStatisticsQuery() {
  return useQuery({
    queryKey: adminQueryKeys.marketing.forms,
    queryFn: fetchFormStatistics,
  });
}

export function useSeoDashboardQuery() {
  return useQuery({
    queryKey: adminQueryKeys.marketing.seo,
    queryFn: fetchSeoDashboard,
  });
}

export function useLandingPagesQuery() {
  return useQuery({
    queryKey: adminQueryKeys.marketing.landingPages,
    queryFn: fetchLandingPages,
  });
}

export function useContentPerformanceQuery() {
  return useQuery({
    queryKey: adminQueryKeys.marketing.content,
    queryFn: fetchContentPerformance,
  });
}

export function useWebsiteHomeQuery() {
  return useQuery({
    queryKey: adminQueryKeys.marketing.websiteHome,
    queryFn: fetchWebsiteHome,
  });
}

export async function useWebsiteNavigationQuery() {
  return useQuery({
    queryKey: adminQueryKeys.marketing.websiteNavigation,
    queryFn: fetchWebsiteNavigation,
  });
}

export function useCampaignsQuery() {
  return useQuery({
    queryKey: ["admin", "marketing", "campaigns"],
    queryFn: fetchCampaigns,
  });
}
