import React, { useState, useEffect } from 'react';
import { UrlState } from '@/context';
import supabase from '@/db/supabase';
import useFetch from '@/hooks/useFetch';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectGroup, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchParams } from "react-router-dom";
import JobCard from '@/components/JobCard';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Download } from 'lucide-react';// Assuming you are using react-feather icons

function MyJobs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [location, setLocation] = useState("");
  const [role, setRole] = useState(null);
  const [applications, setApplications] = useState([]);
  const [searchParams] = useSearchParams();

  const { user } = UrlState();

  useEffect(() => {
    const fetchUserDetails = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
  
      if (userError) {
        console.error('Error fetching user:', userError);
        return;
      }
  
      if (user) {
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
  
        if (profileError) {
          console.error('Error fetching user profile:', profileError);
        } else {
          setRole(data?.role);
        }
      }
    };
  
    fetchUserDetails();
  }, []); 

  useEffect(() => {
    const search = searchParams.get('search') || "";
    const locationParam = searchParams.get('location') || "";
    const companyParam = searchParams.get('company') || "";

    setSearchTerm(search);
    setLocation(locationParam);
    setSelectedCompany(companyParam);
  }, [searchParams]);

  // Fetch Jobs for Recruiter
  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, company:companies(name, logo_url), saved:saved_jobs(id)')
      .eq('recruiter_id', user.id);
    if (error) throw error;
    return data;
  };

  // Fetch Applications for Candidates
  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        jobs (
          *,
          company:companies(name)
        )
      `)
      .eq('candidate_id', user.id);
  
    if (error) throw error;
    return data;
  };
  
  

  // Fetch jobs if role is recruiter
  const { data: jobData, loading: loadingJobs, error: jobError, fn: fetchJobsData } = useFetch(fetchJobs);

  // Fetch applications if role is candidate
  const { data: applicationsData, loading: loadingApps, error: appError, fn: fetchApplicationsData } = useFetch(fetchApplications);

  useEffect(() => {
    if (role === 'recruiter') {
      fetchJobsData();
    } else if (role === 'candidate') {
      fetchApplicationsData();
    }
  }, [role]);

  if (loadingJobs || loadingApps) return <p>Loading...</p>;
  if (jobError) return <p>Error: {jobError.message}</p>;
  if (appError) return <p>Error: {appError.message}</p>;

  const companies = jobData ? Array.from(new Set(jobData.map(job => job.company.name))) : [];

  const filteredJobs = jobData?.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(job => 
    selectedCompany ? job.company.name === selectedCompany : true
  ).filter(job => 
    job.location.toLowerCase().includes(location.toLowerCase())
  );

  return (
    <div>
      <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center font-extrabold'>
        {role === 'recruiter' ? "Posted Jobs" : "Applied Jobs"}
      </h1>

      {role === 'recruiter' ? (
        <>
          {/* Search and Filter for Recruiters */}
          <div className='mx-4 sm:mx-8 mt-6 flex flex-col sm:flex-row gap-4'>
            <div className='w-full sm:w-1/2'>
              <Input 
                type='text'
                placeholder='Search jobs by title...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className='w-full sm:w-1/4'>
              <Input 
                type='text'
                placeholder='Enter Location'
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className='w-full sm:w-1/4'>
              <Select value={selectedCompany} onValueChange={(value) => setSelectedCompany(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {companies.map((company, index) => (
                      <SelectItem key={index} value={company}>
                        {company}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Jobs Listing */}
          <div className='mx-4 sm:mx-8 mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {filteredJobs?.length ? (
              filteredJobs.map((job) => <JobCard key={job.id} job={job} />)
            ) : (
              <div>No jobs found!</div>
            )}
          </div>
        </>
      ) : (
        <div className="mt-8 sm:mx-20 mx-4">
          {applicationsData?.map((app) => (
            <div key={app.id} className="px-2 rounded-lg mb-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between font-bold">
                    {app.jobs?.company?.name}
                    <Download size={18} className="bg-white text-black rounded-full h-8 w-8 p-2 cursor-pointer"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = app.resume;
                        link.target = '_blank';
                        link.click();
                      }}
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex flex-col md:flex-row justify-between'>
                    <p>Education: {app.education}</p>
                    <p>Experience: {app.experience} Years</p>
                    <p>Skills: {app.skills}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <span>Applied on: {new Date(app.created_at).toLocaleString()}</span>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyJobs;
