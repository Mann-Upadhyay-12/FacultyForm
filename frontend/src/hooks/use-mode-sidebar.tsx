import { createContext, useContext, useState, useEffect } from "react";
interface ModeSidebarContextType {
  isOpen: boolean;
  isMobile: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
}
const ModeSidebarContext = createContext<ModeSidebarContextType | undefined>(undefined);
export function ModeSidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  const toggle = () => setIsOpen((prev) => !prev);
  return (
    <ModeSidebarContext.Provider value={{ isOpen, isMobile, setIsOpen, toggle }}>
      {children}
    </ModeSidebarContext.Provider>
  );
}
export function useModeSidebar() {
  const context = useContext(ModeSidebarContext);
  if (context === undefined) {
    throw new Error("useModeSidebar must be used within a ModeSidebarProvider");
  }
  return context;
}
