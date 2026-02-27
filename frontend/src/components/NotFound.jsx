// src/pages/NotFound.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { XCircle } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center max-w-lg">
        <div className="flex justify-center mb-6">
          <XCircle size={80} className="text-purple-600 animate-bounce" />
        </div>
        <h1 className="text-6xl font-extrabold text-gray-900 dark:text-white mb-4">
          404
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
          Oops! The page you are looking for does not exist or has been moved.
        </p>
        <Button
          onClick={() => navigate("/")}
          className="bg-purple-600 text-white hover:bg-purple-700 transition px-8 py-3 rounded-full shadow-lg"
        >
          Go Home
        </Button>
        <div className="mt-10 text-gray-400 dark:text-gray-500 text-sm">
          If you think this is an error, please contact support.
        </div>
      </div>
    </div>
  );
};

export default NotFound;