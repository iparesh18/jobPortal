import React from "react";
import { Link, useLocation } from "react-router-dom";

const routeNameMap = {
  "": "Home",
  jobs: "Jobs",
  browse: "Browse",
  "saved-jobs": "Saved Jobs",
  profile: "Profile",
  admin: "Admin",
  companies: "Companies",
};

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <div className="bg-gradient-to-r from-purple-50 via-white to-purple-50 border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <nav className="flex items-center flex-wrap gap-2 text-sm">
          
          {/* Home */}
          <Link
            to="/"
            className="text-gray-500 hover:text-purple-600 transition-all duration-200 font-medium"
          >
            Home
          </Link>

          {pathnames.map((value, index) => {
            const to = "/" + pathnames.slice(0, index + 1).join("/");
            const isLast = index === pathnames.length - 1;

            return (
              <div key={to} className="flex items-center gap-2">
                
                {/* Separator */}
                <span className="text-gray-400 font-semibold">{">"}</span>

                {isLast ? (
                  <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold shadow-sm">
                    {routeNameMap[value] || value}
                  </span>
                ) : (
                  <Link
                    to={to}
                    className="text-gray-500 hover:text-purple-600 transition-all duration-200 font-medium capitalize"
                  >
                    {routeNameMap[value] || value}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Breadcrumbs;