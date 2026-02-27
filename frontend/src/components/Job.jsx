import React from "react";
import { Button } from "./ui/button";
import { Bookmark } from "lucide-react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { addSavedJob, removeSavedJob } from "@/redux/savedJobSlice";

const Job = ({ job }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { savedJobs } = useSelector((store) => store.savedJob);

    const isSaved = savedJobs.some(
        (saved) => saved._id === job._id
    );

    const handleSaveToggle = async () => {
        try {
            if (isSaved) {
                const res = await axios.delete(
                    `http://localhost:8000/api/v1/user/unsave/${job._id}`,
                    { withCredentials: true }
                );

                if (res.data.success) {
                    dispatch(removeSavedJob(job._id));
                    toast.success("Removed from saved jobs");
                }
            } else {
                const res = await axios.post(
                    `http://localhost:8000/api/v1/user/save/${job._id}`,
                    {},
                    { withCredentials: true }
                );

                if (res.data.success) {
                    dispatch(addSavedJob(job));
                    toast.success("Job saved successfully");
                }
            }
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        }
    };

    const daysAgoFunction = (mongodbTime) => {
        const createdAt = new Date(mongodbTime);
        const currentTime = new Date();
        const timeDifference = currentTime - createdAt;
        return Math.floor(timeDifference / (1000 * 24 * 60 * 60));
    };

    return (
        <div className="p-5 rounded-md shadow-xl bg-white border border-gray-100">
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    {daysAgoFunction(job?.createdAt) === 0
                        ? "Today"
                        : `${daysAgoFunction(job?.createdAt)} days ago`}
                </p>

                <Button
                    variant="outline"
                    className="rounded-full"
                    size="icon"
                    onClick={handleSaveToggle}
                >
                    <Bookmark
                        className={
                            isSaved
                                ? "fill-black text-black"
                                : ""
                        }
                    />
                </Button>
            </div>

            <div className="flex items-center gap-2 my-2">
                <Button className="p-6" variant="outline" size="icon">
                    <Avatar>
                        <AvatarImage src={job?.company?.logo} />
                    </Avatar>
                </Button>
                <div>
                    <h1 className="font-medium text-lg">
                        {job?.company?.name}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {job?.company?.location}
                    </p>
                </div>
            </div>

            <div>
                <h1 className="font-bold text-lg my-2">
                    {job?.title}
                </h1>
                <p className="text-sm text-gray-600">
                    {job?.description}
                </p>
            </div>

            <div className="flex items-center gap-2 mt-4">
                <Badge className="text-blue-700 font-bold" variant="ghost">
                    {job?.position} Positions
                </Badge>
                <Badge className="text-[#F83002] font-bold" variant="ghost">
                    {job?.jobType}
                </Badge>
                <Badge className="text-[#7209b7] font-bold" variant="ghost">
                    {job?.salary} LPA
                </Badge>
            </div>

            <div className="flex items-center gap-4 mt-4">
                <Button
                    onClick={() =>
                        navigate(`/description/${job?._id}`)
                    }
                    variant="outline"
                >
                    Details
                </Button>

                <Button
                    onClick={handleSaveToggle}
                    className={isSaved ? "bg-gray-600" : "bg-[#7209b7]"}
                >
                    {isSaved ? "Saved" : "Save For Later"}
                </Button>
            </div>
        </div>
    );
};

export default Job;