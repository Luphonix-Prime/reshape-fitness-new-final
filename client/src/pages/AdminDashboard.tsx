import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Users, Activity, Settings, BarChart, Plus, Edit, Trash2, Phone, Calendar, Target, Key } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";

export default function AdminDashboard() {
  // ALL HOOKS MUST BE DECLARED AT THE TOP - BEFORE ANY CONDITIONAL LOGIC
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("members");
  const [showScheduleSessionModal, setShowScheduleSessionModal] = useState(false);
  const [newSessionData, setNewSessionData] = useState({
    memberId: "",
    trainerId: "",
    sessionType: "",
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    duration: "60",
    notes: ""
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [markedTrainers, setMarkedTrainers] = useState<Set<string>>(new Set()); // This state is not used in the final logic but kept for context.
  const [newAttendance, setNewAttendance] = useState({
    trainerId: "",
    status: "present",
    checkInTime: "",
    checkOutTime: "",
    notes: ""
  });
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddTrainerModal, setShowAddTrainerModal] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [editingTrainer, setEditingTrainer] = useState<any>(null);
  const [newMember, setNewMember] = useState({
    firstName: "",
    lastName: "",
    email: "",
    membershipTierId: "",
    trainingType: "", // Added trainingType state
    phone: "",
    emergencyContact: "",
    fitnessGoals: ""
  });
  const [newTrainer, setNewTrainer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    specializations: "",
    hourlyRate: "",
    experienceYears: "",
    certifications: "",
    bio: ""
  });

  // Trainer Password Change State
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [selectedTrainerForPassword, setSelectedTrainerForPassword] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Body Assessment state
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [selectedAssessmentIds, setSelectedAssessmentIds] = useState<Set<string>>(new Set());
  const [newAssessment, setNewAssessment] = useState({
    memberId: "",
    dateOfBirth: "",
    age: "",
    height: "",
    bloodPressure: "",
    afterTreadmillBP: "",
    emergencyContact: "",
    bodyComposition: {
      bmi: "",
      weight: "",
      muscle: "",
      fat: "",
      saturatedFat: "",
      visceralFat: "",
      bmr: "",
      bodyAge: ""
    },
    posturalAssessment: {
      asymmetrical: false,
      headNeckAlignment: "",
      shoulderAlignment: "",
      upperBackAlignment: "",
      lowerBackAlignment: "",
      pelvicAlignment: "",
      hipKneeAlignment: "",
      ankleAlignment: "",
      spinalMobility: "",
      recommendations: {
        stretching: "",
        strengthening: ""
      }
    },
    circumferenceMeasurements: {
      neck: "",
      shoulders: "",
      chest: "",
      upperArm: "",
      forearms: "",
      wrist: "",
      waist: "",
      hip: "",
      thighs: "",
      calf: "",
      ankle: ""
    },
    advice: ""
  });

  // System settings state
  const [gymSettings, setGymSettings] = useState({
    gymName: "RESHAPE FITNESS",
    address: "123 Fitness Avenue, Luxury District",
    operatingHours: "5:00 AM - 11:00 PM"
  });

  const [membershipPricing, setMembershipPricing] = useState({});

  const [settingsLoading, setSettingsLoading] = useState(false);

  // Membership Management State
  const [showAddMembershipModal, setShowAddMembershipModal] = useState(false);
  const [editingMembership, setEditingMembership] = useState<any>(null);
  const [newMembership, setNewMembership] = useState({
    name: "",
    sessions: 0,
    duration: "",
    oneOnOnePrice: 0,
    oneOnOnePerSession: 0,
    twoPeoplePrice: 0,
    twoPeoplePerSession: 0,
    threePeoplePrice: 0,
    threePeoplePerSession: 0,
    features: "",
    description: ""
  });

  // Trainer Assignment State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedMemberForAssignment, setSelectedMemberForAssignment] = useState<string>('');
  const [selectedTrainerForAssignment, setSelectedTrainerForAssignment] = useState<string>('');
  const [assignmentData, setAssignmentData] = useState({
    trainerId: "",
    assignedDate: new Date().toISOString().split('T')[0],
    notes: ""
  });

  // Fetch real data
  const { data: members, isLoading: membersLoading, refetch: refetchMembers } = useQuery({
    queryKey: ['/api/admin/members'],
  });

  const { data: trainers, isLoading: trainersLoading, refetch: refetchTrainers } = useQuery({
    queryKey: ['/api/admin/trainers'],
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
  });

  const { data: membershipTiers, refetch: refetchMembershipTiers } = useQuery({
    queryKey: ['/api/membership-tiers'],
  });

  const { data: todayAttendance, refetch: refetchAttendance } = useQuery({
    queryKey: ['/api/admin/attendance', selectedDate],
    queryFn: () => apiRequest('GET', `/api/admin/attendance/${selectedDate}`),
  });

  const { data: attendanceStats } = useQuery({
    queryKey: ['/api/admin/attendance-stats', new Date().getFullYear()],
    queryFn: () => apiRequest('GET', `/api/admin/attendance-stats?year=${new Date().getFullYear()}`),
  });

  const { data: monthlyAttendanceStats } = useQuery({
    queryKey: ['/api/admin/attendance-stats', new Date().getFullYear(), new Date().getMonth() + 1],
    queryFn: () => apiRequest('GET', `/api/admin/attendance-stats?year=${new Date().getFullYear()}&month=${new Date().getMonth() + 1}`),
  });

  const { data: bodyAssessments, refetch: refetchAssessments } = useQuery({
    queryKey: ['/api/admin/body-assessments'],
    queryFn: () => apiRequest('GET', '/api/admin/body-assessments'),
  });

  const { data: inquiries, refetch: refetchInquiries } = useQuery({
    queryKey: ['/api/admin/inquiries'],
    queryFn: () => apiRequest('GET', '/api/admin/inquiries'),
  });

  // Fetch Trainer Assignments
  const { data: trainerAssignments, refetch: refetchTrainerAssignments } = useQuery({
    queryKey: ['/api/admin/trainer-assignments'],
    queryFn: () => apiRequest('GET', '/api/admin/trainer-assignments'),
  });

  // Fetch all sessions for admin
  const { data: allSessions, refetch: refetchAllSessions } = useQuery({
    queryKey: ['/api/admin/member-sessions'],
    queryFn: () => apiRequest('GET', '/api/admin/member-sessions'),
  });

  // Mutations
  const createMemberMutation = useMutation({
    mutationFn: (memberData: any) => apiRequest('POST', '/api/admin/create-member', memberData),
    onSuccess: () => {
      toast({
        title: "Member Created",
        description: "New member has been added successfully."
      });
      setShowAddMemberModal(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/members'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to create member",
        variant: "destructive"
      });
    }
  });

  const createTrainerMutation = useMutation({
    mutationFn: (trainerData: any) => apiRequest('POST', '/api/admin/create-trainer', trainerData),
    onSuccess: () => {
      toast({
        title: "Trainer Added",
        description: "New trainer has been added to the team."
      });
      setShowAddTrainerModal(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/trainers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create trainer",
        variant: "destructive"
      });
    }
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({ id, memberData }: { id: string, memberData: any }) => apiRequest('PUT', `/api/admin/update-member/${id}`, memberData),
    onSuccess: () => {
      toast({
        title: "Member Updated",
        description: "Member details have been updated successfully."
      });
      closeModals();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/members'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: (error: any) => {
      console.error('Update member error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to update member",
        variant: "destructive",
      });
    }
  });

  const updateTrainerMutation = useMutation({
    mutationFn: ({ id, trainerData }: { id: string, trainerData: any }) => apiRequest('PUT', `/api/admin/update-trainer/${id}`, trainerData),
    onSuccess: () => {
      toast({
        title: "Trainer Updated",
        description: "Trainer details have been updated successfully."
      });
      closeModals();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/trainers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update trainer",
        variant: "destructive",
      });
    }
  });

  // Trainer password change mutation
  const changeTrainerPasswordMutation = useMutation({
    mutationFn: ({ trainerId, newPassword }: { trainerId: string, newPassword: string }) =>
      apiRequest('POST', `/api/admin/change-trainer-password/${trainerId}`, { newPassword }),
    onSuccess: () => {
      toast({
        title: "Password Updated",
        description: "Trainer's password has been updated successfully."
      });
      setShowChangePasswordModal(false);
      setSelectedTrainerForPassword(null);
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    }
  });

  // System settings mutations
  const updateGymSettingsMutation = useMutation({
    mutationFn: (settings: any) => apiRequest('PUT', '/api/admin/gym-settings', settings),
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Gym configuration has been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update gym settings",
        variant: "destructive"
      });
    }
  });

  const updateMembershipPricingMutation = useMutation({
    mutationFn: (pricing: any) => apiRequest('PUT', '/api/admin/membership-pricing', pricing),
    onSuccess: () => {
      toast({
        title: "Pricing Updated",
        description: "Membership pricing has been updated successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/membership-tiers'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update pricing",
        variant: "destructive"
      });
    }
  });

  // Membership Tier Mutations
  const createMembershipMutation = useMutation({
    mutationFn: (membershipData: any) => apiRequest('POST', '/api/admin/membership-tiers', membershipData),
    onSuccess: () => {
      toast({
        title: "Membership Tier Added",
        description: "New membership tier created successfully."
      });
      setShowAddMembershipModal(false);
      queryClient.invalidateQueries({ queryKey: ['/api/membership-tiers'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create membership tier",
        variant: "destructive"
      });
    }
  });

  const updateMembershipMutation = useMutation({
    mutationFn: ({ id, membershipData }: { id: string, membershipData: any }) => apiRequest('PUT', `/api/admin/membership-tiers/${id}`, membershipData),
    onSuccess: () => {
      toast({
        title: "Membership Tier Updated",
        description: "Membership tier updated successfully."
      });
      closeMemershipModal();
      queryClient.invalidateQueries({ queryKey: ['/api/membership-tiers'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update membership tier",
        variant: "destructive"
      });
    }
  });

  const deleteMembershipMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/admin/membership-tiers/${id}`, {}),
    onSuccess: () => {
      toast({
        title: "Membership Tier Deleted",
        description: "Membership tier deleted successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/membership-tiers'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete membership tier",
        variant: "destructive"
      });
    }
  });

  const recordAttendanceMutation = useMutation({
    mutationFn: (attendanceData: any) => apiRequest('POST', '/api/admin/attendance', attendanceData),
    onSuccess: () => {
      toast({
        title: "Attendance Recorded",
        description: "Trainer attendance has been recorded successfully."
      });
      setShowAttendanceModal(false);
      refetchAttendance();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/attendance-stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record attendance",
        variant: "destructive"
      });
    }
  });

  // Body Assessment mutations
  const createAssessmentMutation = useMutation({
    mutationFn: (assessmentData: any) => apiRequest('POST', '/api/admin/body-assessments', assessmentData),
    onSuccess: () => {
      toast({
        title: "Assessment Created",
        description: "Body assessment has been created successfully."
      });
      setShowAssessmentModal(false);
      refetchAssessments();
      closeAssessmentModal();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create assessment",
        variant: "destructive"
      });
    }
  });

  const shareAssessmentMutation = useMutation({
    mutationFn: ({ assessmentId, trainerId }: { assessmentId: string, trainerId: string }) =>
      apiRequest('POST', `/api/admin/body-assessments/${assessmentId}/share/${trainerId}`, {}),
    onSuccess: () => {
      toast({
        title: "Assessment Shared",
        description: "Assessment has been shared with trainer successfully."
      });
      setShowShareModal(false);
      setSelectedAssessment(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to share assessment",
        variant: "destructive"
      });
    }
  });

  const updateAssessmentMutation = useMutation({
    mutationFn: ({ id, assessmentData }: { id: string, assessmentData: any }) =>
      apiRequest('PUT', `/api/admin/body-assessments/${id}`, assessmentData),
    onSuccess: () => {
      toast({
        title: "Assessment Updated",
        description: "Assessment has been updated successfully."
      });
      setShowAssessmentModal(false);
      setEditingAssessment(null);
      refetchAssessments();
      closeAssessmentModal();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update assessment",
        variant: "destructive"
      });
    }
  });

  const convertInquiryMutation = useMutation({
    mutationFn: ({ inquiryId, memberData, assessmentData }: { inquiryId: string, memberData: any, assessmentData: any }) =>
      apiRequest('POST', `/api/admin/inquiries/${inquiryId}/convert`, { memberData, assessmentData }),
    onSuccess: () => {
      toast({
        title: "Inquiry Converted",
        description: "Inquiry has been converted to member successfully."
      });
      setShowConvertModal(false);
      setSelectedInquiry(null);
      refetchInquiries();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/members'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to convert inquiry",
        variant: "destructive"
      });
    }
  });

  const deleteInquiryMutation = useMutation({
    mutationFn: (inquiryId: string) => apiRequest('DELETE', `/api/admin/inquiries/${inquiryId}`, {}),
    onSuccess: () => {
      toast({
        title: "Inquiry Cancelled",
        description: "Inquiry has been cancelled successfully."
      });
      refetchInquiries();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel inquiry",
        variant: "destructive"
      });
    }
  });

  // Trainer Assignment Mutations
  const assignTrainerMutation = useMutation({
    mutationFn: (assignmentData: any) => apiRequest('POST', '/api/admin/assign-trainer', assignmentData),
    onSuccess: () => {
      toast({
        title: "Assignment Successful",
        description: "Trainer assigned to member successfully."
      });
      setShowAssignModal(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/trainer-assignments'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign trainer",
        variant: "destructive"
      });
    }
  });

  // Session scheduling mutation for admin
  const scheduleSessionMutation = useMutation({
    mutationFn: (sessionData: any) => apiRequest('POST', '/api/admin/member-sessions', sessionData),
    onSuccess: () => {
      toast({
        title: "Session Scheduled",
        description: "Training session has been scheduled successfully."
      });
      setShowScheduleSessionModal(false);
      setNewSessionData({
        memberId: "",
        trainerId: "",
        sessionType: "",
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        duration: "60",
        notes: ""
      });
      refetchAllSessions();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to schedule session",
        variant: "destructive"
      });
    }
  });

  const handleRemoveTrainer = async (memberId: string, trainerId: string) => {
    if (confirm('Are you sure you want to remove this trainer assignment?')) {
      try {
        await apiRequest('DELETE', `/api/admin/remove-trainer/${memberId}/${trainerId}`);
        toast({
          title: "Assignment Removed",
          description: "Trainer removed from member successfully."
        });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/trainer-assignments'] });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to remove trainer assignment",
          variant: "destructive"
        });
      }
    }
  };

  const handleScheduleSession = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newSessionData.memberId || !newSessionData.trainerId || !newSessionData.sessionType || !newSessionData.date || !newSessionData.time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Get member and trainer names
    const selectedMember = members?.find(m => m.userId === newSessionData.memberId);
    const selectedTrainer = trainers?.find(t => t.userId === newSessionData.trainerId);

    const sessionData = {
      memberId: newSessionData.memberId,
      trainerId: newSessionData.trainerId,
      memberName: selectedMember ? `${selectedMember.firstName} ${selectedMember.lastName}` : '',
      trainerName: selectedTrainer ? `${selectedTrainer.firstName} ${selectedTrainer.lastName}` : '',
      sessionType: newSessionData.sessionType,
      scheduledDate: newSessionData.date,
      scheduledTime: newSessionData.time,
      duration: parseInt(newSessionData.duration),
      notes: newSessionData.notes
    };

    scheduleSessionMutation.mutate(sessionData);
  };

  useEffect(() => {
    if (user) {
      refetchMembers();
      refetchTrainers();
      refetchAssessments();
      refetchInquiries();
      refetchTrainerAssignments();
      refetchMembershipTiers();
    }
  }, [user]);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!newMember.firstName || !newMember.lastName || !newMember.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (First Name, Last Name, Email)",
        variant: "destructive"
      });
      return;
    }

    // For updates, membershipTierId is optional; for creates, it's required
    if (!editingMember) {
      const membershipTierId = newMember.membershipTierId || (membershipTiers?.[0]?._id || membershipTiers?.[0]?.id);
      if (!membershipTierId) {
        toast({
          title: "Error",
          description: "Please select a membership type",
          variant: "destructive"
        });
        return;
      }
    }

    const memberData = {
      firstName: newMember.firstName,
      lastName: newMember.lastName,
      email: newMember.email,
      membershipTierId: newMember.membershipTierId || (membershipTiers?.[0]?._id || membershipTiers?.[0]?.id),
      trainingType: newMember.trainingType || 'one_on_one',
      phone: newMember.phone || null,
      emergencyContact: newMember.emergencyContact || null,
      fitnessGoals: newMember.fitnessGoals || null
    };

    console.log(editingMember ? 'Updating member with data:' : 'Creating member with data:', memberData);

    if (editingMember) {
      // Use the correct member ID from the member object
      const memberId = editingMember.userId || editingMember.id || editingMember.user_id;
      if (!memberId) {
        toast({
          title: "Error",
          description: "Invalid member ID",
          variant: "destructive"
        });
        return;
      }
      updateMemberMutation.mutate({ id: memberId, memberData });
    } else {
      createMemberMutation.mutate(memberData);
    }
  };

  const handleAddTrainer = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!newTrainer.firstName || !newTrainer.lastName || !newTrainer.email || !newTrainer.specializations) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const specializations = newTrainer.specializations.split(',').map(s => s.trim()).filter(Boolean);
    const trainerData = {
      ...newTrainer,
      specializations,
      hourlyRate: newTrainer.hourlyRate || "75.00",
      experienceYears: parseInt(newTrainer.experienceYears) || 2
    };

    if (editingTrainer) {
      updateTrainerMutation.mutate({ id: editingTrainer.userId, trainerData });
    } else {
      createTrainerMutation.mutate(trainerData);
    }
  };

  // Edit member
  const handleEditMember = (member: any) => {
    console.log('Editing member:', member);
    setEditingMember(member);
    setNewMember({
      firstName: member.first_name || '',
      lastName: member.last_name || '',
      email: member.email || '',
      phone: member.phone || '',
      membershipTierId: member.membership_tier_id || member.subscription_membership_tier_id || '',
      emergencyContact: member.emergency_contact || '',
      fitnessGoals: member.fitness_goals || '',
      trainingType: member.subscription_training_type || member.training_type || 'one_on_one'
    });
    setShowAddMemberModal(true);
  };

  const handleEditTrainer = (trainer: any) => {
    setEditingTrainer(trainer);
    setNewTrainer({
      firstName: trainer.firstName || "",
      lastName: trainer.lastName || "",
      email: trainer.email || "",
      specializations: Array.isArray(trainer.specializations) ? trainer.specializations.join(', ') : "",
      hourlyRate: trainer.hourlyRate || "",
      experienceYears: trainer.experienceYears?.toString() || "",
      certifications: trainer.certifications || "",
      bio: trainer.bio || ""
    });
    setShowAddTrainerModal(true);
  };

  const handleDeleteMember = async (member: any) => {
    if (confirm(`Are you sure you want to delete member ${member.firstName} ${member.lastName}?`)) {
      try {
        const response = await apiRequest('DELETE', `/api/admin/delete-member/${member.userId}`, {});

        if (response) {
          // Refresh all related data
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['/api/admin/members'] }),
            queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] })
          ]);
          toast({
            title: "Success",
            description: "Member deleted successfully!",
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete member",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteTrainer = async (trainer: any) => {
    if (confirm(`Are you sure you want to delete trainer ${trainer.firstName} ${trainer.lastName}?`)) {
      try {
        const response = await apiRequest('DELETE', `/api/admin/delete-trainer/${trainer.userId}`, {});

        if (response) {
          // Refresh all related data
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['/api/admin/trainers'] }),
            queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] })
          ]);
          toast({
            title: "Success",
            description: "Trainer deleted successfully!",
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete trainer",
          variant: "destructive",
        });
      }
    }
  };

  // Close all member and trainer modals and reset their states
  const closeModals = () => {
    setShowAddMemberModal(false);
    setShowAddTrainerModal(false);
    setEditingMember(null);
    setEditingTrainer(null);
    setNewMember({
      firstName: "",
      lastName: "",
      email: "",
      membershipTierId: "",
      trainingType: "", // Reset trainingType
      phone: "",
      emergencyContact: "",
      fitnessGoals: ""
    });
    setNewTrainer({
      firstName: "",
      lastName: "",
      email: "",
      specializations: "",
      hourlyRate: "",
      experienceYears: "",
      certifications: "",
      bio: ""
    });
  };

  // System settings handlers
  const handleSaveGymConfiguration = (e: React.FormEvent) => {
    e.preventDefault();
    updateGymSettingsMutation.mutate(gymSettings);
  };

  const handleUpdatePricing = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert string prices back to numbers for submission
    const pricingData = Object.keys(membershipPricing).map(tierId => ({
      tierId,
      monthlyPrice: parseFloat(membershipPricing[tierId])
    }));
    updateMembershipPricingMutation.mutate({ pricing: pricingData });
  };

  // Initialize membership pricing when tiers are loaded
  React.useEffect(() => {
    if (membershipTiers && membershipTiers.length > 0) {
      const pricing = {};
      membershipTiers.forEach(tier => {
        const tierId = tier._id || tier.id;
        pricing[tierId] = tier.monthlyPrice || tier.price;
      });
      setMembershipPricing(pricing);
    }
  }, [membershipTiers]);

  // Membership Management Handlers
  const handleAddMembership = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMembership) {
      updateMembershipMutation.mutate({ id: editingMembership.id || editingMembership._id, membershipData: newMembership });
    } else {
      createMembershipMutation.mutate(newMembership);
    }
  };

  const handleEditMembership = (tier: any) => {
    setEditingMembership(tier);
    setNewMembership({
      name: tier.name || "",
      sessions: tier.sessions || 0,
      duration: tier.duration || "",
      oneOnOnePrice: tier.one_on_one_price || tier.oneOnOnePrice || 0,
      oneOnOnePerSession: tier.one_on_one_per_session || tier.oneOnOnePerSession || 0,
      twoPeoplePrice: tier.two_people_price || tier.twoPeoplePrice || 0,
      twoPeoplePerSession: tier.two_people_per_session || tier.twoPeoplePerSession || 0,
      threePeoplePrice: tier.three_people_price || tier.threePeoplePrice || 0,
      threePeoplePerSession: tier.three_people_per_session || tier.threePeoplePerSession || 0,
      features: Array.isArray(tier.features) ? tier.features.join(', ') : tier.features || "",
      description: tier.description || ""
    });
    setShowAddMembershipModal(true);
  };

  const handleDeleteMembership = async (tier: any) => {
    if (confirm(`Are you sure you want to delete membership tier "${tier.name}"?`)) {
      await deleteMembershipMutation.mutateAsync(tier.id || tier._id);
    }
  };

  const closeMemershipModal = () => {
    setShowAddMembershipModal(false);
    setEditingMembership(null);
    setNewMembership({
      name: "",
      sessions: 0,
      duration: "",
      oneOnOnePrice: 0,
      oneOnOnePerSession: 0,
      twoPeoplePrice: 0,
      twoPeoplePerSession: 0,
      threePeoplePrice: 0,
      threePeoplePerSession: 0,
      features: "",
      description: ""
    });
  };

  // Handler for changing trainer password
  const handleSubmitPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive"
      });
      return;
    }

    if (selectedTrainerForPassword) {
      changeTrainerPasswordMutation.mutate({ trainerId: selectedTrainerForPassword.userId, newPassword });
    }
  };


  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-gold border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }

  // Check if user has admin role
  if (user?.userType !== 'admin' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold text-gold mb-4">Access Denied</h1>
          <p className="text-gray-300">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const handleRecordAttendance = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAttendance.trainerId || !newAttendance.status) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const attendanceData = {
      ...newAttendance,
      date: selectedDate
    };

    recordAttendanceMutation.mutate(attendanceData);
  };

  const closeAttendanceModal = () => {
    setShowAttendanceModal(false);
    setNewAttendance({
      trainerId: "",
      status: "present",
      checkInTime: "",
      checkOutTime: "",
      notes: ""
    });
  };

  const handleQuickAttendance = async (trainerId: string, status: string) => {
    try {
      const currentTime = new Date().toTimeString().slice(0, 5);
      const attendanceData = {
        trainerId,
        status,
        date: selectedDate,
        checkInTime: status === "present" ? currentTime : "",
        checkOutTime: "",
        notes: ""
      };

      await recordAttendanceMutation.mutateAsync(attendanceData);

      // Update the attendance state to reflect the new status
      queryClient.invalidateQueries({ queryKey: [`/api/admin/attendance/${selectedDate}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/attendance-stats'] });
    } catch (error: any) {
      console.error('Error recording quick attendance:', error);
    }
  };

  const handleCheckOut = async (trainerId: string) => {
    try {
      const currentTime = new Date().toTimeString().slice(0, 5);

      // Find existing attendance record
      const existingAttendance = todayAttendance?.find(att => att.trainerId.toString() === trainerId);

      if (existingAttendance) {
        const attendanceData = {
          trainerId,
          status: "present",
          date: selectedDate,
          checkInTime: existingAttendance.checkInTime,
          checkOutTime: currentTime,
          notes: existingAttendance.notes || ""
        };

        await recordAttendanceMutation.mutateAsync(attendanceData);

        // Update the attendance state
        queryClient.invalidateQueries({ queryKey: [`/api/admin/attendance/${selectedDate}`] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/attendance-stats'] });
      }
    } catch (error: any) {
      console.error('Error recording checkout:', error);
    }
  };

  const getAttendanceStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-600 text-white">Present</Badge>;
      case "absent":
        return <Badge className="bg-red-600 text-white">Absent</Badge>;
      case "late":
        return <Badge className="bg-yellow-600 text-white">Late</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Assessment handlers
  const handleCreateAssessment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAssessment.memberId || !newAssessment.age || !newAssessment.height) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (editingAssessment) {
      updateAssessmentMutation.mutate({ id: editingAssessment._id, assessmentData: newAssessment });
    } else {
      createAssessmentMutation.mutate(newAssessment);
    }
  };

  const closeAssessmentModal = () => {
    setShowAssessmentModal(false);
    setEditingAssessment(null);
    setNewAssessment({
      memberId: "",
      dateOfBirth: "",
      age: "",
      height: "",
      bloodPressure: "",
      afterTreadmillBP: "",
      emergencyContact: "",
      bodyComposition: {
        bmi: "",
        weight: "",
        muscle: "",
        fat: "",
        saturatedFat: "",
        visceralFat: "",
        bmr: "",
        bodyAge: ""
      },
      posturalAssessment: {
        asymmetrical: false,
        headNeckAlignment: "",
        shoulderAlignment: "",
        upperBackAlignment: "",
        lowerBackAlignment: "",
        pelvicAlignment: "",
        hipKneeAlignment: "",
        ankleAlignment: "",
        spinalMobility: "",
        recommendations: {
          stretching: "",
          strengthening: ""
        }
      },
      circumferenceMeasurements: {
        neck: "",
        shoulders: "",
        chest: "",
        upperArm: "",
        forearms: "",
        wrist: "",
        waist: "",
        hip: "",
        thighs: "",
        calf: "",
        ankle: ""
      },
      advice: ""
    });
  };

  const handleShareAssessment = (assessment: any) => {
    setSelectedAssessment(assessment);
    setShowShareModal(true);
  };

  const handleEditAssessment = (assessment: any) => {
    setEditingAssessment(assessment);
    setNewAssessment({
      memberId: assessment.memberId || assessment.member_id || "",
      dateOfBirth: assessment.dateOfBirth || assessment.date_of_birth || "",
      age: assessment.age || "",
      height: assessment.height || "",
      bloodPressure: assessment.bloodPressure || assessment.bp || "",
      afterTreadmillBP: assessment.afterTreadmillBP || assessment.bp_after_treadmill || "",
      emergencyContact: assessment.emergencyContact || assessment.emergency_contact || "",
      bodyComposition: {
        bmi: assessment.bodyComposition?.bmi || assessment.bmi || "",
        weight: assessment.bodyComposition?.weight || assessment.weight || "",
        muscle: assessment.bodyComposition?.muscle || assessment.muscle || "",
        fat: assessment.bodyComposition?.fat || assessment.fat || "",
        saturatedFat: assessment.bodyComposition?.saturatedFat || assessment.saturated_fat || "",
        visceralFat: assessment.bodyComposition?.visceralFat || assessment.visceral_fat || "",
        bmr: assessment.bodyComposition?.bmr || assessment.bmr || "",
        bodyAge: assessment.bodyComposition?.bodyAge || assessment.body_age || ""
      },
      posturalAssessment: {
        asymmetrical: assessment.posturalAssessment?.asymmetrical || false,
        headNeckAlignment: assessment.posturalAssessment?.headNeckAlignment || assessment.head_neck_alignment || "",
        shoulderAlignment: assessment.posturalAssessment?.shoulderAlignment || assessment.shoulder_alignment || "",
        upperBackAlignment: assessment.posturalAssessment?.upperBackAlignment || assessment.upper_back_alignment || "",
        lowerBackAlignment: assessment.posturalAssessment?.lowerBackAlignment || assessment.lower_back_alignment || "",
        pelvicAlignment: assessment.posturalAssessment?.pelvicAlignment || assessment.pelvic_alignment || "",
        hipKneeAlignment: assessment.posturalAssessment?.hipKneeAlignment || assessment.hip_knee_alignment || "",
        ankleAlignment: assessment.posturalAssessment?.ankleAlignment || assessment.ankle_alignment || "",
        spinalMobility: assessment.posturalAssessment?.spinalMobility || assessment.spinal_mobility || "",
        recommendations: {
          stretching: assessment.posturalAssessment?.recommendations?.stretching || assessment.recommendations || "",
          strengthening: assessment.posturalAssessment?.recommendations?.strengthening || ""
        }
      },
      circumferenceMeasurements: {
        neck: assessment.circumferenceMeasurements?.neck || "",
        shoulders: assessment.circumferenceMeasurements?.shoulders || "",
        chest: assessment.circumferenceMeasurements?.chest || "",
        upperArm: assessment.circumferenceMeasurements?.upperArm || "",
        forearms: assessment.circumferenceMeasurements?.forearms || "",
        wrist: assessment.circumferenceMeasurements?.wrist || "",
        waist: assessment.circumferenceMeasurements?.waist || "",
        hip: assessment.circumferenceMeasurements?.hip || "",
        thighs: assessment.circumferenceMeasurements?.thighs || "",
        calf: assessment.circumferenceMeasurements?.calf || "",
        ankle: assessment.circumferenceMeasurements?.ankle || ""
      },
      advice: assessment.advice || ""
    });
    setShowAssessmentModal(true);
  };

  const handleConvertInquiry = (inquiry: any) => {
    setSelectedInquiry(inquiry);
    // Reset member form data for conversion
    setNewMember({
      firstName: inquiry.firstName || "",
      lastName: inquiry.lastName || "",
      email: inquiry.email || "",
      phone: inquiry.phone || "",
      membershipTierId: membershipTiers?.[0]?._id || membershipTiers?.[0]?.id || "",
      emergencyContact: inquiry.phone || inquiry.email || "",
      fitnessGoals: inquiry.interest || "General fitness improvement",
      trainingType: "one_on_one"
    });
    setShowConvertModal(true);
  };

  const handleDeleteInquiry = async (inquiryId: string) => {
    try {
      await deleteInquiryMutation.mutateAsync(inquiryId);
    } catch (error: any) {
      console.error('Error deleting inquiry:', error);
    }
  };

  const handleSelectAssessment = (assessmentId: string, checked: boolean) => {
    const newSelected = new Set(selectedAssessmentIds);
    if (checked) {
      newSelected.add(assessmentId);
    } else {
      newSelected.delete(assessmentId);
    }
    setSelectedAssessmentIds(newSelected);
  };

  const handleSelectAllAssessments = (checked: boolean) => {
    if (checked && bodyAssessments) {
      const allIds = bodyAssessments.map((assessment: any) => assessment._id || assessment.id);
      setSelectedAssessmentIds(new Set(allIds));
    } else {
      setSelectedAssessmentIds(new Set());
    }
  };

  const handleSubmitConversion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry) return;

    const memberData = {
      membershipTierId: newMember.membershipTierId || (membershipTiers?.[0]?._id || membershipTiers?.[0]?.id) || "",
      trainingType: newMember.trainingType || 'one_on_one'
    };

    convertInquiryMutation.mutate({
      inquiryId: selectedInquiry._id,
      memberData,
      assessmentData: newAssessment
    });
  };

  const exportToExcel = () => {
    if (!Array.isArray(bodyAssessments) || bodyAssessments.length === 0) {
      toast({
        title: "No Data",
        description: "No assessments available to export",
        variant: "destructive"
      });
      return;
    }

    // Filter assessments based on selection
    const assessmentsToExport = selectedAssessmentIds.size > 0
      ? bodyAssessments.filter((assessment: any) => selectedAssessmentIds.has(assessment._id || assessment.id))
      : bodyAssessments;

    if (assessmentsToExport.length === 0) {
      toast({
        title: "No Data Selected",
        description: "Please select assessments to export",
        variant: "destructive"
      });
      return;
    }

    // Create CSV content
    const headers = [
      "Member Name", "Date of Birth", "Age", "Height", "Blood Pressure", "Emergency Contact",
      "BMI", "Weight", "Muscle", "Fat", "Saturated Fat", "Visceral Fat", "BMR", "Body Age",
      "Head/Neck Alignment", "Shoulder Alignment", "Upper Back", "Lower Back", "Pelvic", "Hip/Knee", "Ankle",
      "Spinal Mobility", "Stretching Recommendations", "Strengthening Recommendations",
      "Neck", "Shoulders", "Chest", "Upper Arm", "Forearms", "Wrist", "Waist", "Hip", "Thighs", "Calf", "Ankle",
      "Advice", "Created Date"
    ];

    const csvContent = [
      headers.join(","),
      ...assessmentsToExport.map((assessment: any) => [
        assessment.memberName || assessment.client_name || "",
        assessment.dateOfBirth || assessment.date_of_birth || "",
        assessment.age || "",
        assessment.height || "",
        assessment.bloodPressure || assessment.bp || "",
        assessment.emergencyContact || assessment.emergency_contact || "",
        assessment.bodyComposition?.bmi || assessment.bmi || "",
        assessment.bodyComposition?.weight || assessment.weight || "",
        assessment.bodyComposition?.muscle || assessment.muscle || "",
        assessment.bodyComposition?.fat || assessment.fat || "",
        assessment.bodyComposition?.saturatedFat || assessment.saturated_fat || "",
        assessment.bodyComposition?.visceralFat || assessment.visceral_fat || "",
        assessment.bodyComposition?.bmr || assessment.bmr || "",
        assessment.bodyComposition?.bodyAge || assessment.body_age || "",
        assessment.posturalAssessment?.headNeckAlignment || assessment.head_neck_alignment || "",
        assessment.posturalAssessment?.shoulderAlignment || assessment.shoulder_alignment || "",
        assessment.posturalAssessment?.upperBackAlignment || assessment.upper_back_alignment || "",
        assessment.posturalAssessment?.lowerBackAlignment || assessment.lower_back_alignment || "",
        assessment.posturalAssessment?.pelvicAlignment || assessment.pelvic_alignment || "",
        assessment.posturalAssessment?.hipKneeAlignment || assessment.hip_knee_alignment || "",
        assessment.posturalAssessment?.ankleAlignment || assessment.ankle_alignment || "",
        assessment.posturalAssessment?.spinalMobility || assessment.spinal_mobility || "",
        assessment.posturalAssessment?.recommendations?.stretching || assessment.recommendations || "",
        assessment.posturalAssessment?.recommendations?.strengthening || "",
        assessment.circumferenceMeasurements?.neck || "",
        assessment.circumferenceMeasurements?.shoulders || "",
        assessment.circumferenceMeasurements?.chest || "",
        assessment.circumferenceMeasurements?.upperArm || "",
        assessment.circumferenceMeasurements?.forearms || "",
        assessment.circumferenceMeasurements?.wrist || "",
        assessment.circumferenceMeasurements?.waist || "",
        assessment.circumferenceMeasurements?.hip || "",
        assessment.circumferenceMeasurements?.thighs || "",
        assessment.circumferenceMeasurements?.calf || "",
        assessment.circumferenceMeasurements?.ankle || "",
        `"${assessment.advice || ""}"`,
        new Date(assessment.createdAt || assessment.created_at).toLocaleDateString()
      ].join(","))
    ].join("\n");

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `body_assessments_${selectedAssessmentIds.size > 0 ? 'selected_' : ''}${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: `${assessmentsToExport.length} body assessment(s) exported to CSV file`
    });
  };

  // Handler for submitting trainer assignment
  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMemberForAssignment || !selectedTrainerForAssignment) {
      toast({
        title: "Error",
        description: "Please select both a member and a trainer",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await apiRequest('POST', '/api/admin/assign-trainer', {
        memberId: selectedMemberForAssignment,
        trainerId: selectedTrainerForAssignment,
        assignedDate: assignmentData.assignedDate,
        notes: assignmentData.notes
      });

      toast({
        title: "Success",
        description: "Trainer assigned to member successfully",
      });

      // Reset form states
      setSelectedMemberForAssignment('');
      setSelectedTrainerForAssignment('');
      setAssignmentData({
        trainerId: "",
        assignedDate: new Date().toISOString().split('T')[0],
        notes: ""
      });

      // Refresh assignments
      refetchTrainerAssignments();
      setShowAssignModal(false); // Close the modal
    } catch (error: any) {
      console.error('Error assigning trainer:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign trainer to member",
        variant: "destructive",
      });
    }
  };

  if (membersLoading || trainersLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-gold border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-wider text-gold mb-2">ADMIN DASHBOARD</h1>
          <p className="text-gray-400">Manage your fitness center operations</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Members</p>
                  <p className="text-2xl font-bold text-gold">{stats?.totalMembers || 0}</p>
                </div>
                <Users className="h-8 w-8 text-gold" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Trainers</p>
                  <p className="text-2xl font-bold text-green-400">{stats?.totalTrainers || 0}</p>
                </div>
                <Activity className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-blue-400">${stats?.monthlyRevenue?.toLocaleString() || 0}</p>
                </div>
                <BarChart className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Training Sessions</p>
                  <p className="text-2xl font-bold text-purple-400">{stats?.totalSessions || 0}</p>
                </div>
                <Settings className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-gray-900 border-gray-800">
            <TabsTrigger value="members" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              <Users className="h-4 w-4 mr-2" />
              MANAGE MEMBERS
            </TabsTrigger>
            <TabsTrigger value="sessions" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              <Calendar className="h-4 w-4 mr-2" />
              SESSIONS
            </TabsTrigger>
            <TabsTrigger value="inquiries" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              <Phone className="h-4 w-4 mr-2" />
              INQUIRIES
            </TabsTrigger>
            <TabsTrigger value="assessments" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              <Target className="h-4 w-4 mr-2" />
              BODY ASSESSMENTS
            </TabsTrigger>
            <TabsTrigger value="attendance" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              <Calendar className="h-4 w-4 mr-2" />
              ATTENDANCE
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              <BarChart className="h-4 w-4 mr-2" />
              VIEW REPORTS
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              <Settings className="h-4 w-4 mr-2" />
              SYSTEM SETTINGS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gold">Member Management</h2>
              <div className="space-x-4">
                <Dialog open={showAddMemberModal} onOpenChange={(open) => {
                  if (!open) closeModals();
                }}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-gold text-black hover:bg-white"
                      onClick={() => setShowAddMemberModal(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-gold">
                        {editingMember ? 'Edit Member' : 'Add New Member'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddMember} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            name="firstName"
                            className="bg-black border-gray-700 text-white"
                            required
                            value={newMember.firstName}
                            onChange={(e) => setNewMember({...newMember, firstName: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            name="lastName"
                            className="bg-black border-gray-700 text-white"
                            required
                            value={newMember.lastName}
                            onChange={(e) => setNewMember({...newMember, lastName: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          name="email"
                          type="email"
                          className="bg-black border-gray-700 text-white"
                          required
                          value={newMember.email}
                          onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          name="phone"
                          className="bg-black border-gray-700 text-white"
                          value={newMember.phone}
                          onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="membershipTierId">Membership Type</Label>
                        <Select
                          name="membershipTierId"
                          required
                          value={newMember.membershipTierId}
                          onValueChange={(value) => setNewMember({...newMember, membershipTierId: value})}
                        >
                          <SelectTrigger className="bg-black border-gray-700 text-white focus:ring-gold">
                            <SelectValue placeholder="Select membership type" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-gray-800 text-white max-h-60 overflow-y-auto">
                            {membershipTiers && membershipTiers.length > 0 ? membershipTiers.map((tier: any) => (
                              <SelectItem key={`member-tier-${tier._id || tier.id}`} value={(tier._id || tier.id).toString()} className="focus:bg-gold focus:text-black hover:bg-gold hover:text-black">
                                {tier.name || `${tier.sessions} Sessions`}
                              </SelectItem>
                            )) : (
                              <SelectItem value="no-tiers" disabled className="text-gray-500">
                                No membership tiers available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      {/* Added Training Type Dropdown */}
                      <div>
                        <Label htmlFor="trainingType">Training Type</Label>
                        <Select
                          name="trainingType"
                          value={newMember.trainingType}
                          onValueChange={(value) => setNewMember({...newMember, trainingType: value})}
                        >
                          <SelectTrigger className="bg-black border-gray-700 text-white focus:ring-gold">
                            <SelectValue placeholder="Select training type" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-gray-800 text-white">
                            <SelectItem value="one_on_one" className="focus:bg-gold focus:text-black">
                              1 on 1 Training
                            </SelectItem>
                            <SelectItem value="two_people" className="focus:bg-gold focus:text-black">
                              2 People Training
                            </SelectItem>
                            <SelectItem value="three_people" className="focus:bg-gold focus:text-black">
                              3 People Training
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="emergencyContact">Emergency Contact</Label>
                        <Input
                          name="emergencyContact"
                          className="bg-black border-gray-700 text-white"
                          value={newMember.emergencyContact}
                          onChange={(e) => setNewMember({...newMember, emergencyContact: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="fitnessGoals">Fitness Goals</Label>
                        <Textarea
                          name="fitnessGoals"
                          placeholder="Member's fitness goals..."
                          className="bg-black border-gray-700 text-white"
                          value={newMember.fitnessGoals}
                          onChange={(e) => setNewMember({...newMember, fitnessGoals: e.target.value})}
                        />
                      </div>
                      <Button type="submit" className="w-full bg-gold text-black hover:bg-white" disabled={createMemberMutation.isPending || updateMemberMutation.isPending}>
                        {editingMember ? (createMemberMutation.isPending || updateMemberMutation.isPending ? "Updating..." : "Update Member") : (createMemberMutation.isPending ? "Creating..." : "Create Member")}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={showAddTrainerModal} onOpenChange={(open) => {
                  if (!open) closeModals();
                }}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-gold text-gold hover:bg-gold hover:text-black"
                      onClick={() => setShowAddTrainerModal(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Trainer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-gold">
                        {editingTrainer ? 'Edit Trainer' : 'Add New Trainer'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddTrainer} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            name="firstName"
                            required
                            value={newTrainer.firstName}
                            onChange={(e) => setNewTrainer({...newTrainer, firstName: e.target.value})}
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            name="lastName"
                            required
                            value={newTrainer.lastName}
                            onChange={(e) => setNewTrainer({...newTrainer, lastName: e.target.value})}
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          name="email"
                          type="email"
                          required
                          value={newTrainer.email}
                          onChange={(e) => setNewTrainer({...newTrainer, email: e.target.value})}
                          className="bg-black border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="specializations">Specializations</Label>
                        <Input
                          name="specializations"
                          placeholder="e.g., Strength Training, Yoga, HIIT"
                          required
                          value={newTrainer.specializations}
                          onChange={(e) => setNewTrainer({...newTrainer, specializations: e.target.value})}
                          className="bg-black border-gray-700 text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                          <Input
                            name="hourlyRate"
                            type="number"
                            step="0.01"
                            value={newTrainer.hourlyRate}
                            onChange={(e) => setNewTrainer({...newTrainer, hourlyRate: e.target.value})}
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="experienceYears">Experience (Years)</Label>
                          <Input
                            name="experienceYears"
                            type="number"
                            value={newTrainer.experienceYears}
                            onChange={(e) => setNewTrainer({...newTrainer, experienceYears: e.target.value})}
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="certifications">Certifications</Label>
                        <Textarea
                          name="certifications"
                          placeholder="Professional certifications..."
                          value={newTrainer.certifications}
                          onChange={(e) => setNewTrainer({...newTrainer, certifications: e.target.value})}
                          className="bg-black border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          name="bio"
                          placeholder="Professional bio..."
                          value={newTrainer.bio}
                          onChange={(e) => setNewTrainer({...newTrainer, bio: e.target.value})}
                          className="bg-black border-gray-700 text-white"
                        />
                      </div>
                      <Button type="submit" className="w-full bg-gold text-black hover:bg-white" disabled={createTrainerMutation.isPending || updateTrainerMutation.isPending}>
                        {editingTrainer ? (createTrainerMutation.isPending || updateTrainerMutation.isPending ? "Updating..." : "Update Trainer") : (createTrainerMutation.isPending ? "Creating..." : "Add Trainer")}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
                {/* Add Trainer Assignment Button */}
                <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-gold text-gold hover:bg-gold hover:text-black"
                      onClick={() => {
                        setShowAssignModal(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Assign Trainer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-800 text-white">
                    <DialogHeader>
                      <DialogTitle className="text-gold">
                        Assign Trainer to Member
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitAssignment} className="space-y-4">
                      <div>
                        <Label htmlFor="memberId">Select Member</Label>
                        <Select
                          required
                          value={selectedMemberForAssignment}
                          onValueChange={setSelectedMemberForAssignment}
                        >
                          <SelectTrigger className="bg-black border-gray-700 text-white">
                            <SelectValue placeholder="Select a member" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-gray-800 text-white">
                            {members && members.length > 0 ? (
                              members.map((member) => (
                                <SelectItem key={member.id} value={member.id.toString()}>
                                  {member.first_name} {member.last_name} ({member.email})
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="" disabled>No members available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="trainerId">Select Trainer</Label>
                        <Select
                          required
                          value={selectedTrainerForAssignment}
                          onValueChange={setSelectedTrainerForAssignment}
                        >
                          <SelectTrigger className="bg-black border-gray-700 text-white">
                            <SelectValue placeholder="Select a trainer" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-gray-800 text-white">
                            {trainers?.map((trainer: any) => (
                              <SelectItem key={`assign-trainer-${trainer.userId}`} value={trainer.userId} className="focus:bg-gold focus:text-black">
                                {trainer.firstName} {trainer.lastName} - {trainer.specializations?.join(', ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="assignedDate">Assignment Date</Label>
                        <Input
                          type="date"
                          value={assignmentData.assignedDate}
                          onChange={(e) => setAssignmentData({...assignmentData, assignedDate: e.target.value})}
                          className="bg-black border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          value={assignmentData.notes}
                          onChange={(e) => setAssignmentData({...assignmentData, notes: e.target.value})}
                          placeholder="Additional notes about this assignment..."
                          className="bg-black border-gray-700 text-white"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-gold text-black hover:bg-white"
                        disabled={assignTrainerMutation.isPending}
                      >
                        {assignTrainerMutation.isPending ? "Assigning..." : "Assign Trainer"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                {/* Button to trigger password change modal */}
                <Button
                  variant="outline"
                  className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
                  onClick={() => {
                    // For demonstration, we'll just open the modal.
                    // In a real app, you'd select a trainer first.
                    toast({ title: "Select a trainer to change their password", description: "You can do this from the 'MANAGE MEMBERS' tab." });
                  }}
                >
                  <Key className="h-4 w-4 mr-2" />
                  Change Trainer Password
                </Button>
              </div>
            </div>

            {/* Trainers Table */}
            <Card className="bg-gray-900 border-gray-800 mb-6">
              <CardHeader>
                <CardTitle className="text-gold">Current Trainers ({trainers?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-gray-400">Name</TableHead>
                      <TableHead className="text-gray-400">Email</TableHead>
                      <TableHead className="text-gray-400">Specializations</TableHead>
                      <TableHead className="text-gray-400">Experience</TableHead>
                      <TableHead className="text-gray-400">Hourly Rate</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trainers?.map((trainer: any) => (
                      <TableRow key={trainer.userId} className="border-gray-800">
                        <TableCell className="text-white">{trainer.firstName} {trainer.lastName}</TableCell>
                        <TableCell className="text-gray-400">{trainer.email}</TableCell>
                        <TableCell className="text-gray-400">
                          {Array.isArray(trainer.specializations)
                            ? trainer.specializations.slice(0, 2).join(', ')
                            : 'N/A'
                          }
                          {Array.isArray(trainer.specializations) && trainer.specializations.length > 2 && '...'}
                        </TableCell>
                        <TableCell className="text-gray-400">{trainer.experienceYears} years</TableCell>
                        <TableCell className="text-gray-400">${trainer.hourlyRate}/hr</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-gold hover:bg-gold hover:text-black"
                              onClick={() => handleEditTrainer(trainer)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-400 hover:bg-red-400 hover:text-white"
                              onClick={() => handleDeleteTrainer(trainer)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            {/* Button to change password */}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-yellow-500 hover:bg-yellow-500 hover:text-black"
                              onClick={() => {
                                setSelectedTrainerForPassword(trainer);
                                setShowChangePasswordModal(true);
                              }}
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!trainers || trainers.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-400">
                          No trainers found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Members Table */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-gold">Current Members ({members?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-gray-400">Name</TableHead>
                      <TableHead className="text-gray-400">Email</TableHead>
                      <TableHead className="text-gray-400">Phone</TableHead>
                      <TableHead className="text-gray-400">Membership</TableHead>
                      <TableHead className="text-gray-400">Training Type</TableHead>
                      <TableHead className="text-gray-400">Plan Type</TableHead>
                      <TableHead className="text-gray-400">Sessions</TableHead>
                      <TableHead className="text-gray-400">Price Paid</TableHead>
                      <TableHead className="text-gray-400">Join Date</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members?.map((member: any, index: number) => {
                        const assignment = trainerAssignments
                          ? trainerAssignments.find((ta: any) => ta.member_id && ta.member_id.toString() === member.id.toString())
                          : null;
                      const assignedTrainerName = assignment ? assignment.trainer_name : 'Not Assigned';

                      return (
                        <TableRow key={member.id || index} className="border-gray-800">
                          <TableCell className="text-white">{member.first_name} {member.last_name}</TableCell>
                          <TableCell className="text-gray-400">{member.email}</TableCell>
                          <TableCell className="text-gray-400">{member.phone || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-gold text-gold">
                              {member.membership_tier_name || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white">
                          {(member.subscription_training_type || member.training_type) ? (
                            (member.subscription_training_type || member.training_type) === 'one_on_one' ? 'One-on-One' :
                            (member.subscription_training_type || member.training_type) === 'two_people' ? '2 People' :
                            (member.subscription_training_type || member.training_type) === 'three_people' ? '3 People' :
                            (member.subscription_training_type || member.training_type)
                          ) : 'Not Set'}
                        </TableCell>
                          <TableCell className="text-white">
                          {member.plan_type || 'No Plan'}</TableCell>
                          <TableCell className="text-white">
                            {member.sessions_used !== undefined && member.sessions_total !== undefined
                              ? `${member.sessions_used || 0}/${member.sessions_total || 0}`
                              : member.membership_sessions || 'N/A'}
                          </TableCell>
                          <TableCell className="text-green-400">
                            ₹{member.price_paid ? member.price_paid.toLocaleString() : '0'}
                          </TableCell>
                          <TableCell className="text-gray-400">
                            {member.subscription_start_date ? new Date(member.subscription_start_date).toLocaleDateString() :
                             member.created_at ? new Date(member.created_at).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-gold hover:bg-gold hover:text-black"
                                onClick={() => handleEditMember(member)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-400 hover:bg-red-400 hover:text-white"
                                onClick={() => handleDeleteMember(member)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              {/* Button to assign trainer to this member */}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-blue-500 hover:text-blue-700"
                                onClick={() => {
                                  setSelectedMemberForAssignment(member.id.toString());
                                  const assignment = Array.isArray(trainerAssignments) ? trainerAssignments.find((ta: any) => ta.member_id.toString() === member.id.toString()) : null;
                                  setAssignmentData({
                                    trainerId: assignment ? assignment.trainer_id : "",
                                    assignedDate: assignment ? new Date(assignment.assigned_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                                    notes: assignment ? assignment.notes : ""
                                  });
                                  setSelectedTrainerForAssignment(assignment ? assignment.trainer_id : ""); // Pre-select if assigned
                                  setShowAssignModal(true);
                                }}
                              >
                                {assignment ? <Edit className="h-4 w-4" /> : <Target className="h-4 w-4" />}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Trainer Assignments Table */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-gold">Current Trainer Assignments ({trainerAssignments?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-gray-400">Member</TableHead>
                      <TableHead className="text-gray-400">Trainer</TableHead>
                      <TableHead className="text-gray-400">Assigned Date</TableHead>
                      <TableHead className="text-gray-400">Notes</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trainerAssignments?.map((assignment: any) => (
                      <TableRow key={`${assignment.member_id}-${assignment.trainer_id}`} className="border-gray-800">
                        <TableCell className="text-white">{assignment.member_name}</TableCell>
                        <TableCell className="text-white">{assignment.trainer_name}</TableCell>
                        <TableCell className="text-gray-400">
                          {new Date(assignment.assigned_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-gray-400">{assignment.notes || 'N/A'}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:bg-red-400 hover:text-white"
                            onClick={() => handleRemoveTrainer(assignment.member_id, assignment.trainer_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!trainerAssignments || trainerAssignments.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-400">
                          No trainer assignments found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Assign Trainer Modal is now outside the members table */}

          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gold">Training Sessions Management</h2>
              <Dialog open={showScheduleSessionModal} onOpenChange={setShowScheduleSessionModal}>
                <DialogTrigger asChild>
                  <Button className="bg-gold text-black hover:bg-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Session
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-800 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-gold">Schedule New Training Session</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleScheduleSession} className="space-y-4">
                    <div>
                      <Label htmlFor="memberId">Select Member</Label>
                      <Select
                        value={newSessionData.memberId}
                        onValueChange={(value) => setNewSessionData({...newSessionData, memberId: value})}
                        required
                      >
                        <SelectTrigger className="bg-black border-gray-700 text-white">
                          <SelectValue placeholder="Select a member" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-800 text-white">
                          {members?.map((member: any) => (
                            <SelectItem key={member.userId} value={member.userId}>
                              {member.firstName} {member.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="trainerId">Select Trainer</Label>
                      <Select
                        value={newSessionData.trainerId}
                        onValueChange={(value) => setNewSessionData({...newSessionData, trainerId: value})}
                        required
                      >
                        <SelectTrigger className="bg-black border-gray-700 text-white">
                          <SelectValue placeholder="Select a trainer" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-800 text-white">
                          {trainers?.map((trainer: any) => (
                            <SelectItem key={trainer.userId} value={trainer.userId}>
                              {trainer.firstName} {trainer.lastName} - {trainer.specializations?.join(', ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="sessionType">Session Type</Label>
                      <Select
                        value={newSessionData.sessionType}
                        onValueChange={(value) => setNewSessionData({...newSessionData, sessionType: value})}
                        required
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
                          value={newSessionData.date}
                          onChange={(e) => setNewSessionData({...newSessionData, date: e.target.value})}
                          className="bg-black border-gray-700 text-white"
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="time">Time</Label>
                        <Input
                          id="time"
                          type="time"
                          value={newSessionData.time}
                          onChange={(e) => setNewSessionData({...newSessionData, time: e.target.value})}
                          className="bg-black border-gray-700 text-white"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Select
                        value={newSessionData.duration}
                        onValueChange={(value) => setNewSessionData({...newSessionData, duration: value})}
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
                        value={newSessionData.notes}
                        onChange={(e) => setNewSessionData({...newSessionData, notes: e.target.value})}
                        className="bg-black border-gray-700 text-white"
                        placeholder="Add any special notes for this session..."
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gold text-black hover:bg-white"
                      disabled={scheduleSessionMutation.isPending}
                    >
                      {scheduleSessionMutation.isPending ? "Scheduling..." : "Schedule Session"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* All Sessions Table */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-gold">All Training Sessions ({allSessions?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-gray-400">Member</TableHead>
                      <TableHead className="text-gray-400">Trainer</TableHead>
                      <TableHead className="text-gray-400">Session Type</TableHead>
                      <TableHead className="text-gray-400">Date</TableHead>
                      <TableHead className="text-gray-400">Time</TableHead>
                      <TableHead className="text-gray-400">Duration</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allSessions?.map((session: any) => (
                      <TableRow key={session.id} className="border-gray-800">
                        <TableCell className="text-white">{session.member_name || session.memberName}</TableCell>
                        <TableCell className="text-white">{session.trainer_name || session.trainerName}</TableCell>
                        <TableCell className="text-white">{session.session_type || session.sessionType}</TableCell>
                        <TableCell className="text-gray-400">
                          {new Date(session.scheduled_date || session.scheduledDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-gray-400">{session.scheduled_time || session.scheduledTime}</TableCell>
                        <TableCell className="text-gray-400">{session.duration} min</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-gold text-gold">
                            {session.status || 'Scheduled'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-gold hover:bg-gold hover:text-black"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-400 hover:bg-red-400 hover:text-white"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!allSessions || allSessions.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-gray-400">
                          No training sessions scheduled
                        </TableCell>
                      </TableRow>
                    )}
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
            <Dialog open={showConvertModal} onOpenChange={(open) => {
              setShowConvertModal(open);
              if (!open) {
                // Reset form when modal closes
                setNewMember({
                  firstName: "",
                  lastName: "",
                  email: "",
                  membershipTierId: "",
                  trainingType: "one_on_one",
                  phone: "",
                  emergencyContact: "",
                  fitnessGoals: ""
                });
                setSelectedInquiry(null);
              }
            }}>
              <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-gold">
                    Convert Inquiry to Member - {selectedInquiry?.firstName} {selectedInquiry?.lastName}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitConversion} className="space-y-6">
                  {/* Basic Information Display */}
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

                  {/* Membership Selection */}
                  <div className="space-y-4 p-4 bg-black rounded-lg">
                    <h3 className="text-lg font-semibold text-gold">Membership Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="membershipTierId">Membership Type</Label>
                        <Select
                          name="membershipTierId"
                          value={newMember.membershipTierId}
                          onValueChange={(value) => setNewMember({...newMember, membershipTierId: value})}
                        >
                          <SelectTrigger className="bg-black border-gray-700 text-white focus:ring-gold">
                            <SelectValue placeholder="Select membership type" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-gray-800 text-white max-h-60 overflow-y-auto">
                            {membershipTiers && membershipTiers.length > 0 ? membershipTiers.map((tier: any) => (
                              <SelectItem key={`convert-tier-${tier._id || tier.id}`} value={(tier._id || tier.id).toString()} className="focus:bg-gold focus:text-black hover:bg-gold hover:text-black">
                                {tier.name || `${tier.sessions} Sessions`}
                              </SelectItem>
                            )) : (
                              <SelectItem value="no-tiers" disabled className="text-gray-500">
                                No membership tiers available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="trainingType">Training Type</Label>
                        <Select
                          name="trainingType"
                          value={newMember.trainingType}
                          onValueChange={(value) => setNewMember({...newMember, trainingType: value})}
                        >
                          <SelectTrigger className="bg-black border-gray-700 text-white focus:ring-gold">
                            <SelectValue placeholder="Select training type" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-gray-800 text-white">
                            <SelectItem value="one_on_one" className="focus:bg-gold focus:text-black">
                              1 on 1 Training
                            </SelectItem>
                            <SelectItem value="two_people" className="focus:bg-gold focus:text-black">
                              2 People Training
                            </SelectItem>
                            <SelectItem value="three_people" className="focus:bg-gold focus:text-black">
                              3 People Training
                            </SelectItem>
                          </SelectContent>
                        </Select>
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
                            value={newAssessment.dateOfBirth}
                            onChange={(e) => setNewAssessment({...newAssessment, dateOfBirth: e.target.value})}
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="age">Age</Label>
                          <Input
                            type="number"
                            value={newAssessment.age}
                            onChange={(e) => setNewAssessment({...newAssessment, age: e.target.value})}
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="height">Height (cm)</Label>
                          <Input
                            type="number"
                            value={newAssessment.height}
                            onChange={(e) => setNewAssessment({...newAssessment, height: e.target.value})}
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="bloodPressure">Blood Pressure</Label>
                          <Input
                            placeholder="e.g., 124/84"
                            value={newAssessment.bloodPressure}
                            onChange={(e) => setNewAssessment({...newAssessment, bloodPressure: e.target.value})}
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="afterTreadmillBP">After Treadmill Test</Label>
                          <Input
                            placeholder="e.g., 152/92"
                            value={newAssessment.afterTreadmillBP}
                            onChange={(e) => setNewAssessment({...newAssessment, afterTreadmillBP: e.target.value})}
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="emergencyContact">Emergency Contact</Label>
                          <Input
                            value={newAssessment.emergencyContact}
                            onChange={(e) => setNewAssessment({...newAssessment, emergencyContact: e.target.value})}
                            className="bg-black border-gray-700 text-white"
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
                            value={newAssessment.bodyComposition.bmi}
                            onChange={(e) => setNewAssessment({...newAssessment, bodyComposition: {...newAssessment.bodyComposition, bmi: e.target.value}})}
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="weight">Weight (kg)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={newAssessment.bodyComposition.weight}
                            onChange={(e) => setNewAssessment({...newAssessment, bodyComposition: {...newAssessment.bodyComposition, weight: e.target.value}})}
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="muscle">Muscle (%)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={newAssessment.bodyComposition.muscle}
                            onChange={(e) => setNewAssessment({...newAssessment, bodyComposition: {...newAssessment.bodyComposition, muscle: e.target.value}})}
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="fat">Fat (%)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={newAssessment.bodyComposition.fat}
                            onChange={(e) => setNewAssessment({...newAssessment, bodyComposition: {...newAssessment.bodyComposition, fat: e.target.value}})}
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="saturatedFat">Saturated Fat (%)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={newAssessment.bodyComposition.saturatedFat}
                            onChange={(e) => setNewAssessment({...newAssessment, bodyComposition: {...newAssessment.bodyComposition, saturatedFat: e.target.value}})}
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="visceralFat">Visceral Fat</Label>
                          <Input
                            type="number"
                            value={newAssessment.bodyComposition.visceralFat}
                            onChange={(e) => setNewAssessment({...newAssessment, bodyComposition: {...newAssessment.bodyComposition, visceralFat: e.target.value}})}
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="bmr">BMR</Label>
                          <Input
                            type="number"
                            value={newAssessment.bodyComposition.bmr}
                            onChange={(e) => setNewAssessment({...newAssessment, bodyComposition: {...newAssessment.bodyComposition, bmr: e.target.value}})}
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="bodyAge">Body Age</Label>
                          <Input
                            type="number"
                            value={newAssessment.bodyComposition.bodyAge}
                            onChange={(e) => setNewAssessment({...newAssessment, bodyComposition: {...newAssessment.bodyComposition, bodyAge: e.target.value}})}
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
                            checked={newAssessment.posturalAssessment.asymmetrical}
                            onChange={(e) => setNewAssessment({...newAssessment, posturalAssessment: {...newAssessment.posturalAssessment, asymmetrical: e.target.checked}})}
                            className="rounded"
                          />
                          <span>Asymmetrical</span>
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="headNeckAlignment">Head and Neck Alignment</Label>
                          <Input
                            value={newAssessment.posturalAssessment.headNeckAlignment}
                            onChange={(e) => setNewAssessment({...newAssessment, posturalAssessment: {...newAssessment.posturalAssessment, headNeckAlignment: e.target.value}})}
                            className="bg-black border-gray-700 text-white"
                            placeholder="e.g., neutral"
                          />
                        </div>
                        <div>
                          <Label htmlFor="shoulderAlignment">Shoulder Alignment</Label>
                          <Input
                            value={newAssessment.posturalAssessment.shoulderAlignment}
                            onChange={(e) => setNewAssessment({...newAssessment, posturalAssessment: {...newAssessment.posturalAssessment, shoulderAlignment: e.target.value}})}
                            className="bg-black border-gray-700 text-white"
                            placeholder="e.g., rounded shoulder"
                          />
                        </div>
                        <div>
                          <Label htmlFor="upperBackAlignment">Upper Back Alignment</Label>
                          <Input
                            value={newAssessment.posturalAssessment.upperBackAlignment}
                            onChange={(e) => setNewAssessment({...newAssessment, posturalAssessment: {...newAssessment.posturalAssessment, upperBackAlignment: e.target.value}})}
                            className="bg-black border-gray-700 text-white"
                            placeholder="e.g., kyphotic curve"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lowerBackAlignment">Lower Back Alignment</Label>
                          <Input
                            value={newAssessment.posturalAssessment.lowerBackAlignment}
                            onChange={(e) => setNewAssessment({...newAssessment, posturalAssessment: {...newAssessment.posturalAssessment, lowerBackAlignment: e.target.value}})}
                            className="bg-black border-gray-700 text-white"
                            placeholder="e.g., neutral"
                          />
                        </div>
                        <div>
                          <Label htmlFor="pelvicAlignment">Pelvic Alignment</Label>
                          <Input
                            value={newAssessment.posturalAssessment.pelvicAlignment}
                            onChange={(e) => setNewAssessment({...newAssessment, posturalAssessment: {...newAssessment.posturalAssessment, pelvicAlignment: e.target.value}})}
                            className="bg-black border-gray-700 text-white"
                            placeholder="e.g., neutral"
                          />
                        </div>
                        <div>
                          <Label htmlFor="hipKneeAlignment">Hip and Knee Alignment</Label>
                          <Input
                            value={newAssessment.posturalAssessment.hipKneeAlignment}
                            onChange={(e) => setNewAssessment({...newAssessment, posturalAssessment: {...newAssessment.posturalAssessment, hipKneeAlignment: e.target.value}})}
                            className="bg-black border-gray-700 text-white"
                            placeholder="e.g., neutral"
                          />
                        </div>
                        <div>
                          <Label htmlFor="ankleAlignment">Ankle Alignment</Label>
                          <Input
                            value={newAssessment.posturalAssessment.ankleAlignment}
                            onChange={(e) => setNewAssessment({...newAssessment, posturalAssessment: {...newAssessment.posturalAssessment, ankleAlignment: e.target.value}})}
                            className="bg-black border-gray-700 text-white"
                            placeholder="e.g., neutral"
                          />
                        </div>
                        <div>
                          <Label htmlFor="spinalMobility">Spinal Mobility</Label>
                          <Input
                            value={newAssessment.posturalAssessment.spinalMobility}
                            onChange={(e) => setNewAssessment({...newAssessment, posturalAssessment: {...newAssessment.posturalAssessment, spinalMobility: e.target.value}})}
                            className="bg-black border-gray-700 text-white"
                            placeholder="e.g., decreased (spinal rotation, side bending, forward flexion)"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="stretching">Stretching Recommendations</Label>
                          <Textarea
                            value={newAssessment.posturalAssessment.recommendations.stretching}
                            onChange={(e) => setNewAssessment({...newAssessment, posturalAssessment: {...newAssessment.posturalAssessment, recommendations: {...newAssessment.posturalAssessment.recommendations, stretching: e.target.value}}})}
                            className="bg-black border-gray-700 text-white"
                            placeholder="e.g., hamstring, glutes maximus, TFL, calf, trapezius, pectoral"
                          />
                        </div>
                        <div>
                          <Label htmlFor="strengthening">Strengthening Recommendations</Label>
                          <Textarea
                            value={newAssessment.posturalAssessment.recommendations.strengthening}
                            onChange={(e) => setNewAssessment({...newAssessment, posturalAssessment: {...newAssessment.posturalAssessment, recommendations: {...newAssessment.posturalAssessment.recommendations, strengthening: e.target.value}}})}
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
                            value={newAssessment.circumferenceMeasurements.neck}
                            onChange={(e) => setNewAssessment({...newAssessment, circumferenceMeasurements: {...newAssessment.circumferenceMeasurements, neck: e.target.value}})}
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="shoulders">Shoulders</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={newAssessment.circumferenceMeasurements.shoulders}
                            onChange={(e) => setNewAssessment({...newAssessment, circumferenceMeasurements: {...newAssessment.circumferenceMeasurements, shoulders: e.target.value}})}
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="chest">Chest</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={newAssessment.circumferenceMeasurements.chest}
                            onChange={(e) => setNewAssessment({...newAssessment, circumferenceMeasurements: {...newAssessment.circumferenceMeasurements, chest: e.target.value}})}
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="waist">Waist</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={newAssessment.circumferenceMeasurements.waist}
                            onChange={(e) => setNewAssessment({...newAssessment, circumferenceMeasurements: {...newAssessment.circumferenceMeasurements, waist: e.target.value}})}
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="hip">Hip</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={newAssessment.circumferenceMeasurements.hip}
                            onChange={(e) => setNewAssessment({...newAssessment, circumferenceMeasurements: {...newAssessment.circumferenceMeasurements, hip: e.target.value}})}
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="thighs">Thighs</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={newAssessment.circumferenceMeasurements.thighs}
                            onChange={(e) => setNewAssessment({...newAssessment, circumferenceMeasurements: {...newAssessment.circumferenceMeasurements, thighs: e.target.value}})}
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Advice */}
                    <div className="space-y-4 p-4 bg-black rounded-lg">
                      <h4 className="text-md font-semibold text-gold">Professional Advice</h4>
                      <Textarea
                        value={newAssessment.advice}
                        onChange={(e) => setNewAssessment({...newAssessment, advice: e.target.value})}
                        className="bg-black border-gray-700 text-white"
                        rows={4}
                        placeholder="Lower body mobility exercises, deep breathing exercises, core strengthening..."
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-gold text-black hover:bg-white" disabled={convertInquiryMutation.isPending}>
                    {convertInquiryMutation.isPending ? "Converting..." : "Convert to Member"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="assessments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gold">Body Composition & BMI Assessments</h2>
              <div className="space-x-4">
                <Button
                  variant="outline"
                  className="border-gold text-gold hover:bg-gold hover:text-black"
                  onClick={exportToExcel}
                >
                  Export {selectedAssessmentIds.size > 0 ? `Selected (${selectedAssessmentIds.size})` : 'All'} to Excel
                </Button>
                <Dialog open={showAssessmentModal} onOpenChange={setShowAssessmentModal}>
                  <DialogTrigger asChild>
                    <Button className="bg-gold text-black hover:bg-white">
                      <Plus className="h-4 w-4 mr-2" />
                      New Assessment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-gold">
                        {editingAssessment ? 'Edit Body Assessment' : 'Body Composition & BMI Assessment'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateAssessment} className="space-y-6">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gold">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="memberId">Client Name</Label>
                            <Select
                              required
                              value={newAssessment.memberId}
                              onValueChange={(value) => setNewAssessment({...newAssessment, memberId: value})}
                            >
                              <SelectTrigger className="bg-black border-gray-700 text-white">
                                <SelectValue placeholder="Select client" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-900 border-gray-800 text-white">
                                {members?.map((member: any) => (
                                  <SelectItem key={`assessment-member-${member.userId || member.id}`} value={member.userId || member.id} className="focus:bg-gold focus:text-black">
                                    {member.firstName} {member.lastName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="dateOfBirth">Date of Birth</Label>
                            <Input
                              type="date"
                              value={newAssessment.dateOfBirth}
                              onChange={(e) => setNewAssessment({...newAssessment, dateOfBirth: e.target.value})}
                              className="bg-black border-gray-700 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="age">Age</Label>
                            <Input
                              type="number"
                              required
                              value={newAssessment.age}
                              onChange={(e) => setNewAssessment({...newAssessment, age: e.target.value})}
                              className="bg-black border-gray-700 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="height">Height (cm)</Label>
                            <Input
                              type="number"
                              required
                              value={newAssessment.height}
                              onChange={(e) => setNewAssessment({...newAssessment, height: e.target.value})}
                              className="bg-black border-gray-700 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="bloodPressure">Blood Pressure</Label>
                            <Input
                              value={newAssessment.bloodPressure}
                              onChange={(e) => setNewAssessment({...newAssessment, bloodPressure: e.target.value})}
                              placeholder="e.g., 124/84"
                              className="bg-black border-gray-700 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="afterTreadmillBP">After Treadmill Test</Label>
                            <Input
                              value={newAssessment.afterTreadmillBP}
                              onChange={(e) => setNewAssessment({...newAssessment, afterTreadmillBP: e.target.value})}
                              placeholder="e.g., 152/92"
                              className="bg-black border-gray-700 text-white"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label htmlFor="emergencyContact">Emergency Contact</Label>
                            <Input
                              value={newAssessment.emergencyContact}
                              onChange={(e) => setNewAssessment({...newAssessment, emergencyContact: e.target.value})}
                              className="bg-black border-gray-700 text-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Body Composition */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gold">Body Composition Measurement</h3>
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <Label htmlFor="bmi">BMI</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={newAssessment.bodyComposition.bmi}
                              onChange={(e) => setNewAssessment({
                                ...newAssessment,
                                bodyComposition: {...newAssessment.bodyComposition, bmi: e.target.value}
                              })}
                              className="bg-black border-gray-700 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="weight">Weight (kg)</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={newAssessment.bodyComposition.weight}
                              onChange={(e) => setNewAssessment({
                                ...newAssessment,
                                bodyComposition: {...newAssessment.bodyComposition, weight: e.target.value}
                              })}
                              className="bg-black border-gray-700 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="muscle">Muscle (%)</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={newAssessment.bodyComposition.muscle}
                              onChange={(e) => setNewAssessment({
                                ...newAssessment,
                                bodyComposition: {...newAssessment.bodyComposition, muscle: e.target.value}
                              })}
                              className="bg-black border-gray-700 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="fat">Fat (%)</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={newAssessment.bodyComposition.fat}
                              onChange={(e) => setNewAssessment({
                                ...newAssessment,
                                bodyComposition: {...newAssessment.bodyComposition, fat: e.target.value}
                              })}
                              className="bg-black border-gray-700 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="saturatedFat">Saturated Fat (%)</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={newAssessment.bodyComposition.saturatedFat}
                              onChange={(e) => setNewAssessment({
                                ...newAssessment,
                                bodyComposition: {...newAssessment.bodyComposition, saturatedFat: e.target.value}
                              })}
                              className="bg-black border-gray-700 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="visceralFat">Visceral Fat</Label>
                            <Input
                              type="number"
                              value={newAssessment.bodyComposition.visceralFat}
                              onChange={(e) => setNewAssessment({
                                ...newAssessment,
                                bodyComposition: {...newAssessment.bodyComposition, visceralFat: e.target.value}
                              })}
                              className="bg-black border-gray-700 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="bmr">BMR</Label>
                            <Input
                              type="number"
                              value={newAssessment.bodyComposition.bmr}
                              onChange={(e) => setNewAssessment({
                                ...newAssessment,
                                bodyComposition: {...newAssessment.bodyComposition, bmr: e.target.value}
                              })}
                              className="bg-black border-gray-700 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="bodyAge">Body Age</Label>
                            <Input
                              type="number"
                              value={newAssessment.bodyComposition.bodyAge}
                              onChange={(e) => setNewAssessment({
                                ...newAssessment,
                                bodyComposition: {...newAssessment.bodyComposition, bodyAge: e.target.value}
                              })}
                              className="bg-black border-gray-700 text-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Postural Assessment */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gold">Postural Assessment</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="headNeckAlignment">Head and Neck Alignment</Label>
                            <Input
                              value={newAssessment.posturalAssessment.headNeckAlignment}
                              onChange={(e) => setNewAssessment({
                                ...newAssessment,
                                posturalAssessment: {...newAssessment.posturalAssessment, headNeckAlignment: e.target.value}
                              })}
                              className="bg-black border-gray-700 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="shoulderAlignment">Shoulder Alignment</Label>
                            <Input
                              value={newAssessment.posturalAssessment.shoulderAlignment}
                              onChange={(e) => setNewAssessment({
                                ...newAssessment,
                                posturalAssessment: {...newAssessment.posturalAssessment, shoulderAlignment: e.target.value}
                              })}
                              className="bg-black border-gray-700 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="spinalMobility">Spinal Mobility</Label>
                            <Input
                              value={newAssessment.posturalAssessment.spinalMobility}
                              onChange={(e) => setNewAssessment({
                                ...newAssessment,
                                posturalAssessment: {...newAssessment.posturalAssessment, spinalMobility: e.target.value}
                              })}
                              className="bg-black border-gray-700 text-white"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <Label htmlFor="stretching">Stretching Recommendations</Label>
                            <Textarea
                              value={newAssessment.posturalAssessment.recommendations.stretching}
                              onChange={(e) => setNewAssessment({
                                ...newAssessment,
                                posturalAssessment: {
                                  ...newAssessment.posturalAssessment,
                                  recommendations: {
                                    ...newAssessment.posturalAssessment.recommendations,
                                    stretching: e.target.value
                                  }
                                }
                              })}
                              placeholder="e.g., hamstring, glutes maximus, TFL, calf, trapezius, pectoral"
                              className="bg-black border-gray-700 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="strengthening">Strengthening Recommendations</Label>
                            <Textarea
                              value={newAssessment.posturalAssessment.recommendations.strengthening}
                              onChange={(e) => setNewAssessment({
                                ...newAssessment,
                                posturalAssessment: {
                                  ...newAssessment.posturalAssessment,
                                  recommendations: {
                                    ...newAssessment.posturalAssessment.recommendations,
                                    strengthening: e.target.value
                                  }
                                }
                              })}
                              placeholder="e.g., gluteus maximus and quadriceps, rotator cuff, scapular muscle"
                              className="bg-black border-gray-700 text-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Circumference Measurements */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gold">Circumference Measurements (inches)</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="neck">Neck</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={newAssessment.circumferenceMeasurements.neck}
                              onChange={(e) => setNewAssessment({...newAssessment, circumferenceMeasurements: {...newAssessment.circumferenceMeasurements, neck: e.target.value}})}
                              className="bg-black border-gray-700 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="shoulders">Shoulders</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={newAssessment.circumferenceMeasurements.shoulders}
                              onChange={(e) => setNewAssessment({...newAssessment, circumferenceMeasurements: {...newAssessment.circumferenceMeasurements, shoulders: e.target.value}})}
                              className="bg-black border-gray-700 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="chest">Chest</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={newAssessment.circumferenceMeasurements.chest}
                              onChange={(e) => setNewAssessment({...newAssessment, circumferenceMeasurements: {...newAssessment.circumferenceMeasurements, chest: e.target.value}})}
                              className="bg-black border-gray-700 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="waist">Waist</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={newAssessment.circumferenceMeasurements.waist}
                              onChange={(e)=> setNewAssessment({...newAssessment, circumferenceMeasurements: {...newAssessment.circumferenceMeasurements, waist: e.target.value}})}
                              className="bg-black border-gray-700 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="hip">Hip</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={newAssessment.circumferenceMeasurements.hip}
                              onChange={(e) => setNewAssessment({...newAssessment, circumferenceMeasurements: {...newAssessment.circumferenceMeasurements, hip: e.target.value}})}
                              className="bg-black border-gray-700 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="thighs">Thighs</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={newAssessment.circumferenceMeasurements.thighs}
                              onChange={(e) => setNewAssessment({...newAssessment, circumferenceMeasurements: {...newAssessment.circumferenceMeasurements, thighs: e.target.value}})}
                              className="bg-black border-gray-700 text-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Advice */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gold">Advice</h3>
                        <Textarea
                          value={newAssessment.advice}
                          onChange={(e) => setNewAssessment({...newAssessment, advice: e.target.value})}
                          className="bg-black border-gray-700 text-white"
                          rows={4}
                          placeholder="Lower body mobility exercises, deep breathing exercises, core strengthening..."
                        />
                      </div>

                      <Button type="submit" className="w-full bg-gold text-black hover:bg-white" disabled={createAssessmentMutation.isPending || updateAssessmentMutation.isPending}>
                        {editingAssessment ? (updateAssessmentMutation.isPending ? "Updating..." : "Update Assessment") : (createAssessmentMutation.isPending ? "Creating..." : "Create Assessment")}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Assessments Table */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-gold">Body Assessments ({bodyAssessments?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-gray-400 w-12">
                        <input
                          type="checkbox"
                          checked={selectedAssessmentIds.size === bodyAssessments?.length && bodyAssessments?.length > 0}
                          onChange={(e) => handleSelectAllAssessments(e.target.checked)}
                          className="rounded"
                        />
                      </TableHead>
                      <TableHead className="text-gray-400">Client Name</TableHead>
                      <TableHead className="text-gray-400">Age</TableHead>
                      <TableHead className="text-gray-400">BMI</TableHead>
                      <TableHead className="text-gray-400">Weight</TableHead>
                      <TableHead className="text-gray-400">Body Fat %</TableHead>
                      <TableHead className="text-gray-400">Date Created</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(bodyAssessments) && bodyAssessments.map((assessment: any) => (
                      <TableRow key={assessment._id || assessment.id} className="border-gray-800">
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedAssessmentIds.has(assessment._id || assessment.id)}
                            onChange={(e) => handleSelectAssessment(assessment._id || assessment.id, e.target.checked)}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell className="text-white">{assessment.memberName || assessment.client_name}</TableCell>
                        <TableCell className="text-gray-400">{assessment.age}</TableCell>
                        <TableCell className="text-gray-400">{assessment.bodyComposition?.bmi || assessment.bmi || 'N/A'}</TableCell>
                        <TableCell className="text-gray-400">{assessment.bodyComposition?.weight || assessment.weight || 'N/A'} kg</TableCell>
                        <TableCell className="text-gray-400">{assessment.bodyComposition?.fat || assessment.fat || 'N/A'}%</TableCell>
                        <TableCell className="text-gray-400">
                          {new Date(assessment.createdAt || assessment.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-blue-400 hover:bg-blue-400 hover:text-white"
                              onClick={() => handleShareAssessment(assessment)}
                            >
                              Share
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-gold hover:bg-gold hover:text-black"
                              onClick={() => handleEditAssessment(assessment)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!Array.isArray(bodyAssessments) || bodyAssessments.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-gray-400">
                          No body assessments found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Share Assessment Modal */}
            <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
              <DialogContent className="bg-gray-900 border-gray-800 text-white">
                <DialogHeader>
                  <DialogTitle className="text-gold">Share Assessment with Trainer</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-gray-400">
                    Share assessment for <strong>{selectedAssessment?.memberName}</strong> with a trainer:
                  </p>
                  <div className="space-y-2">
                    {trainers?.map((trainer: any) => (
                      <Button
                        key={`share-trainer-${trainer.userId}`}
                        variant="outline"
                        className="w-full justify-start border-gray-700 text-white hover:bg-gold hover:text-black"
                        onClick={() => {
                          shareAssessmentMutation.mutate({
                            assessmentId: selectedAssessment._id,
                            trainerId: trainer.userId
                          });
                        }}
                        disabled={shareAssessmentMutation.isPending}
                      >
                        {trainer.firstName} {trainer.lastName}
                        <span className="ml-auto text-sm text-gray-400">
                          {trainer.specializations?.join(', ')}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gold">Trainer Attendance System</h2>
              <div className="flex items-center space-x-4">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    // Marked trainers state is no longer used in the current logic, can be removed if not needed elsewhere.
                    // setMarkedTrainers(new Set());
                  }}
                  className="bg-black border-gray-700 text-white"
                />
                <Button
                  variant="outline"
                  className="border-gold text-gold hover:bg-gold hover:text-black"
                  onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                >
                  Today
                </Button>
                <Dialog open={showAttendanceModal} onOpenChange={setShowAttendanceModal}>
                  <DialogTrigger asChild>
                    <Button className="bg-gold text-black hover:bg-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Record Attendance
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-800 text-white">
                    <DialogHeader>
                      <DialogTitle className="text-gold">Record Trainer Attendance</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleRecordAttendance} className="space-y-4">
                      <div>
                        <Label htmlFor="trainerId">Select Trainer</Label>
                        <Select
                          name="trainerId"
                          required
                          value={newAttendance.trainerId}
                          onValueChange={(value) => setNewAttendance({...newAttendance, trainerId: value})}
                        >
                          <SelectTrigger className="bg-black border-gray-700 text-white">
                            <SelectValue placeholder="Select a trainer" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-gray-800 text-white">
                            {trainers?.map((trainer: any) => (
                              <SelectItem key={`attendance-trainer-${trainer.userId}`} value={trainer.userId} className="focus:bg-gold focus:text-black">
                                {trainer.firstName} {trainer.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                          name="status"
                          required
                          value={newAttendance.status}
                          onValueChange={(value) => setNewAttendance({...newAttendance, status: value})}
                        >
                          <SelectTrigger className="bg-black border-gray-700 text-white">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-gray-800 text-white">
                            <SelectItem value="present" className="focus:bg-gold focus:text-black">Present</SelectItem>
                            <SelectItem value="absent" className="focus:bg-gold focus:text-black">Absent</SelectItem>
                            <SelectItem value="late" className="focus:bg-gold focus:text-black">Late</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="checkInTime">Check In Time</Label>
                          <Input
                            name="checkInTime"
                            type="time"
                            value={newAttendance.checkInTime}
                            onChange={(e) => setNewAttendance({...newAttendance, checkInTime: e.target.value})}
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="checkOutTime">Check Out Time</Label>
                          <Input
                            name="checkOutTime"
                            type="time"
                            value={newAttendance.checkOutTime}
                            onChange={(e) => setNewAttendance({...newAttendance, checkOutTime: e.target.value})}
                            className="bg-black border-gray-700 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          name="notes"
                          placeholder="Additional notes..."
                          value={newAttendance.notes}
                          onChange={(e) => setNewAttendance({...newAttendance, notes: e.target.value})}
                          className="bg-black border-gray-700 text-white"
                        />
                      </div>
                      <Button type="submit" className="w-full bg-gold text-black hover:bg-white" disabled={recordAttendanceMutation.isPending}>
                        {recordAttendanceMutation.isPending ? "Recording..." : "Record Attendance"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Attendance Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gold">Today's Attendance</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Present / Total</span>
                      <span className="text-white font-bold">
                        {todayAttendance?.filter(att => att.status === 'present').length || 0} / {trainers?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Absent</span>
                      <span className="text-red-400 font-bold">
                        {todayAttendance?.filter(att => att.status === 'absent').length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Not Marked</span>
                      <span className="text-yellow-400 font-bold">
                        {(trainers?.length || 0) - (todayAttendance?.length || 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gold">This Month</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-green-400">
                    {Array.isArray(monthlyAttendanceStats) ? monthlyAttendanceStats.reduce((sum: number, trainer: any) => sum + trainer.presentDays, 0) : 0}
                  </div>
                  <p className="text-gray-400">Total Present Days</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gold">This Year</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-blue-400">
                    {Array.isArray(attendanceStats) ? attendanceStats.reduce((sum: number, trainer: any) => sum + trainer.presentDays, 0) : 0}
                  </div>
                  <p className="text-gray-400">Total Present Days</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Mark Attendance */}
            {selectedDate === new Date().toISOString().split('T')[0] && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gold">Quick Mark Attendance - Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {trainers?.map((trainer: any) => {
                      const hasAttendance = todayAttendance?.find(attendance => attendance.trainerId?.toString() === trainer.userId);

                      return (
                        <div key={trainer.userId} className="bg-black rounded-lg p-4 border border-gray-800">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center">
                                <span className="text-black font-bold text-sm">
                                  {trainer.firstName?.charAt(0)}{trainer.lastName?.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <h3 className="text-white font-semibold">{trainer.firstName} {trainer.lastName}</h3>
                                <p className="text-gray-400 text-sm">{trainer.specializations?.join(', ') || 'General Training'}</p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {!hasAttendance ? (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleQuickAttendance(trainer.userId, "present")}
                                  >
                                    Present
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleQuickAttendance(trainer.userId, "absent")}
                                  >
                                    Absent
                                  </Button>
                                </>
                              ) : hasAttendance.status === "present" && !hasAttendance.checkOutTime ? (
                                <div className="flex flex-col items-end space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <Badge className="bg-green-600 text-white">Present</Badge>
                                    <span className="text-xs text-gray-400">In: {hasAttendance.checkInTime}</span>
                                  </div>
                                  <Button
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={() => handleCheckOut(trainer.userId)}
                                  >
                                    Check Out
                                  </Button>
                                </div>
                              ) : hasAttendance.status === "present" && hasAttendance.checkOutTime ? (
                                <div className="flex flex-col items-end space-y-1">
                                  <Badge className="bg-green-600 text-white">Present</Badge>
                                  <div className="text-xs text-gray-400">
                                    <div>In: {hasAttendance.checkInTime}</div>
                                    <div>Out: {hasAttendance.checkOutTime}</div>
                                  </div>
                                </div>
                              ) : hasAttendance.status === "absent" ? (
                                <div className="flex flex-col items-end">
                                  <Badge className="bg-red-600 text-white">Absent</Badge>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  {getAttendanceStatusBadge(hasAttendance.status)}
                                  {hasAttendance.checkInTime && (
                                    <span className="text-xs text-gray-400">In: {hasAttendance.checkInTime}</span>
                                  )}
                                  {hasAttendance.checkOutTime && (
                                    <span className="text-xs text-gray-400">Out: {hasAttendance.checkOutTime}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Today's Attendance Table */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-gold">Attendance for {selectedDate}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-gray-400">Trainer Name</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400">Check In</TableHead>
                      <TableHead className="text-gray-400">Check Out</TableHead>
                      <TableHead className="text-gray-400">Hours</TableHead>
                      <TableHead className="text-gray-400">Notes</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(todayAttendance) && todayAttendance.map((attendance: any) => {
                      const hours = attendance.checkInTime && attendance.checkOutTime
                        ? ((new Date(`1970-01-01T${attendance.checkOutTime}:00`).getTime() - new Date(`1970-01-01T${attendance.checkInTime}:00`).getTime()) / (1000 * 60 * 60)).toFixed(1)
                        : 'N/A';
                      return (
                        <TableRow key={attendance._id} className="border-gray-800">
                          <TableCell className="text-white">{attendance.trainerName}</TableCell>
                          <TableCell>{getAttendanceStatusBadge(attendance.status)}</TableCell>
                          <TableCell className="text-gray-400">{attendance.checkInTime || 'N/A'}</TableCell>
                          <TableCell className="text-gray-400">{attendance.checkOutTime || 'N/A'}</TableCell>
                          <TableCell className="text-gray-400">{hours}h</TableCell>
                          <TableCell className="text-gray-400">{attendance.notes || 'N/A'}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-gold hover:bg-gold hover:text-black"
                              onClick={() => {
                                // Set the attendance data for editing
                                setNewAttendance({
                                  trainerId: attendance.trainerId,
                                  status: attendance.status,
                                  checkInTime: attendance.checkInTime || "",
                                  checkOutTime: attendance.checkOutTime || "",
                                  notes: attendance.notes || ""
                                });
                                setShowAttendanceModal(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {(!Array.isArray(todayAttendance) || todayAttendance.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-400">
                          No attendance records for this date
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Monthly/Yearly Statistics */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-gold">Trainer Attendance Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-gray-400">Trainer Name</TableHead>
                      <TableHead className="text-gray-400">Present Days (Month)</TableHead>
                      <TableHead className="text-gray-400">Present Days (Year)</TableHead>
                      <TableHead className="text-gray-400">Attendance Rate (Year)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(attendanceStats) && attendanceStats.map((stat: any) => {
                      const monthlyData = Array.isArray(monthlyAttendanceStats) ? monthlyAttendanceStats.find((m: any) => m.trainerId === stat.trainerId) : null;
                      return (
                        <TableRow key={`stat-trainer-${stat.trainerId}`} className="border-gray-800">
                          <TableCell className="text-white">{stat.trainerName}</TableCell>
                          <TableCell className="text-green-400">{monthlyData?.presentDays || 0}</TableCell>
                          <TableCell className="text-blue-400">{stat.presentDays}</TableCell>
                          <TableCell className="text-purple-400">{stat.attendanceRate?.toFixed(1)}%</TableCell>
                        </TableRow>
                      );
                    })}
                    {(!Array.isArray(attendanceStats) || attendanceStats.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-400">
                          No attendance statistics available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <h2 className="text-2xl font-bold text-gold">Business Reports</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gold">Revenue Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">This Month</span>
                      <span className="text-white font-bold">${stats?.monthlyRevenue?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Growth Rate</span>
                      <span className="text-green-400 font-bold">{stats?.growth || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Active Subscriptions</span>
                      <span className="text-white font-bold">{stats?.activeSubscriptions || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gold">Training Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Sessions</span>
                      <span className="text-white">{stats?.totalSessions || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Active Trainers</span>
                      <span className="text-white">{stats?.totalTrainers || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Member to Trainer Ratio</span>
                      <span className="text-white">
                        {stats?.totalMembers && stats?.totalTrainers
                          ? Math.round(stats.totalMembers / stats.totalTrainers)
                          : 0}:1
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gold">System Settings</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Gym Configuration */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gold">Gym Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveGymConfiguration} className="space-y-4">
                    <div>
                      <Label htmlFor="gymName">Gym Name</Label><Input
                        id="gymName"
                        value={gymSettings.gymName}
                        onChange={(e) => setGymSettings({...gymSettings, gymName: e.target.value})}
                        className="bg-black border-gray-700 text-white focus:ring-gold"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={gymSettings.address}
                        onChange={(e) => setGymSettings({...gymSettings, address: e.target.value})}
                        className="bg-black border-gray-700 text-white focus:ring-gold"
                      />
                    </div>
                    <div>
                      <Label htmlFor="operatingHours">Operating Hours</Label>
                      <Input
                        id="operatingHours"
                        value={gymSettings.operatingHours}
                        onChange={(e) => setGymSettings({...gymSettings, operatingHours: e.target.value})}
                        className="bg-black border-gray-700 text-white focus:ring-gold"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="bg-gold text-black hover:bg-white"
                      disabled={updateGymSettingsMutation.isPending}
                    >
                      {updateGymSettingsMutation.isPending ? "Saving..." : "Save Configuration"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Membership Pricing */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gold">Membership Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdatePricing} className="space-y-4">
                    {membershipTiers?.map((tier: any, index: number) => {
                      const tierId = tier._id || tier.id;
                      // Only render if we have a valid tier ID
                      if (!tierId) return null;

                      return (
                        <div key={`pricing-tier-${tierId}`}>
                          <Label htmlFor={`price-${tierId}`}>{tier.name} Price</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                            <Input
                              id={`price-${tierId}`}
                              type="number"
                              step="0.01"
                              value={membershipPricing[tierId] || ''}
                              onChange={(e) => setMembershipPricing({
                                ...membershipPricing,
                                [tierId]: e.target.value // Keep as string for input, parse on submit
                              })}
                              className="bg-black border-gray-700 text-white focus:ring-gold pl-8"
                              placeholder="0.00"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">/month</span>
                          </div>
                        </div>
                      );
                    })}
                    <Button
                      type="submit"
                      className="bg-gold text-black hover:bg-white"
                      disabled={updateMembershipPricingMutation.isPending}
                    >
                      {updateMembershipPricingMutation.isPending ? "Updating..." : "Update Pricing"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Membership Subscription Management */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-gold">Membership Subscription Management</CardTitle>
                  <Dialog open={showAddMembershipModal} onOpenChange={(open) => {
                    if (!open) closeMemershipModal();
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        className="bg-gold text-black hover:bg-white"
                        onClick={() => setShowAddMembershipModal(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Membership
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-gold">
                          {editingMembership ? 'Edit Membership Tier' : 'Add New Membership Tier'}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddMembership} className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              required
                              value={newMembership.name}
                              onChange={(e) => setNewMembership({...newMembership, name: e.target.value})}
                              className="bg-black border-gray-700 text-white"
                              placeholder="e.g., ONE_ON_ONE_12_SESSIONS"
                            />
                          </div>
                          <div>
                            <Label htmlFor="sessions">Sessions</Label>
                            <Input
                              id="sessions"
                              type="number"
                              required
                              value={newMembership.sessions}
                              onChange={(e) => {
                                const sessions = parseInt(e.target.value) || 0;
                                setNewMembership({
                                  ...newMembership,
                                  sessions,
                                  oneOnOnePerSession: sessions > 0 ? Math.round((newMembership.oneOnOnePrice / sessions) * 100) / 100 : 0,
                                  twoPeoplePerSession: sessions > 0 ? Math.round((newMembership.twoPeoplePrice / sessions) * 100) / 100 : 0,
                                  threePeoplePerSession: sessions > 0 ? Math.round((newMembership.threePeoplePrice / sessions) * 100) / 100 : 0
                                });
                              }}
                              className="bg-black border-gray-700 text-white"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="duration">Duration</Label>
                          <Input
                            id="duration"
                            required
                            value={newMembership.duration}
                            onChange={(e) => setNewMembership({...newMembership, duration: e.target.value})}
                            className="bg-black border-gray-700 text-white"
                            placeholder="e.g., 1 month, 3 months, 6 months"
                          />
                        </div>

                        {/* Pricing Section */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gold">Pricing Structure</h3>

                          {/* One-on-One */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="oneOnOnePrice">One-on-One Total Price</Label>
                              <Input
                                id="oneOnOnePrice"
                                type="number"
                                step="0.01"
                                value={newMembership.oneOnOnePrice}
                                onChange={(e) => {
                                  const price = parseFloat(e.target.value) || 0;
                                  const perSession = newMembership.sessions > 0 ? price / newMembership.sessions : 0;
                                  setNewMembership({
                                    ...newMembership,
                                    oneOnOnePrice: price,
                                    oneOnOnePerSession: Math.round(perSession * 100) / 100
                                  });
                                }}
                                className="bg-black border-gray-700 text-white"
                              />
                            </div>
                            <div>
                              <Label htmlFor="oneOnOnePerSession">Per Session Rate (Auto-calculated)</Label>
                              <Input
                                id="oneOnOnePerSession"
                                type="number"
                                step="0.01"
                                value={newMembership.oneOnOnePerSession}
                                readOnly
                                className="bg-gray-800 border-gray-700 text-gray-400"
                              />
                            </div>
                          </div>

                          {/* Two People */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="twoPeoplePrice">Two People Total Price</Label>
                              <Input
                                id="twoPeoplePrice"
                                type="number"
                                step="0.01"
                                value={newMembership.twoPeoplePrice}
                                onChange={(e) => {
                                  const price = parseFloat(e.target.value) || 0;
                                  const perSession = newMembership.sessions > 0 ? price / newMembership.sessions : 0;
                                  setNewMembership({
                                    ...newMembership,
                                    twoPeoplePrice: price,
                                    twoPeoplePerSession: Math.round(perSession * 100) / 100
                                  });
                                }}
                                className="bg-black border-gray-700 text-white"
                              />
                            </div>
                            <div>
                              <Label htmlFor="twoPeoplePerSession">Per Session Rate (Auto-calculated)</Label>
                              <Input
                                id="twoPeoplePerSession"
                                type="number"
                                step="0.01"
                                value={newMembership.twoPeoplePerSession}
                                readOnly
                                className="bg-gray-800 border-gray-700 text-gray-400"
                              />
                            </div>
                          </div>

                          {/* Three People */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="threePeoplePrice">Three People Total Price</Label>
                              <Input
                                id="threePeoplePrice"
                                type="number"
                                step="0.01"
                                value={newMembership.threePeoplePrice}
                                onChange={(e) => {
                                  const price = parseFloat(e.target.value) || 0;
                                  const perSession = newMembership.sessions > 0 ? price / newMembership.sessions : 0;
                                  setNewMembership({
                                    ...newMembership,
                                    threePeoplePrice: price,
                                    threePeoplePerSession: Math.round(perSession * 100) / 100
                                  });
                                }}
                                className="bg-black border-gray-700 text-white"
                              />
                            </div>
                            <div>
                              <Label htmlFor="threePeoplePerSession">Per Session Rate (Auto-calculated)</Label>
                              <Input
                                id="threePeoplePerSession"
                                type="number"
                                step="0.01"
                                value={newMembership.threePeoplePerSession}
                                readOnly
                                className="bg-gray-800 border-gray-700 text-gray-400"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="features">Features (comma separated)</Label>
                          <Textarea
                            id="features"
                            value={newMembership.features}
                            onChange={(e) => setNewMembership({...newMembership, features: e.target.value})}
                            className="bg-black border-gray-700 text-white"
                            placeholder="Personal Training Sessions, Body Analysis, Workout Plans, etc."
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={newMembership.description}
                            onChange={(e) => setNewMember({...newMember, description: e.target.value})}
                            className="bg-black border-gray-700 text-white"
                            placeholder="Brief description of this membership tier"
                            rows={2}
                          />
                        </div>

                        <Button type="submit" className="w-full bg-gold text-black hover:bg-white" disabled={createMembershipMutation.isPending || updateMembershipMutation.isPending}>
                          {editingMembership ? (updateMembershipMutation.isPending ? "Updating..." : "Update Membership") : (createMembershipMutation.isPending ? "Creating..." : "Create Membership")}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-gray-400">Name</TableHead>
                      <TableHead className="text-gray-400">Sessions</TableHead>
                      <TableHead className="text-gray-400">Duration</TableHead>
                      <TableHead className="text-gray-400">One-on-One Price</TableHead>
                      <TableHead className="text-gray-400">Two People Price</TableHead>
                      <TableHead className="text-gray-400">Three People Price</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {membershipTiers?.map((tier: any) => (
                      <TableRow key={tier.id} className="border-gray-800">
                        <TableCell className="text-white">{tier.name}</TableCell>
                        <TableCell className="text-gray-400">{tier.sessions}</TableCell>
                        <TableCell className="text-gray-400">{tier.duration}</TableCell>
                        <TableCell className="text-gray-400">${tier.one_on_one_price || tier.oneOnOnePrice}</TableCell>
                        <TableCell className="text-gray-400">${tier.two_people_price || tier.twoPeoplePrice}</TableCell>
                        <TableCell className="text-gray-400">${tier.three_people_price || tier.threePeoplePrice}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-gold hover:bg-gold hover:text-black"
                              onClick={() => handleEditMembership(tier)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-400 hover:bg-red-400 hover:text-white"
                              onClick={() => handleDeleteMembership(tier)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!membershipTiers || membershipTiers.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-400">
                          No membership tiers found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Change Trainer Password Modal */}
      <Dialog open={showChangePasswordModal} onOpenChange={setShowChangePasswordModal}>
        <DialogContent className="max-w-md bg-black border-gold">
          <DialogHeader>
            <DialogTitle className="text-gold">
              Change Password - {selectedTrainerForPassword?.firstName} {selectedTrainerForPassword?.lastName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newPassword" className="text-gray-300">New Password *</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Enter new password (min 8 characters)"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowChangePasswordModal(false);
                setSelectedTrainerForPassword(null);
                setNewPassword("");
                setConfirmPassword("");
              }}
              className="border-gray-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitPasswordChange}
              className="bg-gold text-black hover:bg-gold/80"
              disabled={changeTrainerPasswordMutation.isPending}
            >
              {changeTrainerPasswordMutation.isPending ? "Changing..." : "Change Password"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}