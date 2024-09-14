import React from 'react'
import { Input } from "@/components/ui/input"
import { BeatLoader } from "react-spinners"
import Error from "@/components/error"
import { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom'
import * as Yup from "yup"
import {login} from "@/db/apiAuth"
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

function Login() {

    const navigate = useNavigate()

    
    const[formData, setFormData] = useState({
        email:"", 
        password:"",
    })
    const[errors, setErrors] = useState([])

    const handleInputChange = (e) => {
        const {name, value} = e.target
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }))
    }

    const {data, error, loading, fn:fnLogin} = useFetch(login, formData)
    const { fetchUser } = UrlState()

    useEffect(() => {
        if(error === null && data)
            navigate('/')
            fetchUser()

    },[data, error])

    const handleLogin = async () => {
        setErrors([])
        try {
            const schema = Yup.object().shape({
                email: Yup.string().email("Invalid email").required("E-mail is required"),
                password: Yup.string().min(6, "password should be minimum of 6 characters").required("Password is required")
            })

            await schema.validate(formData, {abortEarly: false})
            await fnLogin();

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
                    <CardTitle>Login</CardTitle>
                    <CardDescription>if your account already exists</CardDescription>
                    {error && <Error message={error.message}/>}
                </CardHeader>
                <CardContent className="space-y-2">
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
                </CardContent>
                <CardFooter>
                    <Button onClick={handleLogin} variant='outline'>
                        {loading ? <BeatLoader size={10} color='blue'/> : "Login"}
                        
                    </Button>
                </CardFooter>
            </Card>

        </div>
    )
}

export default Login