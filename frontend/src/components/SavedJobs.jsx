import React, { useEffect } from "react";
import Navbar from "./shared/Navbar";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { MoreHorizontal, Eye, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setSavedJobs, removeSavedJob } from "@/redux/savedJobSlice";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "./shared/Breadcrumbs";
import { USER_API_END_POINT } from "@/utils/constant";


const SavedJobs = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { savedJobs } = useSelector((store) => store.savedJob);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const res = await axios.get(
          `${USER_API_END_POINT}/saved`,
          { withCredentials: true }
        );

        if (res.data.success) {
          dispatch(setSavedJobs(res.data.savedJobs));
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchSavedJobs();
  }, [dispatch]);

  const handleRemove = async (jobId) => {
    try {
      const res = await axios.delete(
        `${USER_API_END_POINT}/unsave/${jobId}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        dispatch(removeSavedJob(jobId));
        toast.success("Removed from saved jobs");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to remove job");
    }
  };

  return (
    <div>
      <Navbar />
      <Breadcrumbs />

      <div className="max-w-7xl mx-auto mt-10">
        <Table>
          <TableCaption>Your saved jobs list</TableCaption>

          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Saved Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {savedJobs?.map((job) => (
              <TableRow key={job._id}>
           

                {/* COMPANY NAME */}
                <TableCell>{job?.company?.name}</TableCell>

                {/* TITLE */}
                <TableCell>{job?.title}</TableCell>

                {/* LOCATION */}
                <TableCell>{job?.location}</TableCell>

                {/* DATE */}
                <TableCell>
                  {job?.createdAt?.split("T")[0]}
                </TableCell>

                {/* ACTION POPOVER */}
                <TableCell className="text-right cursor-pointer">
                  <Popover>
                    <PopoverTrigger>
                      <MoreHorizontal className="w-5" />
                    </PopoverTrigger>

                    <PopoverContent className="w-32">
                      <div
                        onClick={() =>
                          navigate(`/description/${job._id}`)
                        }
                        className="flex items-center gap-2 w-fit cursor-pointer mb-2"
                      >
                        <Eye className="w-4" />
                        <span>View</span>
                      </div>

                      <div
                        onClick={() => handleRemove(job._id)}
                        className="flex items-center gap-2 w-fit cursor-pointer text-red-600"
                      >
                        <Trash2 className="w-4" />
                        <span>Remove</span>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {savedJobs.length === 0 && (
          <div className="text-center mt-10 text-gray-500">
            No saved jobs found.
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;