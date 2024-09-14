import { Button } from '@/components/ui/button';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from "@/db/supabase"; // Ensure this points to your Supabase client

function Onboarding() {
  const navigate = useNavigate();

  const updateUserRole = async (role) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error('Error fetching user:', userError);
      return;
    }

    if (user) {
      // Check if the user already has a profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, so we insert a new profile
        const { data, error: insertError } = await supabase.from('profiles').insert({
          id: user.id,  // Use the authenticated user's ID
          role,         // Set the role selected by the user
        });

        if (insertError) {
          console.error('Error inserting profile: ', insertError);
          return;
        }

        console.log('Profile created: ', data);
      } else if (profile) {
        // Profile exists, update the role
        const { data, error } = await supabase
          .from('profiles')
          .update({ role })
          .eq('id', user.id);

        if (error) {
          console.error('Error updating role: ', error);
        } else {
          console.log('Role updated: ', data);
        }
      } else {
        console.error('Error checking profile: ', profileError);
        return;
      }

      // Redirect based on role
      if (role === 'recruiter') {
        navigate('/');
      } else {
        navigate('/');
      }
    } else {
      console.error('User not authenticated');                                                                                                                                                                               
    }                        
  };

  return (
    <div className='flex flex-col py-20 gap-10'>
      <p className='text-center font-extrabold text-6xl sm:5xl lg:6xl '>I am a ....</p>
      <div className='flex justify-center gap-5'>
        <Button variant="secondary" size="xxl" onClick={() => updateUserRole('candidate')}>
          Candidate
        </Button>
        <Button variant="destructive" size="xxl" onClick={() => updateUserRole('recruiter')}>
          Recruiter
        </Button>
      </div>
    </div>
  );
}

export default Onboarding;
