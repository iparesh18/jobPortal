import { setAllJobs } from '@/redux/jobSlice'
import { JOB_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const useGetAllJobs = () => {
    const dispatch = useDispatch();
    const { searchedQuery } = useSelector(store => store.job);

    useEffect(() => {
        const fetchAllJobs = async () => {
            try {
                const params = {};

                if (typeof searchedQuery === "string" && searchedQuery.trim()) {
                    params.keyword = searchedQuery.trim();
                }

                if (searchedQuery && typeof searchedQuery === "object") {
                    if (searchedQuery[0]) params.location = searchedQuery[0];
                    if (searchedQuery[1]) params.industry = searchedQuery[1];
                    if (searchedQuery[2]?.min !== undefined) params.minSalary = searchedQuery[2].min;
                    if (searchedQuery[2]?.max !== undefined) params.maxSalary = searchedQuery[2].max;
                }

                const res = await axios.get(`${JOB_API_END_POINT}/get`, {
                    params,
                    withCredentials: true,
                });

                if (res.data.success) {
                    dispatch(setAllJobs(res.data.jobs));
                }
            } catch (error) {
                console.log(error);
            }
        };

        fetchAllJobs();
    }, [dispatch, searchedQuery]);
};

export default useGetAllJobs