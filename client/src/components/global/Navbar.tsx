import { useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar
} from "@nextui-org/react";
import { GraduationCap, LogOut, Settings } from "lucide-react";
import { ThemeSwitcher } from "../ThemeSwitcher/ThemeSwitcher";
import { useAuth } from "../../context/AuthContext";
import { Link as RouterLink, useNavigate } from "react-router-dom";

const NavbarComponent = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();

  const menuItems = [
    { name: "Student Profiles", href: "/students", icon: <GraduationCap size={18} /> },
    ...(user?.email === "admin_spms@gmail.com" ? [
      { name: "System Management", href: "/admin/settings", icon: <Settings size={18} /> }
    ] : [])
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return window.location.pathname === path;
  };

  return (
    <Navbar
      className="bg-surface dark:bg-surface-dark border-b border-secondary/20 dark:border-secondary-dark/20 transition-colors duration-300 shadow-sm"
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      maxWidth="xl"
      isBordered
    >
      <NavbarContent justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden text-text-primary dark:text-text-primary-dark h-6"
        />

        <NavbarBrand className="flex gap-2 justify-start">
          <Link className="text-text-primary dark:text-text-primary-dark flex items-center gap-2" href="/">
            <GraduationCap size={30} className="text-primary dark:text-primary-dark" />
            <p className="font-bold text-xl hidden hover:text-primary hover:dark:text-primary-dark sm:block">SPMS</p>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-6" justify="center">
        {menuItems.map((item, index) => (
          <NavbarItem key={index} isActive={isActive(item.href)}>
            <Link
              href={item.href}
              className={`flex items-center gap-2 text-secondary dark:text-secondary-dark hover:text-primary dark:hover:text-primary-dark transition-colors ${isActive(item.href) ? "font-medium text-primary dark:text-primary-dark" : ""
                }`}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.icon}
              {item.name}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <ThemeSwitcher />
        </NavbarItem>
        {isAuthenticated ? (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                as="button"
                className="transition-transform text-md bg-primary dark:bg-primary-dark"
                size="md"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="User menu actions" className="bg-surface dark:bg-surface-dark">
              <DropdownItem
                key="logout"
                color="danger"
                startContent={<LogOut className="w-4 h-4" />}
                onClick={handleLogout}
              >
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <>
            <NavbarItem>
              <Button
                as={RouterLink}
                color="primary"
                to="/login"
                variant="flat"
                className="bg-primary dark:bg-primary-dark text-white"
              >
                Sign In
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>

      <NavbarMenu className="bg-surface/90 dark:bg-surface-dark/90 backdrop-blur-md pt-6">
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={index}>
            <Link
              href={item.href}
              className={`flex items-center gap-3 w-full py-2 text-lg ${isActive(item.href)
                ? "text-primary dark:text-primary-dark font-medium"
                : "text-secondary dark:text-secondary-dark"
                }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.icon}
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}

export default NavbarComponent;
