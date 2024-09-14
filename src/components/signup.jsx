import React from 'react'
import { Input } from "@/components/ui/input"
import { BeatLoader } from "react-spinners"
import Error from "@/components/error"
import { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom'
import * as Yup from "yup"
import {signup} from "@/db/apiAuth"
import useFetch from "@/hooks/useFetch"
import {UrlState} from "@/context"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { Button } from './ui/button'

function Signup() {

    const navigate = useNavigate()

    
    const[formData, setFormData] = useState({
        name:"",
        email:"", 
        password:"",
        profilePic: null,
    })
    const[errors, setErrors] = useState([])

    const handleInputChange = (e) => {
        const {name, value, files} = e.target
        setFormData((prevState) => ({
            ...prevState,
            [name]: files ? files[0] : value,
        }))
    }

    const {data, error, loading, fn:fnSignup} = useFetch(signup, formData)
    const { fetchUser } = UrlState()

    useEffect(() => {
        if(error === null && data)
            navigate('/onboarding')
            fetchUser()

    },[data, error])

    const handleSignup = async () => {
        setErrors([])
        try {
            const schema = Yup.object().shape({
                name: Yup.string().required("name is required"),
                email: Yup.string().email("Invalid email").required("E-mail is required"),
                password: Yup.string().min(6, "password should be minimum of 6 characters").required("Password is required"),
                profilePic: Yup.mixed().required("Profile Pic is required"),
            })

            await schema.validate(formData, {abortEarly: false})
            await fnSignup();

        } catch (e) {
            const newErrors = {};
            e?.inner?.forEach((err) => {
                newErrors[err.path] = err.message
            })

            setErrors(newErrors);

        }
    }

    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Signup</CardTitle>
                    <CardDescription>Create an account if you are new !</CardDescription>
                    {error && <Error message={error.message}/>}
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className='space-y-2'> 
                        <Input name='name' type='text' placeholder='Enter your Name'
                        onChange={handleInputChange}
                        />
                    </div>
                    {errors.name && <Error message={errors.name}/>}
                    
                    <div className='space-y-2'> 
                        <Input name='email' type='email' placeholder='Enter your E-mail'
                        onChange={handleInputChange}
                        />
                    </div>
                    {errors.email && <Error message={errors.email}/>}

                    
                    <div className='space-y-2'>
                        <Input 
                        name='password'
                        type='password'
                        placeholder='Enter your password'
                        onChange={handleInputChange}
                        />
                    </div>
                    {errors.password && <Error message={errors.password}/>}

                    <div className='space-y-2'>
                        <Input 
                        name='profilePic'
                        type='file'
                        accept= 'image/*'
                        onChange={handleInputChange}
                        />
                    </div>
                    {errors.profilePic && <Error message={errors.profilePic}/>}


                </CardContent>
                <CardFooter>
                    <Button onClick={handleSignup} variant='outline'>
                        {loading ? <BeatLoader size={10} color='blue'/> : "Signup"}
                        
                    </Button>
                </CardFooter>
            </Card>

        </div>
    )
}

export default Signup;