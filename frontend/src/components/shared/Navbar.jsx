import React, { useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { LogOut, User2 } from "lucide-react";
import { NavLink, useNavigate , Link} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/constant";
import { setUser } from "@/redux/authSlice";
import { setSavedJobs } from "@/redux/savedJobSlice";
import { toast } from "sonner";

const Navbar = () => {
  const { user } = useSelector((store) => store.auth);
  const { savedJobs } = useSelector((store) => store.savedJob);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ FETCH SAVED JOBS WHEN USER LOGS IN
  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/v1/user/saved",
          { withCredentials: true }
        );

        if (res.data.success) {
          dispatch(setSavedJobs(res.data.savedJobs));
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (user) {
      fetchSavedJobs();
    }
  }, [user, dispatch]);

  // ✅ LOGOUT HANDLER
  const logoutHandler = async () => {
    try {
      const res = await axios.get(`${USER_API_END_POINT}/logout`, {
        withCredentials: true,
      });

      if (res.data.success) {
        dispatch(setUser(null));
        dispatch(setSavedJobs([])); // clear saved jobs
        navigate("/");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Logout failed");
    }
  };

  return (
    <div className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-border/50">
      <div className="flex items-center justify-between mx-auto max-w-7xl h-20 px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 purple-gradient rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:rotate-6 transition-transform">
            J
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Job<span className="text-primary">Hunt</span>
          </h1>
        </Link>

        <div className="flex items-center gap-10">
          <ul className="hidden md:flex font-medium items-center gap-8">
            {user && user.role === "recruiter" ? (
              <>
                <li>
                  <NavLink
                    to="/admin/companies"
                    className={({ isActive }) =>
                      `text-sm transition-colors hover:text-primary ${
                        isActive ? "text-primary font-semibold" : "text-muted-foreground"
                      }`
                    }
                  >
                    Companies
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/admin/jobs"
                    className={({ isActive }) =>
                      `text-sm transition-colors hover:text-primary ${
                        isActive ? "text-primary font-semibold" : "text-muted-foreground"
                      }`
                    }
                  >
                    Jobs
                  </NavLink>
                </li>
              </>
            ) : (
              <>
                <li>
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      `text-sm transition-colors hover:text-primary ${
                        isActive ? "text-primary font-semibold" : "text-muted-foreground"
                      }`
                    }
                  >
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/jobs"
                    className={({ isActive }) =>
                      `text-sm transition-colors hover:text-primary ${
                        isActive ? "text-primary font-semibold" : "text-muted-foreground"
                      }`
                    }
                  >
                    Jobs
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/browse"
                    className={({ isActive }) =>
                      `text-sm transition-colors hover:text-primary ${
                        isActive ? "text-primary font-semibold" : "text-muted-foreground"
                      }`
                    }
                  >
                    Browse
                  </NavLink>
                </li>
                {user && user.role === "student" && (
                  <li className="relative">
                    <NavLink
                      to="/saved-jobs"
                      className={({ isActive }) =>
                        `text-sm flex items-center gap-2 transition-colors hover:text-primary ${
                          isActive ? "text-primary font-semibold" : "text-muted-foreground"
                        }`
                      }
                    >
                      Saved
                      {savedJobs.length > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                          {savedJobs.length}
                        </span>
                      )}
                    </NavLink>
                  </li>
                )}
              </>
            )}
          </ul>

          <div className="flex items-center gap-4 border-l pl-10 border-border/50">
            {!user ? (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" className="text-sm font-semibold hover:bg-primary/5 hover:text-primary">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="purple-gradient hover:purple-gradient-hover text-sm font-semibold shadow-md active:scale-95 transition-all">
                    Get Started
                  </Button>
                </Link>
              </div>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-secondary/80 cursor-pointer transition-colors">
                  <Avatar className="h-9 w-9 border-2 border-primary/20 shadow-sm transition-transform hover:scale-105">
                    <AvatarImage
                      src={
                        user?.profile?.profilePhoto
                          ? `http://localhost:8000/${user.profile.profilePhoto}`
                          : ""
                      }
                      alt="avatar"
                    />
                    <AvatarFallback className="bg-primary text-white font-semibold">
                      {user?.fullname?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold leading-none">{user?.fullname}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 capitalize leading-none">{user?.role}</p>
                  </div>
                  </div>
                </PopoverTrigger>

                <PopoverContent className="w-64 p-2 mt-2 rounded-2xl shadow-2xl border-border/50 overflow-hidden" align="end">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 p-3 mb-2 rounded-xl bg-secondary/50">
                       <Avatar className="h-10 w-10 border border-primary/10">
                        <AvatarImage src={user?.profile?.profilePhoto ? `http://localhost:8000/${user.profile.profilePhoto}` : ""} />
                        <AvatarFallback className="bg-primary text-white">
                          {user?.fullname?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold truncate">{user?.fullname}</h4>
                        <p className="text-xs text-muted-foreground truncate">{user?.profile?.bio || "No bio added"}</p>
                      </div>
                    </div>

                    <div className="p-1 space-y-1">
                      {user.role === "student" && (
                        <Link to="/profile">
                          <Button variant="ghost" className="w-full justify-start gap-2 h-10 rounded-lg text-sm transition-colors hover:bg-primary/5 hover:text-primary">
                            <User2 size={16} />
                            View Profile
                          </Button>
                        </Link>
                      )}
                      
                      <Button 
                        onClick={logoutHandler} 
                        variant="ghost" 
                        className="w-full justify-start gap-2 h-10 rounded-lg text-sm text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <LogOut size={16} />
                        Logout
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;