import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Login from '../components/login'
import Signup from '../components/signup'

function Auth() {
  return (
    <div className='m-10 flex flex-col items-center gap-10'>
        <h1 className='text-4xl font-extrabold'>Login / Signup</h1>
        <Tabs defaultValue="Login" className="w-[280px] sm:w-[400px]">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="Login">Login</TabsTrigger>
                <TabsTrigger value="Signup">Signup</TabsTrigger>
            </TabsList>
            <TabsContent value="Login"><Login /></TabsContent>
            <TabsContent value="Signup"><Signup /></TabsContent>
        </Tabs>

    </div>
    
  )
}

export default Auth