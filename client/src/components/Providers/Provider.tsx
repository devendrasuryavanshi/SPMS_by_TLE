import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";

const ThemedToaster = () => {
  const { theme } = useTheme();

  return (
    <Toaster
      position="bottom-left"
      theme={theme === "dark" ? "dark" : "light"}
    />
  );
};

export const Provider = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <NextUIProvider>
      <NextThemesProvider attribute="class" defaultTheme="light">
        {mounted ? children :
          <div style={{ visibility: 'hidden' }}>
            {children}
          </div>
        }
        <ThemedToaster />
      </NextThemesProvider>
    </NextUIProvider>
  );
}
