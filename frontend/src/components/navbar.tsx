import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 inset-x-0 w-full z-50"
    >
      <div className="flex items-center justify-between p-4 max-w-7xl mx-auto bg-white/50 backdrop-blur-lg border-b border-black/[0.1]">
        <h1 className="text-xl font-bold text-black">Synthify</h1>
        <div className="flex items-center gap-4">
          <Button variant="ghost">Login</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>Sign Up</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem>As a Researcher</DropdownMenuItem>
              <DropdownMenuItem>As a Hospital Admin</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
}