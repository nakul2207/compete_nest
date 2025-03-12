import { Trophy, Medal } from 'lucide-react';
import { useState, useEffect } from 'react';
import { GetContestParticipated } from '@/api/userApi';
import { Spinner } from './ui/Spinner';

interface SolvedContest {
    name: string;
    date: string;
    rank: string;
    score: number;
}

export const ContestParticipated = ({username}:{username?:string}) => {
    const [solvedContests, setSolvedContests] = useState<SolvedContest[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fetchSolvedProblems = async () => {
            try {
                if(!username) return;
                setLoading(true);
                const { data } = await GetContestParticipated(username,page);
                setSolvedContests(data.contestData);
                setTotal(data.totalcontests);
            } catch (error) {
                console.error("Failed to fetch solved problems:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSolvedProblems();
    }, [page]);

    return (
        <div className="bg-white dark:bg-gray-800  p-6  min-h-64">
            {loading ? (
                <div className="flex justify-center items-center ">
                    <Spinner />
                </div>
            ) : (
                <div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Contest
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Rank
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Score
                                    </th>
                                </tr>
                            </thead>
                            {solvedContests.length === 0 ? (
                                <tbody>
                                    <tr>
                                        <td className="px-4 py-3 text-center" colSpan={4}>
                                            No contests participated
                                        </td>
                                    </tr>
                                </tbody>
                            ):(
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {solvedContests.map((contest, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm font-medium">{contest.name}</div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{contest.date}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {contest.rank === '1st' ? (
                                                    <Trophy className="h-4 w-4 text-yellow-500 mr-1" />
                                                ) : contest.rank === '2nd' ? (
                                                    <Medal className="h-4 w-4 text-gray-400 mr-1" />
                                                ) : null}
                                                <span className="text-sm font-medium">{contest.rank === null? 1:(contest.rank)}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">{contest.score}</td>
                                    </tr>
                                ))}
                            </tbody>
                            )}
                        </table>
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Showing {Math.min((page - 1) * 3 + solvedContests.length, total)} of {total} contests
                        </p>
                        <div className="flex space-x-2">
                            <button
                                className={`px-3 py-1 rounded-md text-sm ${
                                    page === 1
                                        ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                }`}
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                            >
                                Previous
                            </button>
                            <button
                                className={`px-3 py-1 rounded-md text-sm ${
                                    page * 3 >= total
                                        ? "bg-blue-300 text-white cursor-not-allowed"
                                        : "bg-blue-600 text-white"
                                }`}
                                onClick={() => setPage(page + 1)}
                                disabled={page * 3 >= total}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};