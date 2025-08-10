import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import VotingCard from "@/components/voting-card";
import ComparisonCard from "@/components/comparison-card";
import CommentSection from "@/components/comment-section";
import { Vote, TrendingUp, Users, CheckSquare, Zap, Landmark, Scale } from "lucide-react";
import Header from "@/components/header";
import { useState } from "react";
import { Link } from "wouter";
import { mockPolls, MockPoll } from "@/data/mock-polls";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("daily_rating");

  // Use hardcoded data instead of API calls
  const stats = {
    totalVotes: 2847,
    activeVoters: 1234, 
    activePolls: 3
  };

  // Filter polls by selected category
  const polls = mockPolls.filter(poll => poll.type === selectedCategory);
  const isLoading = false;

  const categories = [
    { id: "daily_rating", label: "मतदान कार्यक्रम", icon: Zap },
    { id: "political_rating", label: "राजनैतिक", icon: Landmark },
    { id: "comparison_voting", label: "तथ्यांक", icon: Scale },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header stats={stats} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">MeroVote</h1>
          <p className="text-lg text-gray-600 mb-8">
            नेपालको पहिलो सुरक्षित गुणस्तर मतदान प्लेटफर्म। तपाईंको राय दिनुहोस्, गुणस्तर रहनुहोस्।
          </p>
          
          {/* Vote Type Selector */}
          <div className="flex justify-center items-center space-x-4 mb-8">
            <Button className="bg-nepal-red hover:bg-red-700 text-white">
              <Vote className="w-4 h-4 mr-2" />
              नेपाली पोलकर्म
            </Button>
            <Button variant="outline">
              <span className="mr-2">१००%</span>
              सुरक्षित
            </Button>
            <Button variant="outline">
              <CheckSquare className="w-4 h-4 mr-2" />
              गुणस्तर मतदान
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">कुल मतदान</p>
                  <p className="text-3xl font-bold text-nepal-red">
                    {stats.totalVotes.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-nepal-red w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">सक्रिय मतदाता</p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.activeVoters.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="text-green-600 w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">मतदान प्रकार</p>
                  <p className="text-3xl font-bold text-nepal-blue">
                    {stats.activePolls}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckSquare className="text-nepal-blue w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Poll Categories */}
        <div className="flex justify-center items-center space-x-6 mb-8">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 pb-2 font-medium transition-colors ${
                  isActive 
                    ? "text-nepal-red border-b-2 border-nepal-red" 
                    : "text-gray-600 hover:text-nepal-red"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>

        {/* Polls Section */}
        <div className="flex flex-wrap -mx-3">
          {isLoading ? (
            <div className="text-center py-8 w-full">
              <p className="text-gray-500">पोलहरू लोड गर्दै...</p>
            </div>
          ) : !polls || !Array.isArray(polls) || polls.length === 0 ? (
            <div className="text-center py-8 w-full">
              <p className="text-gray-500">कुनै पोल भेटिएन</p>
            </div>
          ) : (
            polls.map((poll: any) => (
              <div key={poll.id} className="w-full md:w-1/2 px-3 mb-6 flex">
                {poll.type === "comparison_voting" ? (
                  <ComparisonCard poll={poll} />
                ) : (
                  <VotingCard poll={poll} />
                )}
                {/* <CommentSection pollId={poll.id} showWordLimit={poll.type === "daily_rating"} /> */}
              </div>
            ))
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-nepal-red rounded-lg flex items-center justify-center">
                  <Vote className="text-white w-4 h-4" />
                </div>
                <h3 className="font-bold text-gray-900">MeroVote</h3>
              </div>
              <p className="text-sm text-gray-600">
                नेपालको पहिलो डिजिटल मतदान प्लेटफर्म। सुरक्षित, पारदर्शी र गुणस्तरीय।
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">सुविधाहरू</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>मतदान कार्यक्रम</li>
                <li>राजनैतिक पोल</li>
                <li>तुलना मतदान</li>
                <li>एडमिन प्यानल</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">सहायता</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>कसरी प्रयोग गर्ने</li>
                <li>सुरक्षा नीति</li>
                <li>सम्पर्क</li>
                <li>FAQ</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">सुरक्षा जानकारी</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <CheckSquare className="w-4 h-4 text-green-500" />
                  <span>एन्क्रिप्टेड मतदान</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-nepal-blue" />
                  <span>पहिचान प्रमाणीकरण</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Vote className="w-4 h-4 text-nepal-red" />
                  <span>डाटा सुरक्षा</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-6 text-center">
            <p className="text-sm text-gray-500">© २०२४ MeroVote. सबै अधिकार सुरक्षित। नेपाल सरकारद्वारा प्रमाणित।</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
