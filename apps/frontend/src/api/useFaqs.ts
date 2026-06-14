import { useQuery } from "@tanstack/react-query";
import { getFaqs, type Faq } from "./faqs";

// Shared query key so the public section and the dashboard editor stay in sync.
export const faqsKey = ["faqs"] as const;

interface UseFaqs {
  faqs: Faq[];
  loading: boolean;
  error: string | null;
}

export function useFaqs(): UseFaqs {
  const { data, isPending, error } = useQuery({
    queryKey: faqsKey,
    queryFn: getFaqs,
  });

  return {
    faqs: data ?? [],
    loading: isPending,
    error: error instanceof Error ? error.message : null,
  };
}
