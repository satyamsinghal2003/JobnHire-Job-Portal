import React, { useEffect, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from "zod"
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectGroup, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from 'react'
import useFetch from '@/hooks/useFetch'
import supabase from '@/db/supabase'
import MDEditor from "@uiw/react-md-editor";
import { Button } from '@/components/ui/button'
import { UrlState } from "@/context";
import { useNavigate } from 'react-router-dom'
import { supabaseUrl } from '@/db/supabase';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const schema = z.object({
  title: z.string().min(1, {message: "Title is required"}),
  description: z.string().min(1, {message: "Description is required"}),
  location: z.string().min(1, {message: "Enter the city name"}),
  company: z.string().min(1, {message: "Select or add a new company"}),
  requirements: z.string().min(1, {message: "Requirements is required"}),
});


const companySchema = z.object({
  name: z.string().min(1, { message: "Company name is required" }),
  logo: z
    .any()
    .refine(
      (file) =>
        file[0] &&
        (file[0].type === "image/png" || file[0].type === "image/jpeg"),
      {
        message: "Only Images are allowed",
      }
    ),
});

function PostJob() {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const { user } = UrlState();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);


  
  
  const { register, control, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema)
  });

  
  const { register: registerCompany, handleSubmit: handleCompanySubmit, formState: { errors: companyErrors }, reset: resetCompanyForm } = useForm({
    resolver: zodResolver(companySchema)
  });

  
  const fetchJobs = async () => {
    const { data, error } = await supabase.from('jobs').select('*, company:companies(name, logo_url), saved:saved_jobs(id)');
    if (error) {
      throw error;
    }
    return data;
  };

  const { data: jobData, fn: fnJobsData } = useFetch(fetchJobs);

  useEffect(() => {
    fnJobsData();
  }, []);

  useEffect(() => {
    if (jobData) {
      setCompanies(Array.from(new Set(jobData.map(job => job.company.name))));
    }
  }, [jobData]);

  const onSubmit = async (data) => {
    try {
      let companyId;

      
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('name', data.company)
        .single();

      if (companyError && companyError.code !== 'PGRST116') {
        throw companyError;
      }

      
      if (companyData) {
        companyId = companyData.id;
      } else {
        const { data: newCompany, error: insertCompanyError } = await supabase
          .from('companies')
          .insert([{ name: data.company }])
          .select('id')
          .single();

        if (insertCompanyError) {
          throw insertCompanyError;
        }

        companyId = newCompany.id;
        setCompanies([...companies, data.company]);
        
      }

      
      const { error: insertJobError } = await supabase.from('jobs').insert([
        {
          title: data.title,
          description: data.description,
          location: data.location,
          company_id: companyId, 
          requirements: data.requirements,
          recruiter_id: user.id,
        },
      ]);

      if (insertJobError) {
        throw insertJobError;
      }

      reset(); 
      navigate('/jobs');
    } catch (error) {
      console.error("Error posting job:", error.message);
      alert("An error occurred while posting the job.");
    }
  };

  const addNewCompany = async (data) => {
    try {
      const random = Math.floor(Math.random() * 90000);
      const fileName = `logo-${random}-${user.id}`;
  
      const { error: storageError } = await supabase.storage.from('company_logo').upload(fileName, data.logo[0]);
      if (storageError) {
        console.error("Error uploading Logo: ", storageError);
        return;
      }
  
      const logo_url = `${supabaseUrl}/storage/v1/object/public/company_logo/${fileName}`;
  
      const { error } = await supabase.from('companies').insert([{ name: data.name, logo_url }]);
      if (error) {
        console.error("Error submitting company: ", error);
        return;
      }
  
      // Add the new company to the list of companies and reset the form
      setCompanies([...companies, data.name]);
      
      
      resetCompanyForm()
      closeDrawer()
  
    } catch (error) {
      console.error("Error adding company:", error);
    }
  };
  



  return (
    <div className='sm:mx-8'>
      <h1 className='font-extrabold text-4xl sm:text-7xl text-center pt-5 pb-2'>
        Post a Job
      </h1>

      <form className='flex flex-col gap-4 p-4 pb-8' onSubmit={handleSubmit(onSubmit)}>
        <Input placeholder="Job Title" {...register("title")} />
        {errors.title && <p className='text-red-500'>{errors.title.message}</p>}

        <Input placeholder="Enter a city Name" {...register("location")} />
        {errors.location && <p className='text-red-500'>{errors.location.message}</p>}

        <Textarea placeholder="Job Description" {...register("description")} />
        {errors.description && <p className='text-red-500'>{errors.description.message}</p>}

        <div className='w-full flex gap-4'>
          <Controller
            name="company" 
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
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
            )}
          />
          {errors.company && <p className='text-red-500'>{errors.company.message}</p>}
          <Drawer isOpen={isOpen} onClose={closeDrawer}>
            <DrawerTrigger>
              <Button type="button" size="sm" variant="secondary">
                Add Company
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Add a New Company</DrawerTitle>
              </DrawerHeader>
              <form className="flex gap-2 p-4 pb-0">
                <Input placeholder="Company name" {...registerCompany("name")} />
                <Input
                  type="file"
                  accept="image/*"
                  className=" file:text-gray-500"
                  {...registerCompany("logo")}
                />
                <Button
                  type="button"
                  onClick={handleCompanySubmit(addNewCompany)}
                  
                  variant="destructive"
                  className="w-40"
                  
                >
                  Add
                </Button>
              </form>
              <DrawerFooter>
                {companyErrors.name && <p className="text-red-500">{companyErrors.name.message}</p>}
                {companyErrors.logo && <p className="text-red-500">{companyErrors.logo.message}</p>}

                <DrawerClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel / Close
                  </Button>
                
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>

        <Controller
          name="requirements"
          control={control}
          render={({ field }) => (
            <MDEditor className='bg-gray-900 text-white bg-transparent'
              value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.requirements && <p className='text-red-500'>{errors.requirements.message}</p>}

        <Button type='submit' variant='blue' size='lg' className='mt-2'>Submit</Button>
      </form>
    </div>
  )
}

export default PostJob;
