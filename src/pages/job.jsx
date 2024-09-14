import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPinIcon, DoorOpen, DoorClosed } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UrlState } from "@/context";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { supabaseUrl } from '@/db/supabase';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Download } from 'lucide-react';
import MDEditor from "@uiw/react-md-editor";



function JobPage() {
  const { id } = useParams(); 
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState(null);
  const [hasApplied, setHasApplied] = useState(false); 
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); 
  const [skills, setSkills] = useState("")
  const [experience, setExperience] = useState("")
  const [name, setName] = useState("")
  const [education, setEducation] = useState("Intermediate")
  const [applications, setApplications] = useState([]);


  const { user } = UrlState();
  

  const handleApplyJob = async (event) => {
    event.preventDefault();  
  
    const fileInput = document.querySelector('input[type="file"]');
    const file = fileInput.files[0]; 
  
    if (!file) {
      console.error("No resume file selected");
      return;
    }
  
    const random = Math.floor(Math.random() * 90000);
    const fileName = `resume-${random}-${user.id}`;
  
    const { error: storageError } = await supabase.storage.from('resumes').upload(fileName, file);
    if (storageError) {
      console.error("Error uploading resume: ", storageError);
      return;
    }
  
    const resume = `${supabaseUrl}/storage/v1/object/public/resumes/${fileName}`;
  
    const { error } = await supabase.from('applications').insert([{ candidate_id: user.id, job_id: id, name, education, status: "applied", skills, experience, resume }]);
  
    if (error) {
      console.error("Error inserting application: ", error);
      return;
    }
    await fetchJobDetails();
    setHasApplied(true);
    setIsDrawerOpen(false); 
  };
  

  const checkIfUserApplied = async () => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('candidate_id', user.id)
      .eq('job_id', id);

    if (error) {
      console.error('Error checking application status:', error);
    } else if (data.length > 0) {
      setHasApplied(true);
    }
  };

  const fetchJobDetails = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('jobs')
      .select('*, company:companies(name, logo_url), applications:applications(id)')
      .eq('id', id)
      .single();

    if (error) {
      setError(error);
      setLoading(false);
    } else {
      setJob(data);
      setLoading(false);
    }
  };

  const updateHiringStatus = async (isOpen) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('jobs')
      .update({ isOpen })
      .eq('id', id)
      .select();

    if (error) {
      setError(error);
      setLoading(false);
    } else {
      setJob(data);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const handleUpdateChange = (value) => {
    const isOpen = value === "open";
    updateHiringStatus(isOpen).then(() => fetchJobDetails());
  };

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
        checkIfUserApplied(); 
      }
    };

    fetchUserDetails();
  }, [user]);

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('job_id', id); 
  
    if (error) {
      console.error('Error fetching applications:', error);
    } else {
      console.log(data);
      setApplications(data)
    }
  };
  
  useEffect(() => {
    fetchApplications();
  }, [id]);

  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  

  return (
    <div className='flex flex-col gap-8 mt-5 mx-10'>
      <div className='flex flex-col-reverse gap-6 md:flex-row justify-between items-center'>
        <h1 className='font-extrabold pb-3 text-3xl sm:text-5xl text-blue-300'>{job.title} 
          <h1 className='font-extrabold pt-4 text-2xl sm:text-3xl text-blue-300'>at {job?.company.name}</h1>
        </h1>
        <img src={job?.company?.logo_url} className='h-10' alt={job?.company?.name} />
      </div>

      <div className='flex justify-between'>
        <div className='flex gap-2'>
          <MapPinIcon />
          {job?.location}
        </div>
        <div className='flex gap-2'>
          <Briefcase /> {job?.applications?.length} Applicants
        </div>
        <div className='flex gap-2'>
          {job?.isOpen ? (<><DoorOpen />Open</>) : (<><DoorClosed />Closed</>)}
        </div>
      </div>

      {role === "recruiter" ? (
        <div className='w-full sm:w-full'>
          <Select onValueChange={handleUpdateChange}>
            <SelectTrigger className={`w-full ${job?.isOpen ? "bg-green-600" : "bg-red-600"}`}>
              <SelectValue placeholder={"Hiring Status: " + (job?.isOpen ? "Open" : "Closed")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div>
          <p>This job is: {job?.isOpen ? "Open" : "Closed"}</p>
        </div>
      )}

      <h2 className='text-2xl sm:text-3xl font-bold'>About The Job</h2>
      <p className='sm:text-lg'>{job?.description}</p>

      <h2 className='text-2xl sm:text-3xl font-bold'>What are we Looking for: </h2>
      
        <MDEditor.Markdown
          source={job?.requirements}
          className="bg-transparent text-white sm:text-lg"/>
        
       

      {/* Recruiter can view applied candidates */}
      {role === "recruiter" && job?.applications?.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold">Applications</h2>
          <div className="mt-4">
            {applications.map((app) => (
              <div key={app.id} className="rounded-lg mb-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between font-bold">{app.name}
                      <Download size={18} className="bg-white text-black rounded-full h-8 w-8 p-2 cursor-pointer"
                      onClick={() => {                        
                          const link = document.createElement('a')
                          link.href = app.resume
                          link.target = '_blank'
                          link.click()                        
                      }}/>
                    </CardTitle>
                    
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4 flex-1">
                    <div className='flex flex-col md:flex-row justify-between'>
                      <p>Education : {app.education}</p>
                      <p>Experience : {app.experience} Years</p>
                      <p>Skills : {app.skills}</p>
                    </div>
                    
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <span>Applied on : {new Date(app.created_at).toLocaleString()}</span>
                    
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {role !== "recruiter" && job?.isOpen && !hasApplied && (
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button size='lg' variant='blue' onClick={() => setIsDrawerOpen(true)}>
              Apply for this Job
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Apply for {job.title} at {job.company.name}</DrawerTitle>
              <DrawerDescription>
                Please confirm your application. Upload your resume before submitting.
              </DrawerDescription>
            </DrawerHeader>
            <form className='flex flex-col gap-4 p-4 pb-0' onSubmit={handleApplyJob}>
            <Input
                type="text"
                placeholder='Your name'
                className='flex-1'
                value={name}
                onChange={(e) => setName(e.target.value)}
              />                
              
              <Input
                type="number"
                placeholder='Years of Experience'
                className='flex-1'
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              />
              <Input
                type="text"
                placeholder='Skills'
                className='flex-1'
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
              <RadioGroup 
              value={education}
              onValueChange={setEducation}
              defaultValue="Intermediate">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Intermediate" id="Intermediate" />
                  <Label htmlFor="Intermediate">Intermediate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Graduate" id="Graduate" />
                  <Label htmlFor="Graduate">Graduate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Post-Graduate" id="Post-Graduate" />
                  <Label htmlFor="Post-Graduate">Post Graduate</Label>
                </div>
              </RadioGroup>

              <Input
                type="file"
                accept='.pdf, .doc, .docx'
                className='flex-1 file:text-gray-500'
              />
              <Button variant='blue' loading={loading} type='submit'>
                Submit Application
              </Button>
            </form>

            <DrawerFooter>
              
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}

      {hasApplied && (
        <Button variant='destructive'>
        Applied
        </Button>
      )}
    </div>
  );
}

export default JobPage;
