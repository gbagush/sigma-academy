import { ArrowUp } from "lucide-react";

export default function Footer() {
  return (
    <footer className="container mx-auto max-w-7xl py-3 px-6">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="mb-2 md:mb-0">
          <span className="text-foreground/75">
            &copy; 2024 Sigma Academy. All rights reserved.
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-foreground cursor-pointer">Back to top</span>
          <ArrowUp size={16} className="ml-1" />{" "}
        </div>
      </div>
    </footer>
  );
}
