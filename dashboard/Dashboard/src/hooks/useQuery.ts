import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
  QueryKey,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

type HttpMethod = 'post' | 'put' | 'delete' | 'patch';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface QueryRequestConfig<TData> {
  url: string;
  queryKey?: QueryKey;
  successMessage?: string;
  errorMessage?: string;
  queryOptions?: Omit<UseQueryOptions<TData, ApiError, TData, QueryKey>, 'queryKey' | 'queryFn'>;
  
}

export interface MutationRequestConfig<TData, TVariables> {
  url: string;
  method: HttpMethod;
  successMessage?: string;
  errorMessage?: string;
  mutationOptions?: Omit<UseMutationOptions<TData, ApiError, TVariables>, 'mutationFn'>;
  auth?: boolean;
  queryKey?: string | readonly unknown[];
}

// METHOD GET
export function useQueryRequest<TData>({
  url,
  queryKey,
  errorMessage = 'Có lỗi xảy ra!',
  queryOptions,
}: QueryRequestConfig<TData>) {
  const result = useQuery<TData, ApiError>({
    queryKey: queryKey || [url],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/proxy${url}`);

        if (!res.ok) {
          const errorData = await res.json();
          throw { response: { data: errorData } };
        }

        const data = await res.json();
        return data;
      } catch (error) {
        const typedError = error as ApiError;
        const message = typedError?.response?.data?.message || errorMessage;
        toast.error(message);
        throw error;
      }
    },
    ...queryOptions,
  });

  return result;
}

// METHOD POST, PUT, PATCH, DELETE
export function useMutationRequest<TData, TVariables>({
  url,
  method,
  successMessage = 'Thao tác thành công!',
  errorMessage = 'Có lỗi xảy ra!',
  mutationOptions,
  auth = true,
  queryKey,
}: MutationRequestConfig<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation<TData, ApiError, TVariables>({
    ...mutationOptions,
    mutationFn: async (variables: TVariables) => {
      const endpoint = auth ? `/api/proxy${url}` : url;

      // Kiểm tra nếu variables là FormData thì không set Content-Type và không stringify body
      const isFormData = variables instanceof FormData;
      
      const res = await fetch(endpoint, {
        method: method.toUpperCase(),
        headers: isFormData 
          ? {} // Không set header cho FormData, browser sẽ tự set với boundary
          : { 'Content-Type': 'application/json' },
        body: isFormData 
          ? variables as FormData 
          : JSON.stringify(variables),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw { response: { data: errorData } };
      }

      return res.json();
    },
    onSuccess: (data, variables, context) => {
      toast.success(successMessage);
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] });
      }
      mutationOptions?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      const message = error?.response?.data?.message || errorMessage;
      toast.error(message);
      mutationOptions?.onError?.(error, variables, context);
    },
  });
}
