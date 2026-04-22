import React from "react";
import { Button } from "./ui/button";
import { Bookmark, MapPin, Briefcase, DollarSign, ArrowRight } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { addSavedJob, removeSavedJob } from "@/redux/savedJobSlice";
import { motion } from "framer-motion";
import { USER_API_END_POINT } from "@/utils/constant";

const Job = ({ job }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { savedJobs } = useSelector((store) => store.savedJob);

    const isSaved = savedJobs.some(
        (saved) => saved._id === job._id
    );

    const handleSaveToggle = async (e) => {
        e.stopPropagation();
        try {
            if (isSaved) {
                const res = await axios.delete(
                    `${USER_API_END_POINT}/unsave/${job._id}`,
                    { withCredentials: true }
                );

                if (res.data.success) {
                    dispatch(removeSavedJob(job._id));
                    toast.success("Removed from saved jobs");
                }
            } else {
                const res = await axios.post(
                    `${USER_API_END_POINT}/save/${job._id}`,
                    {},
                    { withCredentials: true }
                );

                if (res.data.success) {
                    dispatch(addSavedJob(job));
                    toast.success("Job saved successfully");
                }
            }
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        }
    };

    const daysAgoFunction = (mongodbTime) => {
        const createdAt = new Date(mongodbTime);
        const currentTime = new Date();
        const timeDifference = currentTime - createdAt;
        return Math.floor(timeDifference / (1000 * 24 * 60 * 60));
    };

    const requirementsList = Array.isArray(job?.requirements)
        ? job.requirements
        : typeof job?.requirements === "string"
            ? job.requirements.split(/,|\n/)
            : [];

    const cleanRequirements = requirementsList
        .map((req) => String(req || "").trim())
        .filter(Boolean);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="group relative bg-white rounded-3xl border border-border/50 p-6 shadow-sm hover:shadow-xl transition-all duration-300"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-secondary/50 flex items-center justify-center border border-border/50 overflow-hidden group-hover:scale-110 transition-transform duration-300">
                        <Avatar className="h-full w-full rounded-none">
                            <AvatarImage src={job?.company?.logo} className="object-contain p-2" />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                {job?.company?.name?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <div>
                        <h2 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">
                            {job?.title}
                        </h2>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            {job?.company?.name}
                            <span className="h-1 w-1 rounded-full bg-muted-foreground/30 mx-1"></span>
                            {job?.company?.location}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSaveToggle}
                    className={`h-10 w-10 flex items-center justify-center rounded-xl transition-all ${
                        isSaved ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground hover:bg-primary/5 hover:text-primary'
                    }`}
                >
                    <Bookmark size={20} className={isSaved ? "fill-primary" : ""} />
                </button>
            </div>

            <div className="space-y-4">
                <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed h-10">
                    {job?.description}
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold ring-1 ring-emerald-200">
                        <DollarSign size={14} />
                        {job?.salary} LPA
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold ring-1 ring-blue-200">
                        <Briefcase size={14} />
                        {job?.jobType}
                    </div>
                     <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/5 text-primary text-xs font-bold ring-1 ring-primary/20 leading-none">
                        {job?.position} Openings
                    </div>
                </div>

                {cleanRequirements.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                        {cleanRequirements.slice(0, 4).map((req, idx) => (
                            <Badge
                                key={`${job?._id}-req-${idx}`}
                                className="bg-violet-50 text-violet-700 hover:bg-violet-100 border-none px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                            >
                                {req}
                            </Badge>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between pt-4 mt-2 border-t border-border/40">
                    <div className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        {daysAgoFunction(job?.createdAt) === 0 ? "Posted Today" : `${daysAgoFunction(job?.createdAt)}d ago`}
                    </div>
                    <Button 
                        onClick={() => navigate(`/description/${job?._id}`)}
                        variant="ghost" 
                        size="sm"
                        className="group/btn h-9 px-4 rounded-lg text-primary font-bold hover:bg-primary/10"
                    >
                        View Details
                        <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

export default Job;