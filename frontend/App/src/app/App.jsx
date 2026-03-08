import { ThemeProvider } from "next-themes";
import { RouterProvider } from "react-router";
import { defaultSettingsState } from "../entities/settings/model/default-settings";
import { router } from "./router";

export default function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={defaultSettingsState.display.theme}
      disableTransitionOnChange
      enableSystem={false}
      storageKey="emailassist-theme"
    >
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
