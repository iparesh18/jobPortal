import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { RadioGroup } from '../ui/radio-group'
import { Button } from '../ui/button'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '@/redux/authSlice'
import { Loader2, Mail, Lock, User, Phone, Image as ImageIcon, Briefcase, UserCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const Signup = () => {
    const [input, setInput] = useState({
        fullname: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "",
        file: ""
    });
    const { loading, user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }
    const changeFileHandler = (e) => {
        setInput({ ...input, file: e.target.files?.[0] });
    }
    const submitHandler = async (e) => {
        e.preventDefault();
        if(!input.role) return toast.error("Please select a role");
        
        const formData = new FormData();
        formData.append("fullname", input.fullname);
        formData.append("email", input.email);
        formData.append("phoneNumber", input.phoneNumber);
        formData.append("password", input.password);
        formData.append("role", input.role);
        if (input.file) {
            formData.append("file", input.file);
        }

        try {
            dispatch(setLoading(true));
            const res = await axios.post(`${USER_API_END_POINT}/register`, formData, {
                headers: { 'Content-Type': "multipart/form-data" },
                withCredentials: true,
            });
            if (res.data.success) {
                navigate("/login");
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Registration failed");
        } finally {
            dispatch(setLoading(false));
        }
    }

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [user, navigate])

    return (
        <div className="min-h-screen bg-[#F5F6FA] pb-12">
            <Navbar />
            <div className='flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className='max-w-2xl w-full'
                >
                    <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] border border-border/50 p-8 md:p-12">
                        <div className="text-center mb-10">
                            <h1 className='text-3xl font-extrabold tracking-tight mb-2'>Create Account</h1>
                            <p className='text-muted-foreground text-sm'>Join our community and find your dream career today</p>
                        </div>

                        <form onSubmit={submitHandler} className='space-y-6'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div className='space-y-2'>
                                    <Label className="text-sm font-bold ml-1">Full Name</Label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                            <User size={18} />
                                        </div>
                                        <Input
                                            type="text"
                                            value={input.fullname}
                                            name="fullname"
                                            onChange={changeEventHandler}
                                            placeholder="John Doe"
                                            className="pl-10 h-11 rounded-xl bg-secondary/30 border-border/50 focus:bg-white transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className='space-y-2'>
                                    <Label className="text-sm font-bold ml-1">Email Address</Label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                            <Mail size={18} />
                                        </div>
                                        <Input
                                            type="email"
                                            value={input.email}
                                            name="email"
                                            onChange={changeEventHandler}
                                            placeholder="john@example.com"
                                            className="pl-10 h-11 rounded-xl bg-secondary/30 border-border/50 focus:bg-white transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className='space-y-2'>
                                    <Label className="text-sm font-bold ml-1">Phone Number</Label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                            <Phone size={18} />
                                        </div>
                                        <Input
                                            type="text"
                                            value={input.phoneNumber}
                                            name="phoneNumber"
                                            onChange={changeEventHandler}
                                            placeholder="1234567890"
                                            className="pl-10 h-11 rounded-xl bg-secondary/30 border-border/50 focus:bg-white transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className='space-y-2'>
                                    <Label className="text-sm font-bold ml-1">Password</Label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                            <Lock size={18} />
                                        </div>
                                        <Input
                                            type="password"
                                            value={input.password}
                                            name="password"
                                            onChange={changeEventHandler}
                                            placeholder="••••••••"
                                            className="pl-10 h-11 rounded-xl bg-secondary/30 border-border/50 focus:bg-white transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-8 items-end'>
                                <div className='space-y-3'>
                                    <Label className="text-sm font-bold ml-1">Select Your Role</Label>
                                    <div className='flex gap-4'>
                                        <label className={`flex-1 flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${input.role === 'student' ? 'border-primary bg-primary/5 text-primary' : 'border-border/50 hover:border-primary/20'}`}>
                                            <input
                                                type="radio"
                                                name="role"
                                                value="student"
                                                checked={input.role === 'student'}
                                                onChange={changeEventHandler}
                                                className="hidden"
                                            />
                                            <div className="flex items-center gap-2">
                                                <UserCircle size={18} />
                                                <span className="font-bold text-xs uppercase tracking-wider">Student</span>
                                            </div>
                                        </label>
                                        <label className={`flex-1 flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${input.role === 'recruiter' ? 'border-primary bg-primary/5 text-primary' : 'border-border/50 hover:border-primary/20'}`}>
                                            <input
                                                type="radio"
                                                name="role"
                                                value="recruiter"
                                                checked={input.role === 'recruiter'}
                                                onChange={changeEventHandler}
                                                className="hidden"
                                            />
                                            <div className="flex items-center gap-2">
                                                <Briefcase size={18} />
                                                <span className="font-bold text-xs uppercase tracking-wider">Recruiter</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <div className='space-y-3'>
                                    <Label className="text-sm font-bold ml-1">Profile Photo</Label>
                                    <div className="relative">
                                        <Input
                                            accept="image/*"
                                            type="file"
                                            onChange={changeFileHandler}
                                            className="h-12 rounded-xl bg-secondary/30 border-dashed border-2 border-border/50 cursor-pointer pt-2 px-4 hover:bg-white transition-all text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                disabled={loading}
                                className="w-full h-12 rounded-xl purple-gradient hover:purple-gradient-hover text-white font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all mt-6"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                                        Creating Account...
                                    </>
                                ) : "Register Now"}
                            </Button>
                            
                            <p className='text-center text-sm text-muted-foreground mt-6 leading-none'>
                                Already have an account? <Link to="/login" className='font-bold text-primary hover:underline'>Login here</Link>
                            </p>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default Signup