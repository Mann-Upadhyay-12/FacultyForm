import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.warn("404: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f4f6f9] p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-[#1e3a5f]">
          <AlertCircle className="w-8 h-8 text-[#1e3a5f]" />
        </div>
        <h1 className="text-4xl font-extrabold text-[#1e3a5f] mb-1">404</h1>
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Page Not Found</h2>
        <p className="text-sm text-slate-600 mb-6">
          The requested path <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">{location.pathname}</code> does not exist in the faculty portal.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/form/personal"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1e3a5f] hover:bg-[#2d5a87] text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <Home className="w-4 h-4" />
            Go to Assessment Form
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
