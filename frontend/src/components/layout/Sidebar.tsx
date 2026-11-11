/*
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/hooks/use-sidebar";
import { navigationData, type NavItem } from "@/lib/data";
import { Link, useLocation } from "wouter";
import { useModeSidebar } from "@/hooks/use-mode-sidebar.tsx";
function NavItemComponent({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  const [location] = useLocation();
  const isActive = location === item.href;
 
  return (
    <Link href={item.href} onClick={onClick}>
      <span
        className={`block py-2.5 px-3 text-sm font-medium rounded-lg transition-all ${
          isActive
            ? "bg-primary/10 text-primary border-l-2 border-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
        }`}
        data-testid={`link-nav-${item.id}`}
      >
        {item.label}
      </span>
    </Link>
  );
}
export function Sidebar() {
  const { isOpen, isCollapsed, setIsOpen } = useSidebar();
  const { toggle: toggleMode } = useModeSidebar();
  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };
 
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
          data-testid="sidebar-overlay"
        />
      )}
     
      <aside
        className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 transform bg-background border-r border-border/40 transition-all duration-300 ease-in-out md:sticky md:top-16 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${isCollapsed ? "md:w-0 md:overflow-hidden md:opacity-0" : "md:w-64 md:opacity-100"}`}
        data-testid="sidebar"
      >
        <div className="flex h-full flex-col p-4">
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <nav className="space-y-1">
              {navigationData.map((section) =>
                section.items.map((item) => (
                  <NavItemComponent key={item.id} item={item} onClick={handleNavClick} />
                ))
              )}
            </nav>
          </div>
                <div className="pt-4 border-t border-border/40">
          <Button
          variant="ghost"
          className="w-full justify-start text-gray-400 hover:text-[#74AF87] hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] transition"
          data-testid="button-menu-toggle"
          onClick={toggleMode}
              >
              <svg><path fill-rule="evenodd" clip-rule="evenodd" d="M2 12.3393C1.58579 12.3393 1.25 12.0035 1.25 11.5893L1.25 6.48933C1.25 4.55633 2.817 2.98933 4.75 2.98933L6.75 2.98933V1.97671C6.75 1.53439 7.2821 1.30991 7.59892 1.61858L9.38241 3.3562C9.58386 3.55246 9.58386 3.8762 9.38242 4.07246L7.59892 5.81008C7.2821 6.11875 6.75 5.89427 6.75 5.45196V4.48933L4.75 4.48933C3.64543 4.48933 2.75 5.38476 2.75 6.48933L2.75 11.5893C2.75 12.0035 2.41421 12.3393 2 12.3393ZM14 3.66067C14.4142 3.66067 14.75 3.99646 14.75 4.41067V9.51066C14.75 11.4437 13.183 13.0107 11.25 13.0107H9.25001V14.0233C9.25001 14.4656 8.7179 14.6901 8.40109 14.3814L6.61759 12.6438C6.41615 12.4475 6.41615 12.1238 6.61759 11.9275L8.40109 10.1899C8.7179 9.88124 9.25001 10.1057 9.25001 10.548V11.5107H11.25C12.3546 11.5107 13.25 10.6152 13.25 9.51066V4.41067C13.25 3.99646 13.5858 3.66067 14 3.66067Z" fill="currentColor"></path></svg>
      </Button>
    </div>
        </div>
      </aside>
    </>
  );
}
*/
export {}
