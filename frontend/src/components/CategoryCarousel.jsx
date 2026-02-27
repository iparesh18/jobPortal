import React, { useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSearchedQuery } from "@/redux/jobSlice";
import { ChevronLeft, ChevronRight } from "lucide-react";

const categories = [
  "Frontend Developer",
  "Go lang Developer",
  "Python Developer",
  "Selenium Developer",
  "Backend Developer",
  "Data Science",
  "Graphic Designer",
  "FullStack Developer",
  "DevOps Engineer",
  "UI/UX Designer",
  "Machine Learning Engineer",
  "Mobile App Developer"
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
    const scrollAmount = clientWidth; // scroll by container width

    if (direction === "left") {
      carouselRef.current.scrollTo({
        left: scrollLeft - scrollAmount,
        behavior: "smooth",
      });
    } else {
      carouselRef.current.scrollTo({
        left: scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto my-20">
      {/* Left Blur */}
      <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      {/* Right Blur */}
      <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      {/* Left Button */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 bg-white rounded-full p-2 shadow-md hover:bg-purple-600 hover:text-white transition"
      >
        <ChevronLeft size={24} />
      </button>

      {/* Right Button */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 bg-white rounded-full p-2 shadow-md hover:bg-purple-600 hover:text-white transition"
      >
        <ChevronRight size={24} />
      </button>

      <div
        ref={carouselRef}
        className="flex overflow-x-hidden scroll-smooth space-x-4 px-4"
      >
        {[...categories, ...categories].map((cat, index) => (
          <div key={index} className="flex-shrink-0 w-52 md:w-48 lg:w-56">
            <button
              onClick={() => searchJobHandler(cat)}
              className="w-full py-3 px-6 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-purple-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md whitespace-nowrap"
            >
              {cat}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfiniteCarousel;