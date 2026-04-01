import React, { useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSearchedQuery } from "@/redux/jobSlice";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const categories = [
  "Frontend Developer",
  "Backend Developer",
  "Data Science",
  "Graphic Designer",
  "FullStack Developer",
  "DevOps Engineer",
  "UI/UX Designer",
  "Machine Learning",
  "Mobile App Dev",
  "Python Developer",
  "Go lang Developer"
];

const InfiniteCarousel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const carouselRef = useRef(null);

  const searchJobHandler = (query) => {
    dispatch(setSearchedQuery(query));
    navigate("/browse");
  };

  const scroll = (direction) => {
    if (!carouselRef.current) return;
    const { scrollLeft, clientWidth } = carouselRef.current;
    const scrollAmount = clientWidth * 0.8; 

    carouselRef.current.scrollTo({
      left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto my-12 px-6 overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Browse by <span className="text-primary">Category</span></h2>
          <p className="text-muted-foreground mt-1 font-medium">Explore top-rated opportunities across different industries</p>
        </div>
        <div className="flex gap-2">
            <button
                onClick={() => scroll("left")}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-white border border-border shadow-sm hover:bg-primary hover:text-white transition-all duration-300 active:scale-90"
            >
                <ChevronLeft size={20} />
            </button>
            <button
                onClick={() => scroll("right")}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-white border border-border shadow-sm hover:bg-primary hover:text-white transition-all duration-300 active:scale-90"
            >
                <ChevronRight size={20} />
            </button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div
            ref={carouselRef}
            className="flex overflow-x-hidden scroll-smooth space-x-4 py-4"
        >
            {categories.map((cat, index) => (
            <motion.div 
                key={index} 
                className="flex-shrink-0"
                whileHover={{ y: -5 }}
            >
                <button
                    onClick={() => searchJobHandler(cat)}
                    className="h-14 px-8 rounded-2xl bg-white border border-border/60 text-muted-foreground font-bold hover:text-primary hover:border-primary/30 hover:shadow-[0_8px_20px_-10px_rgba(108,92,231,0.3)] transition-all duration-300 whitespace-nowrap text-sm"
                >
                    {cat}
                </button>
            </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default InfiniteCarousel;