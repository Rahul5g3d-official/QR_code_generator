import { cloneElement, forwardRef, isValidElement } from "react";
import { cn } from "../../lib/cn";
import { Spinner } from "./Spinner";

const variants = {
  primary:
    "bg-primary text-primary-contrast hover:bg-primary-strong border-transparent shadow-control",
  secondary:
    "bg-surface text-text hover:bg-surface-muted border-border shadow-control",
  ghost: "border-transparent bg-transparent text-muted hover:bg-surface-muted hover:text-text",
  danger:
    "bg-danger text-white hover:bg-red-700 border-transparent shadow-control",
  subtle:
    "bg-blue-50 text-primary hover:bg-blue-100 border-blue-100 shadow-control",
};

const sizes = {
  sm: "h-9 gap-2 px-3 text-sm",
  md: "h-10 gap-2.5 px-4 text-sm",
  lg: "h-12 gap-3 px-5 text-base",
  icon: "h-10 w-10 p-0",
};

export const Button = forwardRef(function Button(
  {
    asChild = false,
    className,
    variant = "primary",
    size = "md",
    loading = false,
    disabled,
    children,
    type = "button",
    ...props
  },
  ref,
) {
  const classes = cn(
    "focus-ring inline-flex shrink-0 items-center justify-center rounded-md border font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant],
    sizes[size],
    className,
  );

  if (asChild && isValidElement(children)) {
    return cloneElement(children, {
      ref,
      className: cn(classes, children.props.className),
      ...props,
      children: (
        <>
          {loading ? <Spinner className="h-4 w-4" /> : null}
          {children.props.children}
        </>
      ),
    });
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={classes}
      {...props}
    >
      {loading ? <Spinner className="h-4 w-4" /> : null}
      {children}
    </button>
  );
});
