import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const JobTable = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const fetchJobs = async () => {
    try {
      const response = await axios.get("https://next-level-nexus.onrender.com/api/v1/job/get", {
        withCredentials: true,
      });

      if (response.data.success) {
        setJobs(response.data.jobs);
      } else {
        toast.error(response.data.message || "Failed to fetch jobs.");
      }
    } catch (error) {
      toast.error("An error occurred while fetching jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  if (loading) {
    return <div className="text-center text-gray-800 dark:text-gray-200">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 dark:text-red-400">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto my-10 relative">
      {/* Button at top-right */}
      <div className="text-right">
        <Button
          variant="outline"
          className="mb-4 bg-gray-800 hover:bg-gray-600 text-white dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md px-4 py-2 shadow-lg transition-transform transform hover:scale-105"
          onClick={() => navigate("createJob")}
        >
          New Job
        </Button>
      </div>

      <h1 className="font-bold text-2xl mb-4 text-gray-900 dark:text-white">Job Listings</h1>
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <table className="table-auto w-full border-collapse border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-left text-gray-900 dark:text-white">
                Company
              </th>
              <th className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-left text-gray-900 dark:text-white">
                Role
              </th>
              <th className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-left text-gray-900 dark:text-white">
                Date
              </th>
              <th className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-left text-right text-gray-900 dark:text-white">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <tr key={job._id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                    {job.company.name}
                  </td>
                  <td className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                    {job.title}
                  </td>
                  <td className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                    {formatDate(job.createdAt)}
                  </td>
                  <td className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-right">
                    <Button
                      variant="outline"
                      className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                      onClick={() => navigate(`view-applicants/${job._id}`)}
                    >
                      Applicants
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-900 dark:text-white">
                  No jobs available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobTable;
