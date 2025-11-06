import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Store, 
  UserPlus, 
  DollarSign
} from "lucide-react";

export default function AdminMetrics() {
  // Mock data - in real app this would come from API
  const metrics = [
    {
      title: "Total Listings",
      value: "2,847",
      change: "+12%",
      changeType: "positive" as const,
      icon: Store,
      description: "Active business listings"
    },
    {
      title: "Total Users",
      value: "18,432",
      change: "+8%",
      changeType: "positive" as const,
      icon: Users,
      description: "Registered users"
    },
    {
      title: "New Sign-ups",
      value: "234",
      change: "+23%",
      changeType: "positive" as const,
      icon: UserPlus,
      description: "This month"
    },
    {
      title: "Total Revenue",
      value: "$54,280",
      change: "+18%",
      changeType: "positive" as const,
      icon: DollarSign,
      description: "Monthly revenue"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => {
        const IconComponent = metric.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <IconComponent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center space-x-1 text-xs">
                <span
                  className={`font-medium ${
                    metric.changeType === 'positive' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}
                >
                  {metric.change}
                </span>
                <span className="text-muted-foreground">from last month</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}