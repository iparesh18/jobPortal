import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./shared/Navbar";
import Breadcrumbs from "./shared/Breadcrumbs";
import { USER_API_END_POINT } from "@/utils/constant";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/authSlice";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Loader2, Sparkles, RefreshCcw, Brain } from "lucide-react";
import LatestJobCards from "./LatestJobCards";

const AISuggestions = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [refreshingSkills, setRefreshingSkills] = useState(false);
    const [skills, setSkills] = useState([]);
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [latestJobs, setLatestJobs] = useState([]);

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${USER_API_END_POINT}/jobs/recommendations`, {
                withCredentials: true,
            });

            if (res.data.success) {
                setSkills(res.data.skills || []);
                setRecommendedJobs(res.data.recommendedJobs || []);
                setLatestJobs(res.data.latestJobs || []);
            }
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || "Failed to load AI suggestions");
        } finally {
            setLoading(false);
        }
    };

    const refreshSkillsWithAi = async () => {
        try {
            setRefreshingSkills(true);
            const res = await axios.post(
                `${USER_API_END_POINT}/profile/skills/extract`,
                {},
                { withCredentials: true }
            );

            if (res.data.success) {
                dispatch(setUser(res.data.user));
                toast.success("AI refreshed your skills");
                await fetchRecommendations();
            }
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || "Failed to refresh skills");
        } finally {
            setRefreshingSkills(false);
        }
    };

    useEffect(() => {
        fetchRecommendations();
    }, []);

    return (
        <div className="min-h-screen bg-[#F5F6FA]">
            <Navbar />
            <div className="max-w-7xl mx-auto px-6 py-8">
                <Breadcrumbs />

                <div className="mt-8 bg-white border border-border/50 rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                <Brain size={20} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-extrabold tracking-tight">AI Job Suggestions</h1>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Personalized matches generated from your profile skills.
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={refreshSkillsWithAi}
                            disabled={refreshingSkills}
                            className="rounded-xl font-bold"
                        >
                            {refreshingSkills ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Refreshing
                                </>
                            ) : (
                                <>
                                    <RefreshCcw className="mr-2 h-4 w-4" />
                                    Refresh Skills with AI
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                        {skills.length ? (
                            skills.map((skill) => (
                                <Badge key={skill} className="bg-primary/10 text-primary border-primary/30">
                                    {skill}
                                </Badge>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No skills found yet. Update profile or click refresh.
                            </p>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="py-24 flex items-center justify-center text-muted-foreground">
                        <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                        Loading suggestions...
                    </div>
                ) : (
                    <div className="mt-8 space-y-10">
                        <section>
                            <div className="flex items-center gap-2 mb-5">
                                <Sparkles className="text-primary" size={18} />
                                <h2 className="text-xl font-extrabold">Best Match Jobs</h2>
                            </div>

                            {recommendedJobs.length ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {recommendedJobs.map((job) => (
                                        <div key={job._id} className="relative">
                                            <div className="absolute z-10 top-3 right-3 px-2 py-1 rounded-lg text-[10px] font-bold bg-primary text-white">
                                                {Math.min(100, Math.round((job.matchScore || 0) * 100))}% match
                                            </div>
                                            <LatestJobCards job={job} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white border border-border/50 rounded-2xl p-6 text-sm text-muted-foreground">
                                    No AI matches yet. Add more profile skills and refresh.
                                </div>
                            )}
                        </section>

                        <section>
                            <h2 className="text-xl font-extrabold mb-5">Latest Jobs</h2>
                            {latestJobs.length ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {latestJobs.map((job) => (
                                        <LatestJobCards key={job._id} job={job} />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white border border-border/50 rounded-2xl p-6 text-sm text-muted-foreground">
                                    No latest jobs available.
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AISuggestions;