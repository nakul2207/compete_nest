import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

export function Solutions() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Solution 1: Hash Table</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Time Complexity: O(n)</p>
          <p>Space Complexity: O(n)</p>
          <pre className="bg-muted p-2 rounded-md mt-2">
            <code>{`class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}
        for i, value in enumerate(nums):
            remaining = target - value
            if remaining in seen:
                return [seen[remaining], i]
            seen[value] = i
        return []`}</code>
          </pre>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Solution 2: Brute Force</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Time Complexity: O(n^2)</p>
          <p>Space Complexity: O(1)</p>
          <pre className="bg-muted p-2 rounded-md mt-2">
            <code>{`class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        for i in range(len(nums)):
            for j in range(i + 1, len(nums)):
                if nums[i] + nums[j] == target:
                    return [i, j]
        return []`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}

