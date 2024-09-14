import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from "react-router-dom";
import supabase from '@/db/supabase';
import { UrlState } from '@/context';

function LandingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

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
      } else {
        setRole(null);
      }
    };
  
    fetchUserDetails();
  }, []); 

  const handleSearch = () => {
    if(user)
      navigate(`/jobs?search=${searchTerm}&location=${location}&company=${selectedCompany}`);
    else
      navigate('/auth')
  };

  return (
    <main className='flex flex-col gap-10 sm:gap-12 py-10 sm:py-14 px-4 md:px-20 lg:px-40'>
      <section className='text-center font-extrabold text-4xl sm:text-5xl lg:text-6xl'>
        <p>Find Your Dream Job</p>
        <p>And Get Hired</p>
        <p className='text-center font-extralight text-lg sm:text-xl mt-4 mx-auto max-w-2xl'>
          Thousands of job listings are waiting for you. Find the perfect candidate or land your dream job with JobnHire.
        </p>
      </section>

      
      <div className='flex flex-col gap-2 sm:flex-row mx-auto w-full sm:w-3/4 lg:w-full'>
        <div className='flex flex-col sm:flex-row w-full gap-2'>
          
          <Input 
            type="text" 
            placeholder="Job Title" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-3 rounded-lg w-full sm:w-2/3 shadow-lg"
          />
          <Input 
            type="text" 
            placeholder="Location" 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="border p-3 rounded-lg w-full sm:w-1/3 shadow-lg"
          />
          <Input 
            type="text" 
            placeholder="Company" 
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="border p-3 rounded-lg w-full sm:w-1/3 shadow-lg"
          />
        </div>

        
        <Button 
          variant="blue" 
          size="lg" 
          onClick={handleSearch} 
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-transform transform hover:scale-105"
        >
          Search
        </Button>
      </div>

      
      <div className='flex justify-center gap-5'>
        <Button 
          variant="secondary" 
          size="xl" 
          onClick={handleSearch} 
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-lg py-3 px-6 transition-transform transform hover:scale-105"
        >
          Find Jobs
        </Button>
        <Button 
          variant="destructive" 
          size="xl" 
          onClick={() => {
            role === 'recruiter' ? navigate('/post-job') : (alert('Log in as Recruiter') && navigate('/auth'));
          }} 
          className="bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-lg py-3 px-6 transition-transform transform hover:scale-105"
        >
          Post a Job
        </Button>
      </div>
    </main>
  );
}

export default LandingPage;
