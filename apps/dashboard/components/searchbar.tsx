import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface SearchbarProps extends ComponentProps<typeof Input> {
  containerClassName?: string;
  placeholder?: string;
  showClearIcon?: boolean;
  onClear?: () => void;
}

const SearchBar = ({
  containerClassName,
  placeholder = "Search",
  showClearIcon = true,
  onClear,
  ...props
}: SearchbarProps) => {
  return (
    <div className={cn("relative", containerClassName)}>
      <Search
        size={20}
        className="absolute top-1/2 -translate-y-1/2 left-2 text-muted-foreground"
      />
      <Input
        className={cn("pl-8", props.className)}
        placeholder={placeholder}
        {...props}
      />
      {showClearIcon && (
        <Button
          variant="text"
          className="absolute top-1/2 -translate-y-1/2 right-1 text-muted-foreground"
          onClick={onClear}
        >
          <X size={20} />
        </Button>
      )}
    </div>
  );
};

export default SearchBar;
