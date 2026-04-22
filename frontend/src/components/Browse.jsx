import React, { useEffect, useState } from 'react'
import Navbar from './shared/Navbar'
import Job from './Job';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import Breadcrumbs from "./shared/Breadcrumbs";
import { Button } from './ui/button';


// const randomJobs = [1, 2,45];

const Browse = () => {
    const [page, setPage] = useState(1);
    const { pagination, loading } = useGetAllJobs({ page, limit: 9 });
    const { allJobs } = useSelector(store=>store.job);
    const dispatch = useDispatch();
    useEffect(()=>{
        return ()=>{
            dispatch(setSearchedQuery(""));
        }
    },[dispatch])

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
        <div>
            <Navbar />
            <Breadcrumbs />
            <div className='max-w-7xl mx-auto my-10'>
                <h1 className='font-bold text-xl my-10'>Search Results ({pagination?.total ?? allJobs.length})</h1>
                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
                    {
                        allJobs.map((job) => {
                            return (
                                <Job key={job._id} job={job}/>
                            )
                        })
                    }
                </div>

                <div className='flex items-center justify-center gap-3 mt-8'>
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
        </div>
    )
}

export default Browse