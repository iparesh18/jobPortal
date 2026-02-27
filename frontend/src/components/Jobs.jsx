import React, { useEffect, useState } from 'react'
import Navbar from './shared/Navbar'
import FilterCard from './FilterCard'
import Job from './Job';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import Breadcrumbs from "./shared/Breadcrumbs";



const Jobs = () => {
   useGetAllJobs();
    const { allJobs, searchedQuery } = useSelector(store => store.job);
    const [filterJobs, setFilterJobs] = useState(allJobs);

    useEffect(() => {

        if (!searchedQuery || Object.keys(searchedQuery).length === 0) {
            setFilterJobs(allJobs)
            return
        }

        const filteredJobs = allJobs.filter((job) => {

            // LOCATION FILTER
            const locationMatch =
                !searchedQuery[0] ||
                job.location.toLowerCase() === searchedQuery[0].toLowerCase()

            // INDUSTRY FILTER
            const industryMatch =
                !searchedQuery[1] ||
                job.title.toLowerCase().includes(searchedQuery[1].toLowerCase())

            // SALARY FILTER (LPA BASED)
            let salaryMatch = true

            if (searchedQuery[2]) {
                const { min, max } = searchedQuery[2]

                salaryMatch =
                    job.salary >= min &&
                    job.salary <= max
            }

            return locationMatch && industryMatch && salaryMatch

        })

        setFilterJobs(filteredJobs)

    }, [allJobs, searchedQuery])

    return (
        <div>
            <Navbar />
            <Breadcrumbs />
            <div className='max-w-7xl mx-auto mt-5'>
                <div className='flex gap-5'>
                    <div className='w-20%'>
                        <FilterCard />
                    </div>

                    {
                        filterJobs.length <= 0 ? (
                            <span>Job not found</span>
                        ) : (
                            <div className='flex-1 h-[88vh] overflow-y-auto pb-5'>
                                <div className='grid grid-cols-3 gap-4'>
                                    {
                                        filterJobs.map((job) => (
                                            <motion.div
                                                initial={{ opacity: 0, x: 100 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -100 }}
                                                transition={{ duration: 0.3 }}
                                                key={job?._id}
                                            >
                                                <Job job={job} />
                                            </motion.div>
                                        ))
                                    }
                                </div>
                            </div>
                        )
                    }

                </div>
            </div>
        </div>
    )
}

export default Jobs