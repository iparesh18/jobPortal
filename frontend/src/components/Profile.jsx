import React, { useState } from 'react'
import Navbar from './shared/Navbar'
import { Avatar, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Contact, Mail, Pen, FileText, Globe, Award, Briefcase } from 'lucide-react'
import { Badge } from './ui/badge'
import { Label } from './ui/label'
import AppliedJobTable from './AppliedJobTable'
import UpdateProfileDialog from './UpdateProfileDialog'
import { useSelector } from 'react-redux'
import useGetAppliedJobs from '@/hooks/useGetAppliedJobs'
import Breadcrumbs from './shared/Breadcrumbs';
import { motion } from 'framer-motion';

const Profile = () => {
    useGetAppliedJobs();
    const [open, setOpen] = useState(false);
    const { user } = useSelector(store => store.auth);

    return (
        <div className="min-h-screen bg-[#F5F6FA]">
            <Navbar />
            <div className='max-w-5xl mx-auto px-6 py-8'>
                <Breadcrumbs />
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className='grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8'
                >
                    {/* Left Column: Essential Info */}
                    <div className='lg:col-span-1 space-y-6'>
                        <div className='bg-white rounded-[2.5rem] p-8 border border-border/50 shadow-sm text-center relative overflow-hidden'>
                            <div className="absolute top-0 left-0 w-full h-24 purple-gradient opacity-10"></div>
                            
                            <div className='relative flex flex-col items-center mt-4'>
                                <div className='relative group'>
                                    <div className='absolute -inset-1 rounded-full purple-gradient opacity-20 blur group-hover:opacity-40 transition-opacity'></div>
                                    <Avatar className="h-28 w-28 border-4 border-white relative">
                                        <AvatarImage
                                            src={user?.profile?.profilePhoto || `https://ui-avatars.com/api/?name=${user?.fullname}&background=6C5CE7&color=fff`}
                                            alt="profile"
                                        />
                                    </Avatar>
                                </div>
                                <h1 className='mt-5 font-extrabold text-2xl tracking-tight'>{user?.fullname}</h1>
                                <p className='text-sm text-muted-foreground font-medium max-w-[200px] mt-1'>
                                    {user?.profile?.bio || "No bio added yet"}
                                </p>
                                
                                <Button 
                                    onClick={() => setOpen(true)} 
                                    className="mt-6 w-full rounded-xl border-2 border-primary/10 hover:border-primary/30 hover:bg-primary/5 text-primary font-bold shadow-none transition-all" 
                                    variant="outline"
                                >
                                    <Pen size={16} className='mr-2' />
                                    Edit Profile
                                </Button>
                            </div>

                            <div className='mt-8 pt-8 border-t border-border/50 space-y-4 text-left'>
                                <div className='flex items-center gap-3 text-muted-foreground'>
                                    <div className='p-2 bg-secondary/50 rounded-lg'>
                                        <Mail size={16} />
                                    </div>
                                    <span className="text-sm font-medium">{user?.email}</span>
                                </div>
                                <div className='flex items-center gap-3 text-muted-foreground'>
                                    <div className='p-2 bg-secondary/50 rounded-lg'>
                                        <Contact size={16} />
                                    </div>
                                    <span className="text-sm font-medium">{user?.phoneNumber || "Not provided"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Resume Section */}
                        <div className='bg-white rounded-[2.5rem] p-8 border border-border/50 shadow-sm'>
                            <div className='flex items-center gap-2 mb-6'>
                                <FileText size={20} className='text-primary' />
                                <h2 className='font-extrabold text-lg tracking-tight'>Resume</h2>
                            </div>
                            
                            {user?.profile?.resume ? (
                                <a
                                    href={user.profile.resume}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-border/50 hover:border-primary/20 hover:bg-primary/5 transition-all text-sm font-bold"
                                >
                                    <span className="text-foreground group-hover:text-primary">Download.pdf</span>
                                    <Globe size={16} className="text-muted-foreground group-hover:text-primary" />
                                </a>
                            ) : (
                                <div className='text-center py-4'>
                                    <p className='text-sm text-muted-foreground italic'>No resume uploaded</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Skills & History */}
                    <div className='lg:col-span-2 space-y-6'>
                        {/* Skills Section */}
                        <div className='bg-white rounded-[2.5rem] p-8 border border-border/50 shadow-sm'>
                            <div className='flex items-center gap-2 mb-6'>
                                <Award size={20} className='text-primary' />
                                <h2 className='font-extrabold text-lg tracking-tight'>Professional Skills</h2>
                            </div>
                            <div className='flex flex-wrap gap-2'>
                                {user?.profile?.skills?.length > 0 ? (
                                    user.profile.skills.map((item, index) => (
                                        <Badge 
                                            key={index} 
                                            className="px-4 py-2 rounded-xl bg-primary/5 text-primary border-primary/20 hover:bg-primary hover:text-white transition-colors cursor-default"
                                        >
                                            {item}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-muted-foreground text-sm italic">Add skills to get noticed</span>
                                )}
                            </div>
                        </div>

                        {/* Applied Jobs Section */}
                        <div className='bg-white rounded-[2.5rem] p-8 border border-border/50 shadow-sm'>
                            <div className='flex items-center gap-2 mb-8'>
                                <Briefcase size={20} className='text-primary' />
                                <h2 className='font-extrabold text-xl tracking-tight'>Job Application History</h2>
                            </div>
                            <AppliedJobTable />
                        </div>
                    </div>
                </motion.div>
            </div>
            <UpdateProfileDialog open={open} setOpen={setOpen} />
        </div>
    )
}

export default Profile