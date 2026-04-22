import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { JOB_API_END_POINT } from "@/utils/constant";

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    requirements: "",
    salary: "",
    location: "",
    jobType: "",
    experienceLevel: "",
    position: ""
  });

  // Fetch job
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`${JOB_API_END_POINT}/get/${id}`, {
          withCredentials: true
        });

        if (res.data.success) {
          const job = res.data.job;

          setJobData({
            title: job.title || "",
            description: job.description || "",
            requirements: job.requirements?.join(",") || "",
            salary: job.salary || "",
            location: job.location || "",
            jobType: job.jobType || "",
            experienceLevel: job.experienceLevel || "",
            position: job.position || ""
          });
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch job");
      }
    };

    fetchJob();
  }, [id]);

  const handleChange = (e) => {
    setJobData({
      ...jobData,
      [e.target.name]: e.target.value
    });
  };

  // Update Job
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `${JOB_API_END_POINT}/update/${id}`,
        jobData,
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Job updated successfully 🚀");
        navigate("/admin/jobs");
      }
    } catch (error) {
      console.log(error);
      toast.error("Update failed ❌");
    }
  };

  // Delete Job
  const handleDelete = async () => {
    try {
      const res = await axios.delete(
        `${JOB_API_END_POINT}/delete/${id}`, {
          withCredentials: true
        }
      );

      if (res.data.success) {
        toast.success("Job deleted successfully 🗑");
        navigate("/admin/jobs");
      }
    } catch (error) {
      console.log(error);
      toast.error("Delete failed ❌");
    }
  };

  return (
    <div>
      <Navbar />

      <div className="max-w-4xl mx-auto">
        <div className="my-10">
          <h1 className="font-bold text-2xl">Update Job</h1>
          <p className="text-gray-500">
            Edit your job details below. You can update or delete the job.
          </p>
        </div>

        <form onSubmit={handleUpdate}>

          <Label>Job Title</Label>
          <Input
            name="title"
            value={jobData.title}
            onChange={handleChange}
            className="my-2"
          />

          <Label>Location</Label>
          <Input
            name="location"
            value={jobData.location}
            onChange={handleChange}
            className="my-2"
          />

          <Label>Salary (LPA)</Label>
          <Input
            type="number"
            name="salary"
            value={jobData.salary}
            onChange={handleChange}
            className="my-2"
          />

          <Label>Job Type</Label>
          <Input
            name="jobType"
            value={jobData.jobType}
            onChange={handleChange}
            className="my-2"
          />

          <Label>Experience Level</Label>
          <Input
            type="number"
            name="experienceLevel"
            value={jobData.experienceLevel}
            onChange={handleChange}
            className="my-2"
          />

          <Label>Open Positions</Label>
          <Input
            type="number"
            name="position"
            value={jobData.position}
            onChange={handleChange}
            className="my-2"
          />

          <Label>Description</Label>
          <Input
            name="description"
            value={jobData.description}
            onChange={handleChange}
            className="my-2"
          />

          <Label>Requirements (comma separated)</Label>
          <Input
            name="requirements"
            value={jobData.requirements}
            onChange={handleChange}
            className="my-2"
          />

          <div className="flex items-center gap-2 my-10">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/jobs")}
            >
              Cancel
            </Button>

            <Button type="submit">
              Update
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditJob;