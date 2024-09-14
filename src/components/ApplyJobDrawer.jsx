import React from 'react'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
  } from "@/components/ui/drawer"
  import {Button} from "@/components/ui/button"

  
function ApplyJobDrawer({user, job, applied, fetchJob}) {
  return (
    <div>
        <Drawer open={applied ? false : undefined}>
            <DrawerTrigger>
                <Button size='lg' variant={job?.isOpen && !applied ? "blue" : "destructive"}
                        disabled={!job?.isOpen || applied}>
                    
                        {job?.isOpen ? (applied ? "Applied" : "Apply") : "Hiring Closed"}
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                <DrawerTitle>Are you absolutely sure?</DrawerTitle>
                <DrawerDescription>This action cannot be undone.</DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                <Button>Submit</Button>
                <DrawerClose>
                    <Button variant="outline">Cancel</Button>
                </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
            </Drawer>

    </div>
  )
}

export default ApplyJobDrawer