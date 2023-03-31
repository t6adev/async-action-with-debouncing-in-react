import React from "react";
import { createRoot } from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";

import { theme } from "./theme";
import { App } from "./App";

const element = document.getElementById("root");
if (!element) {
  throw new Error("unexpected");
}
const root = createRoot(element);
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
