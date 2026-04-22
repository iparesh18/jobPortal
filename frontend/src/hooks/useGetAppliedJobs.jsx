import { setAllAppliedJobs } from "@/redux/jobSlice";
import { APPLICATION_API_END_POINT } from "@/utils/constant";
import axios from "axios"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"

const useGetAppliedJobs = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((store) => store.auth);

    useEffect(()=>{
        const fetchAppliedJobs = async () => {
            if (!user) {
                dispatch(setAllAppliedJobs([]));
                return;
            }

            // Clear stale history immediately when switching accounts so the previous
            // user's applications never remain visible while the new request is in flight.
            dispatch(setAllAppliedJobs([]));

            try {
                const res = await axios.get(`${APPLICATION_API_END_POINT}/get`, {withCredentials:true});
                if(res.data.success){
                    dispatch(setAllAppliedJobs(res.data.application || []));
                }
            } catch (error) {
                // Always clear on error to avoid showing previous user's persisted history.
                dispatch(setAllAppliedJobs([]));
            }
        }
        fetchAppliedJobs();
    },[dispatch, user?._id])
};
export default useGetAppliedJobs;