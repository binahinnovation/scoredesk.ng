
import { Badge } from "./ui/badge";

interface UserStatusBadgeProps {
  status: "Active" | "Inactive" | "Pending";
  className?: string;
}

export function UserStatusBadge({ status, className }: UserStatusBadgeProps) {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "Inactive":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeVariant(status)} ${className}`}>
      {status}
    </span>
  );
}
