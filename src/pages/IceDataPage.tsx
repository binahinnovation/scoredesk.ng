
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Database, Download, Upload, RefreshCw, FilterX, Filter } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function IceDataPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Ice Data Services</h1>
          <p className="text-muted-foreground">Manage your data and API connections</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Data
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              Total Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">248,562</div>
            <p className="text-sm text-muted-foreground mt-1">+1,248 this week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5 text-green-600" />
              Active Data Sets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-sm text-muted-foreground mt-1">2 updated today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-600" />
              API Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3,587</div>
            <p className="text-sm text-muted-foreground mt-1">Requests this month</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="datasets" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="datasets">Data Sets</TabsTrigger>
          <TabsTrigger value="apis">API Endpoints</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="datasets">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-xl">Available Data Sets</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Records</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { id: 1, name: "Customer Data", records: 52430, updated: "2025-05-21", status: "active" },
                      { id: 2, name: "Transaction History", records: 128967, updated: "2025-05-20", status: "active" },
                      { id: 3, name: "Payment Methods", records: 8765, updated: "2025-05-19", status: "active" },
                      { id: 4, name: "User Accounts", records: 34562, updated: "2025-05-15", status: "inactive" },
                      { id: 5, name: "Product Catalog", records: 23838, updated: "2025-05-10", status: "active" }
                    ].map((dataset) => (
                      <TableRow key={dataset.id}>
                        <TableCell className="font-medium">{dataset.name}</TableCell>
                        <TableCell>{dataset.records.toLocaleString()}</TableCell>
                        <TableCell>{dataset.updated}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            dataset.status === "active" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {dataset.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">View</Button>
                            <Button variant="ghost" size="sm">Edit</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="apis">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Customer API", endpoint: "/api/v1/customers", status: "active" },
                  { name: "Transaction API", endpoint: "/api/v1/transactions", status: "active" },
                  { name: "Payment API", endpoint: "/api/v1/payments", status: "active" },
                  { name: "Report API", endpoint: "/api/v1/reports", status: "inactive" }
                ].map((api, i) => (
                  <Card key={i} className="border">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle className="text-lg">{api.name}</CardTitle>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          api.status === "active" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {api.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">Endpoint: <code>{api.endpoint}</code></p>
                      <div className="flex justify-between">
                        <p className="text-sm">Rate Limit: 100 req/min</p>
                        <Button variant="outline" size="sm">Documentation</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="integrations">
          <Card>
            <CardContent className="py-6">
              <p className="text-center text-muted-foreground">No active integrations. Click 'Add Integration' to set up your first integration.</p>
              <div className="flex justify-center mt-4">
                <Button>Add Integration</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex p-3 border rounded-md">
                    <div className="w-32 text-sm text-muted-foreground">
                      {new Date().toLocaleTimeString()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {i % 2 === 0 ? "Data update completed" : "API endpoint accessed"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {i % 2 === 0 
                          ? "Updated 2,450 records in Customer Data" 
                          : "GET /api/v1/customers - Status 200"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
