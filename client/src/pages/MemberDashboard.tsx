
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Calendar, Dumbbell, Target, TrendingUp, Clock, Apple, User } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";

export default function MemberDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock member data
  const memberStats = {
    workoutsThisMonth: 18,
    caloriesBurned: 2400,
    avgWorkoutTime: 65,
    fitnessScore: 78
  };

  const upcomingSessions = [
    { id: 1, trainer: "Alex Johnson", date: "Today", time: "10:00 AM", type: "Strength Training", status: "Confirmed" },
    { id: 2, trainer: "Sarah Wilson", date: "Tomorrow", time: "2:00 PM", type: "Yoga", status: "Confirmed" },
    { id: 3, trainer: "Mike Chen", date: "Jan 18", time: "9:00 AM", type: "HIIT", status: "Pending" },
  ];

  const recentWorkouts = [
    { id: 1, type: "Strength Training", duration: "60 min", calories: 320, date: "Jan 15", trainer: "Alex Johnson" },
    { id: 2, type: "Cardio", duration: "45 min", calories: 285, date: "Jan 13", trainer: "Sarah Wilson" },
    { id: 3, type: "Yoga", duration: "75 min", calories: 180, date: "Jan 12", trainer: "Mike Chen" },
    { id: 4, type: "HIIT", duration: "30 min", calories: 240, date: "Jan 10", trainer: "Alex Johnson" },
  ];

  const fitnessGoals = [
    { goal: "Lose 5 lbs", progress: 60, target: "Feb 28" },
    { goal: "Run 5K in 25 min", progress: 75, target: "Mar 15" },
    { goal: "Bench Press 150 lbs", progress: 80, target: "Mar 31" },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-wider text-gold mb-2">MEMBER DASHBOARD</h1>
          <p className="text-gray-400">Welcome back, {user?.firstName || 'Member'}! Let's crush your fitness goals.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Workouts This Month</p>
                  <p className="text-2xl font-bold text-gold">{memberStats.workoutsThisMonth}</p>
                </div>
                <Dumbbell className="h-8 w-8 text-gold" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Calories Burned</p>
                  <p className="text-2xl font-bold text-green-400">{memberStats.caloriesBurned}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Avg Workout Time</p>
                  <p className="text-2xl font-bold text-blue-400">{memberStats.avgWorkoutTime}min</p>
                </div>
                <Clock className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Fitness Score</p>
                  <p className="text-2xl font-bold text-purple-400">{memberStats.fitnessScore}/100</p>
                </div>
                <Target className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900 border-gray-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              <Calendar className="h-4 w-4 mr-2" />
              OVERVIEW
            </TabsTrigger>
            <TabsTrigger value="workouts" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              <Dumbbell className="h-4 w-4 mr-2" />
              WORKOUTS
            </TabsTrigger>
            <TabsTrigger value="goals" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              <Target className="h-4 w-4 mr-2" />
              GOALS
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              <Apple className="h-4 w-4 mr-2" />
              NUTRITION
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gold">Upcoming Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 bg-black rounded-lg border border-gray-800">
                        <div>
                          <p className="font-semibold text-white">{session.type}</p>
                          <p className="text-gray-400 text-sm">with {session.trainer}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gold font-semibold">{session.date} at {session.time}</p>
                          <Badge variant={session.status === 'Confirmed' ? 'default' : 'secondary'} 
                                 className={session.status === 'Confirmed' ? 'bg-green-600' : 'bg-yellow-600'}>
                            {session.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gold">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full bg-gold text-black hover:bg-white">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Training Session
                  </Button>
                  <Button className="w-full bg-transparent border border-gold text-gold hover:bg-gold hover:text-black">
                    <Dumbbell className="h-4 w-4 mr-2" />
                    View Workout Plans
                  </Button>
                  <Button className="w-full bg-transparent border border-gold text-gold hover:bg-gold hover:text-black">
                    <Target className="h-4 w-4 mr-2" />
                    Update Goals
                  </Button>
                  <Button className="w-full bg-transparent border border-gold text-gold hover:bg-gold hover:text-black">
                    <User className="h-4 w-4 mr-2" />
                    Find a Trainer
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="workouts" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-gold">Recent Workouts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentWorkouts.map((workout) => (
                    <div key={workout.id} className="flex items-center justify-between p-4 bg-black rounded-lg border border-gray-800">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gold rounded-lg flex items-center justify-center">
                          <Dumbbell className="h-6 w-6 text-black" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{workout.type}</h3>
                          <p className="text-gray-400 text-sm">with {workout.trainer}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="text-center">
                            <p className="text-gray-400">Duration</p>
                            <p className="text-white font-semibold">{workout.duration}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-400">Calories</p>
                            <p className="text-white font-semibold">{workout.calories}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-400">Date</p>
                            <p className="text-white font-semibold">{workout.date}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-gold">Fitness Goals Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {fitnessGoals.map((goal, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-white">{goal.goal}</h3>
                        <span className="text-gray-400 text-sm">Target: {goal.target}</span>
                      </div>
                      <Progress value={goal.progress} className="h-3" />
                      <p className="text-right text-gold text-sm font-semibold">{goal.progress}% Complete</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-gold">Set New Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Target className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-6">Ready to challenge yourself with a new fitness goal?</p>
                  <Button className="bg-gold text-black hover:bg-white">
                    <Target className="h-4 w-4 mr-2" />
                    Create New Goal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nutrition" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-gold">Nutrition Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Apple className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No nutrition plan assigned</h3>
                  <p className="text-gray-600 mb-6">Work with a trainer to create a personalized nutrition plan</p>
                  <Button className="bg-gold text-black hover:bg-white">
                    <Apple className="h-4 w-4 mr-2" />
                    Request Nutrition Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
