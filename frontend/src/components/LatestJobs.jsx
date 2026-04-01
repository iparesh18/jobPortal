import React from 'react'
import LatestJobCards from './LatestJobCards';
import { useSelector } from 'react-redux'; 
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const LatestJobs = () => {
    const { allJobs } = useSelector(store => store.job);
   
    return (
        <div className='max-w-7xl mx-auto my-32 px-6'>
            <div className='flex items-end justify-between mb-10'>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                >
                    <h1 className='text-4xl md:text-5xl font-extrabold tracking-tight'>
                        Featured <span className='text-primary underline decoration-primary/20 underline-offset-8'>Opportunities</span>
                    </h1>
                    <p className='text-muted-foreground mt-3 text-lg font-medium'>Discover recently posted positions from world-class companies</p>
                </motion.div>
                
                <Link to="/jobs">
                    <motion.button
                        whileHover={{ x: 5 }}
                        className='hidden md:flex items-center gap-2 text-primary font-bold hover:underline underline-offset-4'
                    >
                        View all jobs
                        <ArrowRight size={20} />
                    </motion.button>
                </Link>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                {
                    allJobs.length <= 0 ? (
                        <div className='col-span-full py-20 text-center bg-secondary/30 rounded-[2rem] border border-dashed border-border/50'>
                            <h3 className='text-xl font-bold text-muted-foreground'>No Job Postings Available</h3>
                            <p className='text-sm text-muted-foreground/60 mt-1'>Check back later for new opportunities!</p>
                        </div>
                    ) : (
                        allJobs?.slice(0, 6).map((job, index) => (
                            <motion.div
                                key={job._id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <LatestJobCards job={job} />
                            </motion.div>
                        ))
                    )
                }
            </div>
            
            <div className='mt-12 text-center md:hidden'>
                <Link to="/jobs">
                    <button className='px-8 py-3 rounded-xl border border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all'>
                        Browse All Jobs
                    </button>
                </Link>
            </div>
        </div>
    )
}

export default LatestJobs