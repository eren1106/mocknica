"use client";

import React, { useState } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Star } from "lucide-react";
import { cn, convertCamelCaseToTitle } from "@/lib/utils";
import PasswordInput from "./password-input";
import { SelectOption } from "@/types/select-option";
import AutoResizeTextarea from "./auto-resize-textarea";
import DatePicker from "./date-picker";
import { InputTags } from "./input-tags";
import { Switch } from "./ui/switch";
import RichTextEditor from "./rich-text-editor";
import Combobox from "./combobox";
import Link from "next/link";

interface BaseField {
  control: any;
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  optional?: boolean; // add asterisk (*) on label if not optional
  useFormNameAsLabel?: boolean;
  topEndContent?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  displayError?: boolean;
}

interface InputField {
  type:
    | "input"
    | "number"
    | "password"
    | "email"
    | "star"
    | "date"
    | "tags"
    | "switch"
    | "rich-text"
    | "checkbox";
  inputClassName?: string;
}

interface TextareaField {
  type: "textarea";
  minRows?: number;
}

interface SelectField {
  type: "select" | "multiple-choice" | "combobox";
  options: SelectOption[];
  defaultValue?: string;
  emptyOptionsFallback?: React.ReactNode;
}

interface CustomField {
  type: "custom";
  customChildren: React.ReactNode;
}

interface RadioField {
  type: "radio";
  options: SelectOption[];
  hasOther?: boolean;
  textFieldMinRows?: number;
}

interface FileField {
  type: "file";
  inputClassName?: string;
  fileUrl?: string;
}

type GenericFormFieldProps =
  | (BaseField & InputField)
  | (BaseField & TextareaField)
  | (BaseField & SelectField)
  | (BaseField & RadioField)
  | (BaseField & FileField)
  | (BaseField & CustomField);

const GenericFormField: React.FC<GenericFormFieldProps> = (
  props: GenericFormFieldProps
) => {
  const { displayError = true } = props;

  // for radio section
  const [otherValue, setOtherValue] = useState("");
  const [radioValue, setRadioValue] = useState<string>("");

  const {
    control,
    name,
    label,
    type,
    placeholder = `Enter ${convertCamelCaseToTitle(name)}`,
    description,
    disabled = false,
    optional = false,
    useFormNameAsLabel = true,
  } = props;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        let res;
        switch (type) {
          case "input":
            res = (
              <Input
                placeholder={placeholder}
                {...field}
                disabled={disabled}
                className={props.inputClassName}
              />
            );
            break;
          case "number":
            res = (
              <Input
                placeholder={placeholder}
                {...field}
                type="number"
                disabled={disabled}
                className={props.inputClassName}
              />
            );
            break;
          case "email":
            res = (
              <Input
                placeholder={placeholder}
                {...field}
                type="email"
                disabled={disabled}
                className={props.inputClassName}
              />
            );
            break;
          case "file":
            res = (
              <>
                <Input
                  type="file"
                  // {...field}
                  disabled={disabled}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      field.onChange(file); // Pass the file to form state directly
                    }
                  }}
                  className={cn(props.inputClassName, "cursor-pointer")}
                />
                {props.fileUrl && (
                  <Link
                    href={props.fileUrl}
                    target="_blank"
                    className="text-sm text-primary underline"
                  >
                    View current resume
                  </Link>
                )}
              </>
            );
            break;
          case "password":
            res = (
              <PasswordInput
                placeholder={placeholder}
                {...field}
                disabled={disabled}
              />
            );
            break;
          case "textarea":
            res = (
              <AutoResizeTextarea
                placeholder={placeholder}
                minRows={props.minRows || 3}
                {...field}
                disabled={disabled}
              />
            );
            break;
          case "select":
            res = (
              <Select
                onValueChange={field.onChange}
                defaultValue={
                  field.value
                    ? field.value?.toString()
                    : props.defaultValue?.toString()
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {props.options.length > 0 ? (
                    props.options.map((item) => (
                      <SelectItem value={`${item.value}`} key={item.value}>
                        {item.label}
                      </SelectItem>
                    ))
                  ) : (
                    props.emptyOptionsFallback || (
                      <i className="text-muted-foreground text-sm px-1">
                        No options
                      </i>
                    )
                  )}
                </SelectContent>
              </Select>
            );
            break;
          case "combobox":
            res = (
              <Combobox
                items={props.options || []}
                onSelect={field.onChange}
                placeholder={placeholder}
                initialValue={field.value}
              />
            );
            break;
          case "radio":
            res = (
              <RadioGroup
                value={radioValue}
                onValueChange={(value) => {
                  field.onChange(value);
                  setRadioValue(value);
                  if (value !== "other") {
                    setOtherValue("");
                  }
                }}
                className="gap-5"
                disabled={disabled}
              >
                {props.options?.map((item) => (
                  <div key={item.value} className="flex items-center gap-2">
                    <RadioGroupItem
                      value={`${item.value}`}
                      id={`${item.value}`}
                    />
                    <Label htmlFor={`${item.value}`}>{item.label}</Label>
                  </div>
                ))}
                {props.hasOther && (
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                )}
                {radioValue === "other" && (
                  <AutoResizeTextarea
                    placeholder="Please specify"
                    minRows={props.textFieldMinRows || 3}
                    value={otherValue}
                    onChange={(e) => {
                      setOtherValue(e.target.value);
                      field.onChange(e.target.value);
                    }}
                  />
                )}
              </RadioGroup>
            );
            break;
          case "multiple-choice":
            res = (
              <div className="flex flex-col gap-5">
                {props.options?.map((item) => (
                  <div className="flex items-center gap-2" key={item.value}>
                    <Checkbox
                      id={`${item.value}`}
                      checked={field.value?.includes(item.value)}
                      onCheckedChange={(checked) =>
                        checked
                          ? field.onChange([...field.value, item.value])
                          : field.onChange(
                              field.value?.filter(
                                (value: string) => value !== item.value
                              )
                            )
                      }
                      disabled={disabled}
                    />
                    <Label htmlFor={`${item.value}`}>{item.label}</Label>
                  </div>
                ))}
              </div>
            );
            break;
          case "star":
            res = (
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={24}
                    className={`cursor-pointer ${
                      field.value >= star
                        ? "text-primary fill-primary"
                        : "text-muted-foreground"
                    } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                    onClick={() => field.onChange(star)}
                  />
                ))}
              </div>
            );
            break;
          case "date":
            res = (
              <DatePicker selected={field.value} onSelect={field.onChange} />
            );
            break;
          case "tags":
            res = (
              <InputTags
                value={field.value}
                onChange={field.onChange}
                placeholder="Enter values, comma separated..."
              />
            );
            break;
          case "switch":
            res = (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            );
            break;
          case "rich-text":
            res = (
              <RichTextEditor value={field.value} onChange={field.onChange} />
            );
            break;
          case "checkbox":
            res = (
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            );
            break;
          case "custom":
            res = props.customChildren;
            break;
          default:
            res = <></>;
            break;
        }

        return (
          <FormItem
            className={cn("flex flex-col items-start w-full", props.className)}
          >
            <div
              className={cn(
                "flex items-center gap-2 justify-between w-full",
                props.contentClassName
              )}
            >
              {(label || useFormNameAsLabel) && (
                <FormLabel className="font-medium text-sm flex gap-1 items-center">
                  {label || convertCamelCaseToTitle(name)}{" "}
                  {!optional && <p>*</p>}
                </FormLabel>
              )}
              {props.topEndContent && (
                <div className="ml-auto">{props.topEndContent}</div>
              )}
            </div>
            {description && (
              <FormDescription className="whitespace-pre">
                {description}
              </FormDescription>
            )}
            <FormControl>{res}</FormControl>
            {displayError && <FormMessage />}
          </FormItem>
        );
      }}
    />
  );
};

export default GenericFormField;
