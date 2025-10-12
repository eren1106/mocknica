import { SelectOption } from "@/types/select-option";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface DynamicSelectProps {
  options: SelectOption[];
  onChange?: (value: string) => void;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  className?: string;
}

const DynamicSelect = (props: DynamicSelectProps) => {
  return (
    <Select
      onValueChange={props.onChange}
      defaultValue={props.defaultValue || props.options[0]?.value}
      value={props.value}
    >
      <SelectTrigger className={props.className}>
        <SelectValue placeholder={props.placeholder} />
      </SelectTrigger>
      <SelectContent>
        {props.options.map((item) => (
          <SelectItem
            value={item.value}
            key={item.value}
            className="cursor-pointer"
          >
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default DynamicSelect;
