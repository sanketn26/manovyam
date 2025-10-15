import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface ThemeToggleProps {
  theme: "light" | "dark" | "system";
  onThemeChange: (theme: "light" | "dark" | "system") => void;
}

export function ThemeToggle({ theme, onThemeChange }: ThemeToggleProps) {
  const getIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      case "system":
        return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          {getIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => onThemeChange("light")}
          className="gap-2"
        >
          <Sun className="h-4 w-4" />
          Light
          {theme === "light" && (
            <span className="ml-auto text-[#4ECDC4]">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onThemeChange("dark")}
          className="gap-2"
        >
          <Moon className="h-4 w-4" />
          Dark
          {theme === "dark" && (
            <span className="ml-auto text-[#4ECDC4]">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onThemeChange("system")}
          className="gap-2"
        >
          <Monitor className="h-4 w-4" />
          System
          {theme === "system" && (
            <span className="ml-auto text-[#4ECDC4]">✓</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
