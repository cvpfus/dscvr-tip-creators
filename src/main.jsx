import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { GRAPHQL_API_URL } from "@/constants/index.js";

const queryClient = new QueryClient();
const apolloClient = new ApolloClient({
  uri: GRAPHQL_API_URL,
  cache: new InMemoryCache(),
});

createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <ApolloProvider client={apolloClient}>
      <App />
    </ApolloProvider>
  </QueryClientProvider>,
);
