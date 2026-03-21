"use client";

import { useClickOutside } from "@/hooks/use-click-outside";
import { cn } from "@/lib/utils";
import { SetStateActionType } from "@/types/set-state-action-type";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Portal } from "./portal";

type DropdownContextType = {
  isOpen: boolean;
  handleOpen: (rect: DOMRect) => void;
  handleClose: () => void;
  triggerRect: DOMRect | null;
};

const DropdownContext = createContext<DropdownContextType | null>(null);

function useDropdownContext() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("useDropdownContext must be used within a Dropdown");
  }
  return context;
}

type DropdownProps = {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: SetStateActionType<boolean>;
};

export function Dropdown({ children, isOpen, setIsOpen }: DropdownProps) {
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      handleClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
      document.body.style.pointerEvents = "none";
    } else {
      document.body.style.removeProperty("pointer-events");
      setTimeout(() => {
        triggerRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) {
        setIsOpen(false);
        setTriggerRect(null);
      }
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [isOpen, setIsOpen]);

  function handleClose() {
    setIsOpen(false);
    setTriggerRect(null);
  }

  function handleOpen(rect: DOMRect) {
    setTriggerRect(rect);
    setIsOpen(true);
  }

  return (
    <DropdownContext.Provider value={{ isOpen, handleOpen, handleClose, triggerRect }}>
      <div className="relative inline-block" onKeyDown={handleKeyDown}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

type DropdownContentProps = {
  align?: "start" | "end" | "center";
  className?: string;
  children: React.ReactNode;
};

export function DropdownContent({
  children,
  align = "center",
  className,
}: DropdownContentProps) {
  const { isOpen, handleClose, triggerRect } = useDropdownContext();

  const contentRef = useClickOutside<HTMLDivElement>(() => {
    if (isOpen) handleClose();
  });

  if (!isOpen || !triggerRect) return null;

  // Calculate position
  const isNearBottom = triggerRect.bottom + 200 > window.innerHeight;
  const top = isNearBottom ? triggerRect.top - 8 : triggerRect.bottom + 8;
  
  let left = triggerRect.left;
  let transform = "";

  if (align === "end") {
    left = triggerRect.right;
    transform = "translateX(-100%)";
  } else if (align === "center") {
    left = triggerRect.left + triggerRect.width / 2;
    transform = "translateX(-50%)";
  }

  return (
    <Portal>
      <div
        ref={contentRef}
        role="menu"
        aria-orientation="vertical"
        style={{
          position: "fixed",
          top,
          left,
          transform: `${transform} ${isNearBottom ? 'translateY(-100%)' : ''}`,
          zIndex: 9999,
        }}
        className={cn(
          "fade-in-0 zoom-in-95 pointer-events-auto min-w-[8rem] rounded-lg bg-white shadow-2xl dark:bg-gray-800 border dark:border-gray-700 animate-in",
          className,
        )}
      >
        {children}
      </div>
    </Portal>
  );
}

type DropdownTriggerProps = React.HTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export function DropdownTrigger({ children, className }: DropdownTriggerProps) {
  const { handleOpen, isOpen } = useDropdownContext();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    handleOpen(rect);
  };

  return (
    <button
      className={className}
      onClick={handleClick}
      aria-expanded={isOpen}
      aria-haspopup="menu"
      data-state={isOpen ? "open" : "closed"}
    >
      {children}
    </button>
  );
}

export function DropdownClose({ children }: PropsWithChildren) {
  const { handleClose } = useDropdownContext();

  return <div onClick={handleClose}>{children}</div>;
}
