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
    <div className="bg-white border-b">
      <div className="flex items-center justify-between mx-auto max-w-7xl h-16 px-4">
        <div>
          <h1 className="text-2xl font-bold">
            Job<span className="text-[#F83002]">Portal</span>
          </h1>
        </div>

        <div className="flex items-center gap-12">
        <ul className="flex font-medium items-center gap-5">
  {user && user.role === "recruiter" ? (
    <>
      <li>
        <NavLink
          to="/admin/companies"
          className={({ isActive }) =>
            isActive ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-700"
          }
        >
          Companies
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/admin/jobs"
          className={({ isActive }) =>
            isActive ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-700"
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
            isActive ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-700"
          }
        >
          Home
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/jobs"
          className={({ isActive }) =>
            isActive ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-700"
          }
        >
          Jobs
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/browse"
          className={({ isActive }) =>
            isActive ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-700"
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
              isActive ? "text-purple-600 border-b-2 border-purple-600 flex items-center gap-1" : "text-gray-700 flex items-center gap-1"
            }
          >
            Saved Jobs
            {savedJobs.length > 0 && (
              <Badge className="bg-red-500 text-white text-xs px-2 py-0">
                {savedJobs.length}
              </Badge>
            )}
          </NavLink>
        </li>
      )}
    </>
  )}
</ul>

          {/* AUTH SECTION */}
          {!user ? (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-[#6A38C2] hover:bg-[#5b30a6]">
                  Signup
                </Button>
              </Link>
            </div>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage
                    src={
                      user?.profile?.profilePhoto
                        ? `http://localhost:8000/${user.profile.profilePhoto}`
                        : ""
                    }
                    alt="avatar"
                  />
                  <AvatarFallback className="bg-purple-600 text-white">
                    {user?.fullname?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </PopoverTrigger>

              <PopoverContent className="w-80">
                <div>
                  <div className="flex gap-2 items-center">
                    <Avatar>
                      <AvatarImage
                        src={
                          user?.profile?.profilePhoto
                            ? `http://localhost:8000/${user.profile.profilePhoto}`
                            : ""
                        }
                      />
                      <AvatarFallback>
                        {user?.fullname?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{user?.fullname}</h4>
                      <p className="text-sm text-muted-foreground">
                        {user?.profile?.bio}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col my-3 text-gray-600">
                    {user.role === "student" && (
                      <div className="flex items-center gap-2">
                        <User2 size={18} />
                        <Link to="/profile">
                          <Button variant="link">View Profile</Button>
                        </Link>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <LogOut size={18} />
                      <Button onClick={logoutHandler} variant="link">
                        Logout
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;