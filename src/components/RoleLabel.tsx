
import { Badge } from "./ui/badge";
import { UserRole } from "@/types/user";

interface RoleLabelProps {
  role: UserRole;
  className?: string;
}

export function RoleLabel({ role, className }: RoleLabelProps) {
  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "Principal":
        return "destructive";
      case "Exam Officer":
        return "default";
      case "Form Teacher":
        return "secondary";
      case "Subject Teacher":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <Badge variant={getRoleBadgeVariant(role)} className={className}>
      {role}
    </Badge>
  );
}
