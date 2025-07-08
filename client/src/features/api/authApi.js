import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "../authSlice";

const USER_API = "https://next-level-nexus.onrender.com/api/v1/user/";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: USER_API,
    credentials: "include", 
  }),
  endpoints: (builder) => ({
    // Register user
    registerUser: builder.mutation({
      query: (inputData) => ({
        url: "register",
        method: "POST",
        body: inputData,
      }),
    }),

    // Login user
    loginUser: builder.mutation({
      query: (inputData) => ({
        url: "login",
        method: "POST",
        body: inputData,
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(userLoggedIn({ user: result.data.user }));
        } catch (error) {
          console.error("Login failed:", error);
        }
      },
    }),

    // Logout user
    logoutUser: builder.mutation({
      query: () => ({
        url: "logout",
        method: "GET",
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
          dispatch(userLoggedOut());
        } catch (error) {
          console.error("Logout failed:", error);
        }
      },
    }),

    // Load currently logged-in user (used on page refresh, app init, etc.)
    loadUser: builder.query({
      query: () => ({
        url: "profile",
        method: "GET",
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(userLoggedIn({ user: result.data.user }));
        } catch (error) {
          console.error("Load user failed:", error);
        }
      },
    }),

    // Get extra user data
    userData: builder.query({
      query: () => ({
        url: "data",
        method: "GET",
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(userLoggedIn({ user: result.data.user }));
        } catch (error) {
          console.error("User data fetch failed:", error);
        }
      },
    }),

    // Update user profile
    updateUser: builder.mutation({
      query: (formData) => ({
        url: "profile/update",
        method: "PUT",
        body: formData,
      }),
    }),
  }),
});

// Export hooks
export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useLogoutUserMutation,
  useLoadUserQuery,
  useUpdateUserMutation,
  useUserDataQuery,
} = authApi;
