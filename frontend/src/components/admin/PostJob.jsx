import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useSelector } from 'react-redux'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import axios from 'axios'
import { JOB_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

const PostJob = () => {

    const [input, setInput] = useState({
        title: "",
        description: "",
        requirements: "",
        salary: "",
        location: "",
        jobType: "",
        experienceLevel: 0,
        position: 0,
        companyId: ""
    });

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { companies } = useSelector(store => store.company);

    const changeEventHandler = (e) => {
        setInput({
            ...input,
            [e.target.name]:
                e.target.name === "position" || e.target.name === "experienceLevel"
                    ? Number(e.target.value)
                    : e.target.value
        });
    };

    // ✅ FIXED: directly set companyId
    const selectChangeHandler = (value) => {
        setInput({
            ...input,
            companyId: value
        });
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        if (!input.companyId) {
            toast.error("Please select a company");
            return;
        }

        try {
            setLoading(true);

            const res = await axios.post(
                `${JOB_API_END_POINT}/post`,
                input,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            );

            if (res.data.success) {
                toast.success(res.data.message);
                navigate("/admin/jobs");
            }

        } catch (error) {
            console.log(error.response);
            toast.error(error.response?.data?.message || "Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Navbar />

            <div className='flex items-center justify-center w-screen my-5'>

                <form onSubmit={submitHandler}
                    className='p-8 max-w-4xl border border-gray-200 shadow-lg rounded-md'>

                    <div className='grid grid-cols-2 gap-2'>

                        <div>
                            <Label>Title</Label>
                            <Input
                                type="text"
                                name="title"
                                value={input.title}
                                onChange={changeEventHandler}
                                className="my-1"
                            />
                        </div>

                        <div>
                            <Label>Description</Label>
                            <Input
                                type="text"
                                name="description"
                                value={input.description}
                                onChange={changeEventHandler}
                                className="my-1"
                            />
                        </div>

                        <div>
                            <Label>Requirements</Label>
                            <Input
                                type="text"
                                name="requirements"
                                value={input.requirements}
                                onChange={changeEventHandler}
                                className="my-1"
                            />
                        </div>

                        <div>
                            <Label>Salary</Label>
                            <Input
                                type="text"
                                name="salary"
                                value={input.salary}
                                onChange={changeEventHandler}
                                className="my-1"
                            />
                        </div>

                        <div>
                            <Label>Location</Label>
                            <Input
                                type="text"
                                name="location"
                                value={input.location}
                                onChange={changeEventHandler}
                                className="my-1"
                            />
                        </div>

                        <div>
                            <Label>Job Type</Label>
                            <Input
                                type="text"
                                name="jobType"
                                value={input.jobType}
                                onChange={changeEventHandler}
                                className="my-1"
                            />
                        </div>

                        <div>
                            <Label>Experience Level</Label>
                            <Input
                                type="number"
                                name="experienceLevel"
                                value={input.experienceLevel}
                                onChange={changeEventHandler}
                                className="my-1"
                            />
                        </div>

                        <div>
                            <Label>No of Position</Label>
                            <Input
                                type="number"
                                name="position"
                                value={input.position}
                                onChange={changeEventHandler}
                                className="my-1"
                            />
                        </div>

                        {
                            companies.length > 0 && (

                                <Select onValueChange={selectChangeHandler}>

                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select a Company" />
                                    </SelectTrigger>

                                    <SelectContent>

                                        <SelectGroup>

                                            {
                                                companies.map((company) => (

                                                    <SelectItem
                                                        key={company._id}
                                                        value={company._id}   // ✅ FIXED
                                                    >
                                                        {company.name}
                                                    </SelectItem>

                                                ))
                                            }

                                        </SelectGroup>

                                    </SelectContent>

                                </Select>
                            )
                        }

                    </div>

                    {
                        loading ? (
                            <Button className="w-full my-4">
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Please wait
                            </Button>
                        ) : (
                            <Button type="submit" className="w-full my-4">
                                Post New Job
                            </Button>
                        )
                    }

                    {
                        companies.length === 0 &&
                        <p className='text-xs text-red-600 font-bold text-center my-3'>
                            *Please register a company first
                        </p>
                    }

                </form>

            </div>
        </div>
    )
}

export default PostJob;