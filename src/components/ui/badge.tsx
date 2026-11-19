import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "outline";
  status?:
    | "draft"
    | "submitted"
    | "late"
    | "returned_for_revision"
    | "resubmitted"
    | "graded"
    | "published"
    | "locked"
    | "present"
    | "sick"
    | "excused"
    | "absent"
    | "active"
    | "archived"
    | "closed";
}

const statusMap: Record<
  string,
  { label: string; variant: BadgeProps["variant"] }
> = {
  draft: { label: "Draft", variant: "default" },
  submitted: { label: "Terkumpul", variant: "info" },
  late: { label: "Terlambat", variant: "warning" },
  returned_for_revision: { label: "Perlu Revisi", variant: "warning" },
  resubmitted: { label: "Dikirim Ulang", variant: "info" },
  graded: { label: "Sudah Dinilai", variant: "success" },
  published: { label: "Dipublikasikan", variant: "success" },
  locked: { label: "Dikunci", variant: "default" },
  closed: { label: "Ditutup", variant: "default" },
  present: { label: "Hadir", variant: "success" },
  sick: { label: "Sakit", variant: "info" },
  excused: { label: "Izin", variant: "warning" },
  absent: { label: "Alpa", variant: "danger" },
  active: { label: "Aktif", variant: "success" },
  archived: { label: "Diarsipkan", variant: "default" },
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = "default",
  status,
  ...props
}) => {
  const resolvedVariant = status ? statusMap[status]?.variant || variant : variant;
  const resolvedContent = status ? statusMap[status]?.label || children : children;

  const variantStyles = {
    default: "bg-[#F0F3F9] text-[#667085] border border-gray-200",
    primary: "bg-[#EEF3FF] text-[#2457D6] border border-[#2457D6]/20",
    success: "bg-[#E8F5EF] text-[#16845B] border border-[#16845B]/20",
    warning: "bg-[#FDF5E6] text-[#B7791F] border border-[#B7791F]/20",
    danger: "bg-[#FCECEE] text-[#C43D4B] border border-[#C43D4B]/20",
    info: "bg-[#EDF5FA] text-[#2878B8] border border-[#2878B8]/20",
    outline: "bg-transparent text-[#172033] border border-[#E4E9F2]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-tight whitespace-nowrap",
        variantStyles[resolvedVariant],
        className
      )}
      {...props}
    >
      {resolvedContent}
    </span>
  );
};
