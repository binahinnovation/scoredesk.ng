
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircleCheck, CircleAlert, RefreshCcw, ExternalLink } from "lucide-react";

export default function MonnifyStatusPage() {
  // Mock status data
  const services = [
    { name: "Payment API", status: "operational", uptime: "99.9%" },
    { name: "Settlement Service", status: "operational", uptime: "99.7%" },
    { name: "Account Dashboard", status: "operational", uptime: "100%" },
    { name: "Notification Service", status: "operational", uptime: "99.5%" },
    { name: "Reserved Accounts", status: "incident", uptime: "98.2%", message: "Intermittent issues with account creation" },
  ];

  const lastUpdated = new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Monnify Status</h1>
          <p className="text-muted-foreground">Service status and performance metrics</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Visit Monnify
          </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">System Status</CardTitle>
            <Badge variant="outline" className="text-sm">
              Last updated: {lastUpdated}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <CircleAlert className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Partial System Outage</h3>
                <p className="text-muted-foreground">Some services are experiencing issues</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">4 of 5 services operational</p>
              <div className="h-2 w-40 bg-gray-200 rounded-full mt-2">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Service Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="p-4 border rounded-lg flex flex-col md:flex-row justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  {service.status === "operational" ? (
                    <CircleCheck className="h-6 w-6 text-green-500" />
                  ) : (
                    <CircleAlert className="h-6 w-6 text-yellow-500" />
                  )}
                  <div>
                    <h3 className="font-medium">{service.name}</h3>
                    {service.message && (
                      <p className="text-sm text-yellow-600">{service.message}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={service.status === "operational" ? "outline" : "secondary"}
                    className={service.status === "operational" ? "text-green-600 bg-green-50" : "text-yellow-600 bg-yellow-50"}
                  >
                    {service.status === "operational" ? "Operational" : "Minor Outage"}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    Uptime: {service.uptime}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
