import { apiSlice } from "../api/apiSlice";

export const templatesApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Получение всех шаблонов
    getTemplates: builder.query({
      query: () => '/templates/',
      providesTags: ['Templates'],
    }),

    // Получение шаблона по ID
    getTemplateById: builder.query({
      query: (id) => `/templates/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Templates', id }],
    }),

    // Создание шаблона
    createTemplate: builder.mutation({
      query: (templateData) => ({
        url: '/templates/',
        method: 'POST',
        body: templateData,
      }),
      invalidatesTags: ['Templates'],
    }),

    // Обновление шаблона
    updateTemplate: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/templates/${id}/`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Templates', id }],
    }),

    // Удаление шаблона
    deleteTemplate: builder.mutation({
      query: (id) => ({
        url: `/templates/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Templates'],
    }),
  }),
});

export const {
  useGetTemplatesQuery,
  useGetTemplateByIdQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
} = templatesApi;
