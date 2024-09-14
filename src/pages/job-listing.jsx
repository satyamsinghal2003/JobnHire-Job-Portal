import React, { useState, useEffect } from 'react';
import useFetch from "@/hooks/useFetch";
import { supabase } from "@/db/supabase";
import JobCard from '@/components/JobCard';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectGroup, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UrlState } from "@/context";
import { Button } from '@/components/ui/button';

function JobListing() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [location, setLocation] = useState("");
  const [searchParams] = useSearchParams();

  const { user } = UrlState();
  const navigate = useNavigate();

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
        checkIfUserApplied(); 
      }
    };

    fetchUserDetails();
  }, [user]);

  useEffect(() => {
    const search = searchParams.get('search') || "";
    const locationParam = searchParams.get('location') || "";
    const companyParam = searchParams.get('company') || "";

    setSearchTerm(search);
    setLocation(locationParam);
    setSelectedCompany(companyParam);
  }, [searchParams]);

  const fetchJobs = async () => {
    const { data, error } = await supabase.from('jobs').select('*, company:companies(name, logo_url), saved:saved_jobs(id)');
    if (error) {
      throw error;
    }
    return data;
  };

  const { data: jobData, loading, error, fn: fnJobsData } = useFetch(fetchJobs);

  useEffect(() => {
    fnJobsData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const companies = jobData ? Array.from(new Set(jobData.map(job => job.company.name))) : [];

  const filterJobs = jobData?.filter(job => job.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(job => selectedCompany ? job.company.name === selectedCompany : true)
    .filter(job => job.location.toLowerCase().includes(location.toLowerCase()));

  return (
    <div className='px-4 sm:px-6 lg:px-8 py-6'>
      <h1 className='text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-extrabold text-center'>
        Latest Jobs
      </h1>

      <div className='mt-6 flex flex-col gap-4 sm:flex-row sm:gap-6 lg:gap-4 lg:w-full'>
        {/* Search by job title */}
        <div className='w-full sm:w-1/2 lg:w-2/4'>
          <Input 
            type='text'
            placeholder='Search jobs by title...'
            className="border p-2 rounded-lg w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Search by location */}
        <div className='w-full sm:w-1/4 lg:w-1/4'>
          <Input 
            type='text'
            placeholder='Enter Location'
            className="border p-2 rounded-lg w-full"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Select company */}
        <div className='w-full sm:w-1/4 lg:w-1/4'>
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

      {/* Jobs listing */}
      <div className='mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filterJobs?.length ? (
          filterJobs.map((job) => {
            return <JobCard key={job.id} job={job} />;
          })
        ) : (
          user ? (
            <div className='text-center'>
              <h1 className='text-lg sm:text-xl lg:text-2xl font-bold'>
                No jobs found!
              </h1>
            </div>
          ) : (
            <div className='flex items-center gap-5'>
              <h1 className='text-lg sm:text-xl lg:text-2xl font-bold'>
                Login First :
              </h1>
              <Button variant='blue' onClick={() => (navigate('/auth'))}>Login</Button>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default JobListing;
