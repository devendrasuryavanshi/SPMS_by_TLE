import { useTheme } from "next-themes";
import { MoonIcon } from "./MoonIcon";
import { SunIcon } from "./SunIcon";

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <div className="h-6 w-6 cursor-pointer hover:opacity-75 flex items-center justify-center" onClick={toggleTheme}>
      {theme === 'light' ? <MoonIcon className="text-gray-600 text-3xl" /> : <SunIcon className="text-3xl text-gray-300" />}
    </div>
  )
};
