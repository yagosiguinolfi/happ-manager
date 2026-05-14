import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '../api-services/transaction-service';

// Key factories for React Query
const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters?: any) => [...transactionKeys.lists(), filters] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
};

// Hook para buscar todas as transações
export const useTransactions = (params?: any) => {
  return useQuery({
    queryKey: transactionKeys.list(params),
    queryFn: () => transactionService.getAll(params),
    select: (data) => data.data, // Extrair apenas os dados
  });
};

// Hook para buscar uma transação específica
export const useTransaction = (id: string) => {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => transactionService.getById(id),
    select: (data) => data.data,
    enabled: !!id,
  });
};

// Hook para criar uma transação
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => transactionService.create(data),
    onSuccess: () => {
      // Invalidar cache para recarregar a lista
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    },
  });
};

// Hook para atualizar uma transação
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      transactionService.update(id, data),
    onSuccess: (_, { id }) => {
      // Invalidar cache para recarregar a lista e detalhe
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(id) });
    },
  });
};

// Hook para deletar uma transação
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => transactionService.delete(id),
    onSuccess: () => {
      // Invalidar cache para recarregar a lista
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    },
  });
};
