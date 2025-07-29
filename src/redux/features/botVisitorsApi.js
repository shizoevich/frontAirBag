import { apiSlice } from "../api/apiSlice";

export const botVisitorsApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Получение всех bot-visitors
    getBotVisitors: builder.query({
      query: () => '/bot-visitors/',
      providesTags: ['BotVisitors'],
    }),

    // Получение bot-visitor по ID
    getBotVisitorById: builder.query({
      query: (id) => `/bot-visitors/${id}/`,
      providesTags: (result, error, id) => [{ type: 'BotVisitors', id }],
    }),

    // Создание bot-visitor
    createBotVisitor: builder.mutation({
      query: (visitorData) => ({
        url: '/bot-visitors/',
        method: 'POST',
        body: visitorData,
      }),
      invalidatesTags: ['BotVisitors'],
    }),

    // Обновление bot-visitor
    updateBotVisitor: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/bot-visitors/${id}/`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'BotVisitors', id }],
    }),

    // Удаление bot-visitor
    deleteBotVisitor: builder.mutation({
      query: (id) => ({
        url: `/bot-visitors/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['BotVisitors'],
    }),
  }),
});

export const {
  useGetBotVisitorsQuery,
  useGetBotVisitorByIdQuery,
  useCreateBotVisitorMutation,
  useUpdateBotVisitorMutation,
  useDeleteBotVisitorMutation,
} = botVisitorsApi;
