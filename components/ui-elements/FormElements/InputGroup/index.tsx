import React from "react";
import { cn } from "@/lib/utils";

interface InputGroupProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "height"> {
  label?: string;
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
  inputClassName?: string;
  fileStyleVariant?: "style1" | "style2";
  active?: boolean;
  height?: "sm" | "default";
}

const InputGroup = React.forwardRef<HTMLInputElement, InputGroupProps>(
  (
    {
      className, // For the container
      inputClassName, // For the input element
      label,
      type,
      icon,
      endIcon,
      required,
      active,
      height,
      fileStyleVariant,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const id = props.id || generatedId;

    return (
      <div className={className}>
        {label && (
          <label
            htmlFor={id}
            className="mb-2.5 block text-body-sm font-medium text-dark dark:text-white"
          >
            {label}
            {required && <span className="ml-1 select-none text-red">*</span>}
          </label>
        )}

        <div className="relative mt-3">
          {icon && (
            <span className="absolute left-4.5 top-1/2 -translate-y-1/2">
              {icon}
            </span>
          )}

          <input
            id={id}
            type={type}
            ref={ref}
            required={required}
            data-active={active}
            className={cn(
              // Base styles from original component
              "w-full rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition focus:border-primary disabled:cursor-default disabled:bg-gray-2 data-[active=true]:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary dark:disabled:bg-dark dark:data-[active=true]:border-primary",
              // File input specific styles
              type === "file"
                ? getFileStyles(fileStyleVariant || "style2")
                : "px-5.5 py-3 text-dark placeholder:text-dark-6 dark:text-white",
              // Padding adjustments for icons
              icon && "pl-12.5",
              endIcon && "pr-12.5",
              // Height adjustment
              height === "sm" && "py-2.5",
              // Allow overriding with passed inputClassName
              inputClassName,
            )}
            {...props}
          />

          {endIcon && (
            <div className="absolute right-4.5 top-1/2 -translate-y-1/2 flex items-center">
              {endIcon}
            </div>
          )}
        </div>
      </div>
    );
  },
);

InputGroup.displayName = "InputGroup";

function getFileStyles(variant: "style1" | "style2") {
  switch (variant) {
    case "style1":
      return `file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-[#E2E8F0] file:px-6.5 file:py-[13px] file:text-body-sm file:font-medium file:text-dark-5 file:hover:bg-primary file:hover:bg-opacity-10 dark:file:border-dark-3 dark:file:bg-white/30 dark:file:text-white`;
    default:
      return `file:mr-4 file:rounded file:border-[0.5px] file:border-stroke file:bg-stroke file:px-2.5 file:py-1 file:text-body-xs file:font-medium file:text-dark-5 file:focus:border-primary dark:file:border-dark-3 dark:file:bg-white/30 dark:file:text-white px-3 py-[9px]`;
  }
}

export default InputGroup;