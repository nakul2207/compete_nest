
export function ProblemDescription() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <h2>Problem 1: Two Sum</h2>
      <p className="text-green-500 font-semibold mb-4">Difficulty: Easy</p>
      <p>
        Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers
        such that they add up to <code>target</code>.
      </p>
      <p>
        You may assume that each input would have exactly one solution, and you may not use the same element twice.
      </p>
      <p>You can return the answer in any order.</p>
      <h3>Example 1:</h3>
      <pre>
        <code>
          Input: nums = [2,7,11,15], target = 9
          Output: [0,1]
          Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
        </code>
      </pre>
      <h3>Constraints:</h3>
      <ul>
        <li>2 ≤ nums.length ≤ 10^4</li>
        <li>-10^9 ≤ nums[i] ≤ 10^9</li>
        <li>-10^9 ≤ target ≤ 10^9</li>
        <li>Only one valid answer exists.</li>
      </ul>
    </div>
  )
}

