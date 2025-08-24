
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DatabaseDebug() {
  const { data: dbContents, isLoading } = useQuery({
    queryKey: ['/api/debug/database-contents'],
    queryFn: () => apiRequest('GET', '/api/debug/database-contents'),
    refetchInterval: 5000, // Refresh every 5 seconds for real-time data
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <h1 className="text-3xl font-bold text-gold mb-8">Database Debug - Loading...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold text-gold mb-8">Real-Time Database Contents</h1>
      <p className="text-gray-400 mb-6">Last updated: {dbContents?.timestamp ? new Date(dbContents.timestamp).toLocaleString() : 'Unknown'}</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Sessions */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-gold">Member Sessions ({dbContents?.sessions?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {dbContents?.sessions?.map((session: any) => (
                <div key={session.id} className="bg-black p-4 rounded border border-gray-800">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-400">ID:</span> {session.id}</div>
                    <div><span className="text-gray-400">Member:</span> {session.member_name || 'N/A'}</div>
                    <div><span className="text-gray-400">Trainer:</span> {session.trainer_name || 'N/A'}</div>
                    <div><span className="text-gray-400">Type:</span> {session.session_type}</div>
                    <div><span className="text-gray-400">Date:</span> {session.scheduled_date}</div>
                    <div><span className="text-gray-400">Time:</span> {session.scheduled_time}</div>
                    <div><span className="text-gray-400">Status:</span> {session.status}</div>
                    <div><span className="text-gray-400">Duration:</span> {session.duration}min</div>
                  </div>
                  {session.notes && (
                    <div className="mt-2 text-gray-300 text-sm">
                      <span className="text-gray-400">Notes:</span> {session.notes}
                    </div>
                  )}
                </div>
              )) || (
                <div className="text-gray-400 text-center py-4">No sessions found</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Body Assessments */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-gold">Body Assessments ({dbContents?.assessments?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {dbContents?.assessments?.map((assessment: any) => (
                <div key={assessment.id} className="bg-black p-4 rounded border border-gray-800">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-400">ID:</span> {assessment.id}</div>
                    <div><span className="text-gray-400">Client:</span> {assessment.client_name}</div>
                    <div><span className="text-gray-400">Age:</span> {assessment.age || 'N/A'}</div>
                    <div><span className="text-gray-400">Height:</span> {assessment.height ? `${assessment.height}cm` : 'N/A'}</div>
                    <div><span className="text-gray-400">Weight:</span> {assessment.weight ? `${assessment.weight}kg` : 'N/A'}</div>
                    <div><span className="text-gray-400">BMI:</span> {assessment.bmi || 'N/A'}</div>
                    <div><span className="text-gray-400">BP:</span> {assessment.bp || 'N/A'}</div>
                    <div><span className="text-gray-400">Created:</span> {new Date(assessment.created_at).toLocaleDateString()}</div>
                  </div>
                  {assessment.advice && (
                    <div className="mt-2 text-gray-300 text-sm">
                      <span className="text-gray-400">Advice:</span> {assessment.advice.substring(0, 100)}...
                    </div>
                  )}
                </div>
              )) || (
                <div className="text-gray-400 text-center py-4">No assessments found</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Members */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-gold">Members ({dbContents?.members?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {dbContents?.members?.map((member: any) => (
                <div key={member.id} className="bg-black p-4 rounded border border-gray-800">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-400">ID:</span> {member.id}</div>
                    <div><span className="text-gray-400">Name:</span> {member.first_name} {member.last_name}</div>
                    <div><span className="text-gray-400">Email:</span> {member.email}</div>
                    <div><span className="text-gray-400">Phone:</span> {member.phone || 'N/A'}</div>
                    <div><span className="text-gray-400">Tier:</span> {member.tier_category || 'N/A'}</div>
                    <div><span className="text-gray-400">Goals:</span> {member.fitness_goals || 'N/A'}</div>
                  </div>
                </div>
              )) || (
                <div className="text-gray-400 text-center py-4">No members found</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Trainer Assignments */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-gold">Trainer Assignments ({dbContents?.assignments?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {dbContents?.assignments?.map((assignment: any) => (
                <div key={assignment.id} className="bg-black p-4 rounded border border-gray-800">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-400">ID:</span> {assignment.id}</div>
                    <div><span className="text-gray-400">Member ID:</span> {assignment.member_id}</div>
                    <div><span className="text-gray-400">Trainer ID:</span> {assignment.trainer_id}</div>
                    <div><span className="text-gray-400">Active:</span> {assignment.is_active ? 'Yes' : 'No'}</div>
                    <div><span className="text-gray-400">Assigned:</span> {new Date(assignment.assigned_date).toLocaleDateString()}</div>
                  </div>
                  {assignment.notes && (
                    <div className="mt-2 text-gray-300 text-sm">
                      <span className="text-gray-400">Notes:</span> {assignment.notes}
                    </div>
                  )}
                </div>
              )) || (
                <div className="text-gray-400 text-center py-4">No assignments found</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
