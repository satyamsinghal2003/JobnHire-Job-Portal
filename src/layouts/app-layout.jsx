import React from 'react'
import Header from "@/components/header"
import {Outlet} from "react-router-dom"


function AppLayout() {
  return (
    <div>
        <div className='grid-background'></div>
        <main className="min-h-screen container">
            <Header/>
            <Outlet/>
        </main>        
        <div className='p-2 text-center bg-slate-800 mt-10'>Made by @satyamsinghal</div>
    </div>
  )
}

export default AppLayout