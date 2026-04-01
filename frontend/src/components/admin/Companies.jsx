import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import CompaniesTable from './CompaniesTable'
import { useNavigate } from 'react-router-dom'
import useGetAllCompanies from '@/hooks/useGetAllCompanies'
import { useDispatch } from 'react-redux'
import { setSearchCompanyByText } from '@/redux/companySlice'
import { motion } from 'framer-motion'
import { Search, Plus, Building2 } from 'lucide-react'

const Companies = () => {
    useGetAllCompanies();
    const [input, setInput] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setSearchCompanyByText(input));
    }, [input, dispatch]);

    return (
        <div className="min-h-screen bg-[#F5F6FA]">
            <Navbar />
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className='max-w-7xl mx-auto px-6 py-12'
            >
                <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10'>
                    <div className='flex items-center gap-3'>
                        <div className='h-12 w-12 rounded-[1rem] purple-gradient flex items-center justify-center text-white shadow-lg'>
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h1 className='text-3xl font-extrabold tracking-tight'>Registered Companies</h1>
                            <p className='text-muted-foreground font-medium'>Manage and monitor your business profiles</p>
                        </div>
                    </div>
                    
                    <div className='flex items-center gap-3 w-full md:w-auto'>
                        <div className='relative flex-1 md:w-64 group'>
                            <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors' size={18} />
                            <Input
                                className="pl-10 h-11 rounded-xl bg-white border-border/50 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                placeholder="Search by name"
                                onChange={(e) => setInput(e.target.value)}
                            />
                        </div>
                        <Button 
                            onClick={() => navigate("/admin/companies/create")}
                            className="h-11 rounded-xl px-6 purple-gradient hover:purple-gradient-hover text-white font-bold shadow-md active:scale-95 transition-all gap-2"
                        >
                            <Plus size={18} />
                            <span>Add Company</span>
                        </Button>
                    </div>
                </div>
                
                <div className='bg-white rounded-[2rem] border border-border/50 shadow-sm overflow-hidden p-2'>
                    <CompaniesTable />
                </div>
            </motion.div>
        </div>
    )
}

export default Companies