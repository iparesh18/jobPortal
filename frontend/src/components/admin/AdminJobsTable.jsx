import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Edit2, Eye, MoreHorizontal, Calendar, Building2, Users, ArrowUpRight } from 'lucide-react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const AdminJobsTable = () => {
    const { allAdminJobs, searchJobByText } = useSelector(store => store.job)
    const [filterJobs, setFilterJobs] = useState(allAdminJobs)
    const navigate = useNavigate()

    useEffect(() => {
        const filteredJobs = allAdminJobs.filter((job) => {
            if (!searchJobByText) return true
            return (
                job?.title?.toLowerCase().includes(searchJobByText.toLowerCase()) ||
                job?.company?.name?.toLowerCase().includes(searchJobByText.toLowerCase())
            )
        })
        setFilterJobs(filteredJobs)
    }, [allAdminJobs, searchJobByText])

    return (
        <div className="w-full">
            <Table>
                <TableHeader className="bg-secondary/30">
                    <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground pl-6">Company</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Role / Position</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Date Posted</TableHead>
                        <TableHead className="text-right font-bold text-xs uppercase tracking-wider text-muted-foreground pr-6">Action</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    <AnimatePresence mode='popLayout'>
                        {filterJobs?.length <= 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground font-medium">
                                    No jobs found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filterJobs?.map((job, index) => (
                                <motion.tr 
                                    key={job._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group hover:bg-secondary/20 transition-colors border-b border-border/40 last:border-none"
                                >
                                    <TableCell className="pl-6 py-4">
                                        <div className='flex items-center gap-2 font-bold text-foreground/90'>
                                            <Building2 size={16} className='text-primary/60' />
                                            {job?.company?.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-foreground/80">
                                        {job?.title}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground font-medium">
                                        <div className='flex items-center gap-2'>
                                            <Calendar size={14} className='text-primary/60' />
                                            {job?.createdAt.split("T")[0]}
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-right pr-6">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-border/50 shadow-none hover:shadow-sm">
                                                    <MoreHorizontal className='text-muted-foreground' size={18} />
                                                </button>
                                            </PopoverTrigger>

                                            <PopoverContent className="w-48 p-2 rounded-xl shadow-xl border-border/50" align="end">
                                                <div className="space-y-1">
                                                    <button 
                                                        onClick={() => navigate(`/admin/jobs/${job._id}`)} 
                                                        className='flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-primary/5 text-sm font-bold text-muted-foreground hover:text-primary transition-all group/item'
                                                    >
                                                        <Edit2 size={16} />
                                                        <span>Edit Job</span>
                                                        <ArrowUpRight size={14} className="ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                                    </button>
                                                    <button 
                                                        onClick={() => navigate(`/admin/jobs/${job._id}/applicants`)} 
                                                        className='flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-primary/5 text-sm font-bold text-muted-foreground hover:text-primary transition-all group/item'
                                                    >
                                                        <Users size={16} />
                                                        <span>View Applicants</span>
                                                        <ArrowUpRight size={14} className="ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                                    </button>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </TableCell>
                                </motion.tr>
                            ))
                        )}
                    </AnimatePresence>
                </TableBody>
            </Table>
        </div>
    )
}

export default AdminJobsTable