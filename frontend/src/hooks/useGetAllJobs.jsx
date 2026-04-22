import { setAllJobs } from '@/redux/jobSlice'
import { JOB_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const useGetAllJobs = ({ page = 1, limit = 20 } = {}) => {
    const dispatch = useDispatch();
    const { searchedQuery } = useSelector(store => store.job);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit,
        total: 0,
        totalPages: 1,
    });

    useEffect(() => {
        const fetchAllJobs = async () => {
            try {
                setLoading(true);
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

                params.page = page;
                params.limit = limit;

                const res = await axios.get(`${JOB_API_END_POINT}/get`, {
                    params,
                    withCredentials: true,
                });

                if (res.data.success) {
                    dispatch(setAllJobs(res.data.jobs));
                    setPagination(
                        res.data.pagination || {
                            page,
                            limit,
                            total: res.data.jobs?.length || 0,
                            totalPages: 1,
                        }
                    );
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllJobs();
    }, [dispatch, searchedQuery, page, limit]);

    return { loading, pagination };
};

export default useGetAllJobs