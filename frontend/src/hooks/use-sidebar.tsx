/*
import { createContext, useContext, useState, useEffect } from "react";
interface SidebarContextType {
  isOpen: boolean;
  isCollapsed: boolean;
  isMobile: boolean;
  setIsOpen: (open: boolean) => void;
  setIsCollapsed: (collapsed: boolean) => void;
  toggle: () => void;
  toggleCollapse: () => void;
}
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
     
      // Auto-collapse on desktop, auto-close on mobile
      if (!mobile && isOpen) {
        setIsOpen(false);
      }
    };
   
    checkMobile();
    window.addEventListener("resize", checkMobile);
   
    return () => window.removeEventListener("resize", checkMobile);
  }, [isOpen]);
  useEffect(() => {
    // Handle body scroll lock when mobile sidebar is open
    if (isMobile && isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
   
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, isOpen]);
  const toggle = () => {
    if (isMobile) {
      setIsOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => !prev);
    }
  };
  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };
  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        isCollapsed,
        isMobile,
        setIsOpen,
        setIsCollapsed,
        toggle,
        toggleCollapse,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
*/
export {}
