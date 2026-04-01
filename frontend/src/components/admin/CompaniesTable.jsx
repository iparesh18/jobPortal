import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Avatar, AvatarImage } from '../ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Edit2, MoreHorizontal, Calendar, ArrowUpRight } from 'lucide-react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const CompaniesTable = () => {
    const { companies, searchCompanyByText } = useSelector(store => store.company);
    const [filterCompany, setFilterCompany] = useState(companies);
    const navigate = useNavigate();

    useEffect(() => {
        const filteredCompany = companies.filter((company) => {
            if (!searchCompanyByText) return true;
            return company?.name?.toLowerCase().includes(searchCompanyByText.toLowerCase());
        });
        setFilterCompany(filteredCompany);
    }, [companies, searchCompanyByText])

    return (
        <div className="w-full">
            <Table>
                <TableHeader className="bg-secondary/30">
                    <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="w-[100px] font-bold text-xs uppercase tracking-wider text-muted-foreground pl-6">Logo</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Company Name</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Founded Date</TableHead>
                        <TableHead className="text-right font-bold text-xs uppercase tracking-wider text-muted-foreground pr-6">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <AnimatePresence mode='popLayout'>
                        {filterCompany?.length <= 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground font-medium">
                                    No companies found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filterCompany?.map((company, index) => (
                                <motion.tr 
                                    key={company._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group hover:bg-secondary/20 transition-colors border-b border-border/40 last:border-none"
                                >
                                    <TableCell className="pl-6 py-4">
                                        <div className="h-10 w-10 rounded-xl overflow-hidden border border-border/50 bg-white shadow-sm ring-2 ring-transparent group-hover:ring-primary/10 transition-all">
                                            <Avatar className="h-full w-full rounded-none">
                                                <AvatarImage src={company.logo} className="object-contain p-1" />
                                            </Avatar>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold text-foreground/90">
                                        {company.name}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground font-medium">
                                        <div className='flex items-center gap-2'>
                                            <Calendar size={14} className='text-primary/60' />
                                            {company.createdAt.split("T")[0]}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-border/50 shadow-none hover:shadow-sm">
                                                    <MoreHorizontal className='text-muted-foreground' size={18} />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-40 p-2 rounded-xl shadow-xl border-border/50" align="end">
                                                <button 
                                                    onClick={() => navigate(`/admin/companies/${company._id}`)} 
                                                    className='flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-primary/5 text-sm font-bold text-muted-foreground hover:text-primary transition-all group/item'
                                                >
                                                    <Edit2 size={16} />
                                                    <span>Edit Profile</span>
                                                    <ArrowUpRight size={14} className="ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                                </button>
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

export default CompaniesTable