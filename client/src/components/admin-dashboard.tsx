import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, FileText, MessageSquare, Calendar, Eye, Shield } from "lucide-react";

interface AdminDashboardProps {
  stats?: {
    totalVotes: number;
    activeVoters: number;
    totalPolls: number;
    activePolls: number;
    pendingComments: number;
  };
}

export default function AdminDashboard({ stats }: AdminDashboardProps) {
  const adminStats = [
    {
      title: "कुल पोलहरू",
      value: stats?.totalPolls || 0,
      icon: FileText,
      color: "text-nepal-blue",
      bgColor: "bg-blue-50",
    },
    {
      title: "सक्रिय पोलहरू",
      value: stats?.activePolls || 0,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "कुल प्रयोगकर्ता",
      value: stats?.activeVoters || 0,
      icon: Users,
      color: "text-nepal-orange",
      bgColor: "bg-orange-50",
    },
    {
      title: "पेन्डिङ टिप्पणीहरू",
      value: stats?.pendingComments || 0,
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const quickActions = [
    {
      title: "प्रयोगकर्ता व्यवस्थापन",
      icon: Users,
      color: "text-gray-600",
      action: () => console.log("Manage users"),
    },
    {
      title: "विश्लेषण हेर्नुहोस्",
      icon: BarChart3,
      color: "text-gray-600",
      action: () => console.log("View analytics"),
    },
    {
      title: "टिप्पणी मोडरेशन",
      icon: MessageSquare,
      color: "text-gray-600",
      action: () => console.log("Moderate comments"),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Admin Dashboard Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>एडमिन ड्यासबोर्ड</span>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Admin Stats */}
      <div className="grid grid-cols-2 gap-4">
        {adminStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className={`${stat.bgColor} rounded-lg p-3 text-center`}>
                  <div className="flex justify-center mb-2">
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{stat.title}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">द्रुत कार्यहरू</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  onClick={action.action}
                  variant="outline"
                  className="w-full justify-start space-x-2 bg-gray-50 hover:bg-gray-100"
                >
                  <Icon className={`w-4 h-4 ${action.color}`} />
                  <span className="font-medium text-gray-700">{action.title}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Security Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">सुरक्षा सुविधाहरू</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">एन्क्रिप्टेड मतदान</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-nepal-blue rounded-full"></div>
              <span className="text-gray-600">पहिचान प्रमाणीकरण</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-nepal-red rounded-full"></div>
              <span className="text-gray-600">डाटा सुरक्षा</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-nepal-orange rounded-full"></div>
              <span className="text-gray-600">IP ट्र्याकिङ</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">प्रणाली स्थिति</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">सर्भर स्थिति</span>
              <span className="text-green-600 font-medium">सक्रिय</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">डाटाबेस</span>
              <span className="text-green-600 font-medium">जडान भएको</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">सुरक्षा</span>
              <span className="text-green-600 font-medium">सुरक्षित</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
