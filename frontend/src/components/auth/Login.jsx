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
import { setLoading, setUser } from '@/redux/authSlice'
import { Loader2, Mail, Lock, UserCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { Briefcase } from "lucide-react";

const Login = () => {
    const [input, setInput] = useState({
        email: "",
        password: "",
        role: "",
    });
    const { loading, user } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!input.role) {
            return toast.error("Please select a role");
        }
        try {
            dispatch(setLoading(true));
            const res = await axios.post(`${USER_API_END_POINT}/login`, input, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true,
            });
            if (res.data.success) {
                dispatch(setUser(res.data.user));
                navigate("/");
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Login failed");
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
        <div className="min-h-screen bg-[#F5F6FA]">
            <Navbar />
            <div className='flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className='max-w-md w-full'
                >
                    <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] border border-border/50 p-8 md:p-10">
                        <div className="text-center mb-10">
                            <h1 className='text-3xl font-extrabold tracking-tight mb-2'>Welcome Back</h1>
                            <p className='text-muted-foreground'>Enter your credentials to access your account</p>
                        </div>

                        <form onSubmit={submitHandler} className='space-y-6'>
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
                                        placeholder="name@example.com"
                                        className="pl-10 h-12 rounded-xl bg-secondary/30 border-border/50 focus:bg-white transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className='space-y-2'>
                                <div className="flex items-center justify-between ml-1">
                                    <Label className="text-sm font-bold">Password</Label>
                                    <Link to="#" className="text-xs font-bold text-primary hover:underline">Forgot password?</Link>
                                </div>
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
                                        className="pl-10 h-12 rounded-xl bg-secondary/30 border-border/50 focus:bg-white transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className='space-y-3 pt-2'>
                                <Label className="text-sm font-bold ml-1">Select Your Role</Label>
                                <div className='grid grid-cols-2 gap-4'>
                                    <label className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${input.role === 'student' ? 'border-primary bg-primary/5 text-primary' : 'border-border/50 hover:border-primary/20'}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="student"
                                            checked={input.role === 'student'}
                                            onChange={changeEventHandler}
                                            className="hidden"
                                        />
                                        <div className="flex flex-col items-center gap-2">
                                            <UserCircle size={20} />
                                            <span className="font-bold text-sm">Student</span>
                                        </div>
                                    </label>
                                    <label className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${input.role === 'recruiter' ? 'border-primary bg-primary/5 text-primary' : 'border-border/50 hover:border-primary/20'}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="recruiter"
                                            checked={input.role === 'recruiter'}
                                            onChange={changeEventHandler}
                                            className="hidden"
                                        />
                                        <div className="flex flex-col items-center gap-2">
                                            <Briefcase size={20} />
                                            <span className="font-bold text-sm">Recruiter</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                disabled={loading}
                                className="w-full h-12 rounded-xl purple-gradient hover:purple-gradient-hover text-white font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all mt-4"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                                        Authenticating...
                                    </>
                                ) : "Login Account"}
                            </Button>
                            
                            <p className='text-center text-sm text-muted-foreground mt-6'>
                                Don't have an account? <Link to="/signup" className='font-bold text-primary hover:underline'>Create account</Link>
                            </p>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default Login