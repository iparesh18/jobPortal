import React, { useState } from 'react'
import { Button } from './ui/button'
import { Search, Sparkles } from 'lucide-react'
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const HeroSection = () => {
    const [query, setQuery] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchJobHandler = () => {
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    }

    return (
        <div className='relative overflow-hidden bg-white py-20 lg:py-32'>
            {/* Background Decorative Elements */}
            <div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden pointer-events-none'>
                <div className='absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl anim-pulse'></div>
                <div className='absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-400/10 rounded-full blur-3xl'></div>
            </div>

            <div className='max-w-7xl mx-auto px-6 text-center'>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className='flex flex-col gap-6 items-center'
                >
                    <span className='inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm tracking-wide shadow-sm ring-1 ring-primary/20 backdrop-blur-sm'>
                        <Sparkles size={16} />
                        No. 1 Career Navigation Platform
                    </span>

                    <h1 className='text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]'>
                        Find Your Next <br />
                        <span className='text-transparent bg-clip-text purple-gradient'>Career Milestone</span>
                    </h1>

                    <p className='text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
                        Connecting talented professionals with industry-leading companies. 
                        Your dream job is just one search away in our curated opportunity hub.
                    </p>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className='relative w-full max-w-2xl mt-8'
                    >
                        <div className='flex items-center gap-2 p-2 bg-white rounded-2xl shadow-[0_20px_50px_-20px_rgba(108,92,231,0.2)] border border-border/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-300'>
                            <div className='pl-4 text-muted-foreground'>
                                <Search size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder='Search for jobs, skills, or companies...'
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && searchJobHandler()}
                                className='flex-1 py-3 px-2 outline-none border-none bg-transparent text-foreground placeholder:text-muted-foreground/60 font-medium'
                            />
                            <Button 
                                onClick={searchJobHandler} 
                                className="purple-gradient hover:purple-gradient-hover text-white px-8 py-6 rounded-xl shadow-lg active:scale-95 transition-all font-bold"
                            >
                                Search Jobs
                            </Button>
                        </div>
                        
                        <div className='flex flex-wrap justify-center gap-4 mt-6 text-xs font-semibold text-muted-foreground/60 tracking-wider uppercase'>
                            <span>Popular:</span>
                            <span className='hover:text-primary cursor-pointer transition-colors'>React Developer</span>
                            <span className='hover:text-primary cursor-pointer transition-colors'>UI/UX Designer</span>
                            <span className='hover:text-primary cursor-pointer transition-colors'>Data Science</span>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    )
}

export default HeroSection