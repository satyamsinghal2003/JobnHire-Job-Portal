import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { UrlState } from '@/context';
import useFetch from '@/hooks/useFetch';
import { logout } from "@/db/apiAuth";
import supabase from '@/db/supabase';

function Header() {
  const [role, setRole] = useState(null);  
  const navigate = useNavigate();
  
  const { user, fetchUser } = UrlState();  
  const { loading, fn: fnLogout } = useFetch(logout);

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
  }, [role, user, fnLogout]);

  return (
    <nav className='py-5 px-5 sm:px-8 flex justify-between items-center shadow-md'>
      
      <Link to="/">
        <img src='/logo.png' className='h-10 sm:h-12' alt="Logo" />
      </Link>

      
      <div className='flex items-center gap-4 sm:px-8 sm:gap-8'>
        {!user ? (
          <Button 
            variant='outline' 
            className='text-sm sm:text-base'  
            onClick={() => navigate("/auth")}
          >
            Login
          </Button>
        ) : (
          <div className='flex items-center gap-4 sm:gap-6'>
            {role === 'recruiter' && 
              <Button variant="destructive" onClick={() => navigate('/post-job')}>Post a Job</Button>}
            
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar>
                  <AvatarImage src={user?.user_metadata?.profilePic} />
                  <AvatarFallback>{user?.user_metadata?.name?.[0]}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>{user?.user_metadata?.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
      
                
                {role === 'recruiter' ? (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/my-jobs')}>Posted Jobs</DropdownMenuItem>
                    <DropdownMenuItem>Applications</DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/my-jobs')}>My Jobs</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/saved-jobs')}>Saved Jobs</DropdownMenuItem>
                  </>
                )}
      
                
                <DropdownMenuItem 
                  onClick={() => {
                    fnLogout().then(() => {
                      setRole(null);
                      fetchUser(null);
                      navigate('/');
                    });
                  }}
                >
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Header;
