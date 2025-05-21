
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRound, BookOpen, GraduationCap, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for initial rendering
const mockActivityData = [
  { id: 1, action: "SS2A result uploaded", user: "Mr. Akin", time: "2 hours ago" },
  { id: 2, action: "JSS3B class created", user: "Mrs. Okonkwo", time: "5 hours ago" },
  { id: 3, action: "Student transferred", user: "Mr. Adeleke", time: "1 day ago" },
  { id: 4, action: "Result approved", user: "Principal Nwosu", time: "1 day ago" },
  { id: 5, action: "New teacher added", user: "Admin", time: "2 days ago" },
];

const mockScratchCardData = [
  { name: 'Used', value: 45 },
  { name: 'Unused', value: 55 },
];

const mockClassPerformanceData = [
  { name: 'JSS1A', score: 78 },
  { name: 'JSS1B', score: 72 },
  { name: 'JSS2A', score: 82 },
  { name: 'JSS2B', score: 74 },
  { name: 'JSS3A', score: 85 },
  { name: 'JSS3B', score: 78 },
  { name: 'SS1A', score: 68 },
  { name: 'SS2A', score: 76 },
];

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-gray-900">School Dashboard</h1>
      
      {/* Current Term Display */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex justify-between items-center">
        <div>
          <h3 className="font-medium text-emerald-800">Current Academic Period</h3>
          <h2 className="text-2xl font-bold text-emerald-700">Second Term 2024/2025</h2>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-md border border-emerald-200 shadow-sm">
          <Clock className="h-5 w-5 text-emerald-600" />
          <span className="text-sm font-medium">Term ends in 45 days</span>
        </div>
      </div>
      
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <UserRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,258</div>
            <p className="text-xs text-muted-foreground">+8 from last term</p>
            <Progress className="mt-3" value={65} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">+3 from last term</p>
            <Progress className="mt-3" value={42} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Results</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
            <Progress className="mt-3" value={15} color="amber" />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-7">
        {/* Activity Feed */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Latest Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockActivityData.map((activity) => (
                <div key={activity.id} className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">by {activity.user}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Scratch Card Usage */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Scratch Card Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="chart">
              <TabsList className="mb-4">
                <TabsTrigger value="chart">Chart</TabsTrigger>
                <TabsTrigger value="table">Table</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chart" className="space-y-4">
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={mockScratchCardData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between text-sm">
                  <div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-emerald-500 mr-2" />
                      <span>Used: 45%</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-gray-300 mr-2" />
                      <span>Unused: 55%</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="table">
                <div className="space-y-2">
                  <div className="grid grid-cols-3 text-sm font-medium">
                    <div>Status</div>
                    <div>Count</div>
                    <div>Percentage</div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-3 text-sm">
                    <div>Used</div>
                    <div>450</div>
                    <div>45%</div>
                  </div>
                  <div className="grid grid-cols-3 text-sm">
                    <div>Unused</div>
                    <div>550</div>
                    <div>55%</div>
                  </div>
                  <div className="grid grid-cols-3 text-sm font-medium">
                    <div>Total</div>
                    <div>1000</div>
                    <div>100%</div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Top Classes */}
      <Card>
        <CardHeader>
          <CardTitle>Top Classes by Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mockClassPerformanceData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
