import React, { useEffect, useState } from 'react'
import Navbar from './shared/Navbar'
import FilterCard from './FilterCard'
import Job from './Job';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import Breadcrumbs from "./shared/Breadcrumbs";
import { SearchIcon, Briefcase } from 'lucide-react';
import { Button } from './ui/button';

const Jobs = () => {
    const [page, setPage] = useState(1);
    const { loading, pagination } = useGetAllJobs({ page, limit: 10 });
    const { allJobs, searchedQuery } = useSelector(store => store.job);
    const [filterJobs, setFilterJobs] = useState(allJobs);

    useEffect(() => {
        setPage(1);
    }, [searchedQuery]);

    useEffect(() => {
        if (!searchedQuery || Object.keys(searchedQuery).length === 0) {
            setFilterJobs(allJobs)
            return
        }

        const filteredJobs = allJobs.filter((job) => {
            const locationMatch = !searchedQuery[0] || job.location.toLowerCase() === searchedQuery[0].toLowerCase()
            const industryMatch = !searchedQuery[1] || job.title.toLowerCase().includes(searchedQuery[1].toLowerCase())
            let salaryMatch = true
            if (searchedQuery[2]) {
                const { min, max } = searchedQuery[2]
                salaryMatch = job.salary >= min && job.salary <= max
            }
            return locationMatch && industryMatch && salaryMatch
        })
        setFilterJobs(filteredJobs)
    }, [allJobs, searchedQuery])

    const totalPages = Math.max(1, pagination?.totalPages || 1);

    const getVisiblePages = (currentPage, pages, maxButtons = 5) => {
        if (pages <= maxButtons) {
            return Array.from({ length: pages }, (_, idx) => idx + 1);
        }

        const half = Math.floor(maxButtons / 2);
        let start = Math.max(1, currentPage - half);
        let end = Math.min(pages, start + maxButtons - 1);

        if (end - start + 1 < maxButtons) {
            start = Math.max(1, end - maxButtons + 1);
        }

        return Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
    };

    const visiblePages = getVisiblePages(page, totalPages);

    return (
        <div className="min-h-screen bg-[#F5F6FA]">
            <Navbar />
            <div className='max-w-7xl mx-auto px-6 py-8'>
                <Breadcrumbs />
                
                <div className='flex flex-col md:flex-row gap-8 mt-8'>
                    {/* Sidebar / Filters */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className='w-full md:w-80 flex-shrink-0'
                    >
                        <FilterCard />
                    </motion.div>

                    {/* Main Content / Job Listings */}
                    <div className='flex-1'>
                        <div className='flex items-center justify-between mb-6'>
                            <div className='flex items-center gap-3'>
                                <div className='p-2 bg-primary/10 text-primary rounded-xl'>
                                    <Briefcase size={20} />
                                </div>
                                <div>
                                    <h2 className='text-2xl font-extrabold tracking-tight'>Available Jobs</h2>
                                    <p className='text-sm text-muted-foreground font-medium'>
                                        Showing <span className='text-primary font-bold'>{filterJobs.length}</span> positions on this page
                                    </p>
                                </div>
                            </div>
                        </div>

                        <AnimatePresence mode='popLayout'>
                            {filterJobs.length <= 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className='flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-border/50 shadow-sm'
                                >
                                    <div className='h-20 w-20 bg-secondary/50 rounded-full flex items-center justify-center mb-4 text-muted-foreground'>
                                        <SearchIcon size={32} />
                                    </div>
                                    <h3 className='text-xl font-bold'>No results found</h3>
                                    <p className='text-muted-foreground text-center mt-1 max-w-xs'>
                                        Try adjusting your filters or search terms to find what you're looking for.
                                    </p>
                                </motion.div>
                            ) : (
                                <div className='h-[calc(100vh-280px)] overflow-y-auto pr-2 custom-scrollbar'>
                                    <div className='grid grid-cols-1 xl:grid-cols-2 gap-6 pb-10'>
                                        {filterJobs.map((job, index) => (
                                            <motion.div
                                                key={job?._id}
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                            >
                                                <Job job={job} />
                                            </motion.div>
                                        ))}
                                    </div>

                                    <div className='flex items-center justify-center gap-3 pb-4'>
                                        <Button
                                            variant='outline'
                                            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                            disabled={page <= 1 || loading}
                                        >
                                            Previous
                                        </Button>

                                        <div className='flex items-center gap-2'>
                                            {visiblePages.map((pageNumber) => (
                                                <Button
                                                    key={pageNumber}
                                                    variant={pageNumber === page ? 'default' : 'outline'}
                                                    onClick={() => setPage(pageNumber)}
                                                    disabled={loading}
                                                    className='h-9 min-w-9 px-3'
                                                >
                                                    {pageNumber}
                                                </Button>
                                            ))}
                                        </div>

                                        <Button
                                            variant='outline'
                                            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                                            disabled={page >= totalPages || loading}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )
                            }
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Jobs