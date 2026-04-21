import React, { useEffect, useState } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant';
import { setSingleJob } from '@/redux/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import Navbar from './shared/Navbar';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, DollarSign, Users, Calendar, Award, Building2, CheckCircle2 } from 'lucide-react';

const JobDescription = () => {
    const { singleJob } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    const isIntiallyApplied = singleJob?.applications?.some(application => application.applicant === user?._id) || false;
    const [isApplied, setIsApplied] = useState(isIntiallyApplied);

    const params = useParams();
    const jobId = params.id;
    const dispatch = useDispatch();

    const requirementsList = Array.isArray(singleJob?.requirements)
        ? singleJob.requirements
        : typeof singleJob?.requirements === "string"
            ? singleJob.requirements.split(/,|\n/)
            : [];

    const cleanRequirements = requirementsList
        .map((req) => String(req || "").trim())
        .filter(Boolean);

    const applyJobHandler = async () => {
        try {
            const res = await axios.get(`${APPLICATION_API_END_POINT}/apply/${jobId}`, { withCredentials: true });
            if (res.data.success) {
                setIsApplied(true);
                const updatedSingleJob = { ...singleJob, applications: [...singleJob.applications, { applicant: user?._id }] }
                dispatch(setSingleJob(updatedSingleJob));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Application failed");
        }
    }

    useEffect(() => {
        const fetchSingleJob = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setSingleJob(res.data.job));
                    setIsApplied(res.data.job.applications.some(application => application.applicant === user?._id))
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchSingleJob();
    }, [jobId, dispatch, user?._id]);

    return (
        <div className="min-h-screen bg-[#F5F6FA]">
            <Navbar />
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className='max-w-5xl mx-auto px-6 py-12'
            >
                <div className="bg-white rounded-[2.5rem] border border-border/50 shadow-sm overflow-hidden mb-8">
                    <div className="h-48 purple-gradient relative p-8 md:p-12 flex items-end">
                        <div className="absolute top-0 left-0 w-full h-full bg-black/10"></div>
                        <div className="relative flex flex-col md:flex-row md:items-end justify-between w-full gap-6">
                            <div className="flex items-center gap-6">
                                <div className="h-20 w-20 md:h-24 md:w-24 rounded-2xl bg-white p-3 shadow-xl flex items-center justify-center border border-white/20">
                                    <Building2 className="text-primary" size={48} />
                                </div>
                                <div className="text-white">
                                    <h1 className='text-3xl md:text-4xl font-extrabold tracking-tight mb-2'>{singleJob?.title}</h1>
                                    <div className="flex flex-wrap items-center gap-4 text-white/80 font-medium">
                                        <div className="flex items-center gap-1.5 backdrop-blur-md bg-white/10 px-3 py-1 rounded-full border border-white/10">
                                            <Building2 size={16} />
                                            <span>{singleJob?.company?.name || "Premium Company"}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 backdrop-blur-md bg-white/10 px-3 py-1 rounded-full border border-white/10">
                                            <MapPin size={16} />
                                            <span>{singleJob?.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <Button
                                onClick={isApplied ? null : applyJobHandler}
                                disabled={isApplied}
                                className={`h-14 px-10 rounded-2xl font-bold shadow-xl transition-all active:scale-95 ${isApplied ? 'bg-white/20 backdrop-blur-md text-white cursor-not-allowed border border-white/20' : 'bg-white text-primary hover:bg-white/90 shadow-primary/20'}`}
                            >
                                {isApplied ? (
                                    <span className="flex items-center gap-2">
                                        <CheckCircle2 size={20} />
                                        Application Submitted
                                    </span>
                                ) : 'Apply Now'}
                            </Button>
                        </div>
                    </div>

                    <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-10">
                            <div>
                                <h3 className="text-xl font-extrabold tracking-tight mb-6 flex items-center gap-2">
                                    <span className="h-6 w-1 rounded-full bg-primary inline-block"></span>
                                    Job Description
                                </h3>
                                <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-line">
                                    {singleJob?.description}
                                </p>
                            </div>
                            
                            <div>
                                <h3 className="text-xl font-extrabold tracking-tight mb-6 flex items-center gap-2">
                                    <span className="h-6 w-1 rounded-full bg-primary inline-block"></span>
                                    Key Requirements
                                </h3>
                                {cleanRequirements.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {cleanRequirements.map((req, idx) => (
                                            <Badge
                                                key={`${singleJob?._id}-desc-req-${idx}`}
                                                className="bg-violet-50 text-violet-700 hover:bg-violet-100 border-none px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider"
                                            >
                                                {req}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground mb-6">No specific requirements listed for this job.</p>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-secondary/30 border border-border/40">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white shadow-sm text-primary">
                                            <Award size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Experience</p>
                                            <p className="font-bold">{singleJob?.experienceLevel} Years Minimum</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-secondary/30 border border-border/40">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white shadow-sm text-primary">
                                            <Briefcase size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Type</p>
                                            <p className="font-bold">{singleJob?.jobType}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-secondary/20 rounded-3xl p-8 border border-border/30">
                                <h3 className="text-lg font-extrabold tracking-tight mb-6">Job Summary</h3>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center py-4 border-b border-border/50">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <DollarSign size={18} />
                                            <span className="text-sm font-medium">Monthly Salary</span>
                                        </div>
                                        <span className="font-bold text-primary">{singleJob?.salary} LPA</span>
                                    </div>
                                    <div className="flex justify-between items-center py-4 border-b border-border/50">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Users size={18} />
                                            <span className="text-sm font-medium">Total Applicants</span>
                                        </div>
                                        <span className="font-bold">{singleJob?.applications?.length} Candidates</span>
                                    </div>
                                    <div className="flex justify-between items-center py-4 border-b border-border/50">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar size={18} />
                                            <span className="text-sm font-medium">Posted Date</span>
                                        </div>
                                        <span className="font-bold">{singleJob?.createdAt.split("T")[0]}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-4">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Briefcase size={18} />
                                            <span className="text-sm font-medium">Total Positions</span>
                                        </div>
                                        <Badge className="bg-primary/10 text-primary border-none rounded-lg px-3 hover:bg-primary/10">{singleJob?.position} Openings</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default JobDescription