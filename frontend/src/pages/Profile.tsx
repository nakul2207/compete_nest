import React, { useState, useEffect } from "react";
import { Calendar, CheckCircle } from "lucide-react";
import { Github, Linkedin, Mail, Globe } from "lucide-react";
import { ProgressItem } from "@/components/ProblemProgressCard";
import { useParams } from "react-router-dom";
import { GetProfile } from "../api/userApi.ts";
import { Loader } from "@/components/Loader.tsx";
import { ProblemSolved } from "@/components/ProblemSolved.tsx";
import { ContestParticipated } from "@/components/ContestParticipated.tsx";
import img from "../assets/blank.jpg";
import { ForbiddenPage } from "./ForbiddenPage.tsx";

interface ProfileData {
  user: {
    name: string;
    email: string;
    avatar: string;
    bio: string;
    linkedin: string;
    github: string;
    extraURL: string;
    joinDate: string;
  };
  stats: {
    activeDays: number;
    contests: {
      participated: number;
      won: number;
    };
    skills: string[];
    totalProblems: {
      Easy: number;
      Medium: number;
      Hard: number;
    };
    solved: string[];
    recentActivity: {
      date: string;
      action: string;
      problem: string;
      result: "solved" | "attempted" | "contest";
    }[];
  };
}

const getSolvedProblemsCount = (solved: string[], label: string) => {
  return solved.filter((problem) => JSON.parse(problem).type === label).length;
};

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "problems" | "contests">("overview");
  const { user_id } = useParams();
  const [user, setUser] = useState<ProfileData["user"]>();
  const [stats, setStats] = useState<ProfileData["stats"]>();
  const [solvedProblems, setSolvedProblems] = useState<string[]>([]);
  const easy = getSolvedProblemsCount(solvedProblems, "Easy");
  const medium = getSolvedProblemsCount(solvedProblems, "Medium");
  const hard = getSolvedProblemsCount(solvedProblems, "Hard");
  const total = easy + medium + hard;

  useEffect(() => {
    if (!user_id) return;
    GetProfile(user_id)
      .then((data: ProfileData) => {
        setUser(data.user);
        setStats(data.stats);
        setSolvedProblems(data.stats.solved);
      })
      .catch((err: Error) => {
        console.error("Failed to fetch profile:", err);
      });
  }, [user_id]);

  const getActivityColor = (result: string) => {
    switch (result) {
      case "solved":
        return "text-green-500";
      case "attempted":
        return "text-yellow-500";
      case "contest":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };
  const getCacheBustedUrl = (url: string) => `${url}?v=${new Date().getTime()}`;

  if (!user || !stats)
    return (
      <div className="flex justify-center min-h-screen">
        {/* <Spinner></Spinner> */}
        <Loader></Loader>

      </div>
    );
  if (!user_id) return <ForbiddenPage msg="Invalid User!!" />
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-32"></div>
          <div className="px-6 py-4 relative">
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 border-4 border-white dark:border-gray-800 rounded-full overflow-hidden md:left-6 md:translate-x-0 md:-top-16">
              <img
                src={user.avatar ? getCacheBustedUrl(user.avatar) : img}
                alt={user.name}
                className="h-32 w-32 object-cover"
              />
            </div>

            <div className="mt-16 md:mt-0 flex flex-col items-center md:flex-row md:justify-between md:items-center">
              <div className="md:ml-36 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start">
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  <CheckCircle className="h-5 w-5 text-blue-500 ml-2" />
                </div>
                <p className="text-gray-600 dark:text-gray-400">@{user_id}</p>
                <p className="text-gray-700 dark:text-gray-300 mt-1">{user.bio}</p>
              </div>

              <div className="mt-4 md:mt-0 flex items-center space-x-4 md:space-x-4 md:flex-row md:justify-start">
                <a
                  href={user.github || 'https://github.com'}
                  target="_blank"
                  className="hover:text-primary transition-colors"
                  rel="noreferrer"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href={user.linkedin || 'https://linkedin.com'}
                  target="_blank"
                  className="hover:text-primary transition-colors"
                  rel="noreferrer"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                {user.extraURL && (
                  <a
                    href={user.extraURL}
                    target="_blank"
                    className="hover:text-primary transition-colors"
                    rel="noreferrer"
                  >
                    <Globe className="h-5 w-5" />
                  </a>
                )}
                <a
                  href={`mailto:${user.email}` || 'mailto:contact@competenest.com'}
                  className="hover:text-primary transition-colors"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center md:text-left">
              <Calendar className="inline h-4 w-4 mr-1" /> {user.joinDate}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            className={`py-2 px-4 font-medium ${activeTab === "overview" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 dark:text-gray-400"
              }`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === "problems" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 dark:text-gray-400"
              }`}
            onClick={() => setActiveTab("problems")}
          >
            Problems
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === "contests" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 dark:text-gray-400"
              }`}
            onClick={() => setActiveTab("contests")}
          >
            Contests
          </button>
        </div>

        {/* Overview Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Statistics</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Problems</p>
                  <p className="text-2xl font-bold ">{total}</p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Days</p>
                  <p className="text-2xl font-bold ">{stats.activeDays}</p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Contests</p>
                  <p className="text-2xl font-bold ">{stats.contests.participated}</p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Wins</p>
                  <p className="text-2xl font-bold ">{stats.contests.won}</p>
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-md font-semibold mb-3">Problem Difficulty</h2>
                <div className="flex justify-between">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 mb-2">
                      {easy}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Easy</p>
                  </div>

                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 mb-2">
                      {medium}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Medium</p>
                  </div>

                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 mb-2">
                      {hard}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Hard</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Problems Solved</h2>

              <div className="space-y-6">
                <ProgressItem label="Easy" solved={stats.solved} total={stats.totalProblems.Easy} color="text-green-500" />
                <ProgressItem label="Medium" solved={stats.solved} total={stats.totalProblems.Medium} color="text-yellow-500" />
                <ProgressItem label="Hard" solved={stats.solved} total={stats.totalProblems.Hard} color="text-red-500" />
              </div>

              <h2 className="text-lg font-semibold mt-6 mb-4">Skills</h2>
              <div className="space-y-4">
                {stats.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {stats.skills.map((skill, index) => (
                      <span key={index} className="bg-purple-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">No skills added</p>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              {stats.recentActivity.length === 0 ? (<p className="text-gray-600 dark:text-gray-400">No recent activity</p>) : (
                <div className="space-y-4">
                  {stats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex">
                      <div className="mr-3">
                        <div
                          className={`w-2 h-2 mt-2 rounded-full ${getActivityColor(activity.result)} ring-4 ring-opacity-30 ${getActivityColor(activity.result).replace("text", "ring")}`}
                        ></div>
                      </div>
                      <div>
                        <p className="text-sm">
                          <span className={getActivityColor(activity.result)}>{activity.action}</span>{" "}
                          <span className="font-medium">{activity.problem}</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Problems Tab Content */}
        {activeTab === "problems" && <ProblemSolved username={user_id} />}

        {/* Contests Tab Content */}
        {activeTab === "contests" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Contest History</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 ">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Contest Stats</h3>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm ">Participated</p>
                    <p className="text-2xl font-bold text-blue-700">{stats.contests.participated}</p>
                  </div>
                  <div>
                    <p className="text-sm  ">Won</p>
                    <p className="text-2xl font-bold text-green-300">{stats.contests.won}</p>
                  </div>
                </div>
              </div>
            </div>
            <ContestParticipated username={user_id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;