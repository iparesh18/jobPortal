import React from "react";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Briefcase, DollarSign } from "lucide-react";

const LatestJobCards = ({ job }) => {
  const navigate = useNavigate();

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
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/description/${job._id}`)}
      className="p-6 rounded-3xl bg-white border border-border/50 shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 group"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-tight">
            {job?.title}
          </h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground font-medium">
             <span className="text-primary/80">{job?.company?.name}</span>
             <span className="h-1 w-1 rounded-full bg-muted-foreground/30"></span>
             <span className="flex items-center gap-1"><MapPin size={12} /> {job?.company?.location}</span>
          </div>
        </div>
        <div className="h-10 w-10 rounded-xl bg-secondary/50 flex items-center justify-center border border-border/50 group-hover:bg-primary/10 transition-colors">
          <span className="text-primary font-bold">{job?.company?.name?.charAt(0)}</span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed">
          {job?.description}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none px-3 py-1 font-bold text-[10px] uppercase tracking-wider transition-colors">
          {job?.salary} LPA
        </Badge>
        <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none px-3 py-1 font-bold text-[10px] uppercase tracking-wider transition-colors">
          {job?.jobType}
        </Badge>
        <Badge className="bg-primary/5 text-primary hover:bg-primary/10 border-none px-3 py-1 font-bold text-[10px] uppercase tracking-wider transition-colors">
          {job?.position} Openings
        </Badge>
      </div>

      {cleanRequirements.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {cleanRequirements.slice(0, 4).map((req, idx) => (
            <Badge
              key={`${job?._id}-latest-req-${idx}`}
              className="bg-violet-50 text-violet-700 hover:bg-violet-100 border-none px-2.5 py-1 font-bold text-[10px] uppercase tracking-wider transition-colors"
            >
              {req}
            </Badge>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default LatestJobCards;

