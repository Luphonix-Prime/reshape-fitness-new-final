import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Users,
  Calendar,
  Dumbbell,
  Apple,
  Clock,
  TrendingUp,
  Plus,
  Edit,
  CheckCircle,
  XCircle,
  User,
  Target,
  CalendarDays,
  Phone,
  Trash2
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";

export default function TrainerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("schedule");
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [showNewWorkoutModal, setShowNewWorkoutModal] = useState(false);
  const [showNewNutritionModal, setShowNewNutritionModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);

  // State for New Assessment Form
  const [newAssessment, setNewAssessment] = useState({
    clientName: "",
    dateOfBirth: "",
    age: 0,
    height: 0,
    bp: "",
    bpAfterTreadmill: "",
    emergencyContact: "",
    bmi: 0,
    weight: 0,
    muscle: 0,
    fat: 0,
    saturatedFat: 0,
    visceralFat: 0,
    bmr: 0,
    bodyAge: 0,
    posturalAssessment: "",
    headNeckAlignment: "",
    shoulderAlignment: "",
    upperBackAlignment: "",
    lowerBackAlignment: "",
    pelvicAlignment: "",
    hipKneeAlignment: "",
    ankleAlignment: "",
    spinalMobility: "",
    recommendations: "",
    circumferenceMeasurements: {
      neck: 0,
      shoulders: 0,
      chest: 0,
      upperArm: 0,
      forearms: 0,
      wrist: 0,
      waist: 0,
      hip: 0,
      thighs: 0,
      calf: 0,
      ankle: 0,
    },
    advice: "",
  });

  const [newSession, setNewSession] = useState({
    clientName: "",
    sessionType: "",
    date: "",
    time: "",
    duration: "60",
    notes: ""
  });

  const [newWorkout, setNewWorkout] = useState({
    clientId: "",
    planName: "",
    description: "",
    duration: "",
    exercises: ""
  });

  const [newNutrition, setNewNutrition] = useState({
    clientId: "",
    planName: "",
    description: "",
    calories: "",
    meals: ""
  });

  // Mock data for development
  const trainerStats = {
    totalClients: 12,
    todaySessions: 4,
    weeklyHours: 32,
    avgRating: 4.8
  };

  const upcomingSessions = [
    {
      id: 1,
      clientName: "Sarah Johnson",
      sessionType: "Strength Training",
      date: "2024-01-15",
      time: "09:00 AM",
      duration: 60,
      status: "Confirmed",
      notes: "Focus on upper body strength"
    },
    {
      id: 2,
      clientName: "Mike Chen",
      sessionType: "HIIT",
      date: "2024-01-15",
      time: "11:00 AM",
      duration: 45,
      status: "Confirmed",
      notes: "High intensity cardio session"
    },
    {
      id: 3,
      clientName: "Emma Davis",
      sessionType: "Yoga",
      date: "2024-01-15",
      time: "02:00 PM",
      duration: 60,
      status: "Pending",
      notes: "Flexibility and relaxation focus"
    },
    {
      id: 4,
      clientName: "David Wilson",
      sessionType: "Cardio",
      date: "2024-01-15",
      time: "04:00 PM",
      duration: 30,
      status: "Confirmed",
      notes: "Endurance building session"
    },
  ];

  const clients = [
    { id: 1, name: "Sarah Johnson", email: "sarah@email.com", joinDate: "2024-01-01", sessionsCompleted: 24 },
    { id: 2, name: "Mike Chen", email: "mike@email.com", joinDate: "2024-01-05", sessionsCompleted: 18 },
    { id: 3, name: "Emma Davis", email: "emma@email.com", joinDate: "2024-01-10", sessionsCompleted: 12 },
    { id: 4, name: "David Wilson", email: "david@email.com", joinDate: "2024-01-12", sessionsCompleted: 8 },
  ];

  const workoutPlans = [
    { id: 1, clientName: "Sarah Johnson", planName: "Upper Body Strength", createdDate: "2024-01-10", exercises: 8 },
    { id: 2, clientName: "Mike Chen", planName: "HIIT Circuit", createdDate: "2024-01-08", exercises: 6 },
    { id: 3, clientName: "Emma Davis", planName: "Flexibility Routine", createdDate: "2024-01-12", exercises: 10 },
  ];

  const nutritionPlans = [
    { id: 1, clientName: "Sarah Johnson", planName: "Muscle Gain Diet", createdDate: "2024-01-10", calories: 2200 },
    { id: 2, clientName: "Mike Chen", planName: "Performance Nutrition", createdDate: "2024-01-08", calories: 2500 },
    { id: 3, clientName: "Emma Davis", planName: "Wellness Plan", createdDate: "2024-01-12", calories: 1800 },
  ];

  // Mock data for assessments
  const assessments = [
    {
      id: 1,
      clientName: "Keval Patel",
      date: "2024-01-14",
      trainerName: "Coach Alex"
    },
    {
      id: 2,
      clientName: "Sarah Johnson",
      date: "2024-01-13",
      trainerName: "Coach Alex"
    }
  ];

  // Mock inquiries data - in real app this would come from API
  const inquiries = [
    {
      _id: "1",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "555-0123",
      interest: "Personal Training",
      location: "Manhattan",
      message: "Interested in strength training and muscle gain",
      submittedAt: new Date().toISOString(),
      status: "new"
    },
    {
      _id: "2",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      phone: "555-0124",
      interest: "Group Classes",
      location: "Beverly Hills",
      message: "Looking for yoga and flexibility classes",
      submittedAt: new Date().toISOString(),
      status: "new"
    }
  ];

  const handleConvertInquiry = (inquiry: any) => {
    setSelectedInquiry(inquiry);
    setShowConvertModal(true);
  };

  const handleDeleteInquiry = (inquiryId: string) => {
    if (confirm('Are you sure you want to cancel this inquiry?')) {
      toast({
        title: "Inquiry Cancelled",
        description: "Inquiry has been cancelled successfully."
      });
    }
  };

  const handleSubmitConversion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry) return;

    toast({
      title: "Inquiry Converted",
      description: `${selectedInquiry.firstName} ${selectedInquiry.lastName} has been converted to a member successfully.`
    });

    setShowConvertModal(false);
    setSelectedInquiry(null);
  };

  const handleScheduleNewSession = () => {
    if (!newSession.clientName || !newSession.sessionType || !newSession.date || !newSession.time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Mock success
    toast({
      title: "Session Scheduled",
      description: `Session with ${newSession.clientName} has been scheduled successfully.`
    });

    setShowNewSessionModal(false);
    setNewSession({
      clientName: "",
      sessionType: "",
      date: "",
      time: "",
      duration: "60",
      notes: ""
    });
  };

  const handleCreateWorkoutPlan = () => {
    if (!newWorkout.clientId || !newWorkout.planName || !newWorkout.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Workout Plan Created",
      description: `Workout plan "${newWorkout.planName}" has been created successfully.`
    });

    setShowNewWorkoutModal(false);
    setNewWorkout({
      clientId: "",
      planName: "",
      description: "",
      duration: "",
      exercises: ""
    });
  };

  const handleCreateNutritionPlan = () => {
    if (!newNutrition.clientId || !newNutrition.planName || !newNutrition.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Nutrition Plan Created",
      description: `Nutrition plan "${newNutrition.planName}" has been created successfully.`
    });

    setShowNewNutritionModal(false);
    setNewNutrition({
      clientId: "",
      planName: "",
      description: "",
      calories: "",
      meals: ""
    });
  };

  // Handler for creating a new assessment
  const handleCreateAssessment = () => {
    // TODO: Implement actual API call to save the assessment
    toast({
      title: "Assessment Created",
      description: `Assessment for ${newAssessment.clientName} has been created successfully.`
    });
    setShowNewSessionModal(false); // Reusing modal for now, ideally a new modal for assessment
    setNewAssessment({ // Reset form
      clientName: "",
      dateOfBirth: "",
      age: 0,
      height: 0,
      bp: "",
      bpAfterTreadmill: "",
      emergencyContact: "",
      bmi: 0,
      weight: 0,
      muscle: 0,
      fat: 0,
      saturatedFat: 0,
      visceralFat: 0,
      bmr: 0,
      bodyAge: 0,
      posturalAssessment: "",
      headNeckAlignment: "",
      shoulderAlignment: "",
      upperBackAlignment: "",
      lowerBackAlignment: "",
      pelvicAlignment: "",
      hipKneeAlignment: "",
      ankleAlignment: "",
      spinalMobility: "",
      recommendations: "",
      circumferenceMeasurements: {
        neck: 0,
        shoulders: 0,
        chest: 0,
        upperArm: 0,
        forearms: 0,
        wrist: 0,
        waist: 0,
        hip: 0,
        thighs: 0,
        calf: 0,
        ankle: 0,
      },
      advice: "",
    });
  };


  const updateSessionStatus = (sessionId: number, newStatus: string) => {
    toast({
      title: "Session Updated",
      description: `Session status updated to ${newStatus}.`
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Confirmed":
        return <Badge className="bg-green-600 text-white">Confirmed</Badge>;
      case "Pending":
        return <Badge className="bg-yellow-600 text-white">Pending</Badge>;
      case "Cancelled":
        return <Badge className="bg-red-600 text-white">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-wider text-gold mb-2">TRAINER DASHBOARD</h1>
          <p className="text-gray-400">Manage your training sessions and client programs</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Clients</p>
                  <p className="text-2xl font-bold text-gold">{trainerStats.totalClients}</p>
                </div>
                <Users className="h-8 w-8 text-gold" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Today's Sessions</p>
                  <p className="text-2xl font-bold text-green-400">{trainerStats.todaySessions}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Weekly Hours</p>
                  <p className="text-2xl font-bold text-blue-400">{trainerStats.weeklyHours}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Avg Rating</p>
                  <p className="text-2xl font-bold text-purple-400">{trainerStats.avgRating}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-gray-900 border-gray-800">
            <TabsTrigger value="schedule" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              <Calendar className="h-4 w-4 mr-2" />
              SCHEDULE
            </TabsTrigger>
            <TabsTrigger value="clients" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              <Users className="h-4 w-4 mr-2" />
              CLIENTS
            </TabsTrigger>
            <TabsTrigger value="inquiries" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              <Phone className="h-4 w-4 mr-2" />
              INQUIRIES
            </TabsTrigger>
            <TabsTrigger value="assessments" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              <Target className="h-4 w-4 mr-2" />
              ASSESSMENTS
            </TabsTrigger>
            <TabsTrigger value="workouts" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              <Dumbbell className="h-4 w-4 mr-2" />
              WORKOUTS
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              <Apple className="h-4 w-4 mr-2" />
              NUTRITION
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Today's Schedule */}
              <div className="lg:col-span-2">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-gold flex items-center justify-between">
                      Today's Schedule
                      <Dialog open={showNewSessionModal} onOpenChange={setShowNewSessionModal}>
                        <DialogTrigger asChild>
                          <Button className="bg-gold text-black hover:bg-white">
                            <Plus className="h-4 w-4 mr-2" />
                            Schedule Session
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-900 border-gray-800 text-white">
                          <DialogHeader>
                            <DialogTitle className="text-gold">Schedule New Session</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="clientName">Client Name</Label>
                              <Input
                                id="clientName"
                                value={newSession.clientName}
                                onChange={(e) => setNewSession({...newSession, clientName: e.target.value})}
                                className="bg-black border-gray-700 text-white"
                                placeholder="Enter client name"
                              />
                            </div>
                            <div>
                              <Label htmlFor="sessionType">Session Type</Label>
                              <Select
                                value={newSession.sessionType}
                                onValueChange={(value) => setNewSession({...newSession, sessionType: value})}
                              >
                                <SelectTrigger className="bg-black border-gray-700 text-white">
                                  <SelectValue placeholder="Select session type" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-gray-800 text-white">
                                  <SelectItem value="strength">Strength Training</SelectItem>
                                  <SelectItem value="cardio">Cardio</SelectItem>
                                  <SelectItem value="hiit">HIIT</SelectItem>
                                  <SelectItem value="yoga">Yoga</SelectItem>
                                  <SelectItem value="pilates">Pilates</SelectItem>
                                  <SelectItem value="consultation">Consultation</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="date">Date</Label>
                                <Input
                                  id="date"
                                  type="date"
                                  value={newSession.date}
                                  onChange={(e) => setNewSession({...newSession, date: e.target.value})}
                                  className="bg-black border-gray-700 text-white"
                                />
                              </div>
                              <div>
                                <Label htmlFor="time">Time</Label>
                                <Input
                                  id="time"
                                  type="time"
                                  value={newSession.time}
                                  onChange={(e) => setNewSession({...newSession, time: e.target.value})}
                                  className="bg-black border-gray-700 text-white"
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="duration">Duration (minutes)</Label>
                              <Select
                                value={newSession.duration}
                                onValueChange={(value) => setNewSession({...newSession, duration: value})}
                              >
                                <SelectTrigger className="bg-black border-gray-700 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-gray-800 text-white">
                                  <SelectItem value="30">30 minutes</SelectItem>
                                  <SelectItem value="45">45 minutes</SelectItem>
                                  <SelectItem value="60">60 minutes</SelectItem>
                                  <SelectItem value="90">90 minutes</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="notes">Session Notes</Label>
                              <Textarea
                                id="notes"
                                value={newSession.notes}
                                onChange={(e) => setNewSession({...newSession, notes: e.target.value})}
                                className="bg-black border-gray-700 text-white"
                                placeholder="Add any special notes for this session..."
                              />
                            </div>
                            <Button
                              onClick={handleScheduleNewSession}
                              className="w-full bg-gold text-black hover:bg-white"
                            >
                              Schedule Session
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingSessions.map((session) => (
                        <div key={session.id} className="bg-black rounded-lg p-4 border border-gray-800">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <User className="h-5 w-5 text-gold" />
                              <div>
                                <h3 className="text-white font-semibold">{session.clientName}</h3>
                                <p className="text-gray-400 text-sm">{session.sessionType}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-gold font-semibold">{session.time}</p>
                              <p className="text-gray-400 text-sm">{session.duration} min</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            {getStatusBadge(session.status)}
                            <div className="flex space-x-2">
                              {session.status === "Pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => updateSessionStatus(session.id, "Confirmed")}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => updateSessionStatus(session.id, "Cancelled")}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-gold hover:bg-gold hover:text-black"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {session.notes && (
                            <p className="text-gray-400 text-sm mt-2 italic">{session.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div>
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-gold">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      className="w-full bg-black border border-gold text-gold hover:bg-gold hover:text-black"
                      onClick={() => setShowNewSessionModal(true)}
                    >
                      <CalendarDays className="h-4 w-4 mr-2" />
                      Schedule New Session
                    </Button>
                    <Button
                      className="w-full bg-black border border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                      onClick={() => setShowNewWorkoutModal(true)}
                    >
                      <Dumbbell className="h-4 w-4 mr-2" />
                      Create Workout Plan
                    </Button>
                    <Button
                      className="w-full bg-black border border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                      onClick={() => setShowNewNutritionModal(true)}
                    >
                      <Apple className="h-4 w-4 mr-2" />
                      Design Nutrition Plan
                    </Button>
                    <Button
                      className="w-full bg-black border border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      View All Clients
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-gold">Your Clients ({clients.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-gray-400">Name</TableHead>
                      <TableHead className="text-gray-400">Email</TableHead>
                      <TableHead className="text-gray-400">Join Date</TableHead>
                      <TableHead className="text-gray-400">Sessions Completed</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id} className="border-gray-800">
                        <TableCell className="text-white">{client.name}</TableCell>
                        <TableCell className="text-gray-400">{client.email}</TableCell>
                        <TableCell className="text-gray-400">{new Date(client.joinDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-gray-400">{client.sessionsCompleted}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="ghost" className="text-gold hover:bg-gold hover:text-black">
                              View Profile
                            </Button>
                            <Button size="sm" variant="ghost" className="text-blue-400 hover:bg-blue-400 hover:text-white">
                              Schedule Session
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inquiries" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gold">Contact Inquiries</h2>
            </div>

            {/* Inquiries Table */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-gold">Recent Inquiries ({inquiries?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-gray-400">Name</TableHead>
                      <TableHead className="text-gray-400">Email</TableHead>
                      <TableHead className="text-gray-400">Phone</TableHead>
                      <TableHead className="text-gray-400">Interest</TableHead>
                      <TableHead className="text-gray-400">Location</TableHead>
                      <TableHead className="text-gray-400">Submitted</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(inquiries) && inquiries.map((inquiry: any) => (
                      <TableRow key={inquiry._id} className="border-gray-800">
                        <TableCell className="text-white">{inquiry.firstName} {inquiry.lastName}</TableCell>
                        <TableCell className="text-gray-400">{inquiry.email}</TableCell>
                        <TableCell className="text-gray-400">{inquiry.phone}</TableCell>
                        <TableCell className="text-gray-400">{inquiry.interest}</TableCell>
                        <TableCell className="text-gray-400">{inquiry.location}</TableCell>
                        <TableCell className="text-gray-400">
                          {new Date(inquiry.submittedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleConvertInquiry(inquiry)}
                            >
                              Convert to Member
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteInquiry(inquiry._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!Array.isArray(inquiries) || inquiries.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-400">
                          No inquiries found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Convert Inquiry Modal */}
            <Dialog open={showConvertModal} onOpenChange={setShowConvertModal}>
              <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-gold">
                    Convert Inquiry to Member - {selectedInquiry?.firstName} {selectedInquiry?.lastName}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitConversion} className="space-y-6">
                  <div className="space-y-4 p-4 bg-black rounded-lg">
                    <h3 className="text-lg font-semibold text-gold">Inquiry Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Name:</span>
                        <span className="text-white ml-2">{selectedInquiry?.firstName} {selectedInquiry?.lastName}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Email:</span>
                        <span className="text-white ml-2">{selectedInquiry?.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Phone:</span>
                        <span className="text-white ml-2">{selectedInquiry?.phone}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Interest:</span>
                        <span className="text-white ml-2">{selectedInquiry?.interest}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-400">Message:</span>
                        <span className="text-white ml-2">{selectedInquiry?.message}</span>
                      </div>
                    </div>
                  </div>

                  {/* Complete Body Assessment Form */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gold">Complete Body Assessment</h3>
                    
                    {/* Basic Information */}
                    <div className="space-y-4 p-4 bg-black rounded-lg">
                      <h4 className="text-md font-semibold text-gold">Basic Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="dateOfBirth">Date of Birth</Label>
                          <Input
                            type="date"
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="age">Age</Label>
                          <Input
                            type="number"
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="height">Height (cm)</Label>
                          <Input
                            type="number"
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="bloodPressure">Blood Pressure</Label>
                          <Input
                            placeholder="e.g., 124/84"
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="afterTreadmillBP">After Treadmill Test</Label>
                          <Input
                            placeholder="e.g., 152/92"
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="emergencyContact">Emergency Contact</Label>
                          <Input
                            className="bg-black border-gray-700 text-white"
                            defaultValue={selectedInquiry?.phone}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Body Composition Measurements */}
                    <div className="space-y-4 p-4 bg-black rounded-lg">
                      <h4 className="text-md font-semibold text-gold">Body Composition Measurements</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="bmi">BMI</Label>
                          <Input
                            type="number"
                            step="0.1"
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="weight">Weight (kg)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="muscle">Muscle (%)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="fat">Fat (%)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="saturatedFat">Saturated Fat (%)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="visceralFat">Visceral Fat</Label>
                          <Input
                            type="number"
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="bmr">BMR</Label>
                          <Input
                            type="number"
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="bodyAge">Body Age</Label>
                          <Input
                            type="number"
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Postural Assessment */}
                    <div className="space-y-4 p-4 bg-black rounded-lg">
                      <h4 className="text-md font-semibold text-gold">Postural Assessment</h4>
                      <div className="mb-4">
                        <label className="flex items-center space-x-2 text-white">
                          <input
                            type="checkbox"
                            className="rounded"
                          />
                          <span>Asymmetrical</span>
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="headNeckAlignment">Head and Neck Alignment</Label>
                          <Input
                            className="bg-black border-gray-700 text-white"
                            placeholder="e.g., neutral"
                          />
                        </div>
                        <div>
                          <Label htmlFor="shoulderAlignment">Shoulder Alignment</Label>
                          <Input
                            className="bg-black border-gray-700 text-white"
                            placeholder="e.g., rounded shoulder"
                          />
                        </div>
                        <div>
                          <Label htmlFor="upperBackAlignment">Upper Back Alignment</Label>
                          <Input
                            className="bg-black border-gray-700 text-white"
                            placeholder="e.g., kyphotic curve"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lowerBackAlignment">Lower Back Alignment</Label>
                          <Input
                            className="bg-black border-gray-700 text-white"
                            placeholder="e.g., neutral"
                          />
                        </div>
                        <div>
                          <Label htmlFor="pelvicAlignment">Pelvic Alignment</Label>
                          <Input
                            className="bg-black border-gray-700 text-white"
                            placeholder="e.g., neutral"
                          />
                        </div>
                        <div>
                          <Label htmlFor="hipKneeAlignment">Hip and Knee Alignment</Label>
                          <Input
                            className="bg-black border-gray-700 text-white"
                            placeholder="e.g., neutral"
                          />
                        </div>
                        <div>
                          <Label htmlFor="ankleAlignment">Ankle Alignment</Label>
                          <Input
                            className="bg-black border-gray-700 text-white"
                            placeholder="e.g., neutral"
                          />
                        </div>
                        <div>
                          <Label htmlFor="spinalMobility">Spinal Mobility</Label>
                          <Input
                            className="bg-black border-gray-700 text-white"
                            placeholder="e.g., decreased (spinal rotation, side bending, forward flexion)"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="stretching">Stretching Recommendations</Label>
                          <Textarea
                            className="bg-black border-gray-700 text-white"
                            placeholder="e.g., hamstring, glutes maximus, TFL, calf, trapezius, pectoral"
                          />
                        </div>
                        <div>
                          <Label htmlFor="strengthening">Strengthening Recommendations</Label>
                          <Textarea
                            className="bg-black border-gray-700 text-white"
                            placeholder="e.g., gluteus maximus and quadriceps, rotator cuff, scapular muscle"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Circumference Measurements */}
                    <div className="space-y-4 p-4 bg-black rounded-lg">
                      <h4 className="text-md font-semibold text-gold">Circumference Measurements (inches)</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="neck">Neck</Label>
                          <Input
                            type="number"
                            step="0.1"
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="shoulders">Shoulders</Label>
                          <Input
                            type="number"
                            step="0.1"
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="chest">Chest</Label>
                          <Input
                            type="number"
                            step="0.1"
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="upperArm">Upper Arm</Label>
                          <Input
                            type="number"
                            step="0.1"
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="forearms">Forearms</Label>
                          <Input
                            type="number"
                            step="0.1"
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="wrist">Wrist</Label>
                          <Input
                            type="number"
                            step="0.1"
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="waist">Waist</Label>
                          <Input
                            type="number"
                            step="0.1"
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="hip">Hip</Label>
                          <Input
                            type="number"
                            step="0.1"
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="thighs">Thighs</Label>
                          <Input
                            type="number"
                            step="0.1"
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="calf">Calf</Label>
                          <Input
                            type="number"
                            step="0.1"
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="ankle">Ankle</Label>
                          <Input
                            type="number"
                            step="0.1"
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Advice */}
                    <div className="space-y-4 p-4 bg-black rounded-lg">
                      <h4 className="text-md font-semibold text-gold">Professional Advice</h4>
                      <div>
                        <Label htmlFor="advice">Recommendations and Advice</Label>
                        <Textarea
                          className="bg-black border-gray-700 text-white"
                          rows={4}
                          placeholder="e.g., Lower body mobility exercises, Deep breathing exercises, Core strengthening, Pelvic floor muscle activation, Glutes muscles and quadriceps strengthening, Rotator cuff strengthening, Scapular strengthening"
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-gold text-black hover:bg-white">
                    Convert to Member
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="assessments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gold">Client Assessments</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gold text-black hover:bg-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Assessment
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-4xl">
                  <DialogHeader>
                    <DialogTitle className="text-gold">Add New Body Composition & BMI Assessment</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 overflow-y-auto max-h-[70vh]">
                    {/* Client Information */}
                    <div>
                      <Label htmlFor="clientName">Client Name</Label>
                      <Input
                        id="clientName"
                        value={newAssessment.clientName}
                        onChange={(e) => setNewAssessment({...newAssessment, clientName: e.target.value})}
                        className="bg-black border-gray-700 text-white"
                        placeholder="Keval Patel"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={newAssessment.dateOfBirth}
                        onChange={(e) => setNewAssessment({...newAssessment, dateOfBirth: e.target.value})}
                        className="bg-black border-gray-700 text-white"
                        placeholder="29/9/2002"
                      />
                    </div>
                    <div>
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={newAssessment.age || ""}
                        onChange={(e) => setNewAssessment({...newAssessment, age: parseInt(e.target.value)})}
                        className="bg-black border-gray-700 text-white"
                        placeholder="22"
                      />
                    </div>
                    <div>
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={newAssessment.height || ""}
                        onChange={(e) => setNewAssessment({...newAssessment, height: parseInt(e.target.value)})}
                        className="bg-black border-gray-700 text-white"
                        placeholder="174"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bp">BP (Resting)</Label>
                      <Input
                        id="bp"
                        value={newAssessment.bp}
                        onChange={(e) => setNewAssessment({...newAssessment, bp: e.target.value})}
                        className="bg-black border-gray-700 text-white"
                        placeholder="124/84"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bpAfterTreadmill">BP (After Treadmill)</Label>
                      <Input
                        id="bpAfterTreadmill"
                        value={newAssessment.bpAfterTreadmill}
                        onChange={(e) => setNewAssessment({...newAssessment, bpAfterTreadmill: e.target.value})}
                        className="bg-black border-gray-700 text-white"
                        placeholder="152/92"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContact">Emergency Contact</Label>
                      <Input
                        id="emergencyContact"
                        value={newAssessment.emergencyContact}
                        onChange={(e) => setNewAssessment({...newAssessment, emergencyContact: e.target.value})}
                        className="bg-black border-gray-700 text-white"
                        placeholder="9898027699"
                      />
                    </div>

                    {/* Body Composition */}
                    <div className="col-span-2 grid grid-cols-3 gap-x-6 gap-y-4">
                      <h3 className="text-lg font-semibold text-gold col-span-3">Body Composition</h3>
                      <div>
                        <Label htmlFor="bmi">BMI</Label>
                        <Input
                          id="bmi"
                          type="number"
                          value={newAssessment.bmi || ""}
                          onChange={(e) => setNewAssessment({...newAssessment, bmi: parseFloat(e.target.value)})}
                          className="bg-black border-gray-700 text-white"
                          placeholder="30.1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          value={newAssessment.weight || ""}
                          onChange={(e) => setNewAssessment({...newAssessment, weight: parseFloat(e.target.value)})}
                          className="bg-black border-gray-700 text-white"
                          placeholder="94.2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="muscle">Muscle Mass (%)</Label>
                        <Input
                          id="muscle"
                          type="number"
                          value={newAssessment.muscle || ""}
                          onChange={(e) => setNewAssessment({...newAssessment, muscle: parseFloat(e.target.value)})}
                          className="bg-black border-gray-700 text-white"
                          placeholder="29.7"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fat">Fat Mass (%)</Label>
                        <Input
                          id="fat"
                          type="number"
                          value={newAssessment.fat || ""}
                          onChange={(e) => setNewAssessment({...newAssessment, fat: parseFloat(e.target.value)})}
                          className="bg-black border-gray-700 text-white"
                          placeholder="31.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="saturatedFat">Saturated Fat (%)</Label>
                        <Input
                          id="saturatedFat"
                          type="number"
                          value={newAssessment.saturatedFat || ""}
                          onChange={(e) => setNewAssessment({...newAssessment, saturatedFat: parseFloat(e.target.value)})}
                          className="bg-black border-gray-700 text-white"
                          placeholder="22.2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="visceralFat">Visceral Fat</Label>
                        <Input
                          id="visceralFat"
                          type="number"
                          value={newAssessment.visceralFat || ""}
                          onChange={(e) => setNewAssessment({...newAssessment, visceralFat: parseInt(e.target.value)})}
                          className="bg-black border-gray-700 text-white"
                          placeholder="14"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bmr">BMR</Label>
                        <Input
                          id="bmr"
                          type="number"
                          value={newAssessment.bmr || ""}
                          onChange={(e) => setNewAssessment({...newAssessment, bmr: parseInt(e.target.value)})}
                          className="bg-black border-gray-700 text-white"
                          placeholder="1946"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bodyAge">Body Age</Label>
                        <Input
                          id="bodyAge"
                          type="number"
                          value={newAssessment.bodyAge || ""}
                          onChange={(e) => setNewAssessment({...newAssessment, bodyAge: parseInt(e.target.value)})}
                          className="bg-black border-gray-700 text-white"
                          placeholder="50"
                        />
                      </div>
                    </div>

                    {/* Postural Assessment */}
                    <div className="col-span-2 grid grid-cols-2 gap-x-6 gap-y-4">
                      <h3 className="text-lg font-semibold text-gold col-span-2">Postural Assessment</h3>
                      <div className="col-span-2">
                        <Label htmlFor="posturalAssessment">Overall Posture</Label>
                        <Input
                          id="posturalAssessment"
                          value={newAssessment.posturalAssessment}
                          onChange={(e) => setNewAssessment({...newAssessment, posturalAssessment: e.target.value})}
                          className="bg-black border-gray-700 text-white"
                          placeholder="Asymmetrical"
                        />
                      </div>
                      <div>
                        <Label htmlFor="headNeckAlignment">Head & Neck</Label>
                        <Input
                          id="headNeckAlignment"
                          value={newAssessment.headNeckAlignment}
                          onChange={(e) => setNewAssessment({...newAssessment, headNeckAlignment: e.target.value})}
                          className="bg-black border-gray-700 text-white"
                          placeholder="Neutral"
                        />
                      </div>
                      <div>
                        <Label htmlFor="shoulderAlignment">Shoulders</Label>
                        <Input
                          id="shoulderAlignment"
                          value={newAssessment.shoulderAlignment}
                          onChange={(e) => setNewAssessment({...newAssessment, shoulderAlignment: e.target.value})}
                          className="bg-black border-gray-700 text-white"
                          placeholder="Rounded Shoulder"
                        />
                      </div>
                      <div>
                        <Label htmlFor="upperBackAlignment">Upper Back</Label>
                        <Input
                          id="upperBackAlignment"
                          value={newAssessment.upperBackAlignment}
                          onChange={(e) => setNewAssessment({...newAssessment, upperBackAlignment: e.target.value})}
                          className="bg-black border-gray-700 text-white"
                          placeholder="Kyphotic Curve"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lowerBackAlignment">Lower Back</Label>
                        <Input
                          id="lowerBackAlignment"
                          value={newAssessment.lowerBackAlignment}
                          onChange={(e) => setNewAssessment({...newAssessment, lowerBackAlignment: e.target.value})}
                          className="bg-black border-gray-700 text-white"
                          placeholder="Neutral"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pelvicAlignment">Pelvis</Label>
                        <Input
                          id="pelvicAlignment"
                          value={newAssessment.pelvicAlignment}
                          onChange={(e) => setNewAssessment({...newAssessment, pelvicAlignment: e.target.value})}
                          className="bg-black border-gray-700 text-white"
                          placeholder="Neutral"
                        />
                      </div>
                      <div>
                        <Label htmlFor="hipKneeAlignment">Hip & Knee</Label>
                        <Input
                          id="hipKneeAlignment"
                          value={newAssessment.hipKneeAlignment}
                          onChange={(e) => setNewAssessment({...newAssessment, hipKneeAlignment: e.target.value})}
                          className="bg-black border-gray-700 text-white"
                          placeholder="Neutral"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ankleAlignment">Ankle</Label>
                        <Input
                          id="ankleAlignment"
                          value={newAssessment.ankleAlignment}
                          onChange={(e) => setNewAssessment({...newAssessment, ankleAlignment: e.target.value})}
                          className="bg-black border-gray-700 text-white"
                          placeholder="Neutral"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="spinalMobility">Spinal Mobility</Label>
                        <Textarea
                          id="spinalMobility"
                          value={newAssessment.spinalMobility}
                          onChange={(e) => setNewAssessment({...newAssessment, spinalMobility: e.target.value})}
                          className="bg-black border-gray-700 text-white"
                          placeholder="Decreased (spinal rotation, side bending, forward flexion)"
                        />
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="col-span-2 grid grid-cols-2 gap-x-6 gap-y-4">
                      <h3 className="text-lg font-semibold text-gold col-span-2">Recommendations</h3>
                      <div className="col-span-2">
                        <Label htmlFor="recommendations">Stretching</Label>
                        <Textarea
                          id="recommendations"
                          value={newAssessment.recommendations}
                          onChange={(e) => setNewAssessment({...newAssessment, recommendations: e.target.value})}
                          className="bg-black border-gray-700 text-white"
                          placeholder="Hamstring, glutes maximus, TFL, calf, trapezius, pectoral"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="strengthening">Strengthening</Label>
                        <Textarea
                          id="strengthening"
                          value={newAssessment.recommendations} // Assuming this is where strengthening goes
                          onChange={(e) => setNewAssessment({...newAssessment, recommendations: e.target.value})}
                          className="bg-black border-gray-700 text-white"
                          placeholder="Gluteus maximus and quadriceps, rotator cuff, scapular muscle"
                        />
                      </div>
                    </div>

                    {/* Circumference Measurements */}
                    <div className="col-span-2 grid grid-cols-3 gap-x-6 gap-y-4">
                      <h3 className="text-lg font-semibold text-gold col-span-3">Circumference Measurements (inch)</h3>
                      <div className="col-span-3 grid grid-cols-3 gap-x-6 gap-y-4">
                        <div className="col-span-1">
                          <Label htmlFor="neck">Neck</Label>
                          <Input
                            id="neck"
                            type="number"
                            value={newAssessment.circumferenceMeasurements.neck || ""}
                            onChange={(e) => setNewAssessment({...newAssessment, circumferenceMeasurements: {...newAssessment.circumferenceMeasurements, neck: parseFloat(e.target.value)}})}
                            className="bg-black border-gray-700 text-white"
                            placeholder="15.5"
                          />
                        </div>
                        <div className="col-span-1">
                          <Label htmlFor="shoulders">Shoulders</Label>
                          <Input
                            id="shoulders"
                            type="number"
                            value={newAssessment.circumferenceMeasurements.shoulders || ""}
                            onChange={(e) => setNewAssessment({...newAssessment, circumferenceMeasurements: {...newAssessment.circumferenceMeasurements, shoulders: parseFloat(e.target.value)}})}
                            className="bg-black border-gray-700 text-white"
                            placeholder="19.5"
                          />
                        </div>
                        <div className="col-span-1">
                          <Label htmlFor="chest">Chest</Label>
                          <Input
                            id="chest"
                            type="number"
                            value={newAssessment.circumferenceMeasurements.chest || ""}
                            onChange={(e) => setNewAssessment({...newAssessment, circumferenceMeasurements: {...newAssessment.circumferenceMeasurements, chest: parseFloat(e.target.value)}})}
                            className="bg-black border-gray-700 text-white"
                            placeholder="42"
                          />
                        </div>
                      </div>
                      <h4 className="text-md font-semibold text-gold col-span-3">Arms</h4>
                      <div className="col-span-3 grid grid-cols-3 gap-x-6 gap-y-4">
                        <div className="col-span-1">
                          <Label htmlFor="upperArm">Upper Arm</Label>
                          <Input
                            id="upperArm"
                            type="number"
                            value={newAssessment.circumferenceMeasurements.upperArm || ""}
                            onChange={(e) => setNewAssessment({...newAssessment, circumferenceMeasurements: {...newAssessment.circumferenceMeasurements, upperArm: parseFloat(e.target.value)}})}
                            className="bg-black border-gray-700 text-white"
                            placeholder="13"
                          />
                        </div>
                        <div className="col-span-1">
                          <Label htmlFor="forearms">Forearms</Label>
                          <Input
                            id="forearms"
                            type="number"
                            value={newAssessment.circumferenceMeasurements.forearms || ""}
                            onChange={(e) => setNewAssessment({...newAssessment, circumferenceMeasurements: {...newAssessment.circumferenceMeasurements, forearms: parseFloat(e.target.value)}})}
                            className="bg-black border-gray-700 text-white"
                            placeholder="11"
                          />
                        </div>
                        <div className="col-span-1">
                          <Label htmlFor="wrist">Wrist</Label>
                          <Input
                            id="wrist"
                            type="number"
                            value={newAssessment.circumferenceMeasurements.wrist || ""}
                            onChange={(e) => setNewAssessment({...newAssessment, circumferenceMeasurements: {...newAssessment.circumferenceMeasurements, wrist: parseFloat(e.target.value)}})}
                            className="bg-black border-gray-700 text-white"
                            placeholder="7"
                          />
                        </div>
                      </div>
                      <div className="col-span-1">
                        <Label htmlFor="waist">Waist</Label>
                        <Input
                          id="waist"
                          type="number"
                          value={newAssessment.circumferenceMeasurements.waist || ""}
                          onChange={(e) => setNewAssessment({...newAssessment, circumferenceMeasurements: {...newAssessment.circumferenceMeasurements, waist: parseFloat(e.target.value)}})}
                          className="bg-black border-gray-700 text-white"
                          placeholder="41"
                        />
                      </div>
                      <div className="col-span-1">
                        <Label htmlFor="hip">Hip</Label>
                        <Input
                          id="hip"
                          type="number"
                          value={newAssessment.circumferenceMeasurements.hip || ""}
                          onChange={(e) => setNewAssessment({...newAssessment, circumferenceMeasurements: {...newAssessment.circumferenceMeasurements, hip: parseFloat(e.target.value)}})}
                          className="bg-black border-gray-700 text-white"
                          placeholder="43.5"
                        />
                      </div>
                      <h4 className="text-md font-semibold text-gold col-span-3">Legs</h4>
                      <div className="col-span-3 grid grid-cols-3 gap-x-6 gap-y-4">
                        <div className="col-span-1">
                          <Label htmlFor="thighs">Thighs</Label>
                          <Input
                            id="thighs"
                            type="number"
                            value={newAssessment.circumferenceMeasurements.thighs || ""}
                            onChange={(e) => setNewAssessment({...newAssessment, circumferenceMeasurements: {...newAssessment.circumferenceMeasurements, thighs: parseFloat(e.target.value)}})}
                            className="bg-black border-gray-700 text-white"
                            placeholder="25"
                          />
                        </div>
                        <div className="col-span-1">
                          <Label htmlFor="calf">Calf</Label>
                          <Input
                            id="calf"
                            type="number"
                            value={newAssessment.circumferenceMeasurements.calf || ""}
                            onChange={(e) => setNewAssessment({...newAssessment, circumferenceMeasurements: {...newAssessment.circumferenceMeasurements, calf: parseFloat(e.target.value)}})}
                            className="bg-black border-gray-700 text-white"
                            placeholder="15.5"
                          />
                        </div>
                        <div className="col-span-1">
                          <Label htmlFor="ankle">Ankle</Label>
                          <Input
                            id="ankle"
                            type="number"
                            value={newAssessment.circumferenceMeasurements.ankle || ""}
                            onChange={(e) => setNewAssessment({...newAssessment, circumferenceMeasurements: {...newAssessment.circumferenceMeasurements, ankle: parseFloat(e.target.value)}})}
                            className="bg-black border-gray-700 text-white"
                            placeholder="9"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Advice */}
                    <div className="col-span-2">
                      <Label htmlFor="advice">Advice</Label>
                      <Textarea
                        id="advice"
                        value={newAssessment.advice}
                        onChange={(e) => setNewAssessment({...newAssessment, advice: e.target.value})}
                        className="bg-black border-gray-700 text-white"
                        placeholder="Lower body mobility exercises, Deep breathing exercises, Core strengthening, Pelvic floor muscle activation, Glutes muscles and quadriceps strengthening, Rotator cuff strengthening, Scapular strengthening"
                      />
                    </div>
                  </div>
                  <DialogFooter className="mt-6">
                    <Button
                      onClick={handleCreateAssessment}
                      className="w-full bg-gold text-black hover:bg-white"
                    >
                      Save Assessment
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-gold">Assessments ({assessments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-gray-400">Client Name</TableHead>
                      <TableHead className="text-gray-400">Date</TableHead>
                      <TableHead className="text-gray-400">Trainer</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assessments.map((assessment) => (
                      <TableRow key={assessment.id} className="border-gray-800">
                        <TableCell className="text-white">{assessment.clientName}</TableCell>
                        <TableCell className="text-gray-400">{assessment.date}</TableCell>
                        <TableCell className="text-gray-400">{assessment.trainerName}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="ghost" className="text-gold hover:bg-gold hover:text-black">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-blue-400 hover:bg-blue-400 hover:text-white">
                              Share
                            </Button>
                            <Button size="sm" variant="ghost" className="text-green-400 hover:bg-green-400 hover:text-white">
                              Export
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workouts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gold">Workout Plans</h2>
              <Dialog open={showNewWorkoutModal} onOpenChange={setShowNewWorkoutModal}>
                <DialogTrigger asChild>
                  <Button className="bg-gold text-black hover:bg-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Workout Plan
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-800 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-gold">Create Workout Plan</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="clientId">Client</Label>
                      <Select
                        value={newWorkout.clientId}
                        onValueChange={(value) => setNewWorkout({...newWorkout, clientId: value})}
                      >
                        <SelectTrigger className="bg-black border-gray-700 text-white">
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-800 text-white">
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id.toString()}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="planName">Plan Name</Label>
                      <Input
                        id="planName"
                        value={newWorkout.planName}
                        onChange={(e) => setNewWorkout({...newWorkout, planName: e.target.value})}
                        className="bg-black border-gray-700 text-white"
                        placeholder="e.g., Upper Body Strength"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newWorkout.description}
                        onChange={(e) => setNewWorkout({...newWorkout, description: e.target.value})}
                        className="bg-black border-gray-700 text-white"
                        placeholder="Describe the workout plan goals and focus..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration (weeks)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={newWorkout.duration}
                        onChange={(e) => setNewWorkout({...newWorkout, duration: e.target.value})}
                        className="bg-black border-gray-700 text-white"
                        placeholder="4"
                      />
                    </div>
                    <div>
                      <Label htmlFor="exercises">Exercises</Label>
                      <Textarea
                        id="exercises"
                        value={newWorkout.exercises}
                        onChange={(e) => setNewWorkout({...newWorkout, exercises: e.target.value})}
                        className="bg-black border-gray-700 text-white"
                        placeholder="List exercises with sets and reps..."
                      />
                    </div>
                    <Button
                      onClick={handleCreateWorkoutPlan}
                      className="w-full bg-gold text-black hover:bg-white"
                    >
                      Create Plan
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-gray-400">Client</TableHead>
                      <TableHead className="text-gray-400">Plan Name</TableHead>
                      <TableHead className="text-gray-400">Created</TableHead>
                      <TableHead className="text-gray-400">Exercises</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workoutPlans.map((plan) => (
                      <TableRow key={plan.id} className="border-gray-800">
                        <TableCell className="text-white">{plan.clientName}</TableCell>
                        <TableCell className="text-white">{plan.planName}</TableCell>
                        <TableCell className="text-gray-400">{new Date(plan.createdDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-gray-400">{plan.exercises} exercises</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="ghost" className="text-gold hover:bg-gold hover:text-black">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-blue-400 hover:bg-blue-400 hover:text-white">
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nutrition" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gold">Nutrition Plans</h2>
              <Dialog open={showNewNutritionModal} onOpenChange={setShowNewNutritionModal}>
                <DialogTrigger asChild>
                  <Button className="bg-gold text-black hover:bg-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Design Nutrition Plan
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-800 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-gold">Design Nutrition Plan</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="clientId">Client</Label>
                      <Select
                        value={newNutrition.clientId}
                        onValueChange={(value) => setNewNutrition({...newNutrition, clientId: value})}
                      >
                        <SelectTrigger className="bg-black border-gray-700 text-white">
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-800 text-white">
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id.toString()}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="planName">Plan Name</Label>
                      <Input
                        id="planName"
                        value={newNutrition.planName}
                        onChange={(e) => setNewNutrition({...newNutrition, planName: e.target.value})}
                        className="bg-black border-gray-700 text-white"
                        placeholder="e.g., Muscle Gain Diet"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newNutrition.description}
                        onChange={(e) => setNewNutrition({...newNutrition, description: e.target.value})}
                        className="bg-black border-gray-700 text-white"
                        placeholder="Describe the nutrition plan goals..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="calories">Daily Calories</Label>
                      <Input
                        id="calories"
                        type="number"
                        value={newNutrition.calories}
                        onChange={(e) => setNewNutrition({...newNutrition, calories: e.target.value})}
                        className="bg-black border-gray-700 text-white"
                        placeholder="2200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="meals">Meal Plan</Label>
                      <Textarea
                        id="meals"
                        value={newNutrition.meals}
                        onChange={(e) => setNewNutrition({...newNutrition, meals: e.target.value})}
                        className="bg-black border-gray-700 text-white"
                        placeholder="Detail the meal plan and macros..."
                      />
                    </div>
                    <Button
                      onClick={handleCreateNutritionPlan}
                      className="w-full bg-gold text-black hover:bg-white"
                    >
                      Create Plan
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-gray-400">Client</TableHead>
                      <TableHead className="text-gray-400">Plan Name</TableHead>
                      <TableHead className="text-gray-400">Created</TableHead>
                      <TableHead className="text-gray-400">Daily Calories</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {nutritionPlans.map((plan) => (
                      <TableRow key={plan.id} className="border-gray-800">
                        <TableCell className="text-white">{plan.clientName}</TableCell>
                        <TableCell className="text-white">{plan.planName}</TableCell>
                        <TableCell className="text-gray-400">{new Date(plan.createdDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-gray-400">{plan.calories} cal</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="ghost" className="text-gold hover:bg-gold hover:text-black">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-blue-400 hover:bg-blue-400 hover:text-white">
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}