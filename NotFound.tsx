import React from "react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "./button"; // Fixed path for flat repo

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User tried to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="text-xl text-muted-foreground">
          Oops! The page you're looking for doesn't exist.
        </p>
        <div className="pt-4">
          <Button asChild className="w-full sm:w-auto">
            <a href="/SoundMap/">
              Return to Sound Dashboard
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
