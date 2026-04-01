import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Briefcase, Building2, Clock, CheckCircle2, XCircle } from "lucide-react";

const AppliedJobTable = () => {
  const { allAppliedJobs } = useSelector((store) => store.job);

  return (
    <div className="w-full">
      <Table>
        <TableHeader className="bg-secondary/30">
          <TableRow className="hover:bg-transparent border-none">
            <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground pl-6">Date</TableHead>
            <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Job Role</TableHead>
            <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Company</TableHead>
            <TableHead className="text-right font-bold text-xs uppercase tracking-wider text-muted-foreground pr-6">Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <AnimatePresence mode='popLayout'>
            {allAppliedJobs?.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="h-40 text-center text-muted-foreground font-medium bg-white">
                        <div className="flex flex-col items-center justify-center gap-2">
                            <Clock size={32} className="opacity-20" />
                            <span>You haven't applied for any jobs yet.</span>
                        </div>
                    </TableCell>
                </TableRow>
            ) : (
                allAppliedJobs?.map((appliedJob, index) => {
                const status = appliedJob?.status?.toLowerCase() || "pending";

                return (
                    <motion.tr 
                        key={appliedJob._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group hover:bg-secondary/20 transition-colors border-b border-border/40 last:border-none"
                    >
                        <TableCell className="pl-6 py-4">
                            <div className='flex items-center gap-2 text-muted-foreground font-medium'>
                                <Calendar size={14} className='text-primary/60' />
                                {appliedJob?.createdAt?.split("T")[0]}
                            </div>
                        </TableCell>

                        <TableCell className="font-bold text-foreground/90">
                            <div className='flex items-center gap-2'>
                                <Briefcase size={14} className='text-primary/60' />
                                {appliedJob?.job?.title || "N/A"}
                            </div>
                        </TableCell>

                        <TableCell>
                            <div className='flex items-center gap-2 font-medium text-muted-foreground'>
                                <Building2 size={14} className='text-primary/60' />
                                {appliedJob?.job?.company?.name || "N/A"}
                            </div>
                        </TableCell>

                        <TableCell className="text-right pr-6">
                            <Badge
                                className={`capitalize px-3 py-1 rounded-full font-bold text-[10px] tracking-widest border-none
                                    ${status === "rejected" ? "bg-red-100 text-red-600" : 
                                      status === "pending" ? "bg-amber-100 text-amber-600" : 
                                      "bg-emerald-100 text-emerald-600"}`}
                            >
                                <div className="flex items-center gap-1">
                                    {status === "rejected" && <XCircle size={10} />}
                                    {status === "pending" && <Clock size={10} />}
                                    {status === "accepted" && <CheckCircle2 size={10} />}
                                    {status}
                                </div>
                            </Badge>
                        </TableCell>
                    </motion.tr>
                );
                })
            )}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
};

export default AppliedJobTable;