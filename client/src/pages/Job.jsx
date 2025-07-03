import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bookmark } from "lucide-react";
import { Link } from "react-router-dom";

const Job = () => {
  const daysAgoFunction = (mongodbTime) => {
    const createAt = new Date(mongodbTime);
    const currentTime = new Date();
    const timeDiff = currentTime - createAt;
    return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  };

  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(
          "https://next-level-nexus.onrender.com/api/v1/job/get",
          { withCredentials: true }
        );
        if (response.data.success) {
          setJobs(response.data.jobs);
        }
      } catch (err) {
        setError("Failed to fetch jobs.");
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-md">
      {jobs && jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-5 rounded-lg shadow-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-transform transform hover:scale-105 hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {daysAgoFunction(job?.createdAt) === 0
                    ? "Today"
                    : `${daysAgoFunction(job?.createdAt)} days ago`}
                </p>
                <Button variant="outline" className="rounded-full" size="icon">
                  <Bookmark className="text-gray-700 dark:text-gray-300" />
                </Button>
              </div>

              <div className="flex items-center gap-2 my-2">
                <Button className="p-6" variant="outline" size="icon">
                  <Avatar>
                    <AvatarImage src={job?.company?.logo} />
                  </Avatar>
                </Button>
                <div>
                  <h1 className="font-medium text-lg">{job?.company?.name}</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    India
                  </p>
                </div>
              </div>

              <h1 className="font-bold text-lg my-2">{job?.title}</h1>

              <div className="flex flex-wrap gap-2 mt-4">
                <Badge className="text-blue-700 dark:text-blue-400 font-bold" variant="ghost">
                  {job?.position} Positions
                </Badge>
                <Badge className="text-[#F83002] dark:text-red-400 font-bold" variant="ghost">
                  {job?.jobType}
                </Badge>
                <Badge className="text-[#7209b7] dark:text-purple-400 font-bold" variant="ghost">
                  {job?.salary} LPA
                </Badge>
                {job?.remote && (
                  <Badge className="text-green-600 dark:text-green-400 font-bold" variant="ghost">
                    Remote
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 mt-4">
                <Button variant="outline" className="dark:border-gray-700 dark:text-gray-300">
                  <Link to={`/description/${job._id}`} className="no-underline">
                    Details
                  </Link>
                </Button>
                <Button className="bg-[#7209b7] dark:bg-purple-600 hover:bg-[#5a1d97] dark:hover:bg-purple-500 transition-colors">
                  Save For Later
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-800 dark:text-gray-200">No jobs posted yet.</p>
      )}
    </div>
  );
};

export default Job;
