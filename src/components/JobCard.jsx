import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Trash2Icon, MapPinIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from './ui/button'
import { useState, useEffect } from 'react'
import supabase from '@/db/supabase'
import { UrlState } from '@/context'

function JobCard({
  job,
  isMyJob = false,
  savedInit = false,
  onJobSave = () => {},

}) {

  const [role, setRole] = useState(null);
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
          setRole(data?.role); // Set the role if available
        }
        
      }
    };

    fetchUserDetails();
  }, []);

  const deleteJob = async () => {
    const {error} = await supabase.from('jobs').delete().eq('id', job.id).eq('recruiter_id', user.id).select()
    if (error) {
      console.error('Error Deleting the job:', error);
    } else{
      console.log("Deleted")
      window.location.reload();
    }
  }

  useEffect(() => {
    const fetchUserDetails = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error('Error fetching user:', userError);
        return;
      }

      if (user) {
        const { error: profileError } = await supabase
          .from('jobs')
          .select('*')
          .eq('recruiter_id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
        } 
        
      }
    };

    fetchUserDetails(deleteJob);
  }, []);

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between font-bold">
            {job.title}
            {role === 'recruiter' ? (<Trash2Icon fill='red' size={18} 
            onClick={deleteJob}
            className='text-red-300 cursor-pointer'/>) : ("")}
          </CardTitle>
          <CardDescription>at {job?.company?.name}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 flex-1">
          <div className='flex justify-between'>
            {job.company && <img src={job.company.logo_url} className='h-6'/>}
            <div className='flex gap-2 items-center'>
              <MapPinIcon size={15} /> {job.location}
            </div>
          </div>
          {job.description.substring(0, job.description.indexOf("."))}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Link to={`/job/${job.id}`} className="flex-1">
            <Button variant="secondary" className="w-full">More Details</Button>
          </Link>
        </CardFooter>
      </Card>

    </div>
  )
}

export default JobCard