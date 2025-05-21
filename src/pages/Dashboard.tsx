
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BarChart3, Book, GraduationCap, Users } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your ScoreDesk portal</p>
        </div>
        <Separator />
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-slide-in">
          <Card className="hover-scale card-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <div className="p-2 bg-emerald-100 rounded-full">
                <Users className="h-4 w-4 text-emerald-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,845</div>
              <p className="text-xs text-muted-foreground">
                Current term enrollment
              </p>
              <div className="mt-3 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '75%' }}></div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale card-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Classes
              </CardTitle>
              <div className="p-2 bg-blue-100 rounded-full">
                <Book className="h-4 w-4 text-blue-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">58</div>
              <p className="text-xs text-muted-foreground">
                Active classes
              </p>
              <div className="mt-3 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '60%' }}></div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale card-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Teachers
              </CardTitle>
              <div className="p-2 bg-purple-100 rounded-full">
                <GraduationCap className="h-4 w-4 text-purple-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">124</div>
              <p className="text-xs text-muted-foreground">
                Registered staff
              </p>
              <div className="mt-3 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: '45%' }}></div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale card-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Results Published
              </CardTitle>
              <div className="p-2 bg-amber-100 rounded-full">
                <BarChart3 className="h-4 w-4 text-amber-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,432</div>
              <p className="text-xs text-muted-foreground">
                This term
              </p>
              <div className="mt-3 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '80%' }}></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: "New student registered", time: "10 minutes ago", color: "bg-emerald-500" },
                  { title: "Result uploaded for JSS2A", time: "1 hour ago", color: "bg-blue-500" },
                  { title: "Class position calculated", time: "3 hours ago", color: "bg-purple-500" },
                  { title: "Scratch cards generated", time: "Yesterday", color: "bg-amber-500" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className={`${activity.color} h-2 w-2 mt-2 rounded-full`}></div>
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle>Subject Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { subject: "Mathematics", average: 78, color: "bg-emerald-500" },
                  { subject: "English Language", average: 82, color: "bg-blue-500" },
                  { subject: "Basic Science", average: 65, color: "bg-purple-500" },
                  { subject: "Social Studies", average: 70, color: "bg-amber-500" }
                ].map((subject, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{subject.subject}</span>
                      <span className="font-medium">{subject.average}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`${subject.color} h-full rounded-full`} style={{ width: `${subject.average}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
